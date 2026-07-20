const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

console.log('tab-history exists:', html.includes('id="tab-history"'));
console.log('tab-parcel exists:', html.includes('id="tab-parcel"'));

let match = html.match(/<script>([\s\S]*?)<\/script>/g);
let appJs = match[1].replace('<script>', '').replace('</script>', '');

try {
  new Function(appJs);
  console.log('JS syntax is completely valid');
} catch (e) {
  console.error('JS Syntax Error:', e);
}

let renderReportsTab = appJs.split('function renderReportsTab() {')[1].split('function ')[0];
let backticks = (renderReportsTab.match(/\`/g) || []).length;
console.log('Backticks count in renderReportsTab:', backticks);
