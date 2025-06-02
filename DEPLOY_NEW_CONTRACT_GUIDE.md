# 🚀 Deploy New Contract - Complete Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **1. Environment Setup**
Ensure you have the following environment variables in your `.env` file:
```bash
# Required for deployment
MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=your_private_key_here
TREASURY_WALLET=your_treasury_address_here

# Optional but recommended
BASESCAN_API_KEY=your_basescan_api_key_here
```

### ✅ **2. Verify Contract Changes**
```bash
# Compile the new contract
npx hardhat compile

# Check for any compilation errors
# Verify VerticalProjectNFT_Fixed.sol contains auto-sync features
```

### ✅ **3. Test Contract Locally**
```bash
# Run all tests to ensure contract works
npx hardhat test

# Test specific auto-sync functionality
node scripts/test_prize_pool.js
```

---

## 🚀 **Step-by-Step Deployment Process**

### **Step 1: Deploy New Contract**
```bash
# Deploy to Base Mainnet
npx hardhat run mainnet-config/deploy-mainnet.js --network base_mainnet
```

**Expected Output:**
```
🚀 Starting Base Mainnet Deployment - Phase 1 (VIRTUAL only)
============================================================

📋 Deployment Configuration:
VIRTUAL Token: 0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
VERT Token: 0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
Treasury: [YOUR_TREASURY_ADDRESS]

👤 Deploying with account: [YOUR_DEPLOYER_ADDRESS]
💰 Deployer balance: X.XX ETH

⛽ Estimating deployment gas...
🚀 Deploying VerticalProjectNFT...
⏳ Waiting for deployment confirmation...

✅ Deployment successful!
📍 Contract Address: 0x[NEW_CONTRACT_ADDRESS]
```

**📝 IMPORTANT: Copy the new contract address!**

### **Step 2: Verify Contract on BaseScan**
The deployment script should auto-verify, but if it fails:
```bash
npx hardhat verify --network base_mainnet [NEW_CONTRACT_ADDRESS] \
  "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b" \
  "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b" \
  "[YOUR_TREASURY_ADDRESS]"
```

### **Step 3: Test New Contract**
```bash
# Update the contract address temporarily for testing
export NEXT_PUBLIC_CONTRACT_ADDRESS=[NEW_CONTRACT_ADDRESS]

# Test basic contract functions
npx hardhat run scripts/test_view_functions.js --network base_mainnet
```

### **Step 4: Update All Contract Addresses**
```bash
# Use the automation script to update all files
node CONTRACT_UPDATE_AUTOMATION.js [NEW_CONTRACT_ADDRESS]
```

This will:
- ✅ Create backup of all files
- ✅ Update 21+ files with new contract address
- ✅ Generate environment variable templates
- ✅ Create deployment summary

### **Step 5: Update Environment Variables**

**Local Development:**
```bash
# Update your .env.local file
NEXT_PUBLIC_CONTRACT_ADDRESS=[NEW_CONTRACT_ADDRESS]
CONTRACT_ADDRESS=[NEW_CONTRACT_ADDRESS]
```

**Vercel Production:**
1. Go to Vercel Dashboard
2. Navigate to your project
3. Go to Settings → Environment Variables
4. Update `NEXT_PUBLIC_CONTRACT_ADDRESS`
5. Update `CONTRACT_ADDRESS`
6. Click "Save"

### **Step 6: Test Frontend Integration**
```bash
# Start local development server
npm run dev

# Test the following:
# ✅ Contract stats load correctly
# ✅ Admin terminal connects to new contract
# ✅ Mint functions work (if you have tokens)
# ✅ Prize pool displays correctly
```

### **Step 7: Deploy to Production**
```bash
# Commit all changes
git add .
git commit -m "🚀 Deploy new contract with auto-sync functionality

- New contract: [NEW_CONTRACT_ADDRESS]
- Added auto-sync for direct VERT transfers
- Updated all references to new contract address
- Enhanced gas estimates for auto-sync operations"

# Push to main branch (triggers Vercel deployment)
git push origin main
```

