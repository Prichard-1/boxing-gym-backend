// Members.js
// Members.js
import express from "express";
const router = express.Router();

let members = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

router.get("/", (req, res) => {
  res.json(members);
});

router.post("/", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and email required" });

  const newMember = { id: members.length + 1, name, email };
  members.push(newMember);
  res.status(201).json(newMember);
});

export default router;