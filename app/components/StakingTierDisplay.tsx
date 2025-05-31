'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';

interface StakingTierDisplayProps {
  stakingContractAddress?: string;
  className?: string;
}

interface StakingTier {
  name: string;
  minStake: number;
  color: string;
  bgColor: string;
  emoji: string;
  description: string;
}

const STAKING_TIERS: StakingTier[] = [
  {
    name: 'Gold',
    minStake: 100000,
    color: 'text-yellow-500',
    bgColor: 'bg-gradient-to-r from-yellow-100 to-yellow-200',
    emoji: '🥇',
    description: '100K+ VERT staked'
  },
  {
    name: 'Silver',
    minStake: 50000,
    color: 'text-gray-500',
    bgColor: 'bg-gradient-to-r from-gray-100 to-gray-200',
    emoji: '🥈',
    description: '50K+ VERT staked'
  },
  {
    name: 'Bronze',
    minStake: 10000,
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-r from-amber-100 to-amber-200',
    emoji: '🥉',
    description: '10K+ VERT staked'
  }
];

// Mock staking contract ABI - will be replaced with real ABI when available
const MOCK_STAKING_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getStakedAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export default function StakingTierDisplay({ 
  stakingContractAddress,
  className = '' 
}: StakingTierDisplayProps) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [stakedBalance, setStakedBalance] = useState<number>(0);
  const [currentTier, setCurrentTier] = useState<StakingTier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserTier = (stakedAmount: number): StakingTier | null => {
    // Find the highest tier the user qualifies for
    for (const tier of STAKING_TIERS) {
      if (stakedAmount >= tier.minStake) {
        return tier;
      }
    }
    return null; // No tier if below bronze threshold
  };

  const fetchStakedBalance = async () => {
    if (!address || !isConnected || !stakingContractAddress || !publicClient) {
      setStakedBalance(0);
      setCurrentTier(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Attempt to read staked balance from the staking contract
      const stakedAmount = await publicClient.readContract({
        address: stakingContractAddress as `0x${string}`,
        abi: MOCK_STAKING_ABI,
        functionName: 'getStakedAmount',
        args: [address]
      }) as bigint;
      
      const stakedNumber = Number(formatEther(stakedAmount));
      setStakedBalance(stakedNumber);
      setCurrentTier(getUserTier(stakedNumber));
      
    } catch (err: any) {
      console.error('Error fetching staked balance:', err);
      setError('Unable to read staking data');
      setStakedBalance(0);
      setCurrentTier(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (stakingContractAddress) {
      fetchStakedBalance();
    } else {
      setStakedBalance(0);
      setCurrentTier(null);
    }
  }, [address, isConnected, stakingContractAddress, publicClient]);

  const formatStakedAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  };

  const getNextTier = (): StakingTier | null => {
    if (!currentTier) {
      return STAKING_TIERS[STAKING_TIERS.length - 1]; // Return Bronze as next tier
    }
    
    const currentIndex = STAKING_TIERS.findIndex(tier => tier.name === currentTier.name);
    return currentIndex > 0 ? STAKING_TIERS[currentIndex - 1] : null;
  };

  const getProgressToNextTier = (): number => {
    if (!currentTier) {
      const bronzeTier = STAKING_TIERS[STAKING_TIERS.length - 1];
      return Math.min((stakedBalance / bronzeTier.minStake) * 100, 100);
    }
    
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    
    const progress = (stakedBalance / nextTier.minStake) * 100;
    return Math.min(progress, 100);
  };

  // Handle disconnected wallet
  if (!isConnected) {
    return (
      <div className={`card-cel ${className}`}>
        <div className="text-center py-6">
          <h3 className="heading-comic text-lg mb-3">Staking Tier Status</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
          </div>
          <p className="font-comic text-gray-600 text-sm">
            Connect wallet to view your staking tier
          </p>
        </div>
      </div>
    );
  }

  // Handle missing staking contract address
  if (!stakingContractAddress) {
    return (
      <div className={`card-cel ${className}`}>
        <div className="text-center py-6">
          <h3 className="heading-comic text-lg mb-3">Staking Tier Status</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-3">
              <span className="text-3xl">🚀</span>
            </div>
            <p className="font-comic text-blue-800 text-sm mb-2">
              <strong>Coming to Mainnet!</strong>
            </p>
            <p className="font-comic text-blue-700 text-xs">
              Staking tiers will be available when the VERT staking contract is deployed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`card-cel ${className}`}>
        <div className="text-center py-6">
          <h3 className="heading-comic text-lg mb-4">Staking Tier Status</h3>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="font-comic text-sm text-gray-600">Loading staking data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`card-cel ${className}`}>
        <div className="text-center py-6">
          <h3 className="heading-comic text-lg mb-4">Staking Tier Status</h3>
          <div className="text-red-500 mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="font-comic text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchStakedBalance}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-comic text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main tier display
  return (
    <div className={`card-cel ${className}`}>
      <div className="text-center py-6">
        <h3 className="heading-comic text-lg mb-4">Your Staking Tier</h3>
        
        {currentTier ? (
          // User has a tier
          <div className="space-y-4">
            <div className={`${currentTier.bgColor} border-2 border-black rounded-lg p-6 shadow-lg`}>
              <div className="flex items-center justify-center mb-3">
                <span className="text-4xl mr-3">{currentTier.emoji}</span>
                <div className="text-center">
                  <h4 className={`font-comic font-bold text-xl ${currentTier.color}`}>
                    {currentTier.name} Tier
                  </h4>
                  <p className="font-comic text-sm text-gray-700">
                    {currentTier.description}
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="font-comic text-lg font-bold text-gray-800">
                  {formatStakedAmount(stakedBalance)} VERT Staked
                </p>
              </div>
            </div>

            {/* Progress to next tier */}
            {getNextTier() && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-comic text-sm text-gray-600">
                    Progress to {getNextTier()!.name}
                  </span>
                  <span className="font-comic text-sm text-gray-600">
                    {formatStakedAmount(stakedBalance)} / {formatStakedAmount(getNextTier()!.minStake)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(getProgressToNextTier(), 100)}%` }}
                  ></div>
                </div>
                
                <p className="text-xs font-comic text-gray-600">
                  Stake {formatStakedAmount(getNextTier()!.minStake - stakedBalance)} more VERT to unlock{' '}
                  <span className={getNextTier()!.color}>{getNextTier()!.name}</span> tier
                </p>
              </div>
            )}
          </div>
        ) : (
          // User has no tier
          <div className="space-y-4">
            <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
              <div className="flex items-center justify-center mb-3">
                <span className="text-3xl mr-3">⭐</span>
                <div className="text-center">
                  <h4 className="font-comic font-bold text-lg text-gray-600">
                    No Tier
                  </h4>
                  <p className="font-comic text-sm text-gray-500">
                    Stake VERT to unlock tier benefits
                  </p>
                </div>
              </div>
              
              {stakedBalance > 0 ? (
                <div className="text-center">
                  <p className="font-comic text-lg font-bold text-gray-800">
                    {formatStakedAmount(stakedBalance)} VERT Staked
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-comic text-sm text-gray-600">
                    No VERT currently staked
                  </p>
                </div>
              )}
            </div>

            {/* Progress to Bronze tier */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-comic text-sm text-amber-700">
                  Progress to Bronze
                </span>
                <span className="font-comic text-sm text-amber-700">
                  {formatStakedAmount(stakedBalance)} / {formatStakedAmount(STAKING_TIERS[2].minStake)}
                </span>
              </div>
              
              <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressToNextTier()}%` }}
                ></div>
              </div>
              
              <p className="text-xs font-comic text-amber-700">
                Stake {formatStakedAmount(STAKING_TIERS[2].minStake - stakedBalance)} VERT to unlock{' '}
                <span className="text-amber-600 font-bold">Bronze</span> tier benefits
              </p>
            </div>
          </div>
        )}

        {/* Tier benefits info */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <h5 className="font-comic text-sm font-bold text-green-800 mb-2">
            🎯 Staking Benefits
          </h5>
          <ul className="text-xs font-comic text-green-700 space-y-1 text-left">
            <li>• Higher tiers boost your odds of getting rare NFTs</li>
            <li>• Earn additional rewards from protocol fees</li>
            <li>• Unlock exclusive community features</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 