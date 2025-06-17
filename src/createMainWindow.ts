import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow;

export function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      sandbox: false,
      contextIsolation: true,
      webSecurity: true,
      plugins: true,
      devTools: false,
    },
  });

  mainWindow.setContentProtection(true);

  mainWindow.webContents.on('did-fail-load', async () => {
    const isOnline = await mainWindow.webContents.executeJavaScript('navigator.onLine');
    const file = isOnline ? './public/error.html' : './public/offline.html';
    mainWindow.loadFile(file);
  });

  const baseUA = mainWindow.webContents.getUserAgent();
  mainWindow.webContents.setUserAgent(`${baseUA} Testpress Desktop Application`);

  mainWindow.loadURL('https://lmsdemo.testpress.in/');
}
