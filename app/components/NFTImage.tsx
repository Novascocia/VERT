'use client';

import { useState, useEffect } from 'react';

interface NFTImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
  showLoading?: boolean;
  placeholderSrc?: string;
}

// Multiple IPFS gateways with proxy fallback
const getImageSources = (imageUrl: string): string[] => {
  if (!imageUrl) return [];
  
  // If it's already a proxy URL (confirmed working), use it directly
  if (imageUrl.startsWith('/api/image-proxy/')) {
    return [imageUrl];
  }
  
  // If it's a direct HTTP URL (confirmed working), use it directly  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return [imageUrl];
  }
  
  // Extract IPFS hash for IPFS URLs
  const hash = imageUrl.replace(/^ipfs:\/\//, '');
  
  return [
    // 1. Most reliable gateway first (consistently works in practice)
    `https://nftstorage.link/ipfs/${hash}`, // Most reliable based on actual usage - always works
    
    // 2. Other fast public gateways  
    `https://gateway.pinata.cloud/ipfs/${hash}`, // Fast and reliable alternative
    `https://dweb.link/ipfs/${hash}`, // Good backup - 1422ms
    `https://ipfs.io/ipfs/${hash}`, // Moved to backup position - often fails recently
    
    // 3. Local proxy last (as fallback)
    `/api/image-proxy/${hash}`,
  ];
};

export default function NFTImage({ 
  src, 
  alt, 
  className = '', 
  onLoad, 
  onError,
  showLoading = true,
  placeholderSrc = '/placeholder-nft.svg'
}: NFTImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [sourcesQueue, setSourcesQueue] = useState<string[]>([]);

  // Initialize sources when src changes
  useEffect(() => {
    if (src) {
      const sources = getImageSources(src);
      console.log(`🎨 NFTImage: Loading from IPFS with ${sources.length} sources...`);
      setSourcesQueue(sources);
      setCurrentSrc(sources[0] || '');
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src]);

  // Add timeout for each source attempt
  useEffect(() => {
    if (currentSrc && isLoading) {
      const timeout = setTimeout(() => {
        console.log(`⏰ Timeout loading image from: ${currentSrc}`);
        handleImageError(); // Trigger fallback to next source
      }, 10000); // 10 second timeout per source (original working timeout)

      return () => clearTimeout(timeout);
    }
  }, [currentSrc, isLoading]);

  const handleImageLoad = () => {
    const successUrl = sourcesQueue[retryCount];
    console.log(`✅ Image loaded successfully from source ${retryCount + 1}/${sourcesQueue.length}: ${successUrl}`);
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    // Regenerate sources from src if queue is empty (handles race conditions)
    const sources = sourcesQueue.length > 0 ? sourcesQueue : getImageSources(src);
    const currentUrl = currentSrc || sources[retryCount];
    const nextSourceIndex = retryCount + 1;
    
    console.log(`❌ Image load failed for: ${currentUrl || 'undefined'}`);
    console.log(`🔍 Debug: retryCount=${retryCount}, sourcesQueue.length=${sourcesQueue.length}, sources.length=${sources.length}, currentSrc=${currentSrc}`);
    
    if (sources.length === 0) {
      console.error('❌ No sources available');
      setIsLoading(false);
      setHasError(true);
      onError?.('No image sources available');
      return;
    }
    
    // Update sourcesQueue if it was empty
    if (sourcesQueue.length === 0 && sources.length > 0) {
      console.log('🔧 Regenerating sources queue');
      setSourcesQueue(sources);
    }
    
    if (nextSourceIndex < sources.length) {
      // Try next source
      console.log(`🔄 Trying source ${nextSourceIndex + 1}/${sources.length}: ${sources[nextSourceIndex]}`);
      setCurrentSrc(sources[nextSourceIndex]);
      setRetryCount(nextSourceIndex);
    } else {
      // All sources failed
      setIsLoading(false);
      setHasError(true);
      const errorMsg = `Failed to load image from all ${sources.length} sources`;
      console.error('❌ NFT Image Error:', errorMsg);
      console.error('❌ Failed sources:', sources);
      onError?.(errorMsg);
    }
  };

  const handleRetry = () => {
    // Reset and try all sources again
    setRetryCount(0);
    setCurrentSrc(sourcesQueue[0] || '');
    setIsLoading(true);
    setHasError(false);
  };

  // Show loading state
  if (isLoading && showLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 border-2 border-green-500/50 ${className}`}>
        <div className="text-center text-green-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
          <div className="text-xs">Loading NFT...</div>
          <div className="text-xs opacity-75">Source {retryCount + 1}/{sourcesQueue.length}</div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-900 border-2 border-orange-500/50 p-4 ${className}`}>
        <div className="text-center text-orange-400 mb-3">
          <div className="text-sm mb-1">🎨 NFT Still Generating...</div>
          <div className="text-xs opacity-75">New IPFS content can take up to 60s to propagate</div>
          <div className="text-xs opacity-75 mt-1">Tried {sourcesQueue.length} sources</div>
        </div>
        <button
          onClick={handleRetry}
          className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-4 py-2 rounded transition-colors mb-2 font-semibold"
        >
          🔄 Try Again
        </button>
        {placeholderSrc && (
          <img
            src={placeholderSrc}
            alt="Placeholder"
            className="w-16 h-16 opacity-50"
            onError={() => console.log('Placeholder image also failed')}
          />
        )}
      </div>
    );
  }

  // Show the actual image
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={{ imageRendering: 'auto' }}
    />
  );
} 