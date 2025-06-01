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
      <div className="bg-black border-2 border-green-500 rounded-lg p-8 font-mono text-sm relative shadow-2xl shadow-green-500/20 h-[320px] flex flex-col justify-between">
        {/* Glow effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-green-500/5 border border-green-500/30 pointer-events-none"></div>
        
        {/* Terminal Header with emphasized styling */}
        <div className="flex items-center justify-center mb-6 pb-3 border-b border-green-500/40">
          <div className="text-green-400 text-sm font-bold tracking-wider">
            ┌──────────── VERT_STATS_v1.0.0 ─────────────┐
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-center">
          {/* Stats Content - Clean layout */}
          <div className="text-center">
            <div className="space-y-4">
              <div className="text-green-400 text-base">
                NETWORK STATS:
              </div>
              
              {/* Clean stats display */}
              <div className="text-green-300 text-xl font-bold space-y-2">
                <div>MINTED: {totalMinted}</div>
                <div>STAKED: {vertStaked} VERT</div>
                <div>PAID OUT: {Math.floor(parseFloat(totalPaidOut) || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Bottom message area */}
          <div className="text-center min-h-[24px] overflow-hidden">
            <div className="text-green-400 text-base">
              📊 Real-time network data
            </div>
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