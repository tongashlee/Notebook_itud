const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let match = html.indexOf('เลขที่ขาย');
if (match !== -1) {
    let start = html.lastIndexOf('<table', match);
    let end = html.indexOf('</thead>', match);
    if(start !== -1 && end !== -1) {
        console.log(html.substring(start, end));
    } else {
        console.log("Could not find table or thead tags around match.");
        console.log(html.substring(match - 200, match + 500));
    }
} else {
    console.log("Could not find 'เลขที่ขาย'");
}
