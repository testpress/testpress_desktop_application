import { app } from 'electron';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const DEVICE_UID_FILENAME = 'device_uid.txt';

function getDeviceUidFilePath(): string {
  const userDataPath = app.getPath('userData');
  return join(userDataPath, DEVICE_UID_FILENAME);
}

function generateAndSaveDeviceUid(): string {
  const deviceUid = randomUUID();
  const filePath = getDeviceUidFilePath();
  
  try {
    writeFileSync(filePath, deviceUid, 'utf8');
    return deviceUid;
  } catch (error) {
    console.error('[DeviceManager] Failed to save device UID:', error);
    throw error;
  }
}

function loadDeviceUid(): string | null {
  const filePath = getDeviceUidFilePath();
  
  if (!existsSync(filePath)) {
    return null;
  }
  
  try {
    const deviceUid = readFileSync(filePath, 'utf8').trim();
    return deviceUid;
  } catch (error) {
    console.error('[DeviceManager] Failed to load device UID:', error);
    return null;
  }
}

let cachedDeviceUid: string | null = null;

export function getDeviceUid(): string {
  if (cachedDeviceUid) {
    return cachedDeviceUid;
  }
  
  cachedDeviceUid = loadDeviceUid();
  
  if (!cachedDeviceUid) {
    cachedDeviceUid = generateAndSaveDeviceUid();
  }
  
  return cachedDeviceUid;
}

export function getDeviceType(): string {
  return 'desktop_app';
}
