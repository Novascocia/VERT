'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '@/app/hooks/useTypewriter';

interface MintFeedPanelProps {
  isProcessing: boolean;
  isWaitingForTx: boolean;
  mintedNFT: {
    imageUrl: string;
    rarity: string;
    prizeWon?: string;
  } | null;
  lastMintedRarity: string | null;
  lastMintedPrize: string | null;
  mintedNFTImageUrl: string | null;
  mintedTokenId: string | null;
}

// Processing messages for typewriter effect
const processingMessages = [
  "Calibrating traits...",
  "Almost there...",
  "Assembling your Vertical...",
  "Finalizing composition...",
  "Injecting VERT core..."
];

// Helper to convert ipfs:// to https://ipfs.io/ipfs/
function ipfsToHttp(ipfsUrl: string) {
  if (!ipfsUrl) return '';
  // Use the reliable ipfs.io gateway for display
  return ipfsUrl.replace(/^ipfs:\/\//, 'https://ipfs.io/ipfs/');
}

// Alternative function for Twitter sharing - uses multiple fallback gateways
function ipfsToTwitter(ipfsUrl: string) {
  if (!ipfsUrl) return '';
  
  // Try different gateways - some work better with Twitter than others
  const gateways = [
    'https://dweb.link/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/'
  ];
  
  // Use the first gateway for now, but we could implement fallback logic
  const hash = ipfsUrl.replace(/^ipfs:\/\//, '');
  return `${gateways[0]}${hash}`;
}

export default function MintFeedPanel({
  isProcessing,
  isWaitingForTx,
  mintedNFT,
  lastMintedRarity,
  lastMintedPrize,
  mintedNFTImageUrl,
  mintedTokenId
}: MintFeedPanelProps) {
  // Typewriter effect for processing messages
  const typewriterText = useTypewriter({
    messages: processingMessages,
    typeSpeed: 80,
    deleteSpeed: 40,
    pauseTime: 1200,
    isActive: isProcessing
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      case 'mythical': return 'text-red-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="bg-black border-2 border-green-500 rounded-lg p-6 font-mono text-sm h-[400px] relative flex flex-col">
        {/* Terminal Header */}
        <div className="flex items-center justify-center mb-4 pb-2 border-b border-green-500/30">
          <span className="text-green-400 text-xs">MINT_FEED_v1.0.0</span>
        </div>

        {/* Content Area - flex-1 to take remaining space */}
        <div className="flex-1 pb-8">
          <AnimatePresence mode="wait">
            {isWaitingForTx && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-center items-center"
              >
                <div className="text-gray-400 mb-2">
                  &gt; awaiting wallet confirmation...
                </div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-center items-center"
              >
                <div className="text-orange-400 mb-4">
                  &gt; {typewriterText}
                  <span className="animate-pulse">|</span>
                </div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </motion.div>
            )}

            {!isWaitingForTx && !isProcessing && !mintedNFTImageUrl && (
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col justify-center items-center"
              >
                <div className="text-white text-center">
                  <div className="mb-2">&gt; mint feed initialized</div>
                  <div className="text-sm">&gt; your minted NFT appears here</div>
                </div>
              </motion.div>
            )}

            {!isWaitingForTx && !isProcessing && mintedNFTImageUrl && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center h-full flex flex-col max-h-[320px]"
              >
                <div className="text-green-400 mb-2">
                  &gt; mint completed successfully ✅
                </div>
                
                {/* NFT Display - constrained height */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                  <img
                    src={ipfsToHttp(mintedNFTImageUrl)}
                    alt="Minted NFT"
                    className="w-44 h-44 object-cover border-2 border-green-500 rounded cursor-pointer transition-all duration-300 ease-in-out hover:scale-150 hover:z-50 hover:shadow-2xl hover:shadow-green-500/50"
                  />
                </div>
                
                {/* NFT Info - at bottom */}
                <div className="mt-2 space-y-0 flex-shrink-0">
                  <div className="text-center text-sm">
                    <span className="text-green-400">&gt; rarity: </span>
                    <span className={`font-bold ${getRarityColor(lastMintedRarity || 'unknown')}`}>
                      {lastMintedRarity || 'Processing...'}
                    </span>
                  </div>
                  
                  <div className="text-center text-sm">
                    <span className="text-green-400">&gt; prize: </span>
                    <span className="text-green-300 font-bold">
                      {lastMintedPrize ? `${lastMintedPrize} VERT` : '0 VERT'}
                    </span>
                  </div>
                  
                  {/* Share Button */}
                  <div className="text-center mt-3">
                    <button
                      onClick={() => {
                        console.log('🔍 Share button clicked:', {
                          mintedTokenId,
                          mintedNFTImageUrl,
                          lastMintedRarity,
                          lastMintedPrize
                        });
                        
                        if (!mintedTokenId) {
                          console.warn('⚠️ No token ID available for sharing, using fallback approach');
                          // Fallback to old approach if token ID is missing
                          const imageUrl = ipfsToTwitter(mintedNFTImageUrl);
                          const baseText = `Just minted a ${lastMintedRarity || 'Vertical'} NFT on @VerticalOnBase! ${lastMintedPrize ? `Won ${lastMintedPrize} VERT! 🎉` : ''} #vertnft`;
                          const tweetText = `${baseText}\n\n🖼️ ${imageUrl}`;
                          const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                          window.open(tweetUrl, '_blank');
                          return;
                        }
                        
                        const imageUrl = ipfsToTwitter(mintedNFTImageUrl);
                        const baseText = `Just minted a ${lastMintedRarity || 'Vertical'} NFT on @VerticalOnBase! ${lastMintedPrize ? `Won ${lastMintedPrize} VERT! 🎉` : ''} #vertnft`;
                        
                        // Create share URL with proper Twitter Card meta tags
                        const shareUrl = `${window.location.origin}/api/share/${mintedTokenId}?image=${encodeURIComponent(imageUrl)}&rarity=${encodeURIComponent(lastMintedRarity || 'Vertical')}&prize=${encodeURIComponent(lastMintedPrize || '0')}`;
                        console.log('📤 Created share URL:', shareUrl);
                        
                        // Create tweet with the share URL (this will show Twitter Card)
                        const tweetText = `${baseText}\n\nCheck it out: ${shareUrl}`;
                        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                        console.log('🐦 Opening Twitter with:', tweetUrl);
                        window.open(tweetUrl, '_blank');
                      }}
                      className="text-green-400 hover:text-white hover:bg-green-900/20 px-2 py-1 rounded transition-colors font-mono text-xs border border-green-500/30 hover:border-green-400"
                    >
                      &gt; share_on_x
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Note positioned absolutely at bottom - doesn't affect container height */}
        {(isProcessing || isWaitingForTx || (!isWaitingForTx && !isProcessing)) && (
          <div className="absolute bottom-4 left-6 right-6 border-t border-green-500/30 pt-2">
            <div className="text-white text-xs text-center">
              &gt; NFT may take up to 60s to generate — minting gets faster after your first
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
