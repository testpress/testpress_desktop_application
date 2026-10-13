const { contextBridge, ipcRenderer } = require('electron');

interface DeviceBindingPopupOptions {
  message: string;
  title?: string;
}

contextBridge.exposeInMainWorld('TestpressDesktop', {
  showDeviceBindingPopup: (options: DeviceBindingPopupOptions) => {
    return ipcRenderer.invoke('show-device-binding-popup', options);
  }
});
