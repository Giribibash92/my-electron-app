const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    saveNote: (data) => ipcRenderer.invoke('save-note', data),
    loadNote: () => ipcRenderer.invoke('load-note')
});