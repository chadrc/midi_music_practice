import { app, contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('MMPGlobal', {
    appVersion: () => ipcRenderer.invoke('appVersion'),
});