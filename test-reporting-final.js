// Final test script - click Reports tab and run this in console
// This will verify the reporting module is rendering correctly

(() => {
    console.log('=== TESTING REPORTING MODULE ===');
    
    // Find the module
    const module = document.querySelector('task-management-module-with-bulk-ops');
    if (!module) {
        console.error('❌ Main module not found!');
        return;
    }
    
    console.log('✅ Module found');
    
    // Check current view
    console.log('Current view:', module.currentView);
    
    // Check shadow DOM
    const shadow = module.shadowRoot;
    const reportingModule = shadow?.querySelector('task-reporting-module');
    
    if (reportingModule) {
        console.log('✅ Reporting module in DOM');
        
        // Check if it's visible
        const rect = reportingModule.getBoundingClientRect();
        console.log('Visible:', rect.width > 0 && rect.height > 0);
        console.log('Dimensions:', { width: rect.width, height: rect.height });
        
        // Check shadow DOM content
        const reportingShadow = reportingModule.shadowRoot;
        if (reportingShadow) {
            const container = reportingShadow.querySelector('.reporting-container');
            const tabs = reportingShadow.querySelector('.report-tabs');
            const controls = reportingShadow.querySelector('.report-controls');
            
            console.log('\nContent check:');
            console.log('  - Container:', !!container);
            console.log('  - Controls:', !!controls);
            console.log('  - Tabs:', !!tabs);
            
            if (tabs) {
                const activeTab = tabs.querySelector('.tab-button.active');
                console.log('  - Active tab:', activeTab?.textContent.trim());
            }
        }
    } else {
        console.error('❌ Reporting module NOT in DOM');
        
        // Check what's in task-content
        const taskContent = shadow?.querySelector('.task-content');
        if (taskContent) {
            console.log('\nWhat\'s in task-content:', taskContent.innerHTML.substring(0, 200) + '...');
        }
    }
    
    console.log('\n=== END TEST ===');
})();