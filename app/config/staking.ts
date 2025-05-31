export interface StakingTier {
  id: number;
  name: string;
  minStake: number; // in VERT tokens
  description: string;
  rarityMultiplier: number; // multiplier for rare+ odds
  color: string;
  bgColor: string;
}

export const STAKING_TIERS: StakingTier[] = [
  {
    id: 0,
    name: 'No Stake',
    minStake: 0,
    description: 'Standard rarity odds',
    rarityMultiplier: 1.0,
    color: 'text-gray-400',
    bgColor: 'bg-gray-100'
  },
  {
    id: 1,
    name: 'Bronze Staker',
    minStake: 10000,
    description: '10K+ VERT staked',
    rarityMultiplier: 1.15, // 15% boost to rare+ odds
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    id: 2,
    name: 'Silver Staker',
    minStake: 50000,
    description: '50K+ VERT staked',
    rarityMultiplier: 1.25, // 25% boost to rare+ odds
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  },
  {
    id: 3,
    name: 'Gold Staker',
    minStake: 100000,
    description: '100K+ VERT staked',
    rarityMultiplier: 1.4, // 40% boost to rare+ odds
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50'
  }
];

// Base rarity odds (for no stake tier)
export const BASE_RARITY_ODDS = {
  Common: 70.0,
  Rare: 18.75,
  Epic: 9.0,
  Legendary: 1.875,
  Mythical: 0.375
};

// Prize pool percentages remain the same regardless of tier
export const PRIZE_PERCENTAGES = {
  Common: 0,
  Rare: 3,
  Epic: 7,
  Legendary: 15,
  Mythical: 40
};

// Calculate tier-adjusted odds
export function calculateTierOdds(tier: StakingTier) {
  const odds = { ...BASE_RARITY_ODDS };
  
  if (tier.rarityMultiplier > 1.0) {
    // Calculate the boost for rare+ rarities
    const commonOdds = BASE_RARITY_ODDS.Common;
    const rareOdds = BASE_RARITY_ODDS.Rare * tier.rarityMultiplier;
    const epicOdds = BASE_RARITY_ODDS.Epic * tier.rarityMultiplier;
    const legendaryOdds = BASE_RARITY_ODDS.Legendary * tier.rarityMultiplier;
    const mythicalOdds = BASE_RARITY_ODDS.Mythical * tier.rarityMultiplier;
    
    // Total rare+ odds
    const totalRarePlusOdds = rareOdds + epicOdds + legendaryOdds + mythicalOdds;
    
    // Adjust common odds to maintain 100% total
    const adjustedCommonOdds = 100 - totalRarePlusOdds;
    
    // Ensure common odds don't go below a reasonable minimum
    if (adjustedCommonOdds >= 50) {
      odds.Common = adjustedCommonOdds;
      odds.Rare = rareOdds;
      odds.Epic = epicOdds;
      odds.Legendary = legendaryOdds;
      odds.Mythical = mythicalOdds;
    } else {
      // If boost would make common too low, cap the boost
      const maxBoost = (commonOdds - 50) / (100 - commonOdds);
      const cappedMultiplier = 1 + maxBoost;
      
      odds.Common = 50;
      odds.Rare = BASE_RARITY_ODDS.Rare * cappedMultiplier;
      odds.Epic = BASE_RARITY_ODDS.Epic * cappedMultiplier;
      odds.Legendary = BASE_RARITY_ODDS.Legendary * cappedMultiplier;
      odds.Mythical = BASE_RARITY_ODDS.Mythical * cappedMultiplier;
    }
  }
  
  return odds;
}

// Get user's staking tier based on staked amount
export function getUserStakingTier(stakedAmount: number): StakingTier {
  // Find the highest tier the user qualifies for
  for (let i = STAKING_TIERS.length - 1; i >= 0; i--) {
    if (stakedAmount >= STAKING_TIERS[i].minStake) {
      return STAKING_TIERS[i];
    }
  }
  return STAKING_TIERS[0]; // Default to no stake tier
}

// Format staked amount for display
export function formatStakedAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

// Configuration for mainnet staking contract (to be updated when available)
export const STAKING_CONFIG = {
  // This will be updated when Virtuals protocol deploys the staking contract
  stakingContractAddress: null as string | null,
  isStakingEnabled: false, // Will be true on mainnet
  stakingContractABI: [] as any[], // Will be populated with actual ABI
}; 