module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    userId: DataTypes.INTEGER,
    planId: DataTypes.INTEGER,
    status: DataTypes.STRING,
    startDate: DataTypes.DATE
  });

  return Subscription;
};
