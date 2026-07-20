const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let renderFix = /return b\.id\.localeCompare\(a\.id\);/g;
html = html.replace(renderFix, "return (b.id || '').localeCompare(a.id || '');");

fs.writeFileSync('index.html', html);
console.log("Fixed b.id.localeCompare issue");
