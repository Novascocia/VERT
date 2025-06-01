"use client";

import { useEffect, useState } from "react";

export default function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [animatedText, setAnimatedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const fullText = "VERTICAL";

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

  // Animated typing effect for VERTICAL text
  useEffect(() => {
    if (!isMobile) return;
    
    setIsTyping(true);
    let index = 0;
    
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setAnimatedText(fullText.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [isMobile]);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Show for all mobile devices and small screens
  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-98 text-white text-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-black border-2 border-green-500 rounded-lg p-6 font-mono text-sm relative shadow-2xl shadow-green-500/20">
          {/* Glow effect overlay */}
          <div className="absolute inset-0 rounded-lg bg-green-500/5 border border-green-500/30 pointer-events-none"></div>
          
          {/* Terminal Header */}
          <div className="flex items-center justify-center mb-6 pb-3 border-b border-green-500/40 relative">
            <span className="text-green-400 text-xs">MOBILE_WARNING_v1.0.0</span>
          </div>

          {/* Animated VERTICAL Title */}
          <div className="mb-6 text-center">
            <div className="font-mono text-4xl font-bold relative">
              <span 
                className="text-green-400"
                style={{
                  textShadow: '0 0 15px rgba(34, 197, 94, 1), 0 0 30px rgba(34, 197, 94, 0.5)'
                }}
              >
                {animatedText}
              </span>
              {(isTyping || animatedText.length < fullText.length) && showCursor && (
                <span className="text-green-400 animate-pulse">_</span>
              )}
            </div>
            
            {/* Terminal divider */}
            <div className="w-full h-[2px] bg-green-500/40 mx-auto mt-4 mb-6"></div>
          </div>
          
          {/* Terminal-style messages */}
          <div className="space-y-3 text-left mb-6">
            <div className="text-green-400">
              <span className="text-green-400">&gt;</span> mobile experience detected
            </div>
            <div className="text-yellow-400">
              <span className="text-green-400">&gt;</span> optimization protocol loading...
            </div>
            <div className="text-orange-400">
              <span className="text-green-400">&gt;</span> mobile ui currently being enhanced
            </div>
          </div>

          {/* Main message box */}
          <div className="bg-black border border-green-500/50 p-4 rounded mb-6">
            <div className="text-green-300 text-center">
              <div className="text-sm mb-2 text-green-400">RECOMMENDATION:</div>
              <div className="font-bold">
                Visit <span className="text-green-400">vertnft.com</span> on desktop
              </div>
              <div className="text-xs mt-1 text-gray-400">
                for optimal minting experience
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Litepaper button - primary action */}
            <a
              href="https://novascodia.gitbook.io/litepaper/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-4 rounded transition-colors duration-200 font-mono text-sm"
              style={{
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
              }}
            >
              📖 READ PROJECT LITEPAPER
            </a>
            
            {/* Continue anyway button - secondary */}
            <button
              onClick={() => setIsMobile(false)}
              className="block w-full bg-transparent border border-green-500/50 hover:border-green-500 text-green-400 hover:text-green-300 font-mono py-2 px-4 rounded transition-colors duration-200 text-xs"
            >
              continue anyway (not recommended)
            </button>
          </div>

          {/* Bottom status */}
          <div className="mt-6 pt-3 border-t border-green-500/30">
            <div className="text-green-500/70 text-xs text-center">
              🖥️ Best viewed on computers & tablets
            </div>
            
            {/* Debug info - remove in production */}
            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-800/50 rounded text-center">
              Screen: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 