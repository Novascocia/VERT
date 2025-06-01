'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrizePoolTerminalProps {
  prizePoolAmount: string;
}

// Blinking cursor component
const BlinkingCursor = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, 500); // Blink every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-4xl ml-2" style={{ opacity: visible ? 1 : 0 }}>
      █
    </span>
  );
};

// Prize pool hype messages that rotate
const prizePoolMessages = [
  "👀 someone's gonna hit. could be you.",
  "💸 VERT mints flow here — claim your piece.",
  "🔥 mint. reveal. drain the pool.",
  "🧪 odds loaded. prize pool armed.",
  "🕶️ watching for Rare+... prize trigger primed.",
  "🎯 pull a Rare or better to win from the pool.",
  "⚡ prize pool reacts in real-time. no delays.",
];

export default function PrizePoolTerminal({ prizePoolAmount }: PrizePoolTerminalProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Rotate messages every 5 seconds
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % prizePoolMessages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="w-full mx-auto max-w-4xl">
      <div className="bg-black border-2 border-green-500 rounded-lg p-8 font-mono text-sm relative shadow-2xl shadow-green-500/20 h-[320px] flex flex-col justify-between">
        {/* Glow effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-green-500/5 border border-green-500/30 pointer-events-none"></div>
        
        {/* Terminal Header with emphasized styling */}
        <div className="flex items-center justify-center mb-6 pb-3 border-b border-green-500/40">
          <div className="text-green-400 text-sm font-bold tracking-wider">
            ┌──────────── PRIZE_POOL_v1.0.0 ─────────────┐
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6 relative z-10">
          {/* Prize Pool Amount - Simple glowing display without box */}
          <div className="text-center">
            <div className="space-y-4">
              <div className="text-green-400 text-base">
                VERT IN THE POOL:
              </div>
              
              {/* Simple glowing prize amount display - no box */}
              <div className="relative">
                <div className="font-mono text-5xl font-bold text-green-300 
                              animate-pulse
                              drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]
                              hover:scale-105 transition-transform duration-300">
                  {Math.floor(parseFloat(prizePoolAmount) || 0).toLocaleString()}
                  <BlinkingCursor />
                </div>
                
                {/* Subtle glow effect only */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-green-400/10 to-green-500/10 
                              rounded-lg blur-xl animate-pulse pointer-events-none"></div>
              </div>
              
              {/* Prize Pool launching soon note */}
              <div className="text-yellow-500/90 text-sm font-medium tracking-wide">
                🚀 Prize Pool launching soon!
              </div>
            </div>
          </div>

          {/* Rotating Messages - Fixed height to prevent expansion */}
          <div className="text-center min-h-[24px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-green-400 text-base whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {prizePoolMessages[currentMessageIndex]}
              </motion.div>
            </AnimatePresence>
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