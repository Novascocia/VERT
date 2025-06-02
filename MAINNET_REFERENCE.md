# 🚀 VERTICAL PROJECT - MAINNET REFERENCE

**Last Updated:** December 31, 2024  
**Status:** ✅ PRODUCTION READY - Phase 1 Active

---

## 📍 **MAINNET CONTRACT ADDRESSES**

### **Primary NFT Contract (CORRECT)**
- **Address:** `0x653015826EdbF26Fe61ad08E5220cD6150D9cB56`
- **Network:** Base Mainnet (Chain ID: 8453)
- **Deployment Date:** December 19, 2024
- **Deployer:** `0xDF449DaF03a6D4503Cc98B16c44f92e501AaaAca`
- **BaseScan:** https://basescan.org/address/0x653015826EdbF26Fe61ad08E5220cD6150D9cB56
- **Contract Name:** VerticalProjectNFT (Fixed Version)
- **Verification Status:** ⚠️ NEEDS VERIFICATION

### **Token Addresses**
- **VIRTUAL Token:** `0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b`
  - BaseScan: https://basescan.org/address/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
- **VERT Token:** `[TO BE ANNOUNCED BY VIRTUALS PROTOCOL]`
- **Treasury:** `[CONFIGURED IN CONTRACT]`

### **❌ DEPRECATED ADDRESSES (DO NOT USE)**
- ~~`0x9ede64fe689aa03B049497E2A70676d02f3437E9`~~ - First deployment (wrong script)

---

## ⚙️ **CURRENT CONFIGURATION**

### **Phase 1 Pricing**
- **VIRTUAL Mint:** 0.1 VIRTUAL tokens
- **VERT Mint:** 500 VERT tokens (ready for Phase 2)

### **Prize Pool Configuration**
- **Common:** 0% of pool
- **Rare:** 3% of pool  
- **Epic:** 7% of pool
- **Legendary:** 15% of pool
- **Mythical:** 40% of pool

### **Current Stats** (as of last update)
- **Total Minted:** 1 NFT
- **Prize Pool:** ~0 VERT (grows with mints)
- **Network Status:** ✅ Healthy

---

## 🛠️ **ENVIRONMENT VARIABLES**

### **Frontend (.env.local)**
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x653015826EdbF26Fe61ad08E5220cD6150D9cB56
NEXT_PUBLIC_VIRTUAL_TOKEN_ADDRESS=0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
NEXT_PUBLIC_VERT_TOKEN_ADDRESS=[COMING_SOON]
```

### **Backend (.env)**
```bash
CONTRACT_ADDRESS=0x653015826EdbF26Fe61ad08E5220cD6150D9cB56
VIRTUAL_TOKEN_ADDRESS=0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
VERT_TOKEN_ADDRESS=[COMING_SOON]
RPC_URL=https://mainnet.base.org
```

---

## 🔧 **CRITICAL FILES UPDATED**

### **Frontend Files**
- ✅ `app/page.tsx` - Contract address updated
- ✅ `app/components/MintLeaderboard.tsx` - Already correct
- ✅ `utils/generateAndStoreNFT.ts` - Backend address updated

### **Configuration Files**
- ✅ `mainnet-config/mainnet.addresses.json` - Official mainnet addresses
- ✅ `app/config/contracts.ts` - Contract configuration
- ✅ `PHASE1_LAUNCH_STATUS.md` - Launch status documentation

---

## 📜 **IMPORTANT SCRIPTS**

### **Deployment Scripts**
```bash
# CORRECT MAINNET DEPLOYMENT (USED)
node scripts/deploy-fixed.js --network base

# WRONG DEPLOYMENT (DO NOT USE)
node scripts/deploy.js  # Used wrong contract version
```

### **Verification Scripts**
```bash
# Verify contract on BaseScan
npx hardhat verify --network base 0x653015826EdbF26Fe61ad08E5220cD6150D9cB56 \
  "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b" \
  "[VERT_TOKEN_ADDRESS]" \
  "[TREASURY_ADDRESS]"

# Test contract functions
node scripts/verify-mainnet-contract.js
```

### **Management Scripts**
```bash
# Check contract status
node scripts/check-nft-status.js

# Test mint prices
node scripts/check_mint_prices.js

# Check pause status
node scripts/check_pause_status.js

# Force regenerate NFT
node scripts/force-regenerate-token1.js
```

### **Prize Pool Scripts**
```bash
# Add funds to prize pool
node scripts/add-prize-pool.js

# Check prize percentages
node scripts/check-prize-percentages.js

# Seed initial pool
node scripts/seed-prize-pool.js
```

---

## 🌐 **NETWORK INFORMATION**

### **Base Mainnet**
- **Chain ID:** 8453
- **RPC URL:** https://mainnet.base.org
- **Explorer:** https://basescan.org
- **Currency:** ETH

### **RPC Endpoints**
- **Public:** https://mainnet.base.org
- **Alchemy:** `https://base-mainnet.g.alchemy.com/v2/[API_KEY]`
- **QuickNode:** Available via CDP

---

## 🔍 **VERIFICATION CHECKLIST**

### **✅ COMPLETED**
- [x] Contract deployed to correct address
- [x] Frontend updated to use correct contract
- [x] Backend updated to use correct contract
- [x] Token addresses configured
- [x] Pricing set correctly
- [x] NFT generation working
- [x] Minting functionality tested

### **⚠️ TODO**
- [ ] **VERIFY CONTRACT ON BASESCAN** (Priority 1)
- [ ] Update VERT token address when available
- [ ] Set up production environment variables
- [ ] Deploy frontend to production
- [ ] Monitor first production mints

---

## 🚨 **CRITICAL NOTES**

1. **Contract Address:** Always use `0x653015826EdbF26Fe61ad08E5220cD6150D9cB56`
2. **Verification:** Contract needs BaseScan verification for transparency
3. **Phase 2:** Ready for VERT token integration when available
4. **Testing:** All functionality tested and working on mainnet
5. **Security:** Private keys secured, Treasury configured

---

## 📞 **SUPPORT LINKS**

- **BaseScan Contract:** https://basescan.org/address/0x653015826EdbF26Fe61ad08E5220cD6150D9cB56
- **OpenSea Collection:** https://opensea.io/collection/vertical-project
- **VIRTUAL Token:** https://basescan.org/address/0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b
- **Base Bridge:** https://bridge.base.org
- **Base Documentation:** https://docs.base.org

---

## 🔄 **DEPLOYMENT TIMELINE**

1. **December 19, 2024:** Contract deployed to mainnet
2. **December 31, 2024:** Frontend updated to use correct contract
3. **Pending:** BaseScan verification
4. **Phase 2:** VERT token integration (TBA)

---

**🎯 Status: Ready for production use with correct mainnet contract!** 