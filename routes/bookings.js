import express from 'express';
import db from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { session, date } = req.body;
  const userId = req.user.id;
  try {
    await db.query('INSERT INTO bookings (user_id, session, date) VALUES (?, ?, ?)', [userId, session, date]);
    res.json({ message: 'Booking successful' });
  } catch (err) {
    res.status(500).json({ message: 'Booking failed' });
  }
});

router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const [bookings] = await db.query('SELECT * FROM bookings WHERE user_id = ?', [userId]);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

export default router;
