# ✅ Mainnet Deployment Checklist

## 🚀 **Pre-Deployment Preparation**

### **Environment Setup**
- [ ] **Get Base mainnet Alchemy API key**
- [ ] **Get BaseScan API key**
- [ ] **Create mainnet treasury wallet**
- [ ] **Create mainnet deployer wallet with ETH**
- [ ] **Backup all private keys securely**
- [ ] **Test all API keys work correctly**

### **Code Preparation**
- [ ] **Update hardhat.config.js with mainnet network**
- [ ] **Test deployment script on testnet first**
- [ ] **Update all contract addresses in config files**
- [ ] **Remove/reduce debug logging for production**
- [ ] **Update chain configuration (84532 → 8453)**
- [ ] **Update RPC URLs (sepolia → mainnet)**

### **Documentation**
- [ ] **Update README.md for mainnet**
- [ ] **Update ENVIRONMENT_SETUP.md**
- [ ] **Prepare mainnet addresses documentation**
- [ ] **Create deployment announcement content**

---

## 📅 **Phase 1: VIRTUAL-Only Launch**

### **Contract Deployment**
- [ ] **Deploy NFT contract to Base mainnet**
  - [ ] VIRTUAL token: `0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b`
  - [ ] VERT token: `address(0)` (disabled)
  - [ ] Treasury: Your mainnet address
- [ ] **Verify contract on BaseScan**
- [ ] **Test basic contract functions**
- [ ] **Confirm VIRTUAL minting works**
- [ ] **Verify VERT minting is disabled**

### **Frontend Configuration**
- [ ] **Update .env.local with mainnet values**
  ```bash
  NEXT_PUBLIC_CONTRACT_ADDRESS=[DEPLOYED_ADDRESS]
  NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS=0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
  NEXT_PUBLIC_VERT_TOKEN_ADDRESS=  # Leave empty
  NEXT_PUBLIC_CHAIN_ID=8453
  ```
- [ ] **Update wagmi configuration to use base chain**
- [ ] **Update all chain ID references (84532 → 8453)**
- [ ] **Test frontend connects to mainnet**
- [ ] **Hide VERT minting UI elements**

### **Vercel Deployment**
- [ ] **Set environment variables in Vercel dashboard**
- [ ] **Deploy frontend to production**
- [ ] **Test production deployment**
- [ ] **Verify all functionality works on live site**

### **Testing & Verification**
- [ ] **Test VIRTUAL minting end-to-end**
- [ ] **Verify NFT generation works**
- [ ] **Test IPFS uploads and metadata**
- [ ] **Check social sharing functionality**
- [ ] **Test mint leaderboard updates**
- [ ] **Verify gas estimates are reasonable**

### **Launch**
- [ ] **Announce Phase 1 launch**
- [ ] **Monitor for issues**
- [ ] **Track minting activity**
- [ ] **Gather user feedback**

---

## 📅 **Phase 2: VERT Token Integration**

### **Prerequisites**
- [ ] **VERT token deployed by Virtuals Protocol**
- [ ] **Get official VERT token address**
- [ ] **Verify VERT token contract**

### **Contract Updates**
- [ ] **Call `setVertToken(vertTokenAddress)` on NFT contract**
- [ ] **Test VERT minting functionality**
- [ ] **Verify both VIRTUAL and VERT minting work**

### **Frontend Updates**
- [ ] **Add VERT token address to environment**
  ```bash
  NEXT_PUBLIC_VERT_TOKEN_ADDRESS=[VERT_TOKEN_ADDRESS]
  ```
- [ ] **Enable VERT minting UI**
- [ ] **Update mint terminal to show both options**
- [ ] **Test VERT approval flow**
- [ ] **Update pricing displays**

### **Testing**
- [ ] **Test VERT minting end-to-end**
- [ ] **Verify both mint methods work**
- [ ] **Test token approvals**
- [ ] **Check gas estimates for both methods**

### **Deployment**
- [ ] **Deploy frontend updates**
- [ ] **Announce VERT minting availability**
- [ ] **Monitor both minting methods**

---

## 📅 **Phase 3: Prize Pool Funding**

### **Prerequisites**
- [ ] **2-4 weeks after VERT token launch**
- [ ] **Sufficient VERT tokens for prize pool**
- [ ] **Prize pool funding strategy defined**

### **Contract Setup**
- [ ] **Transfer VERT tokens to prize pool**
- [ ] **Verify prize pool balance shows correctly**
- [ ] **Test prize claiming functionality**
- [ ] **Set appropriate prize percentages**

### **Frontend Updates**
- [ ] **Enable prize pool displays**
  ```bash
  PRIZE_POOL_ENABLED=true
  ```