### **Step 8: Verify Production Deployment**
1. **Check Vercel deployment completes successfully**
2. **Visit your production URL**
3. **Test wallet connection**
4. **Verify contract stats load**
5. **Test admin terminal (if you're the deployer)**

---

## 🔍 **Post-Deployment Verification**

### **Automated Tests**
```bash
# Run comprehensive tests on new contract
node scripts/run_all_tests.js

# Test auto-sync functionality specifically
node scripts/test_admin_functions.js
```

### **Manual Verification Checklist**
- [ ] **Contract verified on BaseScan**
- [ ] **Frontend loads without errors**
- [ ] **Stats display correctly (Total Minted, Prize Pool)**
- [ ] **Admin terminal visible to deployer**
- [ ] **Mint buttons enabled for connected wallets**
- [ ] **OpenSea collection created (new NFTs will appear here)**

### **Monitor for 24 Hours**
- [ ] **Gas costs are reasonable**
- [ ] **Auto-sync triggers correctly**
- [ ] **No unexpected errors in logs**
- [ ] **Prize pool updates properly**

---

## 🚨 **Emergency Rollback Plan**

If issues arise with the new contract:

### **Immediate Actions**
```bash
# 1. Pause the new contract (if you can access it)
npx hardhat run scripts/pause_contract.js --network base_mainnet

# 2. Revert to old contract addresses
node CONTRACT_UPDATE_AUTOMATION.js 0xc03605b09aF6010bb2097d285b9aF4024ecAf098

# 3. Update environment variables back to old contract
# In Vercel: NEXT_PUBLIC_CONTRACT_ADDRESS=0xc03605b09aF6010bb2097d285b9aF4024ecAf098

# 4. Redeploy frontend with old contract
git add .
git commit -m "🚨 Emergency rollback to old contract"
git push origin main
```

### **Investigation**
1. **Check contract state on BaseScan**
2. **Review deployment logs**
3. **Test contract functions individually**
4. **Fix issues and redeploy when ready**

---

## 📊 **Key Differences: New vs Old Contract**

| Feature | Old Contract | New Contract |
|---------|-------------|--------------|
| **Direct VERT transfers** | ❌ Not supported | ✅ Auto-synced |
| **Manual sync function** | ❌ Not available | ✅ `syncPrizePool()` |
| **Unaccounted balance check** | ❌ Not available | ✅ `getUnaccountedBalance()` |
| **Auto-sync events** | ❌ No events | ✅ `PrizePoolSynced`, `AutoSyncFailed` |
| **Gas costs** | Lower (no auto-sync) | Slightly higher (+40% buffer) |
| **UX for donations** | Manual process | Seamless (just send VERT) |

---

## 🎯 **New Contract Benefits**

### **For Users:**
- ✅ **Easy donations**: Just send VERT to contract address
- ✅ **Automatic sync**: No manual steps required
- ✅ **Transparent tracking**: All events logged on-chain

### **For Admins:**
- ✅ **Real-time monitoring**: Admin terminal shows unaccounted tokens
- ✅ **Manual sync option**: Force sync if needed
- ✅ **Better debugging**: Enhanced error handling and events

### **For The Project:**
- ✅ **Increased prize pool**: Easier for users to contribute
- ✅ **Better UX**: Seamless donation process
- ✅ **Enhanced transparency**: All operations on-chain

---

## 📞 **Support & Troubleshooting**

### **Common Issues**

**1. "Contract not found" error**
- Check environment variables are updated
- Verify new contract address is correct
- Ensure network is Base Mainnet (Chain ID: 8453)

**2. "Admin terminal not visible"**
- Ensure your wallet address is the contract deployer
- Check if contract address is correct in AdminTerminal.tsx
- Verify contract owner() function returns your address

**3. "Gas estimation failed"**
- Auto-sync functionality requires higher gas limits
- The contract automatically adds 40% buffer
- Ensure you have enough ETH for gas fees

**4. "Auto-sync not working"**
- Direct VERT transfers should trigger auto-sync on next mint
- Use admin terminal to manually sync if needed
- Check contract events for AutoSyncFailed events

### **Getting Help**
- Check BaseScan contract page for errors
- Review browser console for frontend issues
- Use admin terminal for real-time contract monitoring
- Run test scripts to verify contract functionality

---

*Last Updated: [UPDATE_DATE]*
*Contract Version: VerticalProjectNFT_Fixed.sol with Auto-Sync v2.0* 