'use client';

import React from 'react';

interface StatsTerminalProps {
  vertStaked: string;
  totalMinted: string;
  totalPaidOut: string;
}

export default function StatsTerminal({ vertStaked, totalMinted, totalPaidOut }: StatsTerminalProps) {
  return (
    <div className="w-full mx-auto max-w-4xl">
      <div className="bg-black border-2 border-green-500 rounded-lg p-8 font-mono text-sm relative shadow-2xl shadow-green-500/20">
        {/* Glow effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-green-500/5 border border-green-500/30 pointer-events-none"></div>
        
        {/* Terminal Header with emphasized styling */}
        <div className="flex items-center justify-center mb-6 pb-3 border-b border-green-500/40">
          <div className="text-green-400 text-sm font-bold tracking-wider">
            ┌──────────── VERT_STATS_v1.0.0 ─────────────┐
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4 relative z-10">
          {/* Stats Content - Three lines with adjusted sizing */}
          <div className="text-center">
            <div className="space-y-2">
              <div className="text-green-400 text-base">
                NETWORK STATS:
              </div>
              
              {/* Three stats lines with compact spacing */}
              <div className="text-green-300 text-base space-y-1">
                <div>MINTED: {totalMinted}</div>
                <div>STAKED: {vertStaked} VERT</div>
                <div>PAID OUT: {Math.floor(parseFloat(totalPaidOut) || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Minimal bottom space - slightly smaller */}
          <div className="text-center h-[8px]">
            {/* Even smaller to perfectly match */}
          </div>
        </div>

        {/* Additional glow effects on corners */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500/30 rounded-full blur-sm"></div>
      </div>
    </div>
  );
} 