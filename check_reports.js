const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let start = html.indexOf('id="reportsTab"');
if (start !== -1) {
    let end = html.indexOf('</tbody>', start);
    console.log(html.substring(start, end));
}
