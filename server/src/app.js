const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');


const app = express();

// Security & Utility Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Correlation ID Middleware
app.use((req, res, next) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || uuidv4();
  next();
});

// Logging Middleware
app.use(
  morgan('combined', {
    stream: {
      write: message => {
        // Create a simple object for morgan logs to fit into our logger structure if needed,
        // or just trust morgan to log to stdout (which our logger captures in dev) or file.
        // For now, let's keep it simple and standard.
      }
    }
  })
);

// Static Files (for builds and heroes)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes 
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use(routes);

// Error Handler
app.use(errorHandler);

module.exports = app;
