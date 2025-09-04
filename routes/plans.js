import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [plans] = await db.query('SELECT * FROM plans');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
});

export default router;
