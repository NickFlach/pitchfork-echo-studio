# 🚀 Pitchfork Protocol Deployment Guide

Complete guide for deploying the decentralized resistance platform.

## 📋 Prerequisites

### Required Services
- **IPFS Node** - Decentralized storage
- **Blockchain RPC** - Ethereum/Polygon node access (Alchemy/Infura)
- **Redis** - Session management
- **Domain & SSL** - HTTPS certificate

### Required API Keys
- Blockchain RPC URLs (Alchemy/Infura)
- AI Provider Keys (OpenAI, Anthropic, Gemini)
- IPFS Service (Pinata or Web3.Storage)

---

## 🔧 Environment Setup

### 1. Configure Environment
```bash
cp .env.example.comprehensive .env
```

### 2. Critical Variables
```env
# Server
NODE_ENV=production
API_PORT=3001
FRONTEND_PORT=8080

# Security
JWT_SECRET="your-secure-jwt-secret"
ENCRYPTION_KEY="your-32-char-encryption-key"

# Blockchain
ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
POLYGON_RPC_URL="https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY"

# IPFS
IPFS_API_URL="http://localhost:5001"
PINATA_API_KEY="your-pinata-key"

# AI Providers
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Features
FEATURE_WEB3_ENABLED=true
FEATURE_IPFS_ENABLED=true
FEATURE_AI_CONSCIOUSNESS=true
```

---

## 🐳 Docker Deployment

### Quick Start
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Access application
# Frontend: http://localhost:8080
# API: http://localhost:3001
# IPFS: http://localhost:8081
```

### Services Included
- **Frontend** - React application
- **API** - Backend services
- **IPFS** - Decentralized storage
- **Redis** - Session cache

---

## 📜 Smart Contract Deployment

### 1. Configure Network
```bash
# Edit hardhat.config.ts
# Add your network RPC URLs and private key
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Deploy to Testnet (Sepolia)
```bash
# Fund deployer wallet with testnet ETH
# Get from: https://sepoliafaucet.com/

# Deploy contracts
npx hardhat run scripts/deploy-contracts.js --network sepolia

# Copy contract addresses to .env
PITCHFORK_FUNDING_ADDRESS="0x..."
PITCHFORK_GOVERNANCE_ADDRESS="0x..."
```

### 4. Verify Contracts
```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

### 5. Deploy to Mainnet
```bash
# ⚠️  WARNING: This costs real money!
# Ensure you have sufficient ETH for gas fees

npx hardhat run scripts/deploy-contracts.js --network mainnet
```

---

## 🌐 IPFS Setup

### Option 1: Local IPFS Node
```bash
# Included in docker-compose
docker-compose up -d ipfs

# Access gateway
curl http://localhost:8081/ipfs/QmHash...
```

### Option 2: Pinata Service
```env
PINATA_API_KEY="your-api-key"
PINATA_SECRET_KEY="your-secret-key"
```

### Option 3: Web3.Storage
```env
WEB3_STORAGE_API_KEY="your-web3-storage-key"
```

---

## 🔐 Security Checklist

### Pre-Deployment
- [ ] All secrets generated securely
- [ ] Private keys stored in secure vault
- [ ] Smart contracts audited
- [ ] Rate limiting configured
- [ ] CORS restricted to production domain
- [ ] SSL/TLS certificate installed
- [ ] Firewall rules configured
- [ ] DDoS protection enabled

### Smart Contract Security
- [ ] Contracts compiled without warnings
- [ ] Access controls implemented
- [ ] Emergency pause functionality tested
- [ ] Upgrade mechanism secured
- [ ] Gas optimization completed
- [ ] Event logging comprehensive

---

## 📊 Monitoring

### Health Checks
```bash
# API health
curl http://localhost:3001/health

# Detailed status
curl http://localhost:3001/ready

# Metrics
curl http://localhost:3001/metrics
```

### Monitor Blockchain
- Track contract events
- Monitor gas prices
- Watch transaction confirmations
- Alert on failed transactions

### IPFS Monitoring
- Check pin status
- Monitor storage usage
- Verify gateway availability

---

## 🚨 Troubleshooting

### Contract Deployment Fails
```bash
# Check gas price
npx hardhat run scripts/check-gas-price.js

# Verify wallet balance
npx hardhat run scripts/check-balance.js

# Test on local network first
npx hardhat node
npx hardhat run scripts/deploy-contracts.js --network localhost
```

### IPFS Connection Issues
```bash
# Check IPFS daemon
ipfs id

# Test upload
echo "test" | ipfs add

# Check peers
ipfs swarm peers
```

### Web3 Wallet Connection
- Ensure MetaMask is installed
- Check correct network selected
- Verify contract addresses in .env
- Clear browser cache and cookies

---

## 📚 Post-Deployment

### 1. Update Frontend Config
```typescript
// Update contract addresses in frontend
const CONTRACTS = {
  funding: "0x...",
  governance: "0x...",
};
```

### 2. Test All Features
- [ ] Wallet connection
- [ ] Identity verification
- [ ] Document upload to IPFS
- [ ] Smart contract interactions
- [ ] Governance voting
- [ ] Campaign funding
- [ ] Consciousness features

### 3. Monitor & Maintain
- Check logs daily
- Monitor error rates
- Update dependencies
- Rotate secrets quarterly
- Review smart contract events

---

## 🎯 Production Checklist

- [ ] Environment variables set
- [ ] Smart contracts deployed
- [ ] IPFS configured
- [ ] SSL certificate active
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discord**: Community server
- **Email**: support@pitchfork.protocol

---

**Ready to Fight Corruption? 🔱**

Deploy with confidence and help build a better world!
