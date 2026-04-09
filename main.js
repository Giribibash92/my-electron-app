const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let filePath;

function createWindow() {
    const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js')
    }
    });

    win.loadFile('index.html');

    filePath = path.join(app.getPath('documents'), 'note.txt');
}

app.whenReady().then(createWindow);

// Save note
ipcMain.handle('save-note', async (event, data) => {
    fs.writeFileSync(filePath, data);
    return "Saved";
});

// Load note
ipcMain.handle('load-note', async () => {
    if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
    }
    return "";
});
