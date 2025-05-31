'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { 
  STAKING_CONFIG, 
  getUserStakingTier, 
  type StakingTier,
  STAKING_TIERS 
} from '../config/staking';

export function useStaking() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [currentTier, setCurrentTier] = useState<StakingTier>(STAKING_TIERS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's staked amount from the staking contract
  const fetchStakedAmount = async () => {
    if (!address || !isConnected || !STAKING_CONFIG.isStakingEnabled || !STAKING_CONFIG.stakingContractAddress) {
      setStakedAmount(0);
      setCurrentTier(STAKING_TIERS[0]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual contract call when staking contract is available
      // This is the structure that will be used:
      
      // const contract = getContract({
      //   address: STAKING_CONFIG.stakingContractAddress as `0x${string}`,
      //   abi: STAKING_CONFIG.stakingContractABI,
      //   publicClient,
      // });
      
      // const staked = await contract.read.getStakedAmount([address]);
      // const stakedNumber = Number(formatEther(staked));
      
      // For now, return 0 since staking is not yet available
      const stakedNumber = 0;
      
      setStakedAmount(stakedNumber);
      setCurrentTier(getUserStakingTier(stakedNumber));
      
    } catch (err: any) {
      console.error('Error fetching staked amount:', err);
      setError(err.message || 'Failed to fetch staking data');
      setStakedAmount(0);
      setCurrentTier(STAKING_TIERS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh staking data
  const refreshStakingData = () => {
    fetchStakedAmount();
  };

  // Get next tier information
  const getNextTier = (): StakingTier | null => {
    const currentIndex = STAKING_TIERS.findIndex(tier => tier.id === currentTier.id);
    return currentIndex < STAKING_TIERS.length - 1 ? STAKING_TIERS[currentIndex + 1] : null;
  };

  // Calculate progress to next tier
  const getProgressToNextTier = (): number => {
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    return Math.min((stakedAmount / nextTier.minStake) * 100, 100);
  };

  // Get remaining amount needed for next tier
  const getAmountNeededForNextTier = (): number => {
    const nextTier = getNextTier();
    if (!nextTier) return 0;
    return Math.max(nextTier.minStake - stakedAmount, 0);
  };

  // Check if staking is available
  const isStakingAvailable = STAKING_CONFIG.isStakingEnabled && !!STAKING_CONFIG.stakingContractAddress;

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchStakedAmount();
  }, [address, isConnected]);

  return {
    // State
    stakedAmount,
    currentTier,
    isLoading,
    error,
    
    // Computed values
    nextTier: getNextTier(),
    progressToNextTier: getProgressToNextTier(),
    amountNeededForNextTier: getAmountNeededForNextTier(),
    isStakingAvailable,
    
    // Actions
    refreshStakingData,
    
    // Utils
    getUserTier: (amount: number) => getUserStakingTier(amount),
  };
}

// Hook for getting tier-specific rarity odds
export function useTierRarityOdds(tier?: StakingTier) {
  const { currentTier } = useStaking();
  const activeTier = tier || currentTier;
  
  // This will be imported from the staking config
  const { calculateTierOdds } = require('../config/staking');
  
  return calculateTierOdds(activeTier);
} 