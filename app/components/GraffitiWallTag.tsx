'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GraffitiWallTagProps {
  title: string;
  value: string;
  color: 'green' | 'orange';
  position: { top: string; left: string };
  delay?: number;
}

export default function GraffitiWallTag({ title, value, color, position, delay = 0 }: GraffitiWallTagProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const colorStyles = {
    green: {
      tagColor: '#FFD700', // Yellow-orange for PRIZE POOL
      shadowColor: 'rgba(255, 215, 0, 0.9)',
      glowColor: 'rgba(255, 215, 0, 0.3)',
      accentColor: '#FFA500',
      textShadow: '#FF8C00'
    },
    orange: {
      tagColor: '#FF4500', // Orange-red for TOTAL MINTED
      shadowColor: 'rgba(255, 69, 0, 0.9)',
      glowColor: 'rgba(255, 69, 0, 0.3)',
      accentColor: '#DC143C',
      textShadow: '#B22222'
    }
  };

  const style = colorStyles[color];

  // Mobile positioning adjustments
  const mobilePosition = isMobile ? {
    top: `${parseInt(position.top) / 2}px`,
    left: position.left
  } : position;

  // Entrance animation
  const entranceAnimation = {
    initial: { 
      scale: 0.8, 
      opacity: 0,
      rotateZ: -5,
      y: 20
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      rotateZ: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: delay * 0.3
      }
    }
  };

  // Subtle idle animation
  const idleAnimation = {
    y: [0, -2, 0],
    rotateZ: [0, 0.5, 0],
    transition: {
      duration: 4 + Math.random() * 2,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay
    }
  };

  return (
    <motion.div
      className="absolute z-30"
      style={{ 
        top: mobilePosition.top, 
        left: mobilePosition.left,
        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))'
      }}
      initial={entranceAnimation.initial}
      animate={entranceAnimation.animate}
    >
      <motion.div
        animate={idleAnimation}
        className={`
          relative px-6 py-4 md:px-8 md:py-6 
          min-w-[180px] max-w-[220px] md:min-w-[200px] md:max-w-[260px]
          transform-gpu cursor-pointer
        `}
        style={{
          background: `
            linear-gradient(135deg, 
              #8B4513 0%, 
              #A0522D 25%, 
              #CD853F 50%, 
              #8B4513 75%, 
              #654321 100%
            ),
            repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0.3) 0px,
              rgba(0,0,0,0.3) 1px,
              transparent 1px,
              transparent 20px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0,0,0,0.2) 0px,
              rgba(0,0,0,0.2) 1px,
              transparent 1px,
              transparent 60px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(139, 69, 19, 0.8) 0px,
              rgba(139, 69, 19, 0.8) 30px,
              rgba(101, 67, 33, 0.8) 30px,
              rgba(101, 67, 33, 0.8) 60px
            )
          `,
          borderRadius: '4px',
          border: 'none',
          boxShadow: `
            inset 0 0 30px rgba(0,0,0,0.5),
            0 0 40px ${style.glowColor},
            0 12px 40px rgba(0,0,0,0.7),
            0 0 0 2px rgba(0,0,0,0.8)
          `,
          transform: color === 'green' ? 'rotate(-2deg)' : 'rotate(1.5deg)'
        }}
        whileHover={{
          scale: 1.02,
          rotateZ: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25
          }
        }}
      >
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Title - Spray Paint Style */}
          <h3 
            className="font-comic text-lg md:text-2xl font-black mb-3 leading-none"
            style={{
              color: style.tagColor,
              textShadow: `
                3px 3px 0px ${style.textShadow},
                -2px -2px 0px rgba(0,0,0,0.8),
                0 0 20px ${style.shadowColor},
                0 0 40px ${style.shadowColor}
              `,
              transform: 'rotate(-1.5deg)',
              letterSpacing: '2px',
              filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.8))'
            }}
          >
            {title}
          </h3>

          {/* Paint Drips under title */}
          <div className="relative mb-2">
            <div 
              className="absolute -top-1 left-1/4 w-1 h-8 opacity-70"
              style={{
                background: `linear-gradient(to bottom, ${style.tagColor}, transparent)`,
                transform: 'rotate(5deg)',
                filter: 'blur(0.5px)'
              }}
            />
            <div 
              className="absolute -top-1 right-1/3 w-1 h-6 opacity-50"
              style={{
                background: `linear-gradient(to bottom, ${style.accentColor}, transparent)`,
                transform: 'rotate(-3deg)',
                filter: 'blur(0.5px)'
              }}
            />
          </div>
          
          {/* Value - Stencil Style Black Box */}
          <div 
            className="relative mx-auto px-4 py-3 max-w-fit"
            style={{
              background: 'linear-gradient(135deg, #000, #1a1a1a)',
              border: '3px solid #333',
              borderRadius: '2px',
              transform: 'rotate(0.5deg)',
              boxShadow: `
                inset 0 0 10px rgba(0,0,0,0.8),
                0 4px 8px rgba(0,0,0,0.6)
              `
            }}
          >
            <p 
              className="font-mono text-xl md:text-2xl font-bold leading-tight"
              style={{
                color: '#fff',
                textShadow: `
                  0 0 10px #fff,
                  1px 1px 2px rgba(0,0,0,0.8)
                `,
                letterSpacing: '1px',
                fontFamily: 'monospace'
              }}
            >
              {value}
            </p>
          </div>
        </div>

        {/* Grunge Texture Overlay */}
        <div 
          className="absolute inset-0 rounded opacity-30 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(0,0,0,0.3) 2px, transparent 2px),
              radial-gradient(circle at 80% 70%, rgba(0,0,0,0.2) 1px, transparent 1px),
              radial-gradient(circle at 40% 80%, rgba(0,0,0,0.25) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '20px 20px, 15px 15px, 25px 25px'
          }}
        />
      </motion.div>
    </motion.div>
  );
} 