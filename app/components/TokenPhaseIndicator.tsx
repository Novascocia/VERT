'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TokenPhaseIndicatorProps {
  nftContractAddress: string;
}

export default function TokenPhaseIndicator({ nftContractAddress }: TokenPhaseIndicatorProps) {
  // Hardcoded to always show pVERT phase during early launch
  // TODO: Remove when real VERT launches

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto mb-6"
    >
      {/* Always show pVERT phase for now */}
      <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500 rounded-lg p-4 font-mono text-sm relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-10">
            <div className="animate-pulse bg-gradient-to-r from-yellow-500/20 to-orange-500/20 h-full w-full"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Phase Info */}
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <span className="text-yellow-400 text-xl">🚀</span>
              </div>
              <div>
                <div className="text-yellow-300 font-bold text-lg">
                  EARLY LAUNCH PHASE
                </div>
                <div className="text-yellow-400 text-sm">
                  Earning pVERT • Redeemable 1:1 for VERT
                </div>
              </div>
            </div>

            {/* Token Info */}
            <div className="text-center md:text-right">
              <div className="text-yellow-300 text-sm font-bold">
                Current Reward Token: pVERT
              </div>
              <div className="text-yellow-400 text-xs">
                Placeholder VERT • Full redemption when VERT launches
              </div>
            </div>

            {/* Pulsing indicator */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="text-yellow-400 text-xs font-bold">LIVE</div>
            </div>
          </div>
        </div>
    </motion.div>
  );
} 