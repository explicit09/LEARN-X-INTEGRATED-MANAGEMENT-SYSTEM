const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'src/preload.js'),
            contextIsolation: false,
            nodeIntegration: true,
            webSecurity: false
        },
        backgroundColor: '#000000'
    });

    // Load the app
    await mainWindow.loadFile('src/ui/app/content.html');
    
    // Open DevTools
    mainWindow.webContents.openDevTools();
    
    // Wait for app to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run test sequence
    mainWindow.webContents.executeJavaScript(`
        (async () => {
            console.log('=== TESTING REPORTING VIEW FIX ===');
            
            // Step 1: Navigate to Task Management module
            console.log('1. Navigating to Task Management...');
            const limsView = document.querySelector('lims-dashboard-view');
            if (!limsView) {
                console.error('LIMS dashboard view not found!');
                return;
            }
            
            // Click on Task Management module
            const taskModule = limsView.shadowRoot.querySelector('[data-module-id="task-management-enhanced"]');
            if (taskModule) {
                taskModule.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✓ Task Management module loaded');
            } else {
                console.error('Task Management module button not found!');
                return;
            }
            
            // Step 2: Get the task management module element
            const taskMgmt = document.querySelector('task-management-module-enhanced');
            if (!taskMgmt) {
                console.error('Task Management module element not found!');
                return;
            }
            
            console.log('2. Current view:', taskMgmt.currentView);
            
            // Step 3: Click Reports button
            console.log('3. Clicking Reports button...');
            const reportsBtn = taskMgmt.shadowRoot.querySelector('.view-button[class*="reporting"]') ||
                              taskMgmt.shadowRoot.querySelector('button:contains("Reports")') ||
                              Array.from(taskMgmt.shadowRoot.querySelectorAll('button')).find(b => b.textContent.includes('Reports'));
            
            if (reportsBtn) {
                reportsBtn.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('✓ Reports button clicked');
                console.log('4. Current view after click:', taskMgmt.currentView);
            } else {
                console.error('Reports button not found!');
                return;
            }
            
            // Step 4: Check if reporting module is rendered
            console.log('5. Checking for reporting module...');
            const reportingModule = taskMgmt.shadowRoot.querySelector('task-reporting-module');
            if (reportingModule) {
                console.log('✓ Reporting module found in DOM');
                console.log('6. Reporting module display style:', getComputedStyle(reportingModule).display);
                console.log('7. Reporting module visibility:', getComputedStyle(reportingModule).visibility);
                console.log('8. Reporting module dimensions:', reportingModule.offsetWidth, 'x', reportingModule.offsetHeight);
                
                // Check if it has content
                const reportingContent = reportingModule.shadowRoot?.querySelector('.reporting-container');
                if (reportingContent) {
                    console.log('✓ Reporting content rendered');
                } else {
                    console.error('Reporting content not found inside module!');
                }
            } else {
                console.error('Reporting module NOT found in DOM!');
                
                // Debug: Check what's actually in task-content
                const taskContent = taskMgmt.shadowRoot.querySelector('.task-content');
                console.log('Task content innerHTML:', taskContent?.innerHTML);
                console.log('Task content children:', taskContent?.children);
            }
            
            // Step 5: Check if custom element is registered
            console.log('9. Is task-reporting-module registered?', !!customElements.get('task-reporting-module'));
            
            // Step 6: Check for any console errors
            console.log('=== TEST COMPLETE ===');
            console.log('If you see the reporting view, the fix worked!');
            console.log('If not, check the console errors above.');
        })();
    `);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

console.log(`
=== REPORTING VIEW FIX TEST ===

This script will:
1. Open the LIMS app
2. Navigate to Task Management module
3. Click the Reports button
4. Check if the reporting view is displayed
5. Output diagnostic information

The console will show:
- Whether the reporting module is found in the DOM
- The current view state
- Any rendering issues
- Custom element registration status

Look for any errors in the console output.
`);