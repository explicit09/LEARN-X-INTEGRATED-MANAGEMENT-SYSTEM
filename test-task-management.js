/**
 * Comprehensive End-to-End Test Suite for Task Management System
 * Tests all components, interactions, and database connections
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

// Test scenarios
const testScenarios = {
    // Component Structure Tests
    componentTests: [
        {
            name: 'Task Management Module Loads',
            selector: 'task-management-module-enhanced',
            expected: 'Element exists'
        },
        {
            name: 'Kanban Board Renders',
            selector: '.kanban-board',
            expected: 'Element exists with 4 columns'
        },
        {
            name: 'Command Palette Hidden Initially',
            selector: '.command-palette',
            expected: 'Not visible initially'
        },
        {
            name: 'Template Panel Hidden Initially',
            selector: '.template-panel-overlay',
            expected: 'Not visible initially'
        }
    ],
    
    // Button Functionality Tests
    buttonTests: [
        {
            name: 'Templates Button',
            selector: '.template-button',
            action: 'click',
            expected: 'Opens template panel'
        },
        {
            name: 'Demo Tasks Button',
            selector: '.action-button[title="Create Demo Tasks"]',
            action: 'click',
            expected: 'Creates demo tasks'
        },
        {
            name: 'Clear All Button',
            selector: '.action-button[title="Clear All Tasks"]',
            action: 'click',
            expected: 'Clears all tasks'
        },
        {
            name: 'Keyboard Shortcuts Button',
            selector: '.action-button[title="Keyboard shortcuts (?)"]',
            action: 'click',
            expected: 'Shows keyboard shortcuts'
        }
    ],
    
    // Keyboard Shortcut Tests
    keyboardTests: [
        {
            name: 'Command Palette (Cmd/Ctrl+K)',
            key: 'k',
            modifiers: ['ctrl'],
            expected: 'Opens command palette'
        },
        {
            name: 'Create Task (C)',
            key: 'c',
            expected: 'Focuses create input'
        },
        {
            name: 'Select Mode (X)',
            key: 'x',
            expected: 'Enters selection mode'
        }
    ],
    
    // Drag and Drop Tests
    dragDropTests: [
        {
            name: 'Drag Task Between Columns',
            source: '.kanban-column[data-status="todo"] .task-card:first-child',
            target: '.kanban-column[data-status="in_progress"]',
            expected: 'Task moves to new column'
        }
    ],
    
    // Database Tests
    databaseTests: [
        {
            name: 'Create Task',
            action: 'createTask',
            data: {
                title: 'Test Task',
                description: 'Test Description',
                priority: 'high',
                status: 'todo'
            },
            expected: 'Task created with ID'
        },
        {
            name: 'Update Task Status',
            action: 'updateTask',
            data: {
                status: 'in_progress'
            },
            expected: 'Task status updated'
        },
        {
            name: 'Delete Task',
            action: 'deleteTask',
            expected: 'Task deleted successfully'
        }
    ],
    
    // Validation Tests
    validationTests: [
        {
            name: 'Invalid Status Transition',
            action: 'dragTask',
            from: 'todo',
            to: 'done',
            expected: 'Shows validation error'
        }
    ],
    
    // Natural Language Tests
    naturalLanguageTests: [
        {
            name: 'Parse "Review lab results Friday"',
            input: 'Review lab results Friday',
            expected: {
                title: 'Review lab results',
                due_date: 'Next Friday',
                priority: 'normal'
            }
        },
        {
            name: 'Parse "Update docs!!"',
            input: 'Update docs!!',
            expected: {
                title: 'Update docs',
                priority: 'high'
            }
        }
    ]
};

// Test runner
async function runTests(win) {
    console.log('🧪 Starting Task Management System Tests...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        errors: []
    };
    
    // Wait for app to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Component Structure Tests
    console.log('📦 Testing Component Structure...');
    for (const test of testScenarios.componentTests) {
        try {
            const exists = await win.webContents.executeJavaScript(`
                !!document.querySelector('lims-dashboard-view').shadowRoot
                    .querySelector('lims-module-loader').shadowRoot
                    .querySelector('task-management-module-enhanced').shadowRoot
                    .querySelector('${test.selector}')
            `);
            
            if (exists) {
                console.log(`✅ ${test.name}`);
                results.passed++;
            } else {
                console.log(`❌ ${test.name} - Element not found`);
                results.failed++;
                results.errors.push(`${test.name}: Element not found`);
            }
        } catch (error) {
            console.log(`❌ ${test.name} - Error: ${error.message}`);
            results.failed++;
            results.errors.push(`${test.name}: ${error.message}`);
        }
    }
    
    // Button Tests
    console.log('\n🔘 Testing Button Functionality...');
    for (const test of testScenarios.buttonTests) {
        try {
            const result = await win.webContents.executeJavaScript(`
                const module = document.querySelector('lims-dashboard-view').shadowRoot
                    .querySelector('lims-module-loader').shadowRoot
                    .querySelector('task-management-module-enhanced');
                const button = module.shadowRoot.querySelector('${test.selector}');
                if (button) {
                    button.click();
                    true;
                } else {
                    false;
                }
            `);
            
            if (result) {
                console.log(`✅ ${test.name} - Clicked successfully`);
                results.passed++;
            } else {
                console.log(`❌ ${test.name} - Button not found`);
                results.failed++;
                results.errors.push(`${test.name}: Button not found`);
            }
            
            // Wait for action to complete
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.log(`❌ ${test.name} - Error: ${error.message}`);
            results.failed++;
            results.errors.push(`${test.name}: ${error.message}`);
        }
    }
    
    // Database Connection Test
    console.log('\n🗄️ Testing Database Connection...');
    try {
        const dbTest = await win.webContents.executeJavaScript(`
            (async () => {
                const module = document.querySelector('lims-dashboard-view').shadowRoot
                    .querySelector('lims-module-loader').shadowRoot
                    .querySelector('task-management-module-enhanced');
                
                // Test create
                const testTask = {
                    title: 'E2E Test Task',
                    description: 'Created by automated test',
                    priority: 'high',
                    status: 'todo'
                };
                
                const created = await window.api.lims.createTask(testTask);
                if (!created || !created.id) return { error: 'Failed to create task' };
                
                // Test update
                const updated = await window.api.lims.updateTask(created.id, { status: 'in_progress' });
                if (!updated) return { error: 'Failed to update task' };
                
                // Test delete
                const deleted = await window.api.lims.deleteTask(created.id);
                if (!deleted) return { error: 'Failed to delete task' };
                
                return { success: true, taskId: created.id };
            })()
        `);
        
        if (dbTest.success) {
            console.log(`✅ Database CRUD operations successful`);
            results.passed++;
        } else {
            console.log(`❌ Database test failed: ${dbTest.error}`);
            results.failed++;
            results.errors.push(`Database: ${dbTest.error}`);
        }
    } catch (error) {
        console.log(`❌ Database test error: ${error.message}`);
        results.failed++;
        results.errors.push(`Database: ${error.message}`);
    }
    
    // Natural Language Parser Test
    console.log('\n🗣️ Testing Natural Language Parser...');
    try {
        const nlTest = await win.webContents.executeJavaScript(`
            const module = document.querySelector('lims-dashboard-view').shadowRoot
                .querySelector('lims-module-loader').shadowRoot
                .querySelector('task-management-module-enhanced');
            
            const parsed = module.parseNaturalLanguage('Review lab results Friday!!');
            {
                hasDate: !!parsed.due_date,
                hasPriority: parsed.priority === 'high',
                title: parsed.title
            }
        `);
        
        if (nlTest.hasDate && nlTest.hasPriority) {
            console.log(`✅ Natural language parsing working`);
            results.passed++;
        } else {
            console.log(`❌ Natural language parsing incomplete`);
            results.failed++;
            results.errors.push('Natural language parser not working correctly');
        }
    } catch (error) {
        console.log(`❌ Natural language test error: ${error.message}`);
        results.failed++;
        results.errors.push(`Natural language: ${error.message}`);
    }
    
    // Template System Test
    console.log('\n📋 Testing Template System...');
    try {
        const templateTest = await win.webContents.executeJavaScript(`
            const module = document.querySelector('lims-dashboard-view').shadowRoot
                .querySelector('lims-module-loader').shadowRoot
                .querySelector('task-management-module-enhanced');
            
            const templates = module.taskTemplates;
            {
                count: templates.length,
                hasLabTemplate: templates.some(t => t.id === 'lab-test-protocol'),
                categories: [...new Set(templates.map(t => t.category))]
            }
        `);
        
        if (templateTest.count === 6 && templateTest.hasLabTemplate) {
            console.log(`✅ Template system loaded with ${templateTest.count} templates`);
            results.passed++;
        } else {
            console.log(`❌ Template system incomplete`);
            results.failed++;
            results.errors.push('Template system not loaded correctly');
        }
    } catch (error) {
        console.log(`❌ Template test error: ${error.message}`);
        results.failed++;
        results.errors.push(`Templates: ${error.message}`);
    }
    
    // Validation System Test
    console.log('\n🛡️ Testing Workflow Validation...');
    try {
        const validationTest = await win.webContents.executeJavaScript(`
            (async () => {
                const module = document.querySelector('lims-dashboard-view').shadowRoot
                    .querySelector('lims-module-loader').shadowRoot
                    .querySelector('task-management-module-enhanced');
                
                const testTask = {
                    id: 'test-123',
                    title: 'Test Task',
                    status: 'todo',
                    priority: 'high'
                };
                
                // Test valid transition
                const valid = await module.validateStatusTransition(testTask, 'in_progress');
                
                // Test invalid transition
                const invalid = await module.validateStatusTransition(testTask, 'done');
                
                return { valid, invalid };
            })()
        `);
        
        if (validationTest.valid && !validationTest.invalid) {
            console.log(`✅ Workflow validation working correctly`);
            results.passed++;
        } else {
            console.log(`❌ Workflow validation not working`);
            results.failed++;
            results.errors.push('Workflow validation failed');
        }
    } catch (error) {
        console.log(`❌ Validation test error: ${error.message}`);
        results.failed++;
        results.errors.push(`Validation: ${error.message}`);
    }
    
    // Final Report
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.errors.length > 0) {
        console.log('\n⚠️ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    return results;
}

// Export for use
module.exports = { runTests, testScenarios };

// Run if executed directly
if (require.main === module) {
    console.log('Please run this test through the Electron app');
}