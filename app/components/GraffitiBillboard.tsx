'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GraffitiBillboardProps {
  prizePool: string;
  totalMinted: string;
}

export default function GraffitiBillboard({ prizePool, totalMinted }: GraffitiBillboardProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Entrance animation
  const entranceAnimation = {
    initial: { 
      scale: 0.95, 
      opacity: 0,
      y: 30
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 25,
        duration: 0.8
      }
    }
  };

  // Subtle idle animation
  const idleAnimation = {
    y: [0, -1, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <motion.div
      className="relative w-full max-w-6xl mx-auto mb-16"
      initial={entranceAnimation.initial}
      animate={entranceAnimation.animate}
    >
      <motion.div
        animate={idleAnimation}
        className={`
          relative w-full h-32 md:h-40 
          transform-gpu
        `}
        style={{
          background: `
            linear-gradient(135deg, 
              #6B7280 0%, 
              #4B5563 25%, 
              #374151 50%, 
              #1F2937 75%, 
              #111827 100%
            ),
            repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0.1) 0px,
              rgba(0,0,0,0.1) 1px,
              transparent 1px,
              transparent 8px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255,255,255,0.02) 0px,
              rgba(255,255,255,0.02) 1px,
              transparent 1px,
              transparent 40px
            )
          `,
          borderRadius: '4px',
          boxShadow: `
            inset 0 0 40px rgba(0,0,0,0.6),
            0 8px 32px rgba(0,0,0,0.4),
            0 0 0 1px rgba(0,0,0,0.8)
          `,
          transform: 'rotate(-0.5deg)'
        }}
        whileHover={{
          scale: 1.01,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
          }
        }}
      >
        {/* Left Side - PRIZE POOL */}
        <div className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-20">
          <h3 
            className="font-comic text-sm md:text-lg font-black mb-1 leading-none"
            style={{
              color: '#FFD700',
              textShadow: `
                2px 2px 0px #FF8C00,
                -1px -1px 0px rgba(0,0,0,0.8),
                0 0 15px rgba(255, 215, 0, 0.8),
                0 0 30px rgba(255, 215, 0, 0.4)
              `,
              transform: 'rotate(-1deg)',
              letterSpacing: '1px',
              filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.7))'
            }}
          >
            PRIZE POOL
          </h3>
          <motion.p 
            className="font-comic text-xl md:text-3xl font-black leading-tight"
            style={{
              color: '#FFD700',
              textShadow: `
                0 0 20px rgba(255, 215, 0, 1),
                3px 3px 0px #FF8C00,
                -2px -2px 0px rgba(0,0,0,0.9),
                0 0 40px rgba(255, 215, 0, 0.6)
              `,
              letterSpacing: '1px',
              filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.8))'
            }}
            key={prizePool} // Re-animate when value changes
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {Number(prizePool).toLocaleString(undefined, { maximumFractionDigits: 0 })} VERT
          </motion.p>
        </div>

        {/* Center Divider - Spray Paint Slash */}
        <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 z-10">
          <div 
            className="w-8 md:w-12 h-full opacity-80"
            style={{
              background: `
                linear-gradient(15deg, 
                  transparent 0%, 
                  #FF4500 20%, 
                  #FF6347 50%, 
                  #FF4500 80%, 
                  transparent 100%
                )
              `,
              transform: 'rotate(15deg) scaleY(1.2)',
              filter: 'blur(1px)'
            }}
          />
          {/* Paint drips */}
          <div 
            className="absolute top-1/3 left-1/2 w-2 h-8 opacity-60"
            style={{
              background: 'linear-gradient(to bottom, #FF4500, transparent)',
              transform: 'translateX(-50%) rotate(5deg)',
              filter: 'blur(0.5px)'
            }}
          />
          <div 
            className="absolute top-2/3 left-1/4 w-1 h-6 opacity-40"
            style={{
              background: 'linear-gradient(to bottom, #FF6347, transparent)',
              transform: 'rotate(-3deg)',
              filter: 'blur(0.5px)'
            }}
          />
        </div>

        {/* Right Side - TOTAL MINTED */}
        <div className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 text-right z-20">
          <h3 
            className="font-comic text-sm md:text-lg font-black mb-1 leading-none"
            style={{
              color: '#FF4500',
              textShadow: `
                2px 2px 0px #DC143C,
                -1px -1px 0px rgba(0,0,0,0.8),
                0 0 15px rgba(255, 69, 0, 0.8),
                0 0 30px rgba(255, 69, 0, 0.4)
              `,
              transform: 'rotate(1.5deg)',
              letterSpacing: '1px',
              filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.7))'
            }}
          >
            TOTAL MINTED
          </h3>
          <motion.p 
            className="font-comic text-2xl md:text-4xl font-black leading-tight"
            style={{
              color: '#FF4500',
              textShadow: `
                0 0 20px rgba(255, 69, 0, 1),
                3px 3px 0px #DC143C,
                -2px -2px 0px rgba(0,0,0,0.9),
                0 0 40px rgba(255, 69, 0, 0.6)
              `,
              letterSpacing: '2px',
              filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.8))',
              transform: 'rotate(-1deg)'
            }}
            key={totalMinted} // Re-animate when value changes
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {totalMinted}
          </motion.p>
        </div>

        {/* Torn Stickers and Texture Elements */}
        <div className="absolute top-2 left-1/4 w-8 h-6 opacity-40 z-15">
          <div 
            className="w-full h-full rounded-sm"
            style={{
              background: 'linear-gradient(45deg, #FFFF00, #FFA500)',
              transform: 'rotate(-15deg)',
              clipPath: 'polygon(0% 0%, 85% 0%, 100% 80%, 15% 100%)'
            }}
          />
        </div>
        
        <div className="absolute bottom-3 right-1/4 w-6 h-4 opacity-30 z-15">
          <div 
            className="w-full h-full rounded-sm"
            style={{
              background: 'linear-gradient(45deg, #00FF00, #32CD32)',
              transform: 'rotate(25deg)',
              clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)'
            }}
          />
        </div>

        {/* Scratchy Edge Effects */}
        <div 
          className="absolute top-0 left-0 w-full h-1 opacity-20"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(0,0,0,0.5) 3px, rgba(0,0,0,0.5) 4px)'
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-full h-1 opacity-20"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 5px, rgba(0,0,0,0.5) 5px, rgba(0,0,0,0.5) 6px)'
          }}
        />

        {/* Grunge Texture Overlay */}
        <div 
          className="absolute inset-0 rounded opacity-20 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 15% 25%, rgba(0,0,0,0.3) 1px, transparent 1px),
              radial-gradient(circle at 85% 75%, rgba(0,0,0,0.2) 1px, transparent 1px),
              radial-gradient(circle at 45% 60%, rgba(0,0,0,0.25) 1px, transparent 1px),
              radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '25px 25px, 20px 20px, 30px 30px, 15px 15px'
          }}
        />

        {/* Faded Paint Streaks */}
        <div 
          className="absolute top-1/4 left-1/3 w-16 h-1 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
            transform: 'rotate(-5deg)',
            filter: 'blur(1px)'
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/3 w-12 h-1 opacity-25"
          style={{
            background: 'linear-gradient(90deg, transparent, #FF4500, transparent)',
            transform: 'rotate(8deg)',
            filter: 'blur(1px)'
          }}
        />
      </motion.div>
    </motion.div>
  );
} 