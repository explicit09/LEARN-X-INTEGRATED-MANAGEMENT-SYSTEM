// Script to forcefully clear Electron caches and restart the app
// This ensures all modules are reloaded with the latest code

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

console.log('🧹 Clearing Electron caches and restarting app...\n');

// 1. Kill all Electron processes
console.log('1️⃣ Killing Electron processes...');
exec('pkill -f "electron.*glass-clean"', (error) => {
    if (error && error.code !== 1) {
        console.error('Error killing processes:', error);
    }
    
    setTimeout(() => {
        // 2. Clear various cache directories
        console.log('\n2️⃣ Clearing cache directories...');
        
        const cacheDirectories = [
            path.join(os.homedir(), 'Library/Caches/glass-clean'),
            path.join(os.homedir(), 'Library/Application Support/glass-clean/Cache'),
            path.join(os.homedir(), 'Library/Application Support/glass-clean/Code Cache'),
            path.join(os.homedir(), 'Library/Application Support/glass-clean/GPUCache'),
            path.join(__dirname, 'node_modules/.cache'),
            path.join(__dirname, '.cache')
        ];
        
        cacheDirectories.forEach(dir => {
            if (fs.existsSync(dir)) {
                try {
                    fs.rmSync(dir, { recursive: true, force: true });
                    console.log(`✅ Cleared: ${dir}`);
                } catch (err) {
                    console.error(`❌ Failed to clear ${dir}:`, err.message);
                }
            }
        });
        
        // 3. Clear require cache for our modules
        console.log('\n3️⃣ Clearing Node.js require cache...');
        Object.keys(require.cache).forEach(key => {
            if (key.includes('glass-clean') && !key.includes('node_modules')) {
                delete require.cache[key];
                console.log(`🗑️  Cleared from cache: ${path.basename(key)}`);
            }
        });
        
        // 4. Rebuild if needed
        console.log('\n4️⃣ Running build...');
        exec('npm run build', { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                console.error('Build error:', error);
                return;
            }
            console.log('✅ Build completed');
            
            // 5. Start the app fresh
            console.log('\n5️⃣ Starting Electron app...');
            exec('npm start', { cwd: __dirname }, (error) => {
                if (error) {
                    console.error('Failed to start app:', error);
                } else {
                    console.log('✅ App started successfully!\n');
                    console.log('🔍 Now check if the UUID error persists when creating tasks.');
                }
            });
        });
        
    }, 1000); // Wait for processes to fully terminate
});