// backend/src/server.js
require('dotenv').config();
const app = require('./app');
const { syncDatabase } = require('./models');

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // Sync database
    await syncDatabase();
    console.log('✓ Database synced');

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
