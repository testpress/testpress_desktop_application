import { app, BrowserWindow } from 'electron';
import electronUnhandled from 'electron-unhandled';

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
      devTools: false,
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
  const baseUA = mainWindow.webContents.getUserAgent();
  mainWindow.webContents.setUserAgent(`${baseUA} Testpress Desktop Application`);

  mainWindow.loadURL('https://lmsdemo.testpress.in/');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
