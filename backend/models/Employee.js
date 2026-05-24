// backend/src/models/Employee.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Full name is required' },
      len: { args: [2, 255], msg: 'Name must be 2-255 characters' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Must be a valid email' }
    }
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Salary cannot be negative' }
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  employmentType: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract'),
    defaultValue: 'Full-time'
  },
  hireDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'employees',
  timestamps: true,            // adds createdAt and updatedAt automatically
  indexes: [
    { fields: ['country'] },   // speeds up country-based insights queries
    { fields: ['jobTitle'] },
    { fields: ['department'] },
    { fields: ['isActive'] }
  ]
});

module.exports = Employee;