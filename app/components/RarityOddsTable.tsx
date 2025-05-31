'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { 
  STAKING_TIERS, 
  calculateTierOdds, 
  PRIZE_PERCENTAGES,
  formatStakedAmount,
  type StakingTier 
} from '../config/staking';
import { useStaking } from '../hooks/useStaking';

const rarityColors: Record<string, string> = {
  Common: 'text-gray-300',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-orange-400',
  Mythical: 'text-pink-400',
};

export default function RarityOddsTable() {
  const [selectedTier, setSelectedTier] = useState<StakingTier>(STAKING_TIERS[0]);
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
  
  const tierOdds = calculateTierOdds(selectedTier);
  
  const rarityData = [
    { rarity: 'Common', odds: tierOdds.Common.toFixed(2), prize: PRIZE_PERCENTAGES.Common },
    { rarity: 'Rare', odds: tierOdds.Rare.toFixed(2), prize: PRIZE_PERCENTAGES.Rare },
    { rarity: 'Epic', odds: tierOdds.Epic.toFixed(2), prize: PRIZE_PERCENTAGES.Epic },
    { rarity: 'Legendary', odds: tierOdds.Legendary.toFixed(3), prize: PRIZE_PERCENTAGES.Legendary },
    { rarity: 'Mythical', odds: tierOdds.Mythical.toFixed(3), prize: PRIZE_PERCENTAGES.Mythical },
  ];

  return (
    <div className="w-full mx-auto max-w-4xl mt-8">
      <div className="bg-black border-2 border-green-500 rounded-lg p-8 font-mono text-sm relative shadow-2xl shadow-green-500/20">
        {/* Glow effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-green-500/5 border border-green-500/30 pointer-events-none"></div>
        
        {/* Terminal Header */}
        <div className="flex items-center justify-center mb-6 pb-3 border-b border-green-500/40">
          <div className="text-green-400 text-sm font-bold tracking-wider">
            ┌──────────── RARITY_MATRIX_v1.0.0 ─────────────┐
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6 relative z-10">
          
          {/* Tier Selection - Terminal Style */}
          <div className="space-y-3">
            <div className="text-green-400 text-base">
              {'> select_staking_tier:'}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STAKING_TIERS.map((tier, index) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`
                    p-3 rounded border transition-all duration-200 text-left min-h-[80px] flex flex-col justify-center
                    ${selectedTier.id === tier.id 
                      ? 'border-green-400 bg-green-900/30 text-green-300' 
                      : 'border-green-500/30 bg-black hover:border-green-400 hover:bg-green-900/20 text-green-400'
                    }
                  `}
                >
                  <div className="text-xs text-gray-400 mb-1">
                    [{index + 1}]
                  </div>
                  <div className={`font-bold text-sm ${selectedTier.id === tier.id ? 'text-white' : 'text-green-300'}`}>
                    {tier.name.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {tier.minStake > 0 ? `${tier.minStake.toLocaleString()}+ VERT` : 'NO_STAKE'}
                  </div>
                  {tier.rarityMultiplier > 1 && (
                    <div className="text-xs mt-1 text-yellow-400">
                      +{((tier.rarityMultiplier - 1) * 100).toFixed(0)}% boost
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection Output */}
          <div className="space-y-2">
            <div className="text-green-400">
              {'> selected_tier:'} <span className="text-white">{selectedTier.name.toLowerCase()}</span>
            </div>
            {selectedTier.id === 0 ? (
              <div className="text-yellow-400 text-sm">
                {'> status: stake_vert_to_unlock_better_odds'}
              </div>
            ) : (
              <div className="text-yellow-400 text-sm">
                {'> boost:'} <span className="text-yellow-400">+{((selectedTier.rarityMultiplier - 1) * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Terminal Table */}
          <div className="space-y-2">
            <div className="border border-green-500/30 rounded p-4 bg-black/50">
              {/* Table Header */}
              <div className="text-green-400 text-xs mb-2">
                {'├─────────────┬──────────┬─────────────┤'}
              </div>
              <div className="grid grid-cols-3 gap-4 text-green-300 text-sm font-bold mb-2">
                <div>RARITY</div>
                <div>ODDS</div>
                <div>PRIZE_SHARE</div>
              </div>
              <div className="text-green-400 text-xs mb-3">
                {'├─────────────┼──────────┼─────────────┤'}
              </div>
              
              {/* Table Rows */}
              {rarityData.map(({ rarity, odds, prize }) => (
                <div key={rarity} className="grid grid-cols-3 gap-4 text-sm mb-2">
                  <div className={`font-bold ${rarityColors[rarity]}`}>
                    {rarity.toLowerCase()}
                  </div>
                  <div className="text-white">
                    {odds}%
                    {selectedTier.rarityMultiplier > 1 && rarity !== 'Common' && (
                      <span className="text-yellow-400 ml-1">↑</span>
                    )}
                  </div>
                  <div className="text-white">{prize}%</div>
                </div>
              ))}
              
              <div className="text-green-400 text-xs mt-2">
                {'└─────────────┴──────────┴─────────────┘'}
              </div>
            </div>
          </div>

          {/* Staking Status Section */}
          <div className="space-y-3">
            <div className="text-green-400 text-center">
              {'> staking_status:'}
            </div>
            
            {!isConnected ? (
              <div className="text-red-400 text-sm">
                {'> error: wallet_not_connected'}
              </div>
            ) : !isStakingAvailable ? (
              <div className="border border-blue-500/30 rounded p-3 bg-blue-900/20">
                <div className="text-blue-400 text-sm mb-1">
                  {'> info: staking_coming_to_mainnet'}
                </div>
                <div className="text-blue-300 text-xs">
                  {'> deploy_status: awaiting_virtuals_protocol_launch'}
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-yellow-400 text-sm">
                {'> loading: fetching_staking_data...'}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Current Status */}
                <div className="border border-green-500/30 rounded p-3 bg-green-900/20">
                  <div className="text-green-300 text-sm mb-1">
                    {'> current_tier:'} <span className="text-white">{currentTier.name.toLowerCase()}</span>
                  </div>
                  <div className="text-green-300 text-sm mb-1">
                    {'> staked_amount:'} <span className="text-white">{formatStakedAmount(stakedAmount)} VERT</span>
                  </div>
                  {currentTier.id > 0 && (
                    <div className="text-yellow-400 text-sm">
                      {'> bonus:'} +{((currentTier.rarityMultiplier - 1) * 100).toFixed(0)}% rare_odds
                    </div>
                  )}
                </div>

                {/* Progress to Next Tier */}
                {nextTier && (
                  <div className="border border-gray-500/30 rounded p-3 bg-gray-900/20">
                    <div className="text-gray-300 text-sm mb-2">
                      {'> progress_to:'} <span className="text-cyan-400">{nextTier.name.toLowerCase()}</span>
                    </div>
                    <div className="text-gray-300 text-sm mb-2">
                      {'> requirement:'} {formatStakedAmount(nextTier.minStake)} VERT
                    </div>
                    <div className="text-gray-300 text-sm">
                      {'> needed:'} <span className="text-yellow-400">{formatStakedAmount(amountNeededForNextTier)} VERT</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300 bg-green-500"
                          style={{ width: `${Math.min(progressToNextTier, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        [{Math.round(progressToNextTier)}%] complete
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Corner glow effects */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
      </div>
    </div>
  );
} 