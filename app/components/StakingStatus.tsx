'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import { 
  formatStakedAmount,
} from '../config/staking';
import { useStaking } from '../hooks/useStaking';

interface StakingStatusProps {
  className?: string;
}

export default function StakingStatus({ className = '' }: StakingStatusProps) {
  const { isConnected } = useAccount();
  const {
    stakedAmount,
    currentTier,
    isLoading,
    nextTier,
    progressToNextTier,
    amountNeededForNextTier,
    isStakingAvailable
  } = useStaking();

  if (!isConnected) {
    return (
      <div className={`card-cel ${className}`}>
        <div className="text-center py-4">
          <h3 className="heading-comic text-lg mb-2">Staking Status</h3>
          <p className="font-comic text-gray-600">Connect wallet to view staking status</p>
        </div>
      </div>
    );
  }

  if (!isStakingAvailable) {
    return (
      <div className={`card-cel ${className}`}>
        <div className="text-center py-4">
          <h3 className="heading-comic text-lg mb-2">Staking Status</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-comic text-blue-800 text-sm mb-2">
              🚀 <strong>Coming to Mainnet!</strong>
            </p>
            <p className="font-comic text-blue-700 text-xs">
              Staking tiers will be available after mainnet launch when Virtuals protocol deploys the VERT staking contract.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-cel ${className}`}>
      <h3 className="heading-comic text-lg mb-4">Your Staking Status</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vert-accent mx-auto"></div>
          <p className="font-comic text-sm mt-2">Loading staking status...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Tier */}
          <div className={`${currentTier.bgColor} border-2 border-black rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold ${currentTier.color} font-comic`}>
                {currentTier.name}
              </span>
              {currentTier.id > 0 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-comic">
                  +{((currentTier.rarityMultiplier - 1) * 100).toFixed(0)}% Rare Odds
                </span>
              )}
            </div>
            <p className="text-sm font-comic text-gray-700 mb-2">{currentTier.description}</p>
            <p className="text-lg font-bold font-comic">
              {formatStakedAmount(stakedAmount)} VERT Staked
            </p>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-comic text-sm text-gray-600">
                  Progress to {nextTier.name}
                </span>
                <span className="font-comic text-sm text-gray-600">
                  {formatStakedAmount(stakedAmount)} / {formatStakedAmount(nextTier.minStake)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-vert-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressToNextTier, 100)}%` }}
                ></div>
              </div>
              
              <p className="text-xs font-comic text-gray-600">
                Stake {formatStakedAmount(amountNeededForNextTier)} more VERT to unlock{' '}
                <span className={nextTier.color}>{nextTier.name}</span> tier
              </p>
            </div>
          )}

          {/* Tier Benefits */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-comic text-sm font-bold text-yellow-800 mb-2">
              💡 Staking Benefits
            </h4>
            <ul className="text-xs font-comic text-yellow-700 space-y-1">
              <li>• Higher staking tiers boost your odds of getting rare NFTs</li>
              <li>• Prize pool percentages remain the same for all tiers</li>
              <li>• Stake more VERT to unlock better rarity multipliers</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 