# 🚀 Mainnet Deployment Configuration Reference

This folder contains all the templates and variables needed for Base mainnet deployment.

## 📅 **Deployment Phases**

### **Phase 1: Launch with VIRTUAL-only minting** (Week 0)
- Deploy NFT contract on Base mainnet
- Only VIRTUAL minting enabled
- VERT token address set to `address(0)` initially
- No prize pool yet

### **Phase 2: VERT Token Launch** (Week 1-2)
- VERT token deployed via Virtuals Genesis Protocol
- Update NFT contract with VERT token address
- Enable VERT minting
- Staking contract deployed (track for tiers)

### **Phase 3: Prize Pool Funding** (Week 3-5)
- Fund prize pool with VERT tokens
- Enable prize claiming functionality
- Full prize mechanics active

### **Phase 4: Staking Integration** (Ongoing)
- Track user staking tiers from staking contract
- Display staking bonuses and tiers
- Implement staking-based benefits

## 📁 **Reference Files**

### Core Configuration
- `mainnet.env.template` - All environment variables to update
- `mainnet.addresses.json` - Contract addresses template
- `deployment-checklist.md` - Step-by-step deployment guide

### Phase-Specific
- `phase1-virtual-only.md` - Initial deployment with VIRTUAL only
- `phase2-vert-integration.md` - Adding VERT token functionality
- `phase3-prize-pool.md` - Funding and enabling prizes
- `phase4-staking-tiers.md` - Staking integration requirements

### Scripts & Code
- `deploy-mainnet.js` - Mainnet deployment script
- `wagmi-mainnet-config.ts` - Frontend chain configuration
- `contract-updates.md` - Required code changes summary

## ⚠️ **Critical Variables to Update**

See individual files for complete lists, but key items:
- **NFT Contract Address** (deploy first)
- **VERT Token Address** (TBD - from Virtuals Protocol)
- **VIRTUAL Token Address** (0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b)
- **Staking Contract Address** (TBD - from Virtuals Protocol)
- **Treasury Wallet Address** (your mainnet treasury)
- **RPC URLs** (Base mainnet endpoints)
- **API Keys** (Alchemy mainnet, BaseScan, etc.)

## 🔗 **Quick Reference Links**

- **Base Mainnet Chain ID**: 8453
- **Base Mainnet RPC**: https://mainnet.base.org
- **BaseScan**: https://basescan.org
- **VIRTUAL Token (Mainnet)**: 0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b 