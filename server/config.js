import dotenv from 'dotenv';
dotenv.config();

const config = {
  // Server configuration
  apiPort: parseInt(process.env.API_PORT || '3001', 10),
  frontendPort: parseInt(process.env.FRONTEND_PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // URLs
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3001',
  frontendUrl: process.env.VITE_FRONTEND_URL || 'http://localhost:8080',

  // Security
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  encryptionKey: process.env.ENCRYPTION_KEY || 'fallback-encryption-key-change-in-production',

  // Web3
  supportedChains: (process.env.SUPPORTED_CHAINS || '1,137,56,5,11155111,80001,97')
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id)),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://0.0.0.0:8080')
    .split(',')
    .map(origin => origin.trim()),
};

export default config;
