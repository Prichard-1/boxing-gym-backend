// GET /api/plans
app.get('/api/plans', async (req, res) => {
  const plans = [
    { id: 'basic', name: 'Basic', description: 'Access to gym and classes', price: 20 },
    { id: 'pro', name: 'Pro', description: 'Basic + personal training', price: 50 },
    { id: 'premium', name: 'Premium', description: 'All access + nutrition plan', price: 80 },
  ];
  res.json(plans);
});