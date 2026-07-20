const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace fmtMoney with toLocaleString
html = html.replace(/fmtMoney\((.*?)\)/g, "Number($1).toLocaleString(undefined, { minimumFractionDigits: 2 })");

fs.writeFileSync('index.html', html);
console.log("Fixed fmtMoney ReferenceError");
