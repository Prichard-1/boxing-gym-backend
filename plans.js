// backend/routes/plans.js
import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-01' });


// Define your subscription plans
const plans = [
  {
    id: "basic",
    name: "Basic",
    description: "Access to gym and classes",
    price: 20,
    stripePriceId: "price_1RzQYsRrSQNJ6TlI0nWc3Hvl",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Basic + personal training",
    price: 50,
    stripePriceId: "price_1RzQaiRrSQNJ6TlIQSalE4cs",
  },
  {
    id: "premium",
    name: "Premium",
    description: "All access + nutrition plan",
    price: 80,
    stripePriceId: "price_1RzQc7RrSQNJ6TlITjeavWEW",
  },
];

// GET all plans
router.get("/", (req, res) => {
  res.json(plans);
});

// POST create Stripe checkout session
router.post("/create-checkout-session", async (req, res) => {
  const { planId } = req.body;

  const selectedPlan = plans.find((p) => p.id === planId);
  if (!selectedPlan) {
    return res.status(400).json({ error: "Invalid plan ID" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: selectedPlan.stripePriceId, quantity: 1 }],
      success_url: `http://localhost:5173/plans?success=true`,
      cancel_url: `http://localhost:5173/plans?canceled=true`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;