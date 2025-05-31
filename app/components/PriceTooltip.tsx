'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface PriceTooltipProps {
  isVisible: boolean;
  price: string;
  color: 'gold' | 'green';
}

export default function PriceTooltip({ isVisible, price, color }: PriceTooltipProps) {
  const colorStyles = {
    gold: {
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      borderColor: '#d97706',
      glowColor: 'rgba(245, 158, 11, 0.6)'
    },
    green: {
      background: 'linear-gradient(135deg, #4ade80, #16a34a)',
      borderColor: '#15803d',
      glowColor: 'rgba(34, 197, 94, 0.6)'
    }
  };

  const style = colorStyles[color];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute -top-16 z-50"
          style={{ 
            left: '50%'
          }}
          initial={{ 
            scale: 0, 
            opacity: 0, 
            y: 10,
            rotate: -10,
            x: '-50%'
          }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: 0,
            rotate: 0,
            x: '-50%',
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 20,
              duration: 0.3
            }
          }}
          exit={{ 
            scale: 0, 
            opacity: 0, 
            y: 10,
            rotate: 10,
            x: '-50%',
            transition: {
              duration: 0.2
            }
          }}
          whileHover={{
            scale: 1.05,
            rotate: 1,
            x: '-50%',
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 15
            }
          }}
        >
          <div
            className="relative px-4 py-2 rounded-2xl border-3 shadow-2xl min-w-[120px]"
            style={{
              background: style.background,
              borderColor: style.borderColor,
              borderWidth: '3px',
              borderStyle: 'solid',
              boxShadow: `0 0 20px ${style.glowColor}, 0 8px 16px rgba(0,0,0,0.3)`,
              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))'
            }}
          >
            {/* Speech bubble tail */}
            <div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: `8px solid ${style.borderColor}`
              }}
            />
            <div 
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: color === 'gold' ? '6px solid #f59e0b' : '6px solid #16a34a'
              }}
            />

            {/* Content */}
            <div className="text-center relative z-10">
              <p className="font-comic text-sm font-black text-black drop-shadow-sm leading-tight">
                {price}
              </p>
            </div>

            {/* Graffiti-style highlights */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-white/40 rounded-full" />
            <div className="absolute top-2 right-2 w-1 h-1 bg-white/60 rounded-full" />
            
            {/* Comic-style border effect */}
            <div className="absolute inset-0 rounded-2xl border border-white/30 pointer-events-none" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 