import { motion } from 'framer-motion';

interface RarityRevealProps {
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical';
  prizeAmount: number;
}

const rarityStyles: Record<string, string> = {
  Common: 'border-gray-500 bg-[#1f1f1f]',
  Rare: 'border-blue-400 shadow-[0_0_8px_#3b82f6]',
  Epic: 'border-purple-500 animate-pulse',
  Legendary: 'border-orange-400 bg-gradient-to-br from-yellow-200 via-orange-300 to-yellow-500',
  Mythical: 'bg-gradient-to-tr from-pink-400 via-indigo-400 to-cyan-400 filter drop-shadow-lg',
};

const rarityMotion: Record<string, any> = {
  Common: {
    initial: { opacity: 0 },
    animate: { opacity: 1, scale: [0.9, 1.05, 1] },
    transition: { duration: 0.8, ease: 'easeOut' }
  },
  Rare: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: [0.9, 1.1, 1] },
    transition: { duration: 1, repeat: 1, repeatType: 'reverse' }
  },
  Epic: {
    initial: { opacity: 0, filter: 'blur(8px)' },
    animate: { opacity: 1, filter: ['blur(8px)', 'blur(0px)'], scale: [0.8, 1.15, 1] },
    transition: { duration: 1.2, ease: 'anticipate' }
  },
  Legendary: {
    initial: { opacity: 0, rotate: 0 },
    animate: { opacity: 1, rotate: [0, 10, -10, 0], scale: [0.8, 1.2, 1] },
    transition: { duration: 1.5, ease: 'easeInOut' }
  },
  Mythical: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: [0.8, 1.25, 1], filter: ['brightness(0.8)', 'brightness(1.2)', 'brightness(1)'] },
    transition: { duration: 2, ease: 'easeInOut' }
  }
};

export default function RarityReveal({ rarity, prizeAmount }: RarityRevealProps) {
  const anim = rarityMotion[rarity] || rarityMotion.Common;
  const style = rarityStyles[rarity] || rarityStyles.Common;
  return (
    <motion.div
      className={`rarity-box border-4 rounded-xl p-6 mx-auto mt-6 text-center ${style}`}
      initial={anim.initial}
      animate={anim.animate}
      transition={anim.transition}
      style={{ fontSize: '2rem', fontWeight: 'bold', maxWidth: 420 }}
    >
      <p className="mb-2">You minted a <span className="capitalize">{rarity}</span> character.</p>
      {prizeAmount > 0 ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, repeat: 2, repeatType: 'reverse' }}
          className="text-yellow-300 text-3xl font-extrabold mt-2 flex items-center justify-center gap-2"
        >
          <span role="img" aria-label="coin">🪙</span>
          🎉 You won {prizeAmount} VERT from the prize pool! 🎉
        </motion.div>
      ) : (
        <div className="text-lg mt-2">Better luck next time!</div>
      )}
    </motion.div>
  );
} 