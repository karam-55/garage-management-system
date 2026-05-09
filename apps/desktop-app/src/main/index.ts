import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// API Handlers - These will be connected to the backend
ipcMain.handle('api-get', async (_event, url: string) => {
  // Implement API GET call to backend
  return { success: true, data: [] };
});

ipcMain.handle('api-post', async (_event, url: string, data: any) => {
  // Implement API POST call to backend
  return { success: true, data: {} };
});

ipcMain.handle('api-put', async (_event, url: string, data: any) => {
  // Implement API PUT call to backend
  return { success: true, data: {} };
});

ipcMain.handle('api-delete', async (_event, url: string) => {
  // Implement API DELETE call to backend
  return { success: true };
});

ipcMain.handle('login', async (_event, credentials: { email: string; password: string }) => {
  // Implement login logic
  return { success: true, token: 'mock-token' };
});

ipcMain.handle('logout', async () => {
  // Implement logout logic
  return { success: true };
});
