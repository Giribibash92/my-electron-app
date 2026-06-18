// This is the MAIN PROCESS - the "brain" that controls the whole application
const { app, BrowserWindow, ipcMain,dialog,Tray,Menu} = require('electron');

app.disableHardwareAcceleration();

const path = require('node:path');
// Helps us build correct file paths no matter which operating system (Windows/Mac/Linux)
const PDFDocument = require('pdfkit'); //pDF feature

const fs = require('node:fs');
// Built-in Node.js module for reading and writing files on the real disk
const notesFilePath = path.join(app.getPath('userData'), 'notes.json');
const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

let recentFiles = [];
let win;

// This function creates and configures our application window
function createWindow() {
     win = new BrowserWindow({
width: 900, // window starts at 900 pixels wide
height: 600, // 600 pixels tall
webPreferences: {
preload: path.join(__dirname, 'preload.js'),
// preload.js runs before our webpage loads and gives it LIMITED access
// to safe Electron features (very important for security)
contextIsolation: true,
// Protects our renderer process - modern & secure setting
nodeIntegration: false
// Prevents renderer from directly using Node.js (also for security)
}
});
win.on('close', (event) => {
    if (!app.isQuiting) {
        event.preventDefault();
        win.hide();
    }
});

// Tell the window to show our HTML file
win.loadFile('index.html');
}


// When Electron has finished starting up and is ready
app.whenReady().then(() => {
createWindow(); // create the first window



// NEW: System Tray
let tray = null;
// ... menu setup code ...
// Create tray icon
tray = new Tray(path.join(__dirname, 'tray-icon.png'));
// Tray context menu
const trayMenu = Menu.buildFromTemplate([
{
label: 'Show App',
click: () => {
BrowserWindow.getAllWindows()[0].show();
}
},
{
label: 'Quit',
click: () => {
    app.isQuiting = true;
    app.quit();
}
}
]);
tray.setToolTip('Quick Note Taker');
tray.setContextMenu(trayMenu);
});

// NEW: App Menu
const menuTemplate = [
{
label: 'File',
submenu: [
{
label: 'New Note',
accelerator: 'CmdOrCtrl+N',
click: () => {
BrowserWindow.getFocusedWindow().webContents.send('menu-new-note');
}
},
{
label: 'Open File',
accelerator: 'CmdOrCtrl+O',
click: () => {
BrowserWindow.getFocusedWindow().webContents.send('menu-open-file');
}
},
{
label: 'Save',
accelerator: 'CmdOrCtrl+S',
click: () => {
BrowserWindow.getFocusedWindow().webContents.send('menu-save');
}
},
{
label: 'Save As',
accelerator: 'CmdOrCtrl+Shift+S',
click: () => {
BrowserWindow.getFocusedWindow().webContents.send('menu-save-as');
}
},
{ type: 'separator' },
{
label: 'Quit',
accelerator: 'CmdOrCtrl+Q',
click: () => app.quit()
}
 ]
},
{
    label: 'Help',
    submenu: [
        {
            label: 'Keyboard Shortcuts',
            click: async () => {
                await dialog.showMessageBox({
                    type: 'info',
                    title: 'Keyboard Shortcuts',
                    message:
`Ctrl + N  → New Note

Ctrl + S  → Save

Ctrl + O  → Open File

Ctrl + Shift + S  → Save As`
                });
            }
        }
    ]
}
];


const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);




// Special macOS behavior: if user closes all windows but clicks app icon again
app.on('activate', () => {
if (BrowserWindow.getAllWindows().length === 0) {
createWindow();
}
});

// When the user closes the last window
app.on('window-all-closed', () => {
// On Windows & Linux ➡️ quit the app completely
// On macOS ➡️ keep running (typical macOS behavior)
if (process.platform !== 'darwin') {
app.quit();
}
});

// NEW: Helper - read all notes from the JSON file
function readNotes() {
if (!fs.existsSync(notesFilePath)) {
return []; // return empty array if file does not exist yet
}
const raw = fs.readFileSync(notesFilePath, 'utf-8');
return JSON.parse(raw);
}

// NEW: Helper - write all notes to the JSON file
function writeNotes(notes) {
fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), 'utf-8');
}
function readSettings() {
    if (!fs.existsSync(settingsFilePath)) {
        return { fontSize: 16 };
    }

    const raw = fs.readFileSync(settingsFilePath, 'utf-8');
    return JSON.parse(raw);
}

function writeSettings(settings) {
    fs.writeFileSync(
        settingsFilePath,
        JSON.stringify(settings, null, 2),
        'utf-8'
    );
}

// Renderer asks us to SAVE the note
ipcMain.handle('save-note', async (event, text) => {
// We decide to save in the user's Documents folder
// cross-platform safe location
const filePath = path.join(app.getPath('documents'), 'quicknote.txt');

// Write the text to file (synchronous version - simple for teaching)
fs.writeFileSync(filePath, text, 'utf-8');

// Return success message to renderer
return { success: true };
});


// Renderer asks us to LOAD the saved note
ipcMain.handle('load-note', async (event) => {
const filePath = path.join(app.getPath('documents'), 'quicknote.txt');

// Check if file already exists
if (fs.existsSync(filePath)) {
// Read the whole file as UTF-8 text
return fs.readFileSync(filePath, 'utf-8');
}
return '';
});

// // NEW: Save As handler
ipcMain.handle('save-as', async (event, text) => {
const result = await dialog.showSaveDialog({
defaultPath: 'mynote.txt',
filters: [{ name: 'Text Files', extensions: ['txt'] }]
});

if (result.canceled) {
return { success: false };
}

fs.writeFileSync(result.filePath, text, 'utf-8');
return { success: true, filePath: result.filePath };
});

// UPDATED: Smart Save handler (Optimized & Non-blocking)
ipcMain.handle('smart-save', async (event, text, filePath) => {
try {
const targetPath = filePath || path.join(app.getPath('documents'), 'quicknote.txt');

// Use the promise-based async file system method
await fs.promises.writeFile(targetPath, text, 'utf-8');

return { success: true, filePath: targetPath };
} catch (error) {
// Catch errors (e.g., permission denied) and return gracefully
return { success: false, error: error.message };
}
});


// NEW: New Note handler
ipcMain.handle('new-note', async (event) => {
const result = await dialog.showMessageBox({
type: 'warning',
buttons: ['Discard Changes', 'Cancel'],
defaultId: 1,
title: 'Unsaved Changes',
message: 'You have unsaved changes. Start a new note anyway?'
});

// result.response === 0 means user clicked 'Discard Changes'
return { confirmed: result.response === 0 };
});

// NEW: Open File handler
ipcMain.handle('open-file', async (event) => {
const result = await dialog.showOpenDialog({
properties: ['openFile'],
filters: [{ name: 'Text Files', extensions: ['txt'] }]
});

if (result.canceled) {
return { success: false };
}

const filePath = result.filePaths[0];
recentFiles.unshift(filePath);
recentFiles = [...new Set(recentFiles)];
recentFiles = recentFiles.slice(0, 5);
const content = fs.readFileSync(filePath, 'utf-8');
return { success: true, content, filePath };
});


// NEW: Get all notes
ipcMain.handle('get-notes', async () => {
return readNotes();
});

// NEW: Delete a note
ipcMain.handle('delete-note', async (event, id) => {
const notes = readNotes();
const filtered = notes.filter(n => n.id !== id);
writeNotes(filtered);
return { success: true };
});

// Step 3: Add IPC Handlers for Notes in main.js

// NEW: Save a note (create or update)
ipcMain.handle('save-note-json', async (event, note) => {
const notes = readNotes();
const index = notes.findIndex(n => n.id === note.id);
const now = new Date().toISOString();

if (index === -1) {
// Note does not exist yet - create it
notes.push({ ...note, createdAt: now, updatedAt: now });
} else {
// Note already exists - update it
notes[index] = { ...notes[index], ...note, updatedAt: now };
}

writeNotes(notes);
return { success: true };
});
ipcMain.handle('get-settings', async () => {
    return readSettings();
});

ipcMain.handle('save-settings', async (event, settings) => {
    const current = readSettings();
    const updated = { ...current, ...settings };

    writeSettings(updated);

    return { success: true };
});

// NEW: Toggle pin state of a note
ipcMain.handle('toggle-pin', async (event, id) => {
    const notes = readNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return { success: false };

    notes[index].pinned = !notes[index].pinned;
    writeNotes(notes);
    return { success: true, pinned: notes[index].pinned };
});

ipcMain.handle('export-pdf', async (event, note) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export PDF',
        defaultPath: `${note.title || 'note'}.pdf`,
        filters: [
            { name: 'PDF Files', extensions: ['pdf'] }
        ]
    });

    if (canceled || !filePath) {
        return { success: false };
    }

    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text(note.title || 'Untitled', {
        underline: true
    });

    doc.moveDown();

    doc.fontSize(12).text(note.content || '');

    doc.end();

    return {
        success: true,
        filePath
    };
});


ipcMain.handle('get-recent-files', async () => {
    return recentFiles;
});

