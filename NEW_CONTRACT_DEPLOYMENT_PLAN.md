# NEW CONTRACT DEPLOYMENT PLAN
## CRITICAL: Prize Fix for VIRTUAL Mints

### PROBLEM FIXED
Current contract prevents VIRTUAL mints from receiving prizes - this breaks the core value proposition since VIRTUAL mints pay a premium but get nothing for rare+ NFTs.

### NEW CONTRACT CHANGES
✅ **Fixed Prize Logic**: All rare+ NFTs get prizes regardless of payment method
✅ **VIRTUAL mints**: Pay 0.01 ETH → Get prizes → Don't add to pool  
✅ **VERT mints**: Pay 500 pVERT → Get prizes → Do add to pool

---

## FILES REQUIRING UPDATES

### 1. ENVIRONMENT VARIABLES (.env & .env.local)
```bash
# Current
CONTRACT_ADDRESS=0xA35Ff1a9aC137F92914bE0b16764B28AF7437c7d
NEXT_PUBLIC_CONTRACT_ADDRESS=0xA35Ff1a9aC137F92914bE0b16764B28AF7437c7d

# Update to NEW_CONTRACT_ADDRESS after deployment
```

### 2. FRONTEND COMPONENTS (13 files)
All components hardcoded with current address:

**Main Contract Config:**
- `app/config/contracts.ts` (line 4) - Main config file

**Components with hardcoded addresses:**
- `app/components/HowItWorks.tsx` (line 68) - Display address
- `app/components/MintFeedPanel.tsx` (line 9) - Mint feed queries  
- `app/components/PVertBalanceTerminal.tsx` (line 7) - Phase detection
- `app/components/TokenPhaseIndicator.tsx` (line 6) - Phase banner
- `app/components/RarityOddsTable.tsx` (line 14) - Stats display
- `app/components/PrizePoolTerminal.tsx` (line 6) - Prize pool stats

**Backend Utilities:**
- `utils/generateAndStoreNFT.ts` (line 230) - NFT generation API

### 3. SCRIPTS (15+ files requiring updates)
**Core Scripts:**
- `scripts/fund-pvert-prizes.js` - Transfer pVERT to new contract
- `scripts/debug-user-balance.js` - Testing scripts
- `scripts/check_mainnet_prices.js` - Price verification
- `scripts/check-rarity-distribution.js` - Testing

**Debug Files:**
- `check_deployed_contract.js`
- `check_actual_deployed.js` 
- `debug_prize_logic.js`

### 4. DOCUMENTATION FILES
- `DEPLOYMENT_COMPLETE.md` - Update contract address
- Various .md files with contract references

### 5. VERCEL ENVIRONMENT VARIABLES
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=NEW_ADDRESS
CONTRACT_ADDRESS=NEW_ADDRESS
```

### 6. EXTERNAL SERVICES
**OpenSea Collection:**
- Update contract address in collection settings
- Verify metadata endpoints work with new address

**Litepaper:**
- Update contract address references
- Update any technical documentation

---

## DEPLOYMENT SEQUENCE

### PHASE 1: Pre-Deployment Prep
1. ✅ Compile new contract
2. ✅ Verify all functions in fixed contract
3. Test deployment on local/testnet (optional)

### PHASE 2: Mainnet Deployment  
1. Deploy new contract: `npx hardhat run scripts/deploy-fixed-contract.js --network base_mainnet`
2. Verify on BaseScan: `npx hardhat verify --network base_mainnet NEW_ADDRESS`
3. Fund with pVERT: Update and run `scripts/fund-pvert-prizes.js`

### PHASE 3: Frontend Updates
1. Update `.env` and `.env.local` with new address
2. Update `app/config/contracts.ts` 
3. Update all component hardcoded addresses
4. Test locally: `npm run dev`
5. Build: `npm run build`

### PHASE 4: Deployment & Verification
1. Deploy to Vercel with new env vars
2. Update Vercel environment variables
3. Test full mint flow on production
4. Update OpenSea collection settings
5. Update litepaper/documentation

---

## RISK MITIGATION

### Pre-Deploy Checks
- [ ] Verify contract compiles without errors
- [ ] Test prize logic works for both VIRTUAL and VERT mints
- [ ] Confirm all environment variables ready
- [ ] Backup current working contract address

### Post-Deploy Verification
- [ ] Verify contract on BaseScan
- [ ] Test VIRTUAL mint receives prize (THIS IS THE KEY FIX)
- [ ] Test VERT mint receives prize + adds to pool
- [ ] Verify frontend loads correctly
- [ ] Check NFT metadata generation works
- [ ] Verify phase indicator shows correct phase

### Rollback Plan
If issues arise:
1. Revert environment variables to old contract
2. Redeploy frontend with old address  
3. Users can continue using old contract while fixing issues

---

## SUCCESS CRITERIA
✅ VIRTUAL mints receive automatic prizes (5% pool for Rare)
✅ VERT mints receive automatic prizes + fund pool  
✅ All frontend components work with new contract
✅ NFT generation and metadata work correctly
✅ Prize claiming works automatically
✅ Pool funding and management work

---

## POST-LAUNCH TODO
1. Monitor first few VIRTUAL mints to confirm prizes work
2. Update any community documentation
3. Announce the fix to community (VIRTUAL mints now get prizes!)
4. Consider airdropping compensation to your Rare NFT (token 45)

---

## ESTIMATED TIMELINE
- **Deployment**: 30 minutes
- **Frontend Updates**: 1 hour  
- **Testing & Verification**: 30 minutes
- **Documentation Updates**: 30 minutes
- **Total**: ~2.5 hours for complete migration 