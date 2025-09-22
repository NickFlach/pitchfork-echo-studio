# 🚀 Pitchfork Protocol Web3 Testing Guide

## Overview
This guide will help you test the complete Web3 integration of Pitchfork Protocol, including MetaMask wallet connection, smart contracts, and decentralized features.

## Prerequisites

### 1. Install MetaMask
- Download MetaMask browser extension: https://metamask.io/
- Create a new wallet or import existing one
- **IMPORTANT**: Use testnet for testing (Sepolia, Goerli, or local network)

### 2. Get Test ETH
- For Sepolia testnet: https://sepoliafaucet.com/
- For Goerli testnet: https://goerlifaucet.com/
- For local development: Use Hardhat/Ganache local blockchain

### 3. Network Configuration
Add these networks to MetaMask if testing on testnets:

**Sepolia Testnet:**
- Network Name: Sepolia
- RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- Chain ID: 11155111
- Currency Symbol: ETH

## 🧪 Testing Checklist

### Phase 1: Wallet Connection
- [ ] Open Pitchfork Protocol at http://localhost:8081
- [ ] Click "Connect Wallet" button in navigation
- [ ] Select MetaMask from wallet options
- [ ] Approve connection in MetaMask popup
- [ ] Verify wallet address appears in navigation
- [ ] Check network badge shows correct chain

### Phase 2: Identity Verification
- [ ] Navigate to Identity page (/identity)
- [ ] Verify wallet connection status
- [ ] Test basic verification process
- [ ] Check blockchain storage integration
- [ ] Verify progressive verification levels

### Phase 3: Governance Testing
- [ ] Navigate to Governance page (/governance)
- [ ] Create a new proposal
- [ ] Vote on existing proposals
- [ ] Check vote recording on blockchain
- [ ] Test proposal finalization

### Phase 4: Funding Campaigns
- [ ] Navigate to Support page (/support)
- [ ] Create a new funding campaign
- [ ] Make a contribution to campaign
- [ ] Check fund tracking and transparency
- [ ] Test fund withdrawal (creator only)

### Phase 5: Document Verification
- [ ] Navigate to Verify page (/verify)
- [ ] Upload a document
- [ ] Check IPFS storage integration
- [ ] Verify blockchain timestamp
- [ ] Test document retrieval

### Phase 6: Secure Messaging
- [ ] Navigate to Messages page (/messages)
- [ ] Test P2P connection setup
- [ ] Send encrypted messages
- [ ] Verify end-to-end encryption
- [ ] Check WebRTC functionality

## 🔧 Development Testing

### Local Blockchain Setup
```bash
# Install Hardhat for local blockchain
npm install --save-dev hardhat

# Start local blockchain
npx hardhat node

# Deploy contracts
node scripts/deploy-contracts.js
```

### Contract Interaction Testing
```javascript
// Test funding contract
const fundingContract = new ethers.Contract(
  FUNDING_CONTRACT_ADDRESS,
  FUNDING_ABI,
  signer
);

// Create campaign
const tx = await fundingContract.createCampaign(
  "Test Campaign",
  "Testing blockchain integration",
  ethers.parseEther("1.0"), // 1 ETH goal
  30 // 30 days duration
);
```

## 🐛 Common Issues & Solutions

### Issue: "No Web3 wallet detected"
**Solution**: Install MetaMask and refresh the page

### Issue: "Wrong network" warning
**Solution**: Switch MetaMask to supported network (Ethereum, Polygon, etc.)

### Issue: Transaction fails
**Solution**: 
- Check you have enough ETH for gas fees
- Verify contract addresses are correct
- Check network congestion

### Issue: IPFS upload fails
**Solution**: 
- Check IPFS node connection
- Verify file size limits
- Try again after network stabilizes

## 📊 Expected Behavior

### Successful Wallet Connection
- Green "Connected" badge appears
- Wallet address shown (truncated)
- Network name displayed
- All Web3 features become available

### Successful Transaction
- MetaMask popup for transaction approval
- Transaction hash returned
- Blockchain confirmation
- UI updates with new state

### Successful IPFS Storage
- File uploaded to IPFS network
- Hash returned and stored on blockchain
- Document retrievable via hash
- Tamper-proof verification

## 🔒 Security Notes

### For Testing
- **NEVER** use mainnet with real funds for testing
- Use dedicated test wallets only
- Keep private keys secure
- Test on testnets first

### For Production
- Audit smart contracts before mainnet deployment
- Use hardware wallets for large amounts
- Implement multi-signature for critical functions
- Regular security assessments

## 📈 Performance Metrics

### Expected Response Times
- Wallet connection: < 3 seconds
- Transaction submission: < 5 seconds
- Blockchain confirmation: 15-30 seconds (testnet)
- IPFS upload: < 10 seconds
- Document retrieval: < 5 seconds

### Gas Usage Estimates
- Create campaign: ~200,000 gas
- Vote on proposal: ~100,000 gas
- Contribute to campaign: ~80,000 gas
- Identity verification: ~150,000 gas

## 🎯 Success Criteria

### Full Integration Success
- [ ] All wallet connections work smoothly
- [ ] Smart contracts deploy and function correctly
- [ ] IPFS storage and retrieval operational
- [ ] P2P messaging establishes connections
- [ ] All transactions confirm on blockchain
- [ ] UI updates reflect blockchain state
- [ ] Error handling works gracefully
- [ ] Performance meets expectations

## 🚀 Next Steps After Testing

1. **Mainnet Preparation**
   - Security audit smart contracts
   - Optimize gas usage
   - Set up monitoring systems

2. **User Experience**
   - Add transaction status indicators
   - Implement retry mechanisms
   - Improve error messages

3. **Advanced Features**
   - Multi-signature wallets
   - Layer 2 integration
   - Cross-chain functionality

---

## 🆘 Support

If you encounter issues during testing:

1. Check browser console for error messages
2. Verify MetaMask connection and network
3. Ensure sufficient test ETH for transactions
4. Review this guide for common solutions
5. Check GitHub issues for known problems

**Happy Testing! 🎉**

The future of decentralized resistance starts with thorough testing!
