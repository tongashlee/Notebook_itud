const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let match = html.indexOf('id="totalSavingsValue"');
if (match !== -1) {
    console.log(html.substring(match - 500, match + 500));
}
