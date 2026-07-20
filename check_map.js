const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let lines = html.split('\n');
for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('function mapTransaction')) {
        for(let j=i; j<i+15; j++) console.log(j + ': ' + lines[j]);
        break;
    }
}
