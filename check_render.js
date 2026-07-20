const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find renderSavings
let start = html.indexOf('function renderSavings() {');
let end = html.indexOf('async function submitSaving(e) {');
if(start !== -1 && end !== -1) {
    console.log(html.substring(start, end));
}
