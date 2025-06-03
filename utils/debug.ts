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
    // Always show errors, even in production
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  }
};

// For critical user-facing errors that should always show
export const userLog = {
  error: (...args: any[]) => {
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    console.warn(...args);
  }
}; 