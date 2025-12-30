require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { sequelize } = require('./models'); // Will create models/index.js next

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Authenticate DB
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync DB (Disable in production, use migrations)
    // For Phase 1 dev, we might use sync, but PRD implies strictness so we should use migrations.
    // However, for initial startup to check connectivity:

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
