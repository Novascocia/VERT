const isDev = process.env.NODE_ENV === 'development';

export const debugLog = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // ALWAYS show errors in both development and production
    // This ensures critical user-facing errors are never hidden
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  }
};

// For critical user-facing errors that should ALWAYS show in production
// Use this for errors that users need to see to troubleshoot issues
export const userLog = {
  error: (...args: any[]) => {
    console.error('🚨 CRITICAL ERROR:', ...args);
  },
  
  warn: (...args: any[]) => {
    console.warn('⚠️ WARNING:', ...args);
  }
};

// For network/connection errors that should always be visible
export const networkLog = {
  error: (...args: any[]) => {
    console.error('🌐 NETWORK ERROR:', ...args);
  },
  
  warn: (...args: any[]) => {
    console.warn('🌐 NETWORK WARNING:', ...args);
  }
}; 