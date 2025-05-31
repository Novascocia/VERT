# 📊 Phase 4: Staking Tiers Integration

## 📅 **Timeline**: Ongoing after VERT Token Launch

## 🎯 **Phase 4 Goals**
- Integrate with Virtuals Protocol staking contract
- Display user staking tiers in frontend
- Implement staking-based **rarity odds bonuses**
- Track staking stats and leaderboards

## 📝 **Variables to Fill In**

### **Staking Contract Information**
```bash
# When Virtuals Protocol deploys staking:
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=[FILL_IN_STAKING_CONTRACT]
STAKING_CONTRACT_ADDRESS=[FILL_IN_STAKING_CONTRACT]
NEXT_PUBLIC_STAKING_ENABLED=true

# Staking contract ABI (get from Virtuals Protocol)
STAKING_CONTRACT_ABI=[GET_FROM_VIRTUALS_DOCS]
```

## 🔧 **Frontend Integration Requirements**

### **New Components Needed**

**1. Staking Tier Terminal (`app/components/StakingTierTerminal.tsx`)**
```typescript
interface StakingTierTerminalProps {
  userAddress: string;
  stakingContractAddress: string;
}

// Display:
// - User's current staking tier
// - Amount staked
// - Tier benefits/bonuses
// - Next tier requirements
```

**2. Staking Leaderboard (`app/components/StakingLeaderboard.tsx`)**
```typescript
// Show top stakers by:
// - Total VERT staked
// - Staking tier achieved
// - Staking duration
```

**3. Staking Stats (`app/components/StakingStats.tsx`)**
```typescript
// Network-wide staking metrics:
// - Total VERT staked
// - Number of stakers
// - Average stake amount
// - Tier distribution
```

### **Staking Contract Integration**

**Required Contract Functions to Call:**
```solidity
// Get user staking info
function getUserStake(address user) external view returns (
    uint256 amount,
    uint256 tier,
    uint256 stakingTime,
    uint256 rewards
);

// Get staking tiers configuration
function getStakingTiers() external view returns (
    uint256[] memory thresholds,
    string[] memory tierNames,
    uint256[] memory bonuses
);

// Get total staking stats
function getTotalStaked() external view returns (uint256);
function getStakerCount() external view returns (uint256);
```

**Frontend Staking Service (`app/services/stakingService.ts`):**
```typescript
export class StakingService {
  async getUserStakingTier(userAddress: string): Promise<StakingTier>;
  async getStakingLeaderboard(): Promise<StakingEntry[]>;
  async getTotalStakingStats(): Promise<StakingStats>;
}
```

## 🎨 **UI/UX Integration**

### **Staking Tier Display**
```typescript
// In main page layout, add staking tier indicator
{stakingEnabled && isConnected && (
  <StakingTierTerminal 
    userAddress={address} 
    stakingContractAddress={stakingContractAddress}
  />
)}
```

### **Tier-Based Benefits**
```typescript
// Example: Better rarity odds based on staking tier
const getStakingRarityBonus = (userTier: string) => {
  switch (userTier.toLowerCase()) {
    case 'bronze': return 1.1; // 10% better odds
    case 'silver': return 1.25; // 25% better odds  
    case 'gold': return 1.5; // 50% better odds
    default: return 1.0; // No bonus
  }
};

// Apply bonus to rarity calculations in NFT generation
const rarityMultiplier = getStakingRarityBonus(userTier);
const adjustedRoll = baseRarityRoll * rarityMultiplier;
```

### **Staking Tier Colors/Themes**
```css
/* Visual themes for each tier */
.tier-bronze { 
  border-color: #cd7f32; 
  color: #cd7f32; 
}

.tier-silver { 
  border-color: #c0c0c0; 
  color: #c0c0c0; 
}

.tier-gold { 
  border-color: #ffd700; 
  color: #ffd700; 
}
```

## 🔍 **Staking Contract Discovery**

### **How to Find Staking Contract**
1. **Monitor Virtuals Protocol announcements**
2. **Check their documentation/GitHub**
3. **Look for staking-related events after VERT launch**
4. **Scan deployed contracts on Base mainnet**

### **Expected Staking Contract Events**
```solidity
event Staked(address indexed user, uint256 amount, uint256 newTier);
event Unstaked(address indexed user, uint256 amount, uint256 newTier);
event TierChanged(address indexed user, uint256 oldTier, uint256 newTier);
event RewardsClaimed(address indexed user, uint256 amount);
```

