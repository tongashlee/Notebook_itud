const fs = require('fs');
const vm = require('vm');
let html = fs.readFileSync('index.html', 'utf8');

let regex = /<script>([\s\S]*?)<\/script>/g;
let match;
let blockNum = 0;

while ((match = regex.exec(html)) !== null) {
  blockNum++;
  if (blockNum === 2) {
    let js = match[1];
    
    // Write to file and use node -c
    fs.writeFileSync('_temp_check.js', js);
    
    const { execSync } = require('child_process');
    try {
      execSync('node --check _temp_check.js', { stdio: 'pipe' });
      console.log('Script block #2: Syntax OK!');
    } catch (err) {
      console.error('Script block #2: SYNTAX ERROR');
      console.error(err.stderr.toString());
    }
    
    // Clean up
    fs.unlinkSync('_temp_check.js');
    break;
  }
}