- [ ] **Show prize pool terminal**
- [ ] **Display "PAID OUT" statistics**
- [ ] **Enable prize claiming notifications**

### **Testing**
- [ ] **Test prize calculations**
- [ ] **Verify prize claiming works**
- [ ] **Check prize pool balance updates**
- [ ] **Test all rarity prize amounts**

### **Launch**
- [ ] **Announce prize pool launch**
- [ ] **Monitor prize claims**
- [ ] **Track prize pool depletion rate**

---

## 📅 **Phase 4: Staking Integration**

### **Prerequisites**
- [ ] **Staking contract deployed by Virtuals Protocol**
- [ ] **Get staking contract address and ABI**
- [ ] **Understand staking mechanics**

### **Development**
- [ ] **Create staking components**
  - [ ] StakingTierTerminal.tsx
  - [ ] StakingLeaderboard.tsx
  - [ ] StakingStats.tsx
- [ ] **Implement staking service**
- [ ] **Add staking configuration**

### **Frontend Integration**
- [ ] **Add staking contract address to environment**
  ```bash
  NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=[STAKING_ADDRESS]
  NEXT_PUBLIC_STAKING_ENABLED=true
  ```
- [ ] **Integrate staking tier display**
- [ ] **Implement tier-based benefits**
- [ ] **Add staking leaderboards**

### **Testing**
- [ ] **Test staking tier detection**
- [ ] **Verify tier benefits work**
- [ ] **Test staking leaderboards**
- [ ] **Check tier-based discounts**

### **Launch**
- [ ] **Deploy staking features**
- [ ] **Announce staking integration**
- [ ] **Monitor staking metrics**

---

## 🔐 **Security Checklist**

### **Smart Contract Security**
- [ ] **Audit smart contract code**
- [ ] **Verify constructor parameters**
- [ ] **Test all admin functions**
- [ ] **Check access controls**
- [ ] **Verify pause/unpause functionality**

### **Frontend Security**
- [ ] **Remove debug console logs**
- [ ] **Sanitize error messages (hide API keys)**
- [ ] **Verify environment variables are secure**
- [ ] **Check for hardcoded secrets**
- [ ] **Test with production data**

### **Infrastructure Security**
- [ ] **Secure private keys**
- [ ] **Use environment variables for secrets**
- [ ] **Set up monitoring/alerts**
- [ ] **Backup important data**
- [ ] **Document emergency procedures**

---

## 📊 **Post-Launch Monitoring**

### **Metrics to Track**
- [ ] **Total NFTs minted**
- [ ] **VIRTUAL vs VERT mint distribution**
- [ ] **Prize pool depletion rate**
- [ ] **User engagement metrics**
- [ ] **Gas usage and costs**
- [ ] **Error rates and failures**

### **Tools & Dashboards**
- [ ] **Set up BaseScan monitoring**
- [ ] **Configure Alchemy dashboard**
- [ ] **Set up error tracking**
- [ ] **Create analytics dashboard**
- [ ] **Monitor social media engagement**

### **Maintenance Tasks**
- [ ] **Regular balance checks**
- [ ] **Monitor contract health**
- [ ] **Update documentation as needed**
- [ ] **Plan future feature releases**
- [ ] **Gather and analyze user feedback**

---

## 🚨 **Emergency Procedures**

### **If Something Goes Wrong**
- [ ] **Contact information for team members**
- [ ] **Contract pause procedures**
- [ ] **Rollback plan for frontend**
- [ ] **Communication plan for users**
- [ ] **Backup RPC endpoints ready**

### **Common Issues & Solutions**
- [ ] **RPC endpoint failures** → Switch to backup
- [ ] **High gas prices** → Pause/adjust parameters
- [ ] **IPFS failures** → Switch gateways
- [ ] **Contract issues** → Pause and investigate
- [ ] **Frontend bugs** → Quick rollback procedure

---

## 📋 **Final Pre-Launch Checklist**

### **24 Hours Before Launch**
- [ ] **Final code review**
- [ ] **Test everything on testnet**
- [ ] **Prepare announcement materials**
- [ ] **Brief all team members**
- [ ] **Set up monitoring tools**

### **Launch Day**
- [ ] **Deploy contracts**
- [ ] **Update frontend**
- [ ] **Test basic functionality**
- [ ] **Make launch announcement**
- [ ] **Monitor closely for first few hours**

### **Post-Launch (First Week)**
- [ ] **Daily monitoring**
- [ ] **User feedback collection**
- [ ] **Performance optimization**
- [ ] **Bug fixes as needed**
- [ ] **Prepare for next phase** 