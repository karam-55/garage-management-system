// Type fixes for the integration system
export interface ExtendedAuthRequest {
  body: any;
  query: any;
  params: any;
  user?: {
    id: string;
    role: string;
  };
}

// Console fallback
export const safeConsole = {
  error: (message: string, error?: any) => {
    // Fallback for environments without console
    try {
      if (typeof console !== 'undefined') {
        console.error(message, error);
      }
    } catch (e) {
      // Silent fail
    }
  },
  log: (message: string, data?: any) => {
    try {
      if (typeof console !== 'undefined') {
        console.log(message, data);
      }
    } catch (e) {
      // Silent fail
    }
  },
  warn: (message: string, data?: any) => {
    try {
      if (typeof console !== 'undefined') {
        console.warn(message, data);
      }
    } catch (e) {
      // Silent fail
    }
  }
};
