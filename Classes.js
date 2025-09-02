// Classes.js
import express from "express";
const router = express.Router();

let classes = [
  { id: 1, title: "Boxing Basics", instructor: "Coach John" },
  { id: 2, title: "Advanced Sparring", instructor: "Coach Lisa" },
];

router.get("/", (req, res) => {
  res.json(classes);
});

router.post("/", (req, res) => {
  const { title, instructor } = req.body;
  if (!title || !instructor) return res.status(400).json({ error: "Title and instructor required" });

  const newClass = { id: classes.length + 1, title, instructor };
  classes.push(newClass);
  res.status(201).json(newClass);
});

export default router;