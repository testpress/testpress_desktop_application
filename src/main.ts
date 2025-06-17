import { app } from 'electron';
import electronUnhandled from 'electron-unhandled';
import { createMainWindow } from './createMainWindow.js';
import { registerScreenRecorderBlocker } from './recorderProtector.js';

electronUnhandled({
  showDialog: true,
  logger: (err: Error) => console.error('Unhandled error:', err),
});

app.commandLine.appendSwitch('enable-widevine-cdm');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

app.whenReady().then(() => {
  registerScreenRecorderBlocker();
  createMainWindow();
});

app.on('web-contents-created', (_event, contents) => {
  contents.on('did-create-window', (childWindow) => {
    childWindow.setContentProtection(true);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
