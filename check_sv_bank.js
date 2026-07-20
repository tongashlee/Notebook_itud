const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
console.log('Includes sv_bank:', html.includes('id="sv_bank"'));
