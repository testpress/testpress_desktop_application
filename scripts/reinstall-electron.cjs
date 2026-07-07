const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let electronDir;
try {
  electronDir = path.dirname(require.resolve('electron/package.json'));
} catch (e) {}

if (electronDir && fs.existsSync(electronDir)) {
  const distDir = path.join(electronDir, 'dist');
  fs.rmSync(distDir, { recursive: true, force: true });

  const res = spawnSync(process.execPath, ['install.js'], {
    cwd: electronDir,
    stdio: 'inherit',
  });

  if (res.error) {
    console.error(res.error);
    process.exit(1);
  }

  if (res.status !== 0) {
    process.exit(res.status || 1);
  }
}
