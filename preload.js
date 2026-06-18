const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveNote: (text) => ipcRenderer.invoke('save-note', text),

    loadNote: () => ipcRenderer.invoke('load-note'),

    saveAs: (text) => ipcRenderer.invoke('save-as', text),

    newNote: () => ipcRenderer.invoke('new-note'),

    openFile: () => ipcRenderer.invoke('open-file'),

    smartSave: (text, filePath) =>
        ipcRenderer.invoke('smart-save', text, filePath),

    onMenuAction: (channel, callback) =>
        ipcRenderer.on(channel, callback),

    getNotes: () =>
        ipcRenderer.invoke('get-notes'),

    saveNoteJson: (note) =>
        ipcRenderer.invoke('save-note-json', note),

    deleteNote: (id) =>
        ipcRenderer.invoke('delete-note', id),

    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    exportPdf: (note) => ipcRenderer.invoke('export-pdf', note), //PDF feature

    getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),

    togglePin:(id) => ipcRenderer.invoke('toggle-pin', id)  //New
});