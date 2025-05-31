'use client';

import { motion } from 'framer-motion';

interface ThreeBubbleStatsProps {
  prizePool: string;
  totalMinted: string;
  vertStaked?: string;
}

export default function ThreeBubbleStats({ prizePool, totalMinted, vertStaked = "0" }: ThreeBubbleStatsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12 px-4">
      {/* VERT Staked Bubble (Left) - Green like VERT button */}
      <motion.div 
        className="relative order-2 md:order-1"
        whileHover={{ 
          y: -2,
          scale: 1.05,
          transition: { type: "spring", stiffness: 400, damping: 25 }
        }}
      >
        <div 
          className="px-5 py-3 rounded-full font-bold uppercase text-sm text-black shadow-lg cursor-pointer relative overflow-hidden pulse-bubble"
          style={{
            background: '#F4B942',
            fontFamily: 'Bangers, cursive',
            boxShadow: '0 4px 15px rgba(244, 185, 66, 0.3)'
          }}
        >
          {/* Speech bubble tail */}
          <div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #F4B942'
            }}
          />
          VERT Staked: {vertStaked}
        </div>
      </motion.div>

      {/* Prize Pool Bubble (Center) - Larger with white pulse glow */}
      <motion.div 
        className="relative order-1 md:order-2"
        whileHover={{ 
          y: -3,
          scale: 1.08,
          transition: { type: "spring", stiffness: 400, damping: 25 }
        }}
      >
        {/* Rotating glow border wrapper */}
        <div className="rotating-glow-border-wrapper">
          <div 
            className="px-6 py-4 rounded-full font-bold uppercase text-base md:text-lg text-white shadow-xl cursor-pointer relative"
            style={{
              background: '#111111',
              fontFamily: 'Bangers, cursive'
            }}
          >
            Prize Pool: {Number(prizePool).toLocaleString(undefined, { maximumFractionDigits: 0 })} VERT
          </div>
        </div>
      </motion.div>

      {/* Total Minted Bubble (Right) - Gold like VIRTUAL button */}
      <motion.div 
        className="relative order-3 md:order-3"
        whileHover={{ 
          y: -2,
          scale: 1.05,
          transition: { type: "spring", stiffness: 400, damping: 25 }
        }}
      >
        <div 
          className="px-5 py-3 rounded-full font-bold uppercase text-sm text-black shadow-lg cursor-pointer relative overflow-hidden pulse-bubble"
          style={{
            background: '#F4B942',
            fontFamily: 'Bangers, cursive',
            boxShadow: '0 4px 15px rgba(244, 185, 66, 0.3)'
          }}
        >
          {/* Speech bubble tail */}
          <div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #F4B942'
            }}
          />
          Total Minted: {totalMinted}
        </div>
      </motion.div>

      {/* Add all animation keyframes and styles */}
      <style jsx>{`
        .rotating-glow-border-wrapper {
          position: relative;
          padding: 3px;
          border-radius: 9999px;
          background: linear-gradient(45deg, #ffffff, #e5e5e5, #ffffff, #f0f0f0);
          background-size: 300% 300%;
          animation: rotatingGlow 4s ease-in-out infinite;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
        }
        
        @keyframes rotatingGlow {
          0% { 
            background-position: 0% 50%;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
          }
          50% { 
            background-position: 100% 50%;
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.6);
          }
          100% { 
            background-position: 0% 50%;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            box-shadow: none;
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.15);
          }
        }
        
        .pulse-bubble {
          animation: pulseGlow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 