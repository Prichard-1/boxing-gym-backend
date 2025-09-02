import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

let users = [];
let contacts = [];

app.post("/api/register", (req, res) => {
  const { name, email, password, plan, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  const existingUser = users.find(u => u.email === email);
  if (existingUser)
    return res.status(400).json({ error: "User already exists" });

  const newUser = { id: users.length + 1, name, email, password, plan, role };
  users.push(newUser);
  console.log("✅ New user:", newUser);
  res.status(201).json({ message: "Registration successful", user: newUser });
});

// Login route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  res.json({ message: "Login successful", user });
});

// ===== In-memory store for classes =====
let classes = [];

// ===== Add a new class =====
app.post("/api/classes", (req, res) => {
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

  res.status(201).json({ message: "Class added successfully", class: newClass });
});

// ===== Optional: Get all classes =====
app.get("/api/classes", (req, res) => {
  res.json(classes);
});


// Contact route
app.post("/api/contacts", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ error: "All fields required" });
  const newContact = { id: contacts.length + 1, name, email, message, createdAt: new Date() };
  contacts.push(newContact);
  console.log("✅ New contact:", newContact);
  res.status(201).json({ message: "Message sent successfully" });
});

app.get("/", (req, res) => res.send("🚀 Boxing Gym Backend Running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));