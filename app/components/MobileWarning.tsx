"use client";

import { useEffect, useState } from "react";

export default function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // More aggressive mobile detection
      const screenWidth = window.innerWidth;
      const userAgent = navigator.userAgent;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = screenWidth <= 900; // Increased from 768px
      
      setIsMobile(isMobileUA || isSmallScreen);
      
      // Debug logging (remove in production)
      console.log('Mobile Detection:', {
        screenWidth,
        isMobileUA,
        isSmallScreen,
        finalResult: isMobileUA || isSmallScreen
      });
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show for all mobile devices and small screens
  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-98 text-white text-center px-6">
      <div className="card-cel bg-vert-gray max-w-md">
        <div className="mb-6">
          <h1 className="heading-comic text-3xl text-vert-green mb-4">
            VERT NFT
          </h1>
          <div className="w-16 h-1 bg-vert-green mx-auto mb-6"></div>
        </div>
        
        <h2 className="font-comic text-2xl mb-4 text-white">
          📱 Mobile Coming Soon!
        </h2>
        
        <p className="text-lg mb-6 leading-relaxed">
          Our mobile experience is currently being optimized.
        </p>
        
        <div className="bg-black border-2 border-vert-green p-4 rounded-lg mb-6">
          <p className="font-comic text-vert-green">
            Visit <strong>vertnft.com</strong><br />
            on desktop for the full experience
          </p>
        </div>
        
        <div className="text-sm text-gray-400">
          🖥️ Best viewed on computers & tablets
        </div>
        
        {/* Debug info - remove in production */}
        <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-800 rounded">
          Screen: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px
        </div>
      </div>
    </div>
  );
} 