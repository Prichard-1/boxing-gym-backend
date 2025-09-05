import express from 'express';
import Plan from '../models/Plan.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const plans = await Plan.findAll();
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
});

export default router;

