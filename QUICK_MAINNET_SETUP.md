# 🚀 Quick Base Mainnet Setup Guide

## Minimal Environment Variables Needed

Since you already have `PRIVATE_KEY` in your `.env` file, you only need to add these to `.env.local`:

```bash
# Required for Base Mainnet deployment
MAINNET_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
TREASURY_WALLET=YOUR_TREASURY_WALLET_ADDRESS
BASESCAN_API_KEY=YOUR_BASESCAN_API_KEY

# Frontend configuration  
NEXT_PUBLIC_ALCHEMY_KEY=YOUR_ALCHEMY_KEY
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_NETWORK_NAME=base
NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS=0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
NEXT_PUBLIC_VERT_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TREASURY_ADDRESS=YOUR_TREASURY_WALLET_ADDRESS
```

## What You DON'T Need to Set

- ✅ **PRIVATE_KEY** - Already in your `.env` file
- ✅ **VERT_TOKEN_ADDRESS** - Defaults to zero address for Phase 1
- ✅ **CONTRACT_ADDRESS** - Will be set after deployment

## Quick Deployment Steps

1. **Create `.env.local** with the variables above
2. **Verify setup**:
   ```bash
   npx hardhat run scripts/verify-mainnet-setup.js --network base_mainnet
   ```
3. **Deploy**:
   ```bash
   npx hardhat run scripts/deploy-mainnet-manual-sync.js --network base_mainnet
   ```

## After Deployment

Add these to your `.env.local`:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=DEPLOYED_CONTRACT_ADDRESS
CONTRACT_ADDRESS=DEPLOYED_CONTRACT_ADDRESS  
NEXT_PUBLIC_ADMIN_WALLET_ADDRESS=YOUR_DEPLOYER_ADDRESS
```

That's it! The contract is designed to handle Phase 1 (VIRTUAL-only) deployment without needing the VERT token address. 