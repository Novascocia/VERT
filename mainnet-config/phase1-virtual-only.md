# 🚀 Phase 1: Virtual-Only Mainnet Launch

## 📅 **Timeline**: Week 0 (Initial Launch)

## 🎯 **Phase 1 Goals**
- Deploy NFT contract on Base mainnet
- Enable VIRTUAL token minting only
- Establish basic infrastructure
- Ensure frontend works with mainnet

## 📝 **Variables to Fill In**

### **Critical Mainnet Addresses**
```bash
# Deploy these first:
NFT_CONTRACT_ADDRESS=[DEPLOY_THIS]
TREASURY_ADDRESS=[YOUR_MAINNET_TREASURY]
OPERATIONAL_ADDRESS=[YOUR_OPERATIONAL_WALLET]

# Already known:
VIRTUAL_TOKEN_ADDRESS=0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b

# Leave blank for now:
VERT_TOKEN_ADDRESS=address(0)  # Will be set in Phase 2
STAKING_CONTRACT_ADDRESS=address(0)  # Will be set in Phase 4
```

### **API Keys Needed**
```bash
NEXT_PUBLIC_ALCHEMY_KEY=[GET_MAINNET_KEY]
BASESCAN_API_KEY=[GET_BASESCAN_KEY]
PRIVATE_KEY=[MAINNET_DEPLOYER_KEY]
```

## 🛠️ **Deployment Steps**

### **1. Setup Environment**
```bash
# Copy template and fill in Phase 1 values
cp mainnet-config/mainnet.env.template .env.local

# Fill in:
# - NEXT_PUBLIC_ALCHEMY_KEY
# - NEXT_PUBLIC_TREASURY_ADDRESS  
# - PRIVATE_KEY (for deployment)
# - BASESCAN_API_KEY

# Leave empty for now:
# - NEXT_PUBLIC_VERT_TOKEN_ADDRESS
# - NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS
```

### **2. Deploy NFT Contract**
```bash
# Use the deploy-mainnet.js script (to be created)
npx hardhat run scripts/deploy-mainnet.js --network base_mainnet
```

### **3. Update Environment with Contract Address**
```bash
# After deployment, add to .env.local:
NEXT_PUBLIC_CONTRACT_ADDRESS=[DEPLOYED_NFT_ADDRESS]
CONTRACT_ADDRESS=[DEPLOYED_NFT_ADDRESS]
```

### **4. Update Code Configuration**

**Update `app/config/wagmiConfig.ts`:**
```typescript
chains: [base], // Change from baseSepolia
[base.id]: http(  // Change from baseSepolia.id
  ALCHEMY_API_KEY 
    ? `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    : 'https://mainnet.base.org'
),
```

**Update `app/page.tsx`:**
```typescript
const isOnBaseMainnet = chainId === 8453; // Change from 84532
const { data: walletClient } = useWalletClient({ chainId: base.id });
const publicClient = usePublicClient({ chainId: base.id });
```

### **5. Contract Configuration**

**Initial NFT Contract State:**
- VIRTUAL token minting: ✅ Enabled
- VERT token minting: ❌ Disabled (address(0))
- Prize pool: ❌ Empty (will be funded in Phase 3)
- Pricing: Set appropriate mainnet prices

### **6. Frontend Features**

**Enabled in Phase 1:**
- ✅ VIRTUAL minting
- ✅ NFT generation and display
- ✅ Mint leaderboard
- ✅ Basic stats (total minted, etc.)

**Disabled in Phase 1:**
- ❌ VERT minting (button should be disabled/hidden)
- ❌ Prize claiming
- ❌ Staking tier display
- ❌ Prize pool stats

## 🔧 **Code Changes Required**

### **Frontend Conditionals**
Add feature flags to hide VERT functionality:

```typescript
// In mint terminal component
const enableVertMinting = process.env.NEXT_PUBLIC_VERT_TOKEN_ADDRESS && 
                          process.env.NEXT_PUBLIC_VERT_TOKEN_ADDRESS !== 'address(0)';

// Hide VERT mint button if not enabled
{enableVertMinting && (
  <button onClick={handleMintWithVert}>
    Mint with VERT
  </button>
)}
```

### **Prize Pool Display**
```typescript
// Only show prize pool if enabled
const prizePoolEnabled = process.env.PRIZE_POOL_ENABLED === 'true';

{prizePoolEnabled && <PrizePoolTerminal />}
```

## ⚠️ **Phase 1 Limitations**

### **What Users CAN Do:**
- Connect wallets
- Mint NFTs with VIRTUAL tokens
- View their minted NFTs
- Share NFTs on social media
- See mint leaderboard

### **What Users CANNOT Do:**
- Mint with VERT (not available yet)
- Claim prizes (no pool funded yet)
- See staking tiers (not implemented yet)
- Earn VERT rewards (not available yet)

## 🧪 **Testing Checklist**

Before deploying to mainnet:
- [ ] Deploy to Base testnet first with Phase 1 config
- [ ] Test VIRTUAL minting works
- [ ] Verify VERT minting is properly disabled
- [ ] Check all frontend components load correctly
- [ ] Test NFT generation and IPFS uploads
- [ ] Verify share functionality works
- [ ] Test with real VIRTUAL tokens on testnet
- [ ] Confirm gas estimates are reasonable for mainnet

## 📊 **Monitoring**

**Track These Metrics:**
- Total NFTs minted with VIRTUAL
- VIRTUAL token volume
- User wallet connections
- NFT generation success rate
- IPFS upload reliability

## ⏭️ **Preparing for Phase 2**

**When VERT token launches:**
1. Get VERT token address from Virtuals Protocol
2. Call `setVertToken(vertTokenAddress)` on NFT contract
3. Update environment variables
4. Enable VERT minting in frontend
5. Update documentation

**What to Monitor:**
- Virtuals Protocol announcements
- VERT token deployment
- Genesis Protocol launch timeline 