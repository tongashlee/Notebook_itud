const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix a.date.split and b.date.split
html = html.replace("let dateA = a.date.split('/').reverse().join('');", "let dateA = (a.date || '').split('/').reverse().join('');");
html = html.replace("let dateB = b.date.split('/').reverse().join('');", "let dateB = (b.date || '').split('/').reverse().join('');");

fs.writeFileSync('index.html', html);
console.log("Fixed date split issue");
