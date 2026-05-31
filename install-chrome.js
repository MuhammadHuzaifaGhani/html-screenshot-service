const { execSync } = require('child_process');
const fs = require('fs');

console.log('Installing Chrome...');

try {
  execSync('npx puppeteer browsers install chrome', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PUPPETEER_CACHE_DIR: '/opt/render/.cache/puppeteer'
    }
  });
  console.log('Chrome installed successfully');
  
  // Verify installation
  const result = execSync('find /opt/render/.cache/puppeteer -name "chrome" -type f 2>/dev/null').toString().trim();
  console.log('Chrome found at:', result);
  
} catch(e) {
  console.error('Chrome install failed:', e.message);
  process.exit(1);
}
