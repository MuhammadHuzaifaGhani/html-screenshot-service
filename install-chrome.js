const { execSync } = require('child_process');

console.log('Installing Chrome...');

try {
  execSync('npx puppeteer browsers install chrome', {
    stdio: 'inherit'
  });

  console.log('Chrome installed successfully');

} catch (err) {
  console.error(err);
  process.exit(1);
}
