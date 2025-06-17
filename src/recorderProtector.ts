import { app, dialog } from 'electron';
import psList from 'ps-list';

export function registerScreenRecorderBlocker(): void {
  if (process.platform !== 'darwin') return;

  const forbiddenApps = [
    'screencapture', 'obs', 'obs-ffmpeg-mux', 'quicktime', 'quicktimeplayerd',
    'camtasia', 'snagit', 'screenflow', 'kap', 'screenflick', 'loom', 'recordit',
    'cleanshot', 'monosnap', 'vlc', 'gyazo',
  ].map(app => app.toLowerCase());

  const intervalId = setInterval(async () => {
    try {
      const processes = await psList();
      const found = processes.find(p =>
        forbiddenApps.some(app => p.name?.toLowerCase().includes(app))
      );
      if (found) {
        console.warn(`Forbidden screen recording app detected: ${found.name}`);
        await dialog.showMessageBox({
          type: 'warning',
          title: 'Security Alert',
          message: `Detected screen recording application: ${found.name}. Closing the app.`,
        });
        app.exit(1);
        process.exit(1);
      }
    } catch (err) {
      console.error('Recorder scan failed:', err);
    }
  }, 10_000);

  app.once('will-quit', () => clearInterval(intervalId));
}
