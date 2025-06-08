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
const getImageSources = (ipfsUrl: string): string[] => {
  if (!ipfsUrl) return [];
  
  // Extract IPFS hash
  const hash = ipfsUrl.replace(/^ipfs:\/\//, '');
  
  return [
    // 1. Our own proxy (bypasses adblockers)
    `/api/image-proxy/${hash}`,
    
    // 2. Fast public gateways
    `https://dweb.link/ipfs/${hash}`,
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
    
    // 3. Fallback gateways
    `https://ipfs.io/ipfs/${hash}`,
    `https://ipfs.filebase.io/ipfs/${hash}`,
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
      setSourcesQueue(sources);
      setCurrentSrc(sources[0] || '');
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    const nextSourceIndex = retryCount + 1;
    
    if (nextSourceIndex < sourcesQueue.length) {
      // Try next source
      console.log(`🔄 Image failed, trying source ${nextSourceIndex + 1}/${sourcesQueue.length}`);
      setCurrentSrc(sourcesQueue[nextSourceIndex]);
      setRetryCount(nextSourceIndex);
    } else {
      // All sources failed
      setIsLoading(false);
      setHasError(true);
      const errorMsg = `Failed to load image from all ${sourcesQueue.length} sources`;
      console.error('❌ NFT Image Error:', errorMsg);
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
      <div className={`flex flex-col items-center justify-center bg-gray-900 border-2 border-red-500/50 p-4 ${className}`}>
        <div className="text-center text-red-400 mb-3">
          <div className="text-sm mb-1">⚠️ Image failed to load</div>
          <div className="text-xs opacity-75">Tried {sourcesQueue.length} sources</div>
        </div>
        <button
          onClick={handleRetry}
          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors mb-2"
        >
          Retry
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