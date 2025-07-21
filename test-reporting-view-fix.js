const { app, BrowserWindow } = require('electron');
const path = require('path');

// Test script to verify reporting view fix
async function testReportingView() {
    console.log('=== Testing Reporting View Fix ===\n');
    
    // Wait for app to be ready
    await app.whenReady();
    
    // Create test window
    const testWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        },
        show: false
    });
    
    // Load the LIMS view
    await testWindow.loadFile(path.join(__dirname, 'src/ui/lims/LimsDashboardView.html'));
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test the reporting view
    const result = await testWindow.webContents.executeJavaScript(`
        (async () => {
            console.log('Starting reporting view test...');
            
            // Get the task management module
            const taskModule = document.querySelector('task-management-module-with-bulk-ops');
            if (!taskModule) {
                return { error: 'Task management module not found' };
            }
            
            // Store initial state
            const initialView = taskModule.currentView;
            console.log('Initial view:', initialView);
            
            // Click the Reports button
            const reportsButton = taskModule.shadowRoot.querySelector('.view-button[title*="Reports"], .view-button:has(span:contains("Reports"))');
            if (!reportsButton) {
                // Try alternative selector
                const buttons = Array.from(taskModule.shadowRoot.querySelectorAll('.view-button'));
                const reportBtn = buttons.find(btn => btn.textContent.includes('Reports'));
                if (!reportBtn) {
                    return { error: 'Reports button not found' };
                }
                reportBtn.click();
            } else {
                reportsButton.click();
            }
            
            // Wait for update
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if view changed
            const newView = taskModule.currentView;
            console.log('New view:', newView);
            
            // Check if reporting module is rendered
            const reportingModule = taskModule.shadowRoot.querySelector('task-reporting-module');
            const reportingContainer = taskModule.shadowRoot.querySelector('.reporting-view-container');
            
            // Also check in the parent's shadow root (due to render delegation)
            const parentReportingModule = document.querySelector('task-reporting-module');
            
            return {
                success: true,
                initialView,
                newView,
                viewChanged: newView === 'reporting',
                reportingModuleFound: !!reportingModule || !!parentReportingModule,
                reportingContainerFound: !!reportingContainer,
                details: {
                    reportingModuleInShadow: !!reportingModule,
                    reportingModuleInParent: !!parentReportingModule,
                    currentViewAttribute: taskModule.getAttribute('data-view')
                }
            };
        })()
    `);
    
    console.log('\n=== Test Results ===');
    console.log('Initial View:', result.initialView);
    console.log('New View:', result.newView);
    console.log('View Changed to Reporting:', result.viewChanged);
    console.log('Reporting Module Found:', result.reportingModuleFound);
    console.log('Reporting Container Found:', result.reportingContainerFound);
    console.log('\nDetails:', result.details);
    
    if (result.viewChanged && result.reportingModuleFound) {
        console.log('\n✅ SUCCESS: Reporting view is now working correctly!');
    } else {
        console.log('\n❌ FAILED: Reporting view is still not showing');
        console.log('Debugging info:', result);
    }
    
    // Clean up
    testWindow.close();
    app.quit();
}

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    app.quit();
});

// Run the test
testReportingView().catch(error => {
    console.error('Test failed:', error);
    app.quit();
});