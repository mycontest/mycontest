require('dotenv').config();

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000'),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'mycontest_db',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10')
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
    name: 'mycontest.sid'
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10')
  },

  // Compiler
  compiler: {
    timeout: parseInt(process.env.COMPILER_TIMEOUT || '5000'),
    memoryLimit: parseInt(process.env.COMPILER_MEMORY_LIMIT || '256')
  },

  // Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
  }
};

// Validate critical config
const validateConfig = () => {
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('   Using default values - NOT recommended for production!');
  }
};

validateConfig();

module.exports = config;
