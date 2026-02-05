import { app, BrowserWindow } from 'electron';
import electronUnhandled from 'electron-unhandled';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getDeviceUid, getDeviceType } from './deviceManager.js';

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

function setupDeviceHeaders(webContents: Electron.WebContents) {
  const deviceUid = getDeviceUid();
  const deviceType = getDeviceType();
  const allowedOrigin = new URL(appConfig.homepageURL).origin;

  webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    try {
      const requestUrl = new URL(details.url);

      if (requestUrl.origin === allowedOrigin) {
        details.requestHeaders['X-Device-UID'] = deviceUid;
        details.requestHeaders['X-Device-Type'] = deviceType;
      }
    }
    catch (error) {
      console.error(`[HeaderManager] Failed to parse request URL: ${details.url}`, error);
    }

    callback({ requestHeaders: details.requestHeaders });
  });
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
  setupDeviceHeaders(mainWindow.webContents);

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
    setupDeviceHeaders(childWindow.webContents);
    childWindow.loadURL(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(appConfig.homepageURL);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
