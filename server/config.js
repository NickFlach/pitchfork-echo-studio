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

  // Security — never fall back to empty strings, JWT/encryption secrets must be explicitly set
  jwtSecret: process.env.JWT_SECRET,
  encryptionKey: process.env.ENCRYPTION_KEY,

  // Web3
  supportedChains: (process.env.SUPPORTED_CHAINS || '1,137,56,5,11155111,80001,97')
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id)),

  ethereumRpcUrl: process.env.ETHEREUM_RPC_URL,
  polygonRpcUrl: process.env.POLYGON_RPC_URL,
  bscRpcUrl: process.env.BSC_RPC_URL,

  // External services
  redisUrl: process.env.REDIS_URL,
  ipfsApiUrl: process.env.IPFS_API_URL,
  ipfsGatewayUrl: process.env.IPFS_GATEWAY_URL,

  // Space Child SSO federation
  spacechildAuthUrl: process.env.SPACECHILD_AUTH_URL || 'https://auth.spacechild.love',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://0.0.0.0:8080')
    .split(',')
    .map(origin => origin.trim()),
};

// Basic runtime validation — enforced in every environment, not just production.
// An unset/empty JWT_SECRET would let any caller forge valid tokens, so we fail fast.
function assertStrongSecrets() {
  if (!config.jwtSecret || config.jwtSecret.length < 24) {
    throw new Error('JWT_SECRET must be set and at least 24 chars (no environment may run without it)');
  }
  if (!config.encryptionKey || config.encryptionKey.length < 32) {
    throw new Error('ENCRYPTION_KEY must be set and at least 32 chars (no environment may run without it)');
  }
}

assertStrongSecrets();

export default config;
