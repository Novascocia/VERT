/**
 * Wallet utility functions to prevent unwanted auto-connections and modal popups
 */

// Extend Window interface to include potential WalletConnect object
declare global {
  interface Window {
    WalletConnect?: any;
  }
}

export const clearWalletConnectSessions = () => {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('🧹 Aggressively clearing ALL WalletConnect data...');
    
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);
    
    // Find ALL WalletConnect related keys - be more aggressive
    const wcKeys = allKeys.filter(key => 
      key.includes('wc@') || 
      key.includes('walletconnect') ||
      key.includes('WalletConnect') ||
      key.includes('connector') ||
      key.includes('rainbowkit') ||
      key.includes('reown') ||
      key.includes('bridge') ||
      key.includes('session') ||
      key.includes('pairing')
    );
    
    let removedCount = 0;
    
    wcKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        removedCount++;
        console.log(`🗑️ Removed: ${key}`);
      } catch (e) {
        // Ignore individual key errors
      }
    });
    
    // Clear ALL wagmi-related cache
    const wagmiKeys = [
      'wagmi.wallet', 
      'wagmi.connected', 
      'wagmi.recentConnectorId', 
      'wagmi.store',
      'wagmi.cache',
      'wagmi.injected.disconnected',
      'wagmi.injected.shimDisconnect'
    ];
    wagmiKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
        removedCount++;
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Clear session storage too
    try {
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.filter(key => 
        key.includes('wc@') || 
        key.includes('walletconnect') ||
        key.includes('WalletConnect')
      ).forEach(key => {
        sessionStorage.removeItem(key);
        removedCount++;
      });
    } catch (e) {
      // Ignore session storage errors
    }
    
    console.log(`✅ Aggressively cleared ${removedCount} wallet-related items`);
    
  } catch (error) {
    console.warn('⚠️ Could not clear WalletConnect sessions:', error);
  }
};

export const preventWalletAutoPopup = () => {
  if (typeof window === 'undefined') return;
  
  // First, clear all existing sessions
  clearWalletConnectSessions();
  
  // Intercept and prevent WalletConnect Core initialization
  try {
    // Override any existing WalletConnect objects
    if (window.WalletConnect) {
      console.log('🛡️ Disabling existing WalletConnect object...');
      window.WalletConnect = undefined;
    }
    
    // Block common WalletConnect initialization patterns
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
      // Block WalletConnect bridge events
      if (type && typeof type === 'string' && (
        type.includes('walletconnect') || 
        type.includes('wc_') ||
        type.includes('bridge')
      )) {
        console.log('🚫 Blocked WalletConnect event listener:', type);
        return;
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Restore after a delay
    setTimeout(() => {
      window.addEventListener = originalAddEventListener;
    }, 10000); // 10 seconds should be enough for initial load
    
  } catch (e) {
    console.warn('Could not intercept WalletConnect initialization:', e);
  }
  
  // Suppress console warnings more aggressively
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  const suppressedMessages = [
    'WalletConnect Core is already initialized',
    'already initialized',
    'WalletConnect',
    'reown',
    'Init() was called',
    'unexpected behavior'
  ];
  
  console.error = (...args) => {
    const message = args.join(' ');
    if (suppressedMessages.some(msg => message.includes(msg))) {
      return; // Suppress
    }
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args.join(' ');
    if (suppressedMessages.some(msg => message.includes(msg))) {
      return; // Suppress
    }
    originalWarn.apply(console, args);
  };
  
  console.log = (...args) => {
    const message = args.join(' ');
    if (suppressedMessages.some(msg => message.includes(msg))) {
      return; // Suppress
    }
    originalLog.apply(console, args);
  };
  
  // Restore original console methods after a longer delay
  setTimeout(() => {
    console.error = originalError;
    console.warn = originalWarn;
    console.log = originalLog;
  }, 15000); // 15 seconds
};

export const isWalletAutoConnecting = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check for any signs of auto-connection
    const allKeys = Object.keys(localStorage);
    return allKeys.some(key => {
      const value = localStorage.getItem(key);
      return value && (
        value.includes('"connected":true') ||
        value.includes('"autoConnected":true') ||
        value.includes('"isConnected":true')
      );
    });
  } catch (e) {
    return false;
  }
}; 