# 🚀 Contract Deployment Reference Guide

## 📋 **Complete Checklist: Everything to Update When Deploying New Contract**

This document lists every single file and location that must be updated when deploying a new contract with the updated contract address.

---

## 🎯 **Core Contract Configuration Files**

### 1. **Environment Variables (.env / .env.local)**
```bash
# Main contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=[NEW_CONTRACT_ADDRESS]
CONTRACT_ADDRESS=[NEW_CONTRACT_ADDRESS]

# Network configuration (if changed)
NEXT_PUBLIC_CHAIN_ID=8453
```

### 2. **mainnet-config/mainnet.addresses.json**
```json
{
  "NFT_CONTRACT_ADDRESS": "[NEW_CONTRACT_ADDRESS]",
  "_deployment_tracker": {
    "nft_deployed": true,
    "deployment_date": "[UPDATE_DATE]",
    "deployer_address": "[DEPLOYER_ADDRESS]"
  }
}
```

---

## 📱 **Frontend Application Files**

### 3. **app/page.tsx**
```javascript
// Line ~46: Contract addresses
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '[NEW_CONTRACT_ADDRESS]';
```

### 4. **app/components/AdminTerminal.tsx**
```javascript
// Line ~29: Contract addresses
const contractAddress = "0x[NEW_CONTRACT_ADDRESS]";
```

### 5. **scripts/monitor-prize-pool.js**
```javascript
// Line ~7: Contract address
this.contractAddress = "0x[NEW_CONTRACT_ADDRESS]";
```

---

## 🛠️ **Smart Contract Scripts**

### 6. **All scripts in /scripts/ directory that reference contract address:**
- `scripts/add-prize-pool.js`
- `scripts/check-mint-prices.js` 
- `scripts/check-pause-status.js`
- `scripts/check-prize-percentages.js`
- `scripts/seed-prize-pool.js`
- `scripts/set-mint-prices.js`
- `scripts/test-admin-functions.js`
- `scripts/test-edge-cases.js`
- `scripts/test-minting.js`
- `scripts/test-prize-pool.js`
- `scripts/test-view-functions.js`
- `scripts/unpause-contract.js`
- `scripts/verify-mainnet-contract.js`

**Pattern to find:** Look for `0x[OLD_CONTRACT_ADDRESS]` or `contractAddress` variables

---

## 📝 **Documentation Files**

### 7. **README.md**
- Update contract address in examples
- Update BaseScan links
- Update deployment information

### 8. **ENVIRONMENT_SETUP.md**
- Update contract address examples
- Update environment variable examples

### 9. **mainnet-config/deployment-checklist.md**
- Update Phase 1 deployment status
- Update contract address references

### 10. **PHASE1_LAUNCH_STATUS.md**
- Update contract address
- Update deployment status

---

## 🔍 **Configuration & ABI Files**

### 11. **abis/Vertical.json** (if exists)
- May contain hardcoded contract address
- Update ABI if contract interface changed

### 12. **app/config/wagmiConfig.ts** (if exists)
- May contain contract address in wagmi configuration

---

## 🧪 **Test Files**

### 13. **test/ directory**
- Update any hardcoded contract addresses in test files
- Update test configuration files

---

## 🌐 **Deployment & Infrastructure**

### 14. **Vercel Environment Variables**
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=[NEW_CONTRACT_ADDRESS]
CONTRACT_ADDRESS=[NEW_CONTRACT_ADDRESS]
```

### 15. **BaseScan Verification**
- Verify new contract on BaseScan
- Update any documentation links

---

## 🔄 **Auto-Detection Script**

### **Quick Command to Find All Contract Address References:**
```bash
# Windows PowerShell
Get-ChildItem -Recurse -Include "*.js","*.jsx","*.ts","*.tsx","*.json","*.md" | Select-String -Pattern "0xc03605b09aF6010bb2097d285b9aF4024ecAf098" -CaseSensitive

# Linux/Mac
grep -r "0xc03605b09aF6010bb2097d285b9aF4024ecAf098" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" .
```

---

## 📊 **Deployment Process**

### **Step-by-Step Deployment:**

1. **Deploy Contract**
   ```bash
   npx hardhat run mainnet-config/deploy-mainnet.js --network base_mainnet
   ```

2. **Get New Contract Address**
   - Copy from deployment output
   - Verify on BaseScan

3. **Update All Files**
   - Use the checklist above
   - Use auto-detection script to find missed references

4. **Test Deployment**
   ```bash
   npx hardhat run scripts/test-view-functions.js --network base_mainnet
   ```

5. **Update Frontend**
   - Update environment variables
   - Deploy to Vercel
   - Test all functionality

6. **Verify Everything Works**
   - Test minting with VIRTUAL
   - Test admin functions
   - Verify stats display correctly

---

## ⚠️ **Critical Notes**

- **Old Contract**: `0xc03605b09aF6010bb2097d285b9aF4024ecAf098`
- **New Contract**: `[TO_BE_DEPLOYED]`
- **OpenSea**: New contract = new collection (clean slate)
- **Admin Terminal**: Update deployer address detection
- **Gas Estimates**: New contract may have different gas costs

---

## 🎯 **New Contract Features**

The new contract includes:
- ✅ **Auto-sync functionality** for direct VERT transfers
- ✅ **syncPrizePool()** function
- ✅ **getUnaccountedBalance()** function  
- ✅ **Enhanced events** (PrizePoolSynced, AutoSyncFailed)
- ✅ **Try/catch safety** for mint operations

---

## 📱 **Mobile & Frontend Considerations**

- Mobile warning component works with any contract
- All UI components are contract-agnostic except for address references
- Admin terminal automatically detects contract owner
- Prize pool monitoring adapts to new functions

---

## 🔐 **Security Checklist**

- [ ] Verify contract owner is correct deployer
- [ ] Test all admin functions work
- [ ] Verify auto-sync functionality
- [ ] Test gas estimates are reasonable
- [ ] Confirm all events are emitted correctly
- [ ] Verify frontend connects properly
- [ ] Test both VIRTUAL and VERT minting (when available)

---

## 📈 **Post-Deployment Monitoring**

1. **Monitor contract for first 24 hours**
2. **Check gas costs in production**
3. **Verify auto-sync triggers correctly**
4. **Monitor admin terminal for issues**
5. **Track minting activity and prizes**

---

## 🚨 **Emergency Rollback Plan**

If issues arise with new contract:
1. **Pause new contract** immediately
2. **Revert environment variables** to old contract
3. **Redeploy frontend** with old contract
4. **Investigate issues** before retry
5. **Keep old contract** as backup until stable

---

*Last Updated: [CURRENT_DATE]*
*Contract Version: VerticalProjectNFT_Fixed.sol with Auto-Sync* 