const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let start = html.indexOf('function renderDashboard() {');
let end = html.indexOf('function renderViewProducts() {');
if(start !== -1 && end !== -1) {
    console.log(html.substring(start, start+1500));
}
