'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  formatStakedAmount,
} from '../config/staking';
import { useStaking } from '../hooks/useStaking';

interface StakingStatusProps {
  className?: string;
}

// Blinking cursor component
function BlinkingCursor() {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return <span className={`${visible ? 'opacity-100' : 'opacity-0'} text-green-400`}>█</span>;
}

// Typewriter effect for terminal output
function TerminalOutput({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCursor(true);
      let i = 0;
      const typeTimer = setInterval(() => {
        if (i <= text.length) {
          setDisplayText(text.slice(0, i));
          i++;
        } else {
          clearInterval(typeTimer);
          setShowCursor(false);
        }
      }, 30);
      
      return () => clearInterval(typeTimer);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [text, delay]);
  
  return (
    <span>
      {displayText}
      {showCursor && <BlinkingCursor />}
    </span>
  );
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
      <div className={`bg-black border border-green-500/50 rounded-none font-mono text-sm p-6 ${className}`}>
        <div className="text-green-400 mb-2">
          <span className="text-green-500">root@verticals:~$</span> check_staking_status
        </div>
        <div className="text-red-400 mb-2">
          <TerminalOutput text="ERROR: No wallet connection detected" delay={300} />
        </div>
        <div className="text-gray-400">
          <TerminalOutput text="> Please connect wallet to continue..." delay={800} />
        </div>
        <div className="mt-4 text-green-400">
          <span className="text-green-500">root@verticals:~$</span> <BlinkingCursor />
        </div>
      </div>
    );
  }

  if (!isStakingAvailable) {
    return (
      <div className={`bg-black border border-green-500/50 rounded-none font-mono text-sm p-6 ${className}`}>
        <div className="text-green-400 mb-2">
          <span className="text-green-500">root@verticals:~$</span> check_staking_status
        </div>
        <div className="text-yellow-400 mb-2">
          <TerminalOutput text="STAKING MODULE: OFFLINE" delay={200} />
        </div>
        <div className="text-green-300 text-xs">
          {'> deploy_status:'} <span className="text-green-400">awaiting_virtuals_protocol_launch</span>
        </div>
        <div className="text-green-400 mb-2">
          <TerminalOutput text="> Expected: Post mainnet launch" delay={1000} />
        </div>
        <div className="text-gray-400 mb-4">
          <TerminalOutput text="> Staking tiers will be activated when VERT contract is live" delay={1400} />
        </div>
        <div className="text-green-400">
          <span className="text-green-500">root@verticals:~$</span> <BlinkingCursor />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-black border border-green-500/50 rounded-none font-mono text-sm p-6 ${className}`}>
        <div className="text-green-400 mb-2">
          <span className="text-green-500">root@verticals:~$</span> fetch_staking_data
        </div>
        <div className="text-yellow-400 mb-2 flex items-center">
          <span>Querying staking contract</span>
          <span className="ml-2 animate-pulse">...</span>
        </div>
        <div className="text-gray-400 mb-2">
          <span className="animate-pulse">[████████████████████] 100%</span>
        </div>
        <div className="text-green-400">
          <span className="text-green-500">root@verticals:~$</span> <BlinkingCursor />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black border border-green-500/50 rounded-none font-mono text-sm p-6 relative overflow-hidden ${className}`}>
      {/* Terminal scanning line effect */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500/60 animate-scan-terminal"></div>
      
      <div className="relative z-10">
        {/* Terminal Header */}
        <div className="text-green-400 mb-4">
          <span className="text-green-500">root@verticals:~$</span> get_user_staking_profile
        </div>

        {/* User Staking Info */}
        <div className="space-y-2 mb-4">
          <div className="text-green-300">
            <TerminalOutput text={`> USER_TIER: ${currentTier.name.toUpperCase()}`} delay={200} />
          </div>
          <div className="text-green-300">
            <TerminalOutput text={`> STAKED_BALANCE: ${formatStakedAmount(stakedAmount)} VERT`} delay={400} />
          </div>
          {currentTier.id > 0 && (
            <div className="text-yellow-400">
              <TerminalOutput 
                text={`> RARITY_BONUS: +${((currentTier.rarityMultiplier - 1) * 100).toFixed(0)}% multiplier`} 
                delay={600} 
              />
            </div>
          )}
          <div className="text-green-300">
            <TerminalOutput text={`> TIER_DESCRIPTION: ${currentTier.description}`} delay={800} />
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="mb-4 border-t border-green-500/30 pt-3">
            <div className="text-green-400 mb-2">
              <TerminalOutput text="> PROGRESSION_ANALYSIS:" delay={1000} />
            </div>
            <div className="text-gray-300 ml-4 space-y-1">
              <div>
                <TerminalOutput text={`└─ Next Tier: ${nextTier.name.toUpperCase()}`} delay={1200} />
              </div>
              <div>
                <TerminalOutput text={`└─ Required: ${formatStakedAmount(nextTier.minStake)} VERT`} delay={1400} />
              </div>
              <div>
                <TerminalOutput text={`└─ Needed: ${formatStakedAmount(amountNeededForNextTier)} VERT`} delay={1600} />
              </div>
              
              {/* ASCII Progress Bar */}
              <div className="mt-2">
                <div className="text-green-400 text-xs">
                  <TerminalOutput 
                    text={`└─ Progress: [${Array(20).fill('').map((_, i) => (
                      i < (progressToNextTier / 5) ? '█' : '░'
                    )).join('')}] ${Math.round(progressToNextTier)}%`}
                    delay={1800}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tier Benefits */}
        <div className="border-t border-green-500/30 pt-3 mb-4">
          <div className="text-green-400 mb-2">
            <TerminalOutput text="> STAKING_BENEFITS:" delay={2000} />
          </div>
          <div className="text-gray-300 ml-4 space-y-1 text-xs">
            <div>
              <TerminalOutput text="└─ Higher tiers = Better rarity odds" delay={2200} />
            </div>
            <div>
              <TerminalOutput text="└─ Prize percentages remain constant" delay={2400} />
            </div>
            <div>
              <TerminalOutput text="└─ Multiplicative bonus on rare+ drops" delay={2600} />
            </div>
          </div>
        </div>

        {/* Terminal Prompt */}
        <div className="text-green-400 mt-4">
          <span className="text-green-500">root@verticals:~$</span> <BlinkingCursor />
        </div>
      </div>

      {/* Terminal glow effects */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-green-500/50 rounded-full blur-sm animate-pulse"></div>
      <div className="absolute top-2 right-2 w-2 h-2 bg-green-500/50 rounded-full blur-sm animate-pulse delay-300"></div>

      <style jsx>{`
        @keyframes scan-terminal {
          0% { 
            transform: translateY(0); 
            opacity: 1; 
          }
          50% { 
            opacity: 0.3; 
          }
          100% { 
            transform: translateY(300px); 
            opacity: 1; 
          }
        }

        .animate-scan-terminal {
          animation: scan-terminal 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 