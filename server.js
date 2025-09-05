import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();

// ===== CORS setup =====
const allowedOrigins = [
  "http://localhost:5173",
  "https://majestic-sprite-8d5f3b.netlify.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".netlify.app")) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ===== JWT Secret =====
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ===== In-memory storage =====
let users = [];
let classes = [];
let contacts = [];
let bookings = [];
let plans = [
  { id: 1, name: "Basic", description: "Access to gym equipment", price: 199.99 },
  { id: 2, name: "Premium", description: "Includes classes and trainer support", price: 399.99 },
  { id: 3, name: "Elite", description: "Unlimited access + personal trainer", price: 599.99 },
];

// ===== Middleware: Verify Token =====
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied, token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// ===== Middleware: Verify Admin =====
function verifyAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
}

// ===== Routes =====

// Root
app.get("/", (req, res) => {
  res.send("🚀 Boxing Gym Backend Running with JWT Auth and CORS");
});

// Register
app.post("/api/register", (req, res) => {
  const { name, email, password, plan = "Basic", role = "member" } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });

  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email already registered" });

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    plan,
    role,
    createdAt: new Date(),
  };

  users.push(newUser);
  console.log("✅ New user registered:", newUser);

  res.status(201).json({
    message: "Registration successful",
    user: { id: newUser.id, name, email, plan, role },
  });
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  res.json({
    message: "Login successful",
    user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    token,
  });
});

// Classes
app.get("/api/classes", (req, res) => res.json(classes));

app.post("/api/classes", authenticateToken, (req, res) => {
  const { title, instructor, date, time } = req.body;
  if (!title || !instructor || !date || !time) return res.status(400).json({ error: "All fields required" });

  const newClass = { id: classes.length + 1, title, instructor, date, time, createdAt: new Date() };
  classes.push(newClass);
  console.log("✅ New class added:", newClass);

  res.status(201).json({ message: "Class added successfully", class: newClass });
});

// Contacts
app.post("/api/contacts", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "All fields required" });

  const newContact = { id: contacts.length + 1, name, email, message, createdAt: new Date() };
  contacts.push(newContact);
  console.log("✅ New contact:", newContact);

  res.status(201).json({ message: "Message sent successfully" });
});

// Bookings
app.get("/api/bookings", authenticateToken, (req, res) => {
  const user = req.user;
  if (user.role === "admin") return res.json(bookings);
  const userBookings = bookings.filter(b => b.userId === user.id);
  res.json(userBookings);
});

app.post("/api/bookings", authenticateToken, (req, res) => {
  const { session, date } = req.body;
  const user = req.user;
  if (!session || !date) return res.status(400).json({ error: "Session and date required" });

  const newBooking = {
    id: bookings.length + 1,
    userId: user.id,
    userEmail: user.email,
    session,
    date,
    createdAt: new Date()
  };
  bookings.push(newBooking);
  console.log(`✅ New booking by ${user.email}:`, newBooking);

  res.status(201).json(newBooking);
});

// Admin Bookings
app.get("/api/admin/bookings", authenticateToken, verifyAdmin, (req, res) => {
  res.json(bookings);
});

// Plans
app.get("/api/plans", (req, res) => {
  res.json(plans);
});

app.post("/api/plans", authenticateToken, (req, res) => {
  const user = req.user;
  if (user.role !== "admin") return res.status(403).json({ error: "Only admins can create plans" });

  const { name, description, price } = req.body;
  if (!name || !description || !price) return res.status(400).json({ error: "All fields required" });

  const newPlan = { id: plans.length + 1, name, description, price, createdAt: new Date() };
  plans.push(newPlan);
  console.log("✅ New plan added:", newPlan);

  res.status(201).json({ message: "Plan created", plan: newPlan });
});

// Subscribe to Plan
app.post("/api/subscribe", authenticateToken, (req, res) => {
  const { planId } = req.body;
  const user = req.user;

  if (!planId) return res.status(400).json({ error: "Missing planId" });

  const selectedPlan = plans.find(p => p.id === planId);
  if (!selectedPlan) return res.status(404).json({ error: "Plan not found" });

  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex === -1) return res.status(404).json({ error: "User not found" });

  users[userIndex].plan = selectedPlan.name;
  console.log(`✅ ${user.email} subscribed to ${selectedPlan.name}`);

  res.json({ message: "Subscription successful", plan: selectedPlan.name });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
