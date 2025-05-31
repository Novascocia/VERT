# Staking Tier System Documentation

## Overview

The Vertical Project implements a tier-based staking system that provides enhanced rarity odds for users who stake VERT tokens. This system will be activated on mainnet after Virtuals protocol deploys the official VERT staking contract.

## Staking Tiers

### Tier 0: No Stake
- **Requirement**: 0 VERT staked
- **Multiplier**: 1.0x (standard odds)
- **Description**: Default tier for all users

### Tier 1: Bronze Staker
- **Requirement**: 10,000+ VERT staked
- **Multiplier**: 1.15x (15% boost to rare+ odds)
- **Description**: Entry-level staking tier

### Tier 2: Silver Staker
- **Requirement**: 50,000+ VERT staked
- **Multiplier**: 1.25x (25% boost to rare+ odds)
- **Description**: Mid-tier staking level

### Tier 3: Gold Staker
- **Requirement**: 100,000+ VERT staked
- **Multiplier**: 1.4x (40% boost to rare+ odds)
- **Description**: Premium staking tier

## Rarity Odds by Tier

### Base Odds (No Stake)
- **Common**: 70.00%
- **Rare**: 18.75%
- **Epic**: 9.00%
- **Legendary**: 1.875%
- **Mythical**: 0.375%

### Bronze Staker (1.15x multiplier)
- **Common**: 65.94%
- **Rare**: 21.56%
- **Epic**: 10.35%
- **Legendary**: 2.16%
- **Mythical**: 0.43%

### Silver Staker (1.25x multiplier)
- **Common**: 62.50%
- **Rare**: 23.44%
- **Epic**: 11.25%
- **Legendary**: 2.34%
- **Mythical**: 0.47%

### Gold Staker (1.4x multiplier)
- **Common**: 58.13%
- **Rare**: 26.25%
- **Epic**: 12.60%
- **Legendary**: 2.63%
- **Mythical**: 0.53%

## How It Works

1. **Multiplier Application**: The staking tier multiplier is applied to all rare+ rarities (Rare, Epic, Legendary, Mythical)
2. **Common Adjustment**: Common odds are reduced to maintain 100% total probability
3. **Prize Percentages**: Prize pool percentages remain the same for all tiers (only odds change)
4. **Single Roll**: Each mint gets one roll with tier-adjusted odds (Option 1 implementation)

## Implementation Status

### Current (Base Sepolia Testnet)
- ✅ Tier system configured and ready
- ✅ UI components implemented
- ✅ Rarity odds calculator functional
- ⏳ Staking contract integration (waiting for Virtuals protocol)

### Mainnet Activation Requirements
1. Virtuals protocol deploys VERT staking contract
2. Update `STAKING_CONFIG` with contract address and ABI
3. Set `isStakingEnabled: true`
4. Deploy updated frontend

## Technical Implementation

### Key Files
- `app/config/staking.ts` - Tier definitions and calculations
- `app/components/StakingStatus.tsx` - User staking status display
- `app/components/RarityOddsTable.tsx` - Interactive tier odds table
- `app/hooks/useStaking.ts` - Staking data management hook

### Configuration Updates Needed for Mainnet
```typescript
// app/config/staking.ts
export const STAKING_CONFIG = {
  stakingContractAddress: "0x...", // From Virtuals protocol
  isStakingEnabled: true,
  stakingContractABI: [...], // Actual staking contract ABI
};
```

### Contract Integration
```typescript
// Example implementation in useStaking hook
const contract = getContract({
  address: STAKING_CONFIG.stakingContractAddress,
  abi: STAKING_CONFIG.stakingContractABI,
  publicClient,
});

const staked = await contract.read.getStakedAmount([address]);
```

## User Experience

### Staking Status Component
- Shows current tier and staked amount
- Progress bar to next tier
- Benefits explanation
- Mainnet availability notice

### Rarity Odds Table
- Interactive tier selector
- Real-time odds calculation
- Visual boost indicators
- Tier comparison

### Benefits Communication
- Clear tier requirements
- Transparent odds improvement
- Gamification elements
- Educational content

## Future Considerations

### Potential Enhancements
1. **Dynamic Tiers**: Adjust requirements based on total staked supply
2. **Time-based Bonuses**: Additional multipliers for long-term staking
3. **Special Events**: Temporary tier boosts during campaigns
4. **NFT Staking**: Allow staking of rare NFTs for additional benefits

### Analytics Tracking
- Tier distribution monitoring
- Mint success rates by tier
- User progression tracking
- ROI analysis for stakers

## Testing Strategy

### Pre-Mainnet Testing
1. Verify tier calculations with various staked amounts
2. Test UI responsiveness across all tiers
3. Validate odds calculations match expected values
4. Ensure proper fallbacks when staking unavailable

### Post-Mainnet Monitoring
1. Track actual vs expected rarity distributions
2. Monitor staking contract interactions
3. Analyze user tier progression patterns
4. Validate prize distribution fairness

## Support and Documentation

### User Education
- Staking benefits explanation
- Tier progression guides
- FAQ section
- Video tutorials (planned)

### Developer Resources
- API documentation
- Integration examples
- Testing utilities
- Monitoring tools

---

**Note**: This system is designed to encourage VERT token staking while maintaining fair gameplay. The tier system provides meaningful benefits without creating excessive advantages for high-tier stakers. 