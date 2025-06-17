import { app, BrowserWindow } from 'electron';
import electronUnhandled from 'electron-unhandled';
import find from 'find-process';

electronUnhandled({
  showDialog: true,
  logger: (err: Error) => {
    console.error('Unhandled error:', err);
  },
});
app.commandLine.appendSwitch('enable-widevine-cdm');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
let mainWindow: BrowserWindow;

async function registerCheckerForRecordersOnMacOS(): Promise<void> {
  if (process.platform === 'darwin') {
    const forbiddenApps = [
      'screencapture',
      'obs',
      'obs-ffmpeg-mux',
      'quicktime',
      'quicktimeplayerd',
      'camtasia',
      'snagit',
      'screenflow',
      'kap',
      'screenflick',
      'loom',
      'recordit',
      'cleanshot',
      'monosnap',
      'vlc',
      'gyazo',
    ];
    setInterval(async () => {
      for (const appName of forbiddenApps) {
        try {
          const found = await find('name', appName);
          if (found.length > 0) {
            console.warn(`Forbidden screen recording app detected: ${appName}`);
            app.exit(1);
            process.exit(1);
          }
        } catch (error) {
          console.error(`Error while checking for process "${appName}":`, error);
        }
      }
    }, 10000);
  }
}

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

  mainWindow.loadURL('https://lmsdemo.testpress.in/');
}

app.whenReady().then(() => {
  registerCheckerForRecordersOnMacOS();
  createWindow();
});

app.on('web-contents-created', (event, contents) => {
  contents.on('did-create-window', (childWindow) => {
    childWindow.setContentProtection(true);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
