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

const windowOptions = {
  width: 1200,
  height: 800,
  webPreferences: {
    nodeIntegration: false,
    sandbox: true,
    contextIsolation: true,
    webSecurity: true,
    plugins: true,
    devTools: false,
  },
};

function setCustomUserAgent(webContents: Electron.WebContents) {
  const baseUA = webContents.getUserAgent();
  webContents.setUserAgent(`${baseUA} Testpress Desktop Application`);
}

const GOOGLE_LOGIN_URL_PREFIX = 'https://accounts.google.com/';
function createWindow() {
  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.setContentProtection(true);

  mainWindow.webContents.on('did-fail-load', async () => {
    const isOnline = await mainWindow.webContents.executeJavaScript('navigator.onLine');
    if (!isOnline) {
      mainWindow.loadFile('./public/offline.html');
    } else {
      mainWindow.loadFile('./public/error.html');
    }
  });

  setCustomUserAgent(mainWindow.webContents);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(GOOGLE_LOGIN_URL_PREFIX)) {
      return { action: 'allow' };
    }
    const childWindow = new BrowserWindow({
      ...windowOptions,
      parent: mainWindow,
      modal: false,
      show: true,
    });
    childWindow.setContentProtection(true);
    setCustomUserAgent(childWindow.webContents);
    disableCopyAndSelection(childWindow);
    childWindow.loadURL(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(appConfig.homepageURL);
}

function disableCopyAndSelection(childWindow: BrowserWindow) {
  childWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && ['a', 'c', 'x'].includes(input.key.toLowerCase())) {
      event.preventDefault();
    }
  });

  childWindow.webContents.on('did-finish-load', () => {
    childWindow.webContents.insertCSS(`
      * {
        -webkit-user-select: none !important;
        user-select: none !important;
      }
    `);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
