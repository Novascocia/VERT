'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  STAKING_TIERS, 
  calculateTierOdds, 
  PRIZE_PERCENTAGES,
  formatStakedAmount,
  type StakingTier 
} from '../config/staking';
import { useStaking } from '../hooks/useStaking';
import useActiveToken from '../hooks/useActiveToken';

const NFT_CONTRACT_ADDRESS = "0x414280a38d52eB30768275Eb95D16714c69d216A";

interface ActiveToken {
  address: string;
  symbol: string;
  name: string;
  isPlaceholder: boolean;
}

const rarityColors: Record<string, string> = {
  Common: 'text-gray-300',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-orange-400',
  Mythical: 'text-pink-400',
};

// Typewriter effect hook
function useTypewriter(text: string, speed: number = 50) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}

export default function RarityOddsTable() {
  const [selectedTier, setSelectedTier] = useState<StakingTier>(STAKING_TIERS[0]);
  const [showScrollingText, setShowScrollingText] = useState(false);
  const { isConnected } = useAccount();
  const { activeToken, isPvertPhase, loading: tokenLoading } = useActiveToken(NFT_CONTRACT_ADDRESS) as {
    activeToken: ActiveToken | null;
    isPvertPhase: boolean;
    loading: boolean;
  };
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
  
  // Typewriter effect for selected tier
  const selectedTierText = `${selectedTier.name.toLowerCase()}`;
  const { displayText: typedTierText } = useTypewriter(selectedTierText, 80);
  
  const rarityData = [
    { rarity: 'Common', odds: tierOdds.Common.toFixed(2), prize: PRIZE_PERCENTAGES.Common },
    { rarity: 'Rare', odds: tierOdds.Rare.toFixed(2), prize: PRIZE_PERCENTAGES.Rare },
    { rarity: 'Epic', odds: tierOdds.Epic.toFixed(2), prize: PRIZE_PERCENTAGES.Epic },
    { rarity: 'Legendary', odds: tierOdds.Legendary.toFixed(3), prize: PRIZE_PERCENTAGES.Legendary },
    { rarity: 'Mythical', odds: tierOdds.Mythical.toFixed(3), prize: PRIZE_PERCENTAGES.Mythical },
  ];

  // Trigger scrolling text effect on tier change
  useEffect(() => {
    setShowScrollingText(true);
    const timer = setTimeout(() => setShowScrollingText(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedTier]);

  return (
    <div className="w-full mx-auto max-w-4xl mt-8">
      <div className="bg-black border-2 border-green-500 rounded-lg p-8 font-mono text-sm relative shadow-2xl shadow-green-500/20 overflow-hidden">
        {/* Animated Matrix Rain Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="matrix-rain"></div>
        </div>
        
        {/* Glow effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-green-500/5 border border-green-500/30 pointer-events-none"></div>
        
        {/* Animated Terminal Header */}
        <div className="flex items-center justify-center mb-6 pb-3 border-b border-green-500/40">
          <div className="text-green-400 text-sm font-bold tracking-wider animate-pulse-border">
            <span className="animated-border">┌────────────</span> RARITY_MATRIX_v1.0.0 <span className="animated-border">─────────────┐</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6 relative z-10">
          
          {/* Tier Selection with Matrix Effect */}
          <div>
            <div className="text-green-400 text-base mb-4">
              {'> select_staking_tier:'}
              {showScrollingText && (
                <span className="ml-2 text-green-300 animate-pulse">
                  [PROCESSING...]
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STAKING_TIERS.map((tier, index) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`
                    p-3 rounded border transition-all duration-300 text-left min-h-[90px] flex flex-col justify-center
                    relative overflow-hidden group
                    ${selectedTier.id === tier.id 
                      ? 'border-green-400 bg-green-900/40 text-green-300 shadow-lg shadow-green-500/20' 
                      : 'border-green-500/30 bg-black hover:border-green-400 hover:bg-green-900/20 text-green-400'
                    }
                    hover:shadow-lg hover:shadow-green-500/10 hover:scale-[1.02]
                  `}
                >
                  {/* Tier Button Scan Line Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/20 to-transparent 
                                translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  
                  <div className="text-xs text-gray-400 mb-1 relative z-10">
                    [{index + 1}]
                  </div>
                  <div className={`font-bold text-sm mb-1 relative z-10 ${
                    selectedTier.id === tier.id ? 'text-white' : 'text-green-300'
                  }`}>
                    {tier.name.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-400 mb-1 relative z-10">
                    {tier.minStake > 0 ? `${tier.minStake.toLocaleString()}+ VERT` : 'NO_STAKE'}
                  </div>
                  {tier.rarityMultiplier > 1 && (
                    <div className="text-xs text-yellow-400 font-bold relative z-10">
                      +{((tier.rarityMultiplier - 1) * 100).toFixed(0)}% boost
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Selection Output with Typewriter Effect */}
          <div className="space-y-2">
            <div className="text-green-400">
              {'> selected_tier:'} <span className="text-white font-bold">{typedTierText}</span>
              <span className="animate-pulse text-green-500">|</span>
            </div>
            {selectedTier.id === 0 ? (
              <div className="text-white text-sm">
                {'> status: stake_vert_to_unlock_better_odds'}
              </div>
            ) : (
              <div className="text-yellow-400 text-sm">
                {'> boost:'} <span className="text-yellow-300 font-bold">+{((selectedTier.rarityMultiplier - 1) * 100).toFixed(0)}%</span> {'rare_odds_multiplier'}
              </div>
            )}
          </div>

          {/* Compact Professional Terminal Rarity Display */}
          <div className="space-y-2">
            <div className="border border-green-500/30 rounded p-4 bg-black/50 relative">
              
              {/* Enhanced Terminal Header */}
              <div className="text-center mb-4">
                <div className="text-green-400 text-xs font-mono animate-pulse-slow">
                  {'╔══════════════════════════════════════════════════════════════════════════════════════╗'}
                </div>
                <div className="text-green-300 text-sm font-bold py-1">
                  ║  RARITY DISTRIBUTION MATRIX • PROBABILITY ANALYSIS ENGINE • v2.1.0  ║
                </div>
                <div className="text-green-400 text-xs font-mono animate-pulse-slow">
                  {'╠══════════════════════════════════════════════════════════════════════════════════════╣'}
                </div>
              </div>

              {/* Horizontal Grid Layout */}
              <div className="grid grid-cols-5 gap-3 text-center">
                {rarityData.map(({ rarity, odds, prize }, index) => (
                  <div key={rarity} className="group">
                    <div className="border border-green-500/20 rounded p-3 hover:border-green-400/50 transition-all duration-300 hover:bg-green-900/10">
                      
                      {/* Rarity Name */}
                      <div className={`${rarityColors[rarity]} font-bold text-xs mb-2`}>
                        {rarity.toUpperCase()}
                        {selectedTier.rarityMultiplier > 1 && rarity !== 'Common' && (
                          <span className="text-yellow-400 ml-1">●</span>
                        )}
                      </div>

                      {/* Stats Compact */}
                      <div className="space-y-1">
                        <div>
                          <div className="text-gray-400 text-xs">ODDS</div>
                          <div className="text-white font-mono text-sm font-bold">
                            {odds}%
                            {selectedTier.rarityMultiplier > 1 && rarity !== 'Common' && (
                              <span className="text-green-400 text-xs ml-1">↗</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="border-t border-green-500/20 pt-1">
                          <div className="text-gray-400 text-xs">PRIZE</div>
                          <div className="text-white font-mono text-sm font-bold">
                            {prize}%
                          </div>
                          {isPvertPhase && (
                            <div className="text-yellow-400 text-xs mt-1">
                              → pVERT redeemable for VERT
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Boost Indicator */}
                      {selectedTier.rarityMultiplier > 1 && rarity !== 'Common' && (
                        <div className="mt-2 pt-2 border-t border-yellow-400/30">
                          <div className="text-yellow-400 text-xs">
                            +{((selectedTier.rarityMultiplier - 1) * 100).toFixed(0)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Terminal Footer */}
              <div className="text-center mt-4">
                <div className="text-green-400 text-xs font-mono animate-pulse-slow">
                  {'╠══════════════════════════════════════════════════════════════════════════════════════╣'}
                </div>
                <div className="text-green-300 text-xs py-1 font-mono">
                  ║  SCAN_COMPLETE • {rarityData.length} ENTITIES PROCESSED • MATRIX_STABLE  ║
                </div>
                <div className="text-green-400 text-xs font-mono animate-pulse-slow">
                  {'╚══════════════════════════════════════════════════════════════════════════════════════╝'}
                </div>
              </div>
            </div>
          </div>

          {/* Staking Status Section */}
          <div className="space-y-3">
            <div className="text-green-400 text-center">
              {'> staking_tier_status:'}
            </div>
            
            {!isConnected ? (
              <div className="text-red-400 text-sm animate-pulse">
                {'> error: wallet_not_connected'}
              </div>
            ) : !isStakingAvailable ? (
              <div className="border border-green-500/30 rounded p-3 bg-green-900/20">
                <div className="text-green-400 text-sm mb-1">
                  {'> info:'} <span className="text-yellow-400">staking_coming_to_mainnet</span>
                </div>
                <div className="text-green-300 text-xs">
                  {'> deploy_status:'} <span className="text-green-400">awaiting_virtuals_protocol_launch</span>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-yellow-400 text-sm animate-pulse">
                {'> loading: fetching_staking_data'}
                <span className="animate-ping">...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Current Status */}
                <div className="border border-green-500/30 rounded p-3 bg-green-900/20 relative">
                  <div className="text-green-300 text-sm mb-1">
                    {'> current_tier:'} <span className="text-white font-bold">{currentTier.name.toLowerCase()}</span>
                  </div>
                  <div className="text-green-300 text-sm mb-1">
                    {'> staked_amount:'} <span className="text-white font-mono">{formatStakedAmount(stakedAmount)} VERT</span>
                  </div>
                  {currentTier.id > 0 && (
                    <div className="text-yellow-400 text-sm">
                      {'> bonus:'} <span className="text-yellow-300 font-bold">+{((currentTier.rarityMultiplier - 1) * 100).toFixed(0)}%</span> {'rare_odds'}
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
                      {'> requirement:'} <span className="text-white font-mono">{formatStakedAmount(nextTier.minStake)} VERT</span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {'> needed:'} <span className="text-yellow-400 font-mono">{formatStakedAmount(amountNeededForNextTier)} VERT</span>
                    </div>
                    
                    {/* ASCII Progress Bar */}
                    <div className="mt-2">
                      <div className="text-green-400 text-xs font-mono">
                        {'['}{Array(20).fill('').map((_, i) => (
                          i < (progressToNextTier / 5) ? '█' : '░'
                        )).join('')}{']'} {Math.round(progressToNextTier)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced corner glow effects */}
        <div className="absolute top-0 left-0 w-6 h-6 bg-green-500/40 rounded-full blur-lg animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-6 h-6 bg-green-500/40 rounded-full blur-lg animate-pulse-slow delay-300"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 bg-green-500/40 rounded-full blur-lg animate-pulse-slow delay-700"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500/40 rounded-full blur-lg animate-pulse-slow delay-1000"></div>
      </div>

      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animated-border {
          display: inline-block;
          animation: pulse-border 2s ease-in-out infinite;
        }

        .matrix-rain {
          background: linear-gradient(0deg, transparent 24%, rgba(34, 197, 94, 0.05) 25%, rgba(34, 197, 94, 0.05) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.05) 75%, rgba(34, 197, 94, 0.05) 76%, transparent 77%, transparent);
          background-size: 75px 60px;
          animation: matrix-rain 20s linear infinite;
        }

        @keyframes matrix-rain {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
      `}</style>
    </div>
  );
} 