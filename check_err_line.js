const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Just split by lines and find renderSavings to see where I messed up
let lines = html.split('\n');
let start = -1;
for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('function renderSavings() {')) {
        start = i;
        break;
    }
}

if(start !== -1) {
    for(let i=start; i<start + 100; i++) {
        if(i < lines.length) console.log((i+1) + ': ' + lines[i]);
    }
}
