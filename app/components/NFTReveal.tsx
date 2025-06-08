'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import NFTImage from './NFTImage';

interface NFTRevealProps {
  isRevealing: boolean;
  imageUrl: string;
  rarity: string;
  prizeWon?: string;
  revealReady: boolean;
  onRevealComplete: () => void;
}

// Helper to convert ipfs:// to https://ipfs.io/ipfs/
function ipfsToHttp(ipfsUrl: string) {
  if (!ipfsUrl) return '';
  return ipfsUrl.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
}

export default function NFTReveal({ isRevealing, imageUrl, rarity, prizeWon, revealReady, onRevealComplete }: NFTRevealProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (revealReady) {
      setIsFlipped(true);
      // Auto-restore when reveal is ready
      if (isMinimized) {
        setIsMinimized(false);
      }
    }
  }, [revealReady, isMinimized]);

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  return (
    <AnimatePresence>
      {isRevealing && (
        <>
          {/* Minimized floating indicator */}
          {isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <button
                onClick={handleRestore}
                className="border-2 border-black shadow-cel p-3 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: '#50D64D', 
                  color: '#111111'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(80, 214, 77, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#50D64D';
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span className="font-comic text-sm">Processing NFT...</span>
                </div>
              </button>
            </motion.div>
          )}

          {/* Main reveal modal */}
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            >
              <div
                className="relative w-[380px] h-[480px] md:w-[440px] md:h-[540px] perspective-1000"
                style={{ perspective: '1000px' }}
              >
                {/* Minimize button (only show during processing, not during reveal) */}
                {!revealReady && (
                  <button
                    onClick={handleMinimize}
                    className="absolute top-2 right-2 z-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors"
                    title="Minimize"
                  >
                    −
                  </button>
                )}

                <div
                  className="absolute w-full h-full"
                  style={{
                    transition: 'transform 0.6s cubic-bezier(0.4,0.2,0.2,1)',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Front of card (loading) */}
                  <div
                    className="absolute w-full h-full bg-vert-gray border-4 border-black shadow-cel p-6 flex flex-col items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      zIndex: 2
                    }}
                  >
                    <div className="text-center">
                      <h3 className="font-comic text-2xl md:text-3xl lg:text-4xl mb-6 break-words max-w-full">PROCESSING...</h3>
                      <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6" style={{ borderColor: '#50D64D', borderTopColor: 'transparent' }} />
                    </div>
                  </div>

                  {/* Back of card (reveal) */}
                  <div
                    className="absolute w-full h-full bg-vert-gray border-4 border-black shadow-cel p-6 flex flex-col items-center justify-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      zIndex: 1
                    }}
                  >
                    <div className="text-center">
                      <NFTImage
                        src={imageUrl}
                        alt="Your NFT"
                        className="w-48 h-48 object-cover mb-4 border-2 border-black mx-auto"
                        onLoad={() => console.log('NFT image loaded successfully')}
                        onError={(error) => console.error('NFT image failed:', error)}
                        showLoading={false}
                      />
                      <h3 className="font-comic text-2xl mb-2">{rarity || 'Unknown Rarity'}</h3>
                      {prizeWon ? (
                        <p className="font-comic text-xl mb-4" style={{ color: '#50D64D' }}>
                          You won {prizeWon} VERT!
                        </p>
                      ) : (
                        <p className="font-comic text-xl text-gray-300 mb-4">
                          No prize this time!
                        </p>
                      )}
                      <button
                        onClick={onRevealComplete}
                        className="mt-4 px-6 py-3 font-comic text-xl font-bold border-2 border-black shadow-cel hover:shadow-cel-hover hover:-translate-y-1 active:translate-y-0 active:shadow-cel transition-all duration-200 rounded-lg"
                        style={{ 
                          backgroundColor: '#50D64D', 
                          color: '#111111'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(80, 214, 77, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#50D64D';
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
} 