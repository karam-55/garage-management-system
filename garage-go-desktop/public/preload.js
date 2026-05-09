const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Menu events
  onMenuNewBooking: (callback) => ipcRenderer.on('menu-new-booking', callback),
  onMenuNewJobCard: (callback) => ipcRenderer.on('menu-new-job-card', callback),
  
  // Platform detection
  platform: process.platform,
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});

// Expose a custom API for the renderer process
contextBridge.exposeInMainWorld('garageAPI', {
  // Store authentication token
  setAuthToken: (token) => {
    localStorage.setItem('garage_token', token);
  },
  
  getAuthToken: () => {
    return localStorage.getItem('garage_token');
  },
  
  removeAuthToken: () => {
    localStorage.removeItem('garage_token');
  },
  
  // Store user info
  setUserInfo: (userInfo) => {
    localStorage.setItem('garage_user', JSON.stringify(userInfo));
  },
  
  getUserInfo: () => {
    const user = localStorage.getItem('garage_user');
    return user ? JSON.parse(user) : null;
  },
  
  removeUserInfo: () => {
    localStorage.removeItem('garage_user');
  },
  
  // Store garage info
  setGarageInfo: (garageInfo) => {
    localStorage.setItem('garage_info', JSON.stringify(garageInfo));
  },
  
  getGarageInfo: () => {
    const garage = localStorage.getItem('garage_info');
    return garage ? JSON.parse(garage) : null;
  },
  
  // Clear all data
  clearAllData: () => {
    localStorage.clear();
  },
  
  // Platform specific features
  isDesktop: true,
  platform: 'desktop',
  
  // File operations
  saveFile: async (data, filename) => {
    const result = await window.electronAPI.showSaveDialog({
      defaultPath: filename,
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled) {
      // Here you would implement actual file saving
      console.log('Saving file to:', result.filePath);
      return true;
    }
    return false;
  },
  
  openFile: async () => {
    const result = await window.electronAPI.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled) {
      return result.filePaths[0];
    }
    return null;
  },
  
  // Notifications
  showNotification: (title, body) => {
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  },
  
  // App controls
  minimizeApp: () => {
    // This would be implemented with additional IPC calls
    console.log('Minimize app');
  },
  
  closeApp: () => {
    // This would be implemented with additional IPC calls
    console.log('Close app');
  }
});

// Set up notification permission
if (window.Notification) {
  Notification.requestPermission();
}
