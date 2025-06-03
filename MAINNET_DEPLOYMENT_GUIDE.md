# 🚀 Base Mainnet Deployment Guide - VerticalProjectNFT_WithManualSync

## Overview
This guide covers deploying the enhanced VerticalProjectNFT contract with manual sync functionality to Base mainnet.

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
Create `.env.local` file with the following variables (use template from `mainnet-config/deploy.env.template`):

```bash
# Required for deployment
MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=YOUR_DEPLOYER_PRIVATE_KEY
TREASURY_WALLET=YOUR_TREASURY_WALLET_ADDRESS
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY

# Frontend configuration
NEXT_PUBLIC_ALCHEMY_KEY=YOUR_ALCHEMY_KEY
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_NETWORK_NAME=base
NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS=0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
NEXT_PUBLIC_VERT_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
```

### 2. Wallet Requirements
- **Deployer wallet** with sufficient ETH for deployment (~0.01-0.02 ETH)
- **Treasury wallet** configured for receiving funds
- **Admin wallet** (typically the deployer) for manual sync operations

### 3. Network Configuration
The `hardhat.config.js` is already configured for Base mainnet:
- Network: `base_mainnet`
- Chain ID: `8453`
- RPC: Uses `MAINNET_RPC_URL` environment variable

## 🚀 Deployment Steps

### Step 1: Compile Contracts
```bash
npx hardhat compile
```

### Step 2: Deploy to Base Mainnet
```bash
npx hardhat run scripts/deploy-mainnet-manual-sync.js --network base_mainnet
```

### Step 3: Record Deployment Information
The script will output:
- ✅ Contract address
- 👤 Deployer address (admin wallet)
- 🔗 Transaction hash
- 💰 Deployment cost

**Save this information immediately!**

### Step 4: Update Environment Variables
Update your `.env.local` with the deployed contract address:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=0xYOUR_DEPLOYER_ADDRESS
```

### Step 5: Update Frontend Configuration
Update `app/page.tsx` with the new contract address if it's hardcoded anywhere.

## 🔧 Manual Sync Features

### Contract Functions Added
1. **`syncPrizePool()`** - Admin-only function to sync unaccounted VERT tokens
2. **`getUnaccountedBalance()`** - View function to check unsynced VERT
3. **`PrizePoolSynced`** event - Emitted when sync occurs

### Admin Panel Features
- **Manual Sync Button** - One-click sync of unaccounted VERT
- **Balance Display** - Shows unaccounted VERT awaiting sync
- **Price Management** - Update VIRTUAL/VERT mint prices
- **Emergency Controls** - Pause/unpause contract
- **Real-time Stats** - Contract status and statistics

### Security Model
- Only the contract owner (deployer) can call `syncPrizePool()`
- Admin cannot access user funds or NFT ownership
- Manual sync only adds untracked VERT to the prize pool

## 📊 Post-Deployment Testing

### 1. Basic Contract Functions
```bash
# Test contract deployment
npx hardhat run scripts/verify-deployment.js --network base_mainnet
```

### 2. Admin Panel Testing
1. Connect with deployer wallet
2. Verify admin panel appears
3. Test manual sync functionality (should show 0 initially)
4. Test price update functions

### 3. Minting Testing
1. Test VIRTUAL token minting (0.01 VIRTUAL)
2. Verify NFT metadata and images
3. Check treasury receives payment

## 🔍 Verification

### BaseScan Verification
The deployment script automatically submits for verification. If it fails:

```bash
npx hardhat verify --network base_mainnet YOUR_CONTRACT_ADDRESS "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b" "0x0000000000000000000000000000000000000000" "YOUR_TREASURY_ADDRESS"
```

### Manual Verification
1. Visit: https://basescan.org/verifyContract
2. Enter contract address
3. Select compiler version: 0.8.21
4. Upload contract source code

## 🌐 Production Deployment

### Frontend Updates
1. Update Vercel environment variables
2. Deploy to production
3. Test mainnet functionality
4. Monitor admin panel access

### Monitoring
1. Watch for manual sync requirements
2. Monitor VERT token launch announcements
3. Track prize pool growth
4. Monitor gas costs and optimization opportunities

## 📋 Contract Addresses

### Base Mainnet
- **VIRTUAL Token**: `0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b`
- **VERT Token**: `0x0000000000000000000000000000000000000000` (Phase 1)
- **NFT Contract**: `[FILL_AFTER_DEPLOYMENT]`
- **Treasury**: `[YOUR_TREASURY_ADDRESS]`
- **Admin**: `[YOUR_DEPLOYER_ADDRESS]`

### Reference (Testnet)
- **Current Working Contract**: `0xc03605b09aF6010bb2097d285b9aF4024ecAf098` (Base Sepolia)
- **Admin Wallet**: `0xDF449DaF03a6D4503Cc98B16c44f92e501AaaAca`

## 🚨 Important Notes

### Security
- ⚠️ Never commit `.env.local` to git
- 🔐 Store production keys in Vercel environment variables
- 👤 Admin wallet must be secure and accessible
- 💰 Treasury wallet should be a secure multisig

### Gas Optimization
- Current deployment cost: ~0.01-0.02 ETH
- Manual sync costs: ~0.0001-0.0005 ETH per sync
- Price updates: ~0.0001 ETH per update

### Phase Management
- **Phase 1**: VIRTUAL-only minting (current)
- **Phase 2**: VERT minting enabled (when VERT launches)
- **Phase 3**: Prize pool active
- **Phase 4**: Staking integration

## 🔄 Future Updates

### When VERT Token Launches
1. Update `VERT_TOKEN_ADDRESS` in environment
2. Call `setVertToken()` on contract
3. Enable VERT minting in admin panel
4. Update frontend configuration

### Manual Sync Usage
- Use when users send VERT directly to contract
- Regular monitoring recommended
- Sync adds to prize pool, benefiting all users
- No user funds at risk

## 📞 Support & Resources

- **BaseScan**: https://basescan.org
- **Base Network**: https://base.org
- **VIRTUAL Token**: https://basescan.org/token/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
- **Admin Panel**: Only visible to deployer wallet 