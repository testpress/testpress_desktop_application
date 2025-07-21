import { app, BrowserWindow } from 'electron';
import electronUnhandled from 'electron-unhandled';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appConfigPath = join(__dirname, '..', 'app-config.json');
const appConfig = JSON.parse(readFileSync(appConfigPath, 'utf8'));

electronUnhandled({
  showDialog: true,
  logger: (err: Error) => {
    console.error('Unhandled error:', err);
  },
});
app.commandLine.appendSwitch('enable-widevine-cdm');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
let mainWindow: BrowserWindow;

function createWindow() {
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
    if (!isOnline) {
      mainWindow.loadFile('./public/offline.html');
    } else {
      mainWindow.loadFile('./public/error.html');
    }
  }); 
  const baseUA = mainWindow.webContents.getUserAgent();
  mainWindow.webContents.setUserAgent(`${baseUA} Testpress Desktop Application`);

  mainWindow.webContents.setWindowOpenHandler(({ url, features }) => {
    const childWindow = new BrowserWindow({
      parent: mainWindow,
      modal: false,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        sandbox: false,
        contextIsolation: true,
        webSecurity: true,
        plugins: true,
        devTools: false,
      },
    });
    childWindow.setContentProtection(true);
    const childBaseUA = childWindow.webContents.getUserAgent();
    childWindow.webContents.setUserAgent(`${childBaseUA} Testpress Desktop Application`);
    childWindow.loadURL(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(appConfig.homepageURL);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
