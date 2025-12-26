require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config');
const apiRoutes = require('./api/routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimit');

// Initialize Express app
const app = express();

// Trust proxy (if behind reverse proxy like Nginx)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors(config.cors));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Session configuration
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  name: config.session.name,
  cookie: {
    httpOnly: true,
    secure: config.nodeEnv === 'production', // HTTPS only in production
    maxAge: config.session.maxAge,
    sameSite: 'lax'
  }
}));

// Rate limiting
app.use(generalLimiter);

// Mount API routes
app.use(config.apiPrefix, apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MyContest API Server',
    version: '2.0.0',
    docs: `${config.apiPrefix}/health`,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   MyContest API Server v2.0.0              ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   Environment: ${config.nodeEnv.padEnd(28)} ║`);
  console.log(`║   Port: ${PORT.toString().padEnd(35)} ║`);
  console.log(`║   API Prefix: ${config.apiPrefix.padEnd(27)} ║`);
  console.log(`║   Health: http://localhost:${PORT}${config.apiPrefix}/health`);
  console.log('╚════════════════════════════════════════════╝');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
