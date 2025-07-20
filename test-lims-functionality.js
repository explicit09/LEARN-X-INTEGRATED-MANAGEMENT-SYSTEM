// Real LIMS Functionality Test
// Run this in the LIMS dashboard DevTools console

(async function testLIMSFunctionality() {
    console.log('🧪 Testing LIMS Real Functionality...\n');
    
    const results = {
        passed: [],
        failed: []
    };
    
    // 1. Test API availability
    console.log('1️⃣ Testing API Availability...');
    if (window.api && window.api.lims) {
        console.log('✅ window.api.lims is available');
        results.passed.push('API availability');
    } else {
        console.log('❌ window.api.lims NOT available');
        results.failed.push('API availability');
        return results;
    }
    
    // 2. Test getting tasks
    console.log('\n2️⃣ Testing getTasks...');
    try {
        const tasks = await window.api.lims.getTasks();
        console.log(`✅ getTasks returned ${tasks.length} tasks`);
        console.log('Sample task:', tasks[0]);
        results.passed.push('getTasks');
    } catch (error) {
        console.log('❌ getTasks failed:', error);
        results.failed.push('getTasks: ' + error.message);
    }
    
    // 3. Test creating a task
    console.log('\n3️⃣ Testing createTask...');
    const testTask = {
        title: `Test Task ${Date.now()}`,
        description: 'Created from functionality test',
        status: 'todo',
        priority: 'normal',
        labels: 'test,functionality'
    };
    
    try {
        const created = await window.api.lims.createTask(testTask);
        console.log('✅ Task created:', created);
        
        if (created && created.id) {
            results.passed.push('createTask');
            
            // 4. Test updating the task
            console.log('\n4️⃣ Testing updateTask...');
            try {
                const updated = await window.api.lims.updateTask(created.id, {
                    status: 'in_progress',
                    priority: 'high'
                });
                console.log('✅ Task updated:', updated);
                results.passed.push('updateTask');
            } catch (error) {
                console.log('❌ updateTask failed:', error);
                results.failed.push('updateTask: ' + error.message);
            }
            
            // 5. Test deleting the task
            console.log('\n5️⃣ Testing deleteTask...');
            try {
                const deleted = await window.api.lims.deleteTask(created.id);
                console.log('✅ Task deleted');
                results.passed.push('deleteTask');
            } catch (error) {
                console.log('❌ deleteTask failed:', error);
                results.failed.push('deleteTask: ' + error.message);
            }
        } else {
            results.failed.push('createTask: No ID returned');
        }
    } catch (error) {
        console.log('❌ createTask failed:', error);
        results.failed.push('createTask: ' + error.message);
    }
    
    // 6. Test UI functionality
    console.log('\n6️⃣ Testing UI Functionality...');
    const module = document.querySelector('lims-dashboard-view')?.shadowRoot
        ?.querySelector('lims-module-loader')?.shadowRoot
        ?.querySelector('task-management-module-enhanced');
    
    if (module) {
        // Test natural language input
        const nlInput = module.shadowRoot.querySelector('.nl-input');
        if (nlInput) {
            console.log('Testing natural language input...');
            nlInput.value = 'Test task from NL input!!';
            const enterEvent = new KeyboardEvent('keyup', { key: 'Enter' });
            nlInput.dispatchEvent(enterEvent);
            console.log('✅ Natural language input triggered');
            results.passed.push('Natural language input');
        } else {
            console.log('❌ Natural language input not found');
            results.failed.push('Natural language input element');
        }
        
        // Test quickCreateTask
        if (typeof module.quickCreateTask === 'function') {
            console.log('✅ quickCreateTask method exists');
            results.passed.push('quickCreateTask method');
        } else {
            console.log('❌ quickCreateTask method missing');
            results.failed.push('quickCreateTask method');
        }
        
        // Test createTask method
        if (typeof module.createTask === 'function') {
            console.log('✅ createTask method exists');
            results.passed.push('createTask method');
            
            // Try calling it
            try {
                await module.createTask({
                    title: 'UI Test Task',
                    status: 'todo',
                    priority: 'normal'
                });
                console.log('✅ UI createTask executed');
                results.passed.push('UI createTask execution');
            } catch (error) {
                console.log('❌ UI createTask failed:', error);
                results.failed.push('UI createTask: ' + error.message);
            }
        } else {
            console.log('❌ createTask method missing');
            results.failed.push('createTask method');
        }
        
        // Check if loadModuleData works
        if (typeof module.loadModuleData === 'function') {
            console.log('Testing loadModuleData...');
            try {
                await module.loadModuleData();
                console.log('✅ loadModuleData executed');
                console.log(`Module has ${module.tasks.length} tasks loaded`);
                results.passed.push('loadModuleData');
            } catch (error) {
                console.log('❌ loadModuleData failed:', error);
                results.failed.push('loadModuleData: ' + error.message);
            }
        }
    } else {
        console.log('❌ Module not found');
        results.failed.push('Module element');
    }
    
    // Summary
    console.log('\n📊 TEST RESULTS:');
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
        console.log('\nFailed tests:');
        results.failed.forEach(f => console.log(`  - ${f}`));
    }
    
    return results;
})();