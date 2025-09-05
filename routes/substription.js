const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // your auth middleware
const Subscription = require('../models/Subscription');   // your model
const Plan = require('../models/Plan');                   // optional validation

router.post('/subscribe', verifyToken, async (req, res) => {
  const { planId } = req.body;
  const userId = req.user.id;

  try {
    // Optional: validate plan exists
    const plan = await Plan.findByPk(planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    // Create or update subscription
    const subscription = await Subscription.create({
      userId,
      planId,
      status: 'active',
      startDate: new Date()
    });

    res.json({ message: 'Subscription successful', subscription });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

module.exports = router;
