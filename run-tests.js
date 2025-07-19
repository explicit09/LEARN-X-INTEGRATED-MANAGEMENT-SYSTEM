const { app, BrowserWindow } = require('electron');
const path = require('path');
const { runTests } = require('./test-task-management');

// Prevent Electron from running in production mode
process.env.NODE_ENV = 'test';

let mainWindow;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'src/preload/index.js')
        }
    });

    // Load the main app
    await mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
    
    // Wait for app to fully initialize
    console.log('⏳ Waiting for app to initialize...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Open LIMS dashboard
    console.log('🚀 Opening LIMS dashboard...');
    await mainWindow.webContents.executeJavaScript(`
        window.api.shortcuts.simulateKeybind('toggleLIMS');
    `);
    
    // Wait for LIMS to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run the tests
    console.log('🧪 Starting tests...\n');
    const results = await runTests(mainWindow);
    
    // Close after tests
    setTimeout(() => {
        app.quit();
        process.exit(results.failed > 0 ? 1 : 0);
    }, 2000);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});