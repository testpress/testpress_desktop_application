import { app, BrowserWindow } from 'electron';
import electronUnhandled from 'electron-unhandled';
import config from '../app-config.json' with { type: 'json' };

electronUnhandled({
  showDialog: true,
  logger: (err: Error) => {
    console.error('Unhandled error:', err);
  },
});

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      sandbox: false,
      contextIsolation: true,
    },
  });
  mainWindow.setContentProtection(true);
  mainWindow.webContents.on('did-fail-load', async () => {
    const isOnline = await mainWindow.webContents.executeJavaScript('navigator.onLine');
    if (!isOnline) {
      mainWindow.loadFile('./public/offline.html');
    } else {
      mainWindow.loadFile('./public/error.html');
    }
  }); 
  const userAgentAddition = process.platform === 'darwin'
    ? `AppStoreID/${config.macAppStoreId}`
    : process.platform === 'win32'
    ? `MSStoreID/${config.windowsStoreId}`
    : '';
  const userAgent = `${mainWindow.webContents.getUserAgent()} Desktop ${userAgentAddition}`;
  mainWindow.webContents.setUserAgent(userAgent);

  mainWindow.loadURL('https://lmsdemo.testpress.in/');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
