// Copy and paste this entire script into the DevTools console while LIMS is open

(async function runAutomatedTests() {
    console.log('🧪 Starting Automated LIMS Tests...\n');
    
    const results = { passed: 0, failed: 0, errors: [] };
    
    // Helper function to find the task management module
    function getModule() {
        return document.querySelector('lims-dashboard-view')?.shadowRoot
            ?.querySelector('lims-module-loader')?.shadowRoot
            ?.querySelector('task-management-module-enhanced');
    }
    
    // Test 1: Component Structure
    console.log('📦 Testing Component Structure...');
    try {
        const module = getModule();
        const tests = [
            { name: 'Module exists', check: !!module },
            { name: 'Kanban board', check: !!module?.shadowRoot?.querySelector('.kanban-board') },
            { name: 'Has 4 columns', check: module?.shadowRoot?.querySelectorAll('.kanban-column').length === 4 },
            { name: 'Template button', check: !!module?.shadowRoot?.querySelector('.template-button') },
            { name: 'Command palette', check: !!module?.shadowRoot?.querySelector('.command-palette') }
        ];
        
        tests.forEach(test => {
            if (test.check) {
                console.log(`✅ ${test.name}`);
                results.passed++;
            } else {
                console.log(`❌ ${test.name}`);
                results.failed++;
                results.errors.push(test.name);
            }
        });
    } catch (e) {
        console.error('❌ Component structure test failed:', e);
        results.failed++;
    }
    
    // Test 2: Database Operations
    console.log('\n🗄️ Testing Database Operations...');
    try {
        // Create test task
        const testTask = {
            title: 'Automated Test Task ' + Date.now(),
            description: 'Created by automated test',
            priority: 'high',
            status: 'todo',
            labels: 'test,automated'
        };
        
        console.log('Creating test task...');
        const created = await window.api.lims.createTask(testTask);
        
        if (created && created.id) {
            console.log('✅ Task created with ID:', created.id);
            results.passed++;
            
            // Update task
            console.log('Updating task status...');
            const updated = await window.api.lims.updateTask(created.id, { 
                status: 'in_progress',
                labels: ['test', 'automated', 'updated']
            });
            
            if (updated) {
                console.log('✅ Task updated successfully');
                results.passed++;
            } else {
                console.log('❌ Task update failed');
                results.failed++;
            }
            
            // Delete task
            console.log('Deleting test task...');
            const deleted = await window.api.lims.deleteTask(created.id);
            
            if (deleted) {
                console.log('✅ Task deleted successfully');
                results.passed++;
            } else {
                console.log('❌ Task deletion failed');
                results.failed++;
            }
        } else {
            console.log('❌ Task creation failed');
            results.failed++;
            results.errors.push('Task creation');
        }
    } catch (e) {
        console.error('❌ Database test failed:', e);
        results.failed++;
        results.errors.push('Database operations');
    }
    
    // Test 3: Natural Language Parser
    console.log('\n🗣️ Testing Natural Language Parser...');
    try {
        const module = getModule();
        const testCases = [
            { input: 'Review lab results Friday', expectDate: true, expectPriority: false },
            { input: 'Update docs tomorrow!!', expectDate: true, expectPriority: true },
            { input: 'Meeting on Monday', expectDate: true, expectPriority: false }
        ];
        
        testCases.forEach(test => {
            const parsed = module.parseNaturalLanguage(test.input);
            const hasDate = !!parsed.due_date;
            const isHighPriority = parsed.priority === 'high';
            
            if (hasDate === test.expectDate && isHighPriority === test.expectPriority) {
                console.log(`✅ Parsed "${test.input}" correctly`);
                results.passed++;
            } else {
                console.log(`❌ Failed to parse "${test.input}"`);
                results.failed++;
                results.errors.push(`Parse: ${test.input}`);
            }
        });
    } catch (e) {
        console.error('❌ Natural language test failed:', e);
        results.failed++;
    }
    
    // Test 4: Template System
    console.log('\n📋 Testing Template System...');
    try {
        const module = getModule();
        const templates = module.taskTemplates;
        
        if (templates && templates.length === 6) {
            console.log(`✅ Found ${templates.length} templates`);
            results.passed++;
            
            const hasLabTemplate = templates.some(t => t.id === 'lab-test-protocol');
            if (hasLabTemplate) {
                console.log('✅ Lab test protocol template exists');
                results.passed++;
            } else {
                console.log('❌ Lab test protocol template missing');
                results.failed++;
            }
        } else {
            console.log('❌ Template system not loaded correctly');
            results.failed++;
            results.errors.push('Template system');
        }
    } catch (e) {
        console.error('❌ Template test failed:', e);
        results.failed++;
    }
    
    // Test 5: Validation System
    console.log('\n🛡️ Testing Validation System...');
    try {
        const module = getModule();
        
        // Test valid transition
        const validTest = await module.validateStatusTransition(
            { id: 'test', status: 'todo', priority: 'normal' },
            'in_progress'
        );
        
        if (validTest) {
            console.log('✅ Valid transition allowed (todo → in_progress)');
            results.passed++;
        } else {
            console.log('❌ Valid transition blocked');
            results.failed++;
        }
        
        // Test invalid transition
        const invalidTest = await module.validateStatusTransition(
            { id: 'test', status: 'todo', priority: 'normal' },
            'done'
        );
        
        if (!invalidTest) {
            console.log('✅ Invalid transition blocked (todo → done)');
            results.passed++;
        } else {
            console.log('❌ Invalid transition allowed');
            results.failed++;
        }
    } catch (e) {
        console.error('❌ Validation test failed:', e);
        results.failed++;
    }
    
    // Final Report
    console.log('\n========================================');
    console.log('📊 TEST RESULTS SUMMARY:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.errors.length > 0) {
        console.log('\n⚠️ Failed Tests:');
        results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n🎉 Automated testing complete!');
    console.log('\n💡 Next: Perform manual interaction tests:');
    console.log('- Drag and drop tasks between columns');
    console.log('- Open template panel and create from template');
    console.log('- Test keyboard shortcuts (C, X, Cmd+K)');
    console.log('- Verify animations are smooth');
    
    return results;
})();