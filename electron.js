const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        // Remove window frame
        frame: false,
        // Make window resizable
        resizable: true,
        // Set minimum window size
        minWidth: 800,
        minHeight: 600,
        // Set background color
        backgroundColor: '#0f0f1b'
    });

    // Load the index.html file
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

    // Remove menu bar
    mainWindow.setMenuBarVisibility(false);
}

// Listen for close-app event from renderer
ipcMain.on('close-app', () => {
    if (mainWindow) {
        mainWindow.close();
    }
});

// When the app is ready, create the window
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}); 