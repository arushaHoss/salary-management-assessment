// backend/src/app.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const employeeRoutes = require('./routes/employees');
const insightRoutes = require('./routes/insights');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/insights', insightRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling (must be last)
app.use(errorHandler);

module.exports = app;
