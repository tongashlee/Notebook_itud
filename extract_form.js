const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let match = html.indexOf('<form id="savingsForm"');
if (match !== -1) {
    let end = html.indexOf('</form>', match);
    console.log(html.substring(match, end + 7));
}
