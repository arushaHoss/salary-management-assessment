// backend/src/models/index.js
const sequelize = require('../config/database');
const Employee = require('./Employee');

// Sync all models (creates tables if they don't exist)
const syncDatabase = async () => {
  await sequelize.sync({ alter: true });
  console.log('Database synced');
};

module.exports = { sequelize, Employee, syncDatabase };
