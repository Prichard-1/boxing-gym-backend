// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();

// ✅ Allowed frontend URLs (local + Netlify deployments)
const FRONTEND_URLS = [
  "http://localhost:5173",
  "https://cheerful-moonbeam-38264a.netlify.app",
  "https://majestic-sprite-8d5f3b.netlify.app",
];

app.use(
  cors({
    origin: FRONTEND_URLS,
    credentials: true,
  })
);

app.use(express.json());

// ===== Secret Key =====
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ===== In-memory stores =====
let users = [];
let classes = [];
let contacts = [];

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

// ===== Registration =====
app.post("/api/register", (req, res) => {
  const { name, email, password, plan, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password, // ❌ not hashed for demo (should use bcrypt in production)
    plan,
    role,
  };

  users.push(newUser);
  console.log("✅ New user:", newUser);

  res.status(201).json({
    message: "Registration successful",
    user: { id: newUser.id, name, email, plan, role },
  });
});

// ===== Login =====
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    token,
    user: { id: user.id, name: user.name, email: user.email, plan: user.plan, role: user.role },
  });
});

// ===== Protected Route Example =====
app.get("/api/profile", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user });
});

// ===== Classes =====
app.post("/api/classes", authenticateToken, (req, res) => {
  const { title, instructor, date, time } = req.body;

  if (!title || !instructor || !date || !time) {
    return res.status(400).json({ error: "All class fields are required" });
  }

  const newClass = {
    id: classes.length + 1,
    title,
    instructor,
    date,
    time,
    createdAt: new Date(),
  };

  classes.push(newClass);
  console.log("✅ New class added:", newClass);

  res.status(201).json({
    message: "Class added successfully",
    class: newClass,
  });
});

app.get("/api/classes", (req, res) => {
  res.json(classes);
});

// ===== Contacts =====
app.post("/api/contacts", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields required" });
  }

  const newContact = {
    id: contacts.length + 1,
    name,
    email,
    message,
    createdAt: new Date(),
  };

  contacts.push(newContact);
  console.log("✅ New contact:", newContact);

  res.status(201).json({
    message: "Message sent successfully",
  });
});

// ===== Root =====
app.get("/", (req, res) => {
  res.send("🚀 Boxing Gym Backend Running with JWT Auth...");
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