## 📊 **Staking Tiers Configuration**

### **Staking Tier Structure**
```typescript
const STAKING_TIERS = {
  bronze: { 
    name: "Bronze", 
    threshold: "1000", // 1K+ VERT
    rarityBonus: 1.1, // 10% better odds
    color: "#cd7f32" 
  },
  silver: { 
    name: "Silver", 
    threshold: "5000", // 5K+ VERT
    rarityBonus: 1.25, // 25% better odds
    color: "#c0c0c0" 
  },
  gold: { 
    name: "Gold", 
    threshold: "25000", // 25K+ VERT
    rarityBonus: 1.5, // 50% better odds
    color: "#ffd700" 
  }
};
```

### **Benefits by Tier**
- **Bronze (1K+ VERT)**: 10% better rarity odds
- **Silver (5K+ VERT)**: 25% better rarity odds  
- **Gold (25K+ VERT)**: 50% better rarity odds

**Note**: Better rarity odds means higher chance of minting rare/legendary NFTs instead of common ones.

### **Rarity Odds Integration**
```typescript
// In NFT generation service, factor in staking tier
export const generateNFTWithStakingBonus = async (
  userAddress: string,
  stakingTier: string
) => {
  // Get base rarity roll (0-100)
  const baseRarityRoll = Math.random() * 100;
  
  // Apply staking bonus
  const stakingBonus = getStakingRarityBonus(stakingTier);
  const adjustedRoll = Math.min(baseRarityRoll * stakingBonus, 100);
  
  // Determine rarity based on adjusted roll
  const rarity = determineRarity(adjustedRoll);
  
  return generateNFTForRarity(rarity);
};
```

## 🛠️ **Implementation Steps**

### **1. Monitor for Staking Contract**
- Set up alerts for Virtuals Protocol announcements
- Create monitoring script to detect staking contract deployment
- Get staking contract ABI and documentation

### **2. Create Staking Components**
```bash
# Create new components
touch app/components/StakingTierTerminal.tsx
touch app/components/StakingLeaderboard.tsx
touch app/components/StakingStats.tsx
touch app/services/stakingService.ts
```

### **3. Update Configuration**
```typescript
// Add staking config to app/config/staking.ts
export const STAKING_CONFIG = {
  stakingContractAddress: process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS,
  isStakingEnabled: process.env.NEXT_PUBLIC_STAKING_ENABLED === 'true',
  stakingContractABI: STAKING_ABI, // Import from ABIs
};
```

### **4. Integrate with Existing UI**
- Add staking terminal to main page layout
- Update mint terminals to show tier discounts
- Add staking leaderboard section
- Update user profile/stats display

### **5. Test Integration**
- Test with mock staking data first
- Verify tier calculations work correctly
- Test discount applications
- Ensure UI scales with different tier levels

## 🎯 **Key Metrics to Track**

### **User-Level Metrics**
- Individual staking amount
- Current tier and benefits
- Time until next tier
- Historical tier changes
- Staking rewards earned

### **Network-Level Metrics**
- Total VERT staked across all users
- Distribution of users across tiers
- Average staking amount
- Staking participation rate
- Total rewards distributed

## ⚠️ **Implementation Notes**

### **Staking Contract Dependencies**
- Wait for Virtuals Protocol to deploy staking contract
- Get official contract address and ABI
- Understand their staking mechanics and tier structure
- Verify contract security and audit status

### **Frontend Considerations**
- Make staking features conditionally rendered
- Handle cases where staking contract isn't available yet
- Provide fallback UI for users without staking
- **Show rarity odds improvement in UI**
- **Display "Better Odds" indicators for staked users**

### **User Experience**
- Clear explanation of **rarity odds benefits**
- Easy way to check current tier and requirements
- Visual indicators of tier status throughout UI
- **Show improved odds percentages in mint UI**
- **"Staking Boost Active" indicators during minting**

## 🔄 **Ongoing Maintenance**

### **Monitor for Updates**
- Track Virtuals Protocol updates to staking mechanics
- Watch for tier structure changes
- Monitor for new staking benefits or features
- Update UI to match any protocol changes

### **Analytics**
- Track staking feature usage
- Monitor tier distribution changes
- Analyze impact of staking discounts on minting
- Gather user feedback on staking integration 