'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StatBubbleProps {
  title: string;
  value: string;
  color: 'green' | 'gold' | 'purple' | 'blue';
  position: { top: string; left: string };
  delay?: number;
}

const colorVariants = {
  green: {
    bg: 'bg-gradient-to-br from-green-400 to-green-600',
    border: 'border-green-700',
    shadow: 'shadow-green-500/50',
    glow: 'shadow-green-400/60'
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    border: 'border-orange-600',
    shadow: 'shadow-yellow-500/50',
    glow: 'shadow-yellow-400/60'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    border: 'border-purple-700',
    shadow: 'shadow-purple-500/50',
    glow: 'shadow-purple-400/60'
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    border: 'border-blue-700',
    shadow: 'shadow-blue-500/50',
    glow: 'shadow-blue-400/60'
  }
};

export default function StatBubble({ title, value, color, position, delay = 0 }: StatBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const colorClass = colorVariants[color];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Random bounce animation values
  const bounceAnimation = {
    y: [0, -8, 0, -4, 0],
    rotate: [-1, 1, -0.5, 0.5, 0],
    transition: {
      duration: 3 + Math.random() * 2, // Random duration between 3-5 seconds
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay
    }
  };

  // Entrance animation
  const entranceAnimation = {
    initial: { 
      scale: 0, 
      rotate: -180, 
      opacity: 0,
      x: -100 
    },
    animate: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: delay * 0.2
      }
    }
  };

  // Hover animation
  const hoverAnimation = {
    scale: isHovered ? 1.1 : 1,
    rotate: isHovered ? 2 : 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  };

  // Mobile positioning adjustments
  const mobilePosition = isMobile ? {
    top: `${parseInt(position.top) / 2}px`,
    left: position.left
  } : position;

  return (
    <motion.div
      className="absolute z-40"
      style={{ 
        top: mobilePosition.top, 
        left: mobilePosition.left,
        filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
      }}
      initial={entranceAnimation.initial}
      animate={entranceAnimation.animate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={bounceAnimation}
        whileHover={hoverAnimation}
        className={`
          relative px-4 py-3 md:px-6 md:py-4 rounded-3xl border-4 
          ${colorClass.bg} ${colorClass.border}
          shadow-2xl ${isHovered ? `bubble-glow-${color}` : colorClass.shadow}
          transform-gpu cursor-pointer
          min-w-[140px] max-w-[180px] md:min-w-[160px] md:max-w-[200px]
        `}
        style={{
          background: `linear-gradient(135deg, ${color === 'green' ? '#4ade80, #16a34a' : 
                                                color === 'gold' ? '#fbbf24, #f59e0b' :
                                                color === 'purple' ? '#a855f7, #9333ea' :
                                                '#3b82f6, #2563eb'})`,
        }}
      >
        {/* Speech bubble tail */}
        <div 
          className={`
            absolute -bottom-3 left-6 w-0 h-0 
            border-l-[15px] border-l-transparent
            border-r-[15px] border-r-transparent
            border-t-[15px] ${colorClass.border.replace('border-', 'border-t-')}
          `}
        />
        <div 
          className={`
            absolute -bottom-2 left-7 w-0 h-0 
            border-l-[12px] border-l-transparent
            border-r-[12px] border-r-transparent
            border-t-[12px]
          `}
          style={{
            borderTopColor: color === 'green' ? '#16a34a' : 
                           color === 'gold' ? '#f59e0b' :
                           color === 'purple' ? '#9333ea' :
                           '#2563eb'
          }}
        />

        {/* Content */}
        <div className="text-center relative z-10">
          <h3 className="font-comic text-sm font-bold text-black mb-1 drop-shadow-sm">
            {title}
          </h3>
          <p className="font-comic text-lg font-black text-black drop-shadow-sm leading-tight">
            {value}
          </p>
        </div>

        {/* Graffiti-style highlights */}
        <div className="absolute top-2 right-2 w-3 h-3 bg-white/30 rounded-full" />
        <div className="absolute top-4 right-4 w-1 h-1 bg-white/50 rounded-full" />
        
        {/* Comic-style border effect */}
        <div className="absolute inset-0 rounded-3xl border-2 border-white/20 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
} 