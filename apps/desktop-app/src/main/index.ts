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
      webSecurity: false,
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

// API Handlers - Connected to backend
import https from 'https';

ipcMain.handle('api-get', async (_event, url: string, token?: string) => {
  try {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'garage-backend.onrender.com',
        port: 443,
        path: url,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ success: true, data: JSON.parse(data) });
          } catch (e) {
            resolve({ success: true, data: data });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('api-post', async (_event, url: string, data: any, token?: string) => {
  try {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const options = {
        hostname: 'garage-backend.onrender.com',
        port: 443,
        path: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            resolve({ success: true, data: JSON.parse(responseData) });
          } catch (e) {
            resolve({ success: true, data: responseData });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('api-put', async (_event, url: string, data: any, token?: string) => {
  try {
    return new Promise((resolve, reject) => {
      const putData = JSON.stringify(data);
      const options = {
        hostname: 'garage-backend.onrender.com',
        port: 443,
        path: url,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(putData),
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            resolve({ success: true, data: JSON.parse(responseData) });
          } catch (e) {
            resolve({ success: true, data: responseData });
          }
        });
      });

      req.on('error', reject);
      req.write(putData);
      req.end();
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('api-delete', async (_event, url: string, token?: string) => {
  try {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'garage-backend.onrender.com',
        port: 443,
        path: url,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ success: true, data: JSON.parse(data) });
          } catch (e) {
            resolve({ success: true, data: data });
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('login', async (_event, credentials: { email: string; password: string }) => {
  try {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(credentials);
      const options = {
        hostname: 'garage-backend.onrender.com',
        port: 443,
        path: '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            resolve({ success: true, data: JSON.parse(responseData) });
          } catch (e) {
            resolve({ success: true, data: responseData });
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('logout', async () => {
  return { success: true };
});
