'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useAccumulativeTypewriter } from '@/app/hooks/useAccumulativeTypewriter';
import { debugLog } from '@/utils/debug';

interface MintTerminalProps {
  onMintWithVirtual: () => Promise<void>;
  onMintWithVert: () => Promise<void>;
  isProcessing: boolean;
  isWaitingForTx: boolean;
  canMint: boolean;
  priceVirtual: string;
  priceVert: string;
  mintError?: string | null;
  mintedNFTImageUrl?: string | null;
  isOnBaseMainnet?: boolean;
  networkReady?: boolean;
}

interface TerminalLine {
  id: string;
  text: string;
  type: 'system' | 'option' | 'command' | 'success' | 'error' | 'processing' | 'waiting' | 'marketing';
  clickable?: boolean;
}

// Marketing messages for mint terminal during processing
const mintTerminalMessages = [
  "stake VERT to boost your mint odds",
  "view all minted Verticals on OpenSea", 
  "every mint grows the prize pool",
  "mint unlimited times—no caps, no cooldowns",
  "real-time rarity + prize payouts every mint",
  "prizes paid instantly to your wallet",
  "each Vertical is onchain and tradable",
  "own it. flex it. flip it. your call",
  "no two Verticals are ever the same"
];

export default function MintTerminal({ 
  onMintWithVirtual, 
  onMintWithVert, 
  isProcessing, 
  isWaitingForTx,
  canMint,
  priceVirtual,
  priceVert,
  mintError,
  mintedNFTImageUrl,
  isOnBaseMainnet = false,
  networkReady = false
}: MintTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 'boot', text: '> vertical mint protocol online ✅', type: 'success' },
    { id: 'select', text: '> select mint type:', type: 'system' },
    { id: 'opt1', text: `  [1] mint with virtual (${priceVirtual} virtual)`, type: 'option', clickable: true },
    { id: 'opt2', text: `  [2] mint with vert (${priceVert} vert)`, type: 'option', clickable: false },
    { id: 'vert-note', text: '      ↳ mint with vert coming soon! 🚀', type: 'system' }
  ]);
  const [showCursor, setShowCursor] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { isConnected, chain } = useAccount();

  // Accumulative typewriter effect for marketing messages during processing
  const { completedMessages, currentMessage, isComplete } = useAccumulativeTypewriter({
    messages: mintTerminalMessages,
    typeSpeed: 60,
    pauseBetweenMessages: 800,
    isActive: isProcessing
  });

  // Track terminal state for UI coordination
  useEffect(() => {
    debugLog.log('🎯 Terminal initializing with:', { isConnected, canMint, chain, isOnBaseMainnet, networkReady });
    
    if (!isConnected) {
      setLines([
        { id: 'noWallet', text: '> wallet not connected', type: 'error' },
        { id: 'connect', text: '> please connect your wallet to continue', type: 'system' }
      ]);
    } else if (isConnected && chain && chain.id !== 8453) {
      // Wrong network - show clear error with specific guidance
      setLines([
        { id: 'connected', text: '> wallet connected ✅', type: 'success' },
        { id: 'wrongNetwork', text: '> WRONG NETWORK DETECTED ❌', type: 'error' },
        { id: 'currentNetwork', text: `> current: ${chain.name || 'Unknown'} (${chain.id})`, type: 'error' },
        { id: 'requiredNetwork', text: '> required: Base Mainnet (8453)', type: 'system' },
        { id: 'switchNetwork', text: '> click "WRONG NETWORK" button in top-right corner', type: 'system' },
        { id: 'switchInstructions', text: '> then select "Base" from the network list', type: 'system' }
      ]);
    } else if (isConnected && !isOnBaseMainnet && !networkReady) {
      // Network detection issues - more specific guidance
      setLines([
        { id: 'connected', text: '> wallet connected ✅', type: 'success' },
        { id: 'networkIssue', text: '> network detection issue ⚠️', type: 'error' },
        { id: 'chainInfo', text: `> detected chain: ${chain?.name || 'Unknown'} (${chain?.id || 'Unknown'})`, type: 'system' },
        { id: 'refreshAdvice', text: '> try refreshing page or switching networks', type: 'system' },
        { id: 'switchNetworkAdvice', text: '> click "WRONG NETWORK" button → select "Base"', type: 'system' }
      ]);
    } else if (!canMint) {
      // Show a more helpful message for other initialization issues
      setLines([
        { id: 'connected', text: '> wallet connected ✅', type: 'success' },
        { id: 'loading', text: '> initializing mint protocol...', type: 'system' },
        { id: 'wait', text: '> please wait a moment', type: 'system' },
        { id: 'networkHint', text: '> if stuck, try refreshing or switching networks', type: 'system' }
      ]);
    } else {
      // Show working terminal
      setLines([
        { id: 'boot', text: '> vertical mint protocol online ✅', type: 'success' },
        { id: 'select', text: '> select mint type:', type: 'system' },
        { id: 'opt1', text: `  [1] mint with virtual (${priceVirtual} virtual)`, type: 'option', clickable: true },
        { id: 'opt2', text: `  [2] mint with vert (${priceVert} vert)`, type: 'option', clickable: false },
        { id: 'vert-note', text: '      ↳ mint with vert coming soon! 🚀', type: 'system' }
      ]);
    }
  }, [isConnected, canMint, chain, isOnBaseMainnet, networkReady, priceVirtual, priceVert]);

  // Log state changes for debugging
  useEffect(() => {
    debugLog.log('🔄 Terminal state change:', { isWaitingForTx, isProcessing });
  }, [isWaitingForTx, isProcessing]);

  // Handle mint option selection
  const handleOptionSelect = useCallback(async (option: 'virtual' | 'vert') => {
    if (!canMint || isProcessing || isWaitingForTx) return;
    
    setLines(prev => [...prev, 
      { id: 'minting-' + Date.now(), text: `> minting ${option} nft...`, type: 'command' }
    ]);
    
    try {
      if (option === 'virtual') {
        await onMintWithVirtual();
      } else {
        await onMintWithVert();
      }
      
      // Only show success if we get here without errors
      setLines(prev => [...prev, 
        { id: 'success-' + Date.now(), text: '> mint successful ✅', type: 'success' }
      ]);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setLines([
          { id: 'boot', text: '> vertical mint protocol online ✅', type: 'success' },
          { id: 'select', text: '> select mint type:', type: 'system' },
          { id: 'opt1', text: `  [1] mint with virtual (${priceVirtual} virtual)`, type: 'option', clickable: true },
          { id: 'opt2', text: `  [2] mint with vert (${priceVert} vert)`, type: 'option', clickable: false },
          { id: 'vert-note', text: '      ↳ mint with vert coming soon! 🚀', type: 'system' }
        ]);
      }, 2000);
      
    } catch (error: any) {
      debugLog.log('🚫 Mint error caught in terminal:', error);
      
      // Determine the type of error for better user feedback
      let errorMessage = '> mint failed ❌';
      
      if (error?.message?.includes('User rejected') || 
          error?.message?.includes('user rejected') ||
          error?.message?.includes('User denied') ||
          error?.message?.includes('rejected') ||
          error?.message?.includes('cancelled by user') ||
          error?.code === 4001 ||
          error?.code === 'ACTION_REJECTED') {
        errorMessage = '> transaction cancelled by user ❌';
      } else if (error?.message?.includes('approval cancelled')) {
        errorMessage = '> token approval cancelled by user ❌';
      } else if (error?.message?.includes('approval failed')) {
        errorMessage = '> token approval failed ❌';
      } else if (error?.message?.includes('insufficient funds')) {
        errorMessage = '> insufficient funds ❌';
      } else if (error?.message?.includes('INSUFFICIENT_FUNDS')) {
        errorMessage = '> insufficient funds for gas ❌';
      } else if (error?.message?.includes('Network connectivity')) {
        errorMessage = '> network issues detected ❌';
      }
      
      setLines(prev => [...prev, 
        { id: 'error-' + Date.now(), text: errorMessage, type: 'error' }
      ]);
      
      // Reset after 3 seconds (longer for error messages)
      setTimeout(() => {
        setLines([
          { id: 'boot', text: '> vertical mint protocol online ✅', type: 'success' },
          { id: 'select', text: '> select mint type:', type: 'system' },
          { id: 'opt1', text: `  [1] mint with virtual (${priceVirtual} virtual)`, type: 'option', clickable: true },
          { id: 'opt2', text: `  [2] mint with vert (${priceVert} vert)`, type: 'option', clickable: false },
          { id: 'vert-note', text: '      ↳ mint with vert coming soon! 🚀', type: 'system' }
        ]);
      }, 3000);
    }
  }, [canMint, isProcessing, isWaitingForTx, onMintWithVirtual, onMintWithVert, priceVirtual, priceVert]);

  // Handle keyboard input - disable VERT option (key 2)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!canMint || isProcessing || isWaitingForTx) return;
      
      if (event.key === '1') {
        handleOptionSelect('virtual');
      } else if (event.key === '2') {
        // VERT minting disabled - do nothing
        debugLog.log('⚠️ VERT minting coming soon!');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canMint, isProcessing, isWaitingForTx, handleOptionSelect]);

  // Cursor blinking effect - slower blink during typing for less distraction
  useEffect(() => {
    // Slower blink during processing to reduce visual noise during typing
    const blinkInterval = isProcessing ? 750 : 500;
    
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, blinkInterval);
    
    return () => clearInterval(interval);
  }, [isProcessing]);

  const getLineColor = (type: string, clickable?: boolean) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'option': 
        return clickable 
          ? 'text-white hover:text-gray-300' 
          : 'text-gray-500'; // Disabled options are grayed out
      case 'command': return 'text-yellow-400';
      case 'processing': return 'text-orange-400';
      case 'waiting': return 'text-gray-400';
      case 'marketing': return 'text-white';
      default: return 'text-green-300';
    }
  };

  const handleLineClick = (line: TerminalLine) => {
    if (!line.clickable || !canMint || isProcessing || isWaitingForTx) return;
    
    if (line.id === 'opt1') {
      handleOptionSelect('virtual');
    } else if (line.id === 'opt2') {
      // VERT option is disabled - do nothing
      debugLog.log('⚠️ VERT minting coming soon!');
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="bg-black border-2 border-green-500 rounded-lg p-6 font-mono text-sm min-h-[400px]">
        {/* Terminal Header */}
        <div className="flex items-center mb-4 pb-2 border-b border-green-500/30 relative">
          <div className="flex items-center gap-2 text-center">
            <div className="text-white font-mono text-xs font-black animate-pulse" style={{textShadow: '0 0 15px rgba(34, 197, 94, 1), 0 0 30px rgba(34, 197, 94, 0.5)'}}>
              START HERE
            </div>
            <div className="text-white font-mono text-sm animate-bounce" style={{textShadow: '0 0 15px rgba(34, 197, 94, 1), 0 0 30px rgba(34, 197, 94, 0.5)'}}>
              ↓
            </div>
          </div>
          <span className="text-green-400 text-xs absolute left-1/2 transform -translate-x-1/2">VERTICAL_MINT_v1.0.0</span>
        </div>

        {/* Terminal Content */}
        <div className="min-h-[200px] space-y-1">
          {isProcessing ? (
            // During processing, render messages without AnimatePresence to avoid glitches
            <>
              <div className="text-green-400">
                {'> vertical mint protocol online ✅'}
              </div>
              {completedMessages.map((message, index) => (
                <div key={`completed-${index}`} className="text-white">
                  {`> ${message}`}
                </div>
              ))}
              {currentMessage && !completedMessages.includes(currentMessage) && (
                <div key="current-typing" className="text-white">
                  {`> ${currentMessage}`}
                  {showCursor && !mintedNFTImageUrl && <span className="text-green-400">_</span>}
                </div>
              )}
            </>
          ) : (
            // Normal terminal state with animations
            <AnimatePresence mode="popLayout">
              {lines.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`${getLineColor(line.type, line.clickable)} ${
                    line.clickable && canMint && !isProcessing && !isWaitingForTx
                      ? 'cursor-pointer hover:bg-green-900/20 px-2 py-1 rounded transition-colors'
                      : ''
                  }`}
                  onClick={() => handleLineClick(line)}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Only show standalone cursor when not processing and no NFT is displayed */}
          {!isProcessing && !isWaitingForTx && !mintedNFTImageUrl && (
            <div className="text-green-300">
              {showCursor && <span className="text-green-400">_</span>}
            </div>
          )}
        </div>

        {/* Help text */}
        {canMint && !isProcessing && !isWaitingForTx && (
          <div className="mt-4 pt-2 border-t border-green-500/30">
            <div className="text-green-500/70 text-xs">
              💡 Use keyboard: [1] for VIRTUAL minting, or click option above
            </div>
            <div className="text-green-500/70 text-xs mt-1">
              First time minting? Approve token spending. Select Max for best experience.
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 