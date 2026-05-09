export {};

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      showSaveDialog: (options: any) => Promise<{ canceled: boolean; filePath?: string }>;
      showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
      showMessageBox: (options: any) => Promise<{ response: number }>;
      onMenuNewBooking: (callback: () => void) => void;
      onMenuNewJobCard: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
      platform: string;
    };
    garageAPI: {
      setAuthToken: (token: string) => void;
      getAuthToken: () => string | null;
      removeAuthToken: () => void;
      setUserInfo: (userInfo: any) => void;
      getUserInfo: () => any | null;
      removeUserInfo: () => void;
      setGarageInfo: (garageInfo: any) => void;
      getGarageInfo: () => any | null;
      clearAllData: () => void;
      isDesktop: boolean;
      platform: string;
      saveFile: (data: any, filename: string) => Promise<boolean>;
      openFile: () => Promise<string | null>;
      showNotification: (title: string, body: string) => void;
    };
  }
}
