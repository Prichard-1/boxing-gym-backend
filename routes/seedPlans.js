import sequelize from './config/database.js';
import Plan from './models/Plan.js';

const seedPlans = async () => {
  try {
    await sequelize.sync({ force: true }); // rebuild tables
    await Plan.bulkCreate([
      { name: 'Basic Plan', description: 'Access to gym equipment only', price: 200 },
      { name: 'Pro Plan', description: 'Includes gym equipment + group classes', price: 400 },
      { name: 'Premium Plan', description: 'All access + personal trainer', price: 600 },
    ]);
    console.log('✅ Plans seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding plans:', err);
    process.exit(1);
  }
};

seedPlans();
