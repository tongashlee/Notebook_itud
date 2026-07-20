const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the line that sets innerText to be safe
let targetLine = "document.getElementById('totalSavingsValue').innerText = '฿' + totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 });";
let safeLine = "let tsv = document.getElementById('totalSavingsValue'); if(tsv) tsv.innerText = '฿' + totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 });";
html = html.replace(targetLine, safeLine);

// Also add the ID back to the dynamic HTML so it's consistent
let oldHtml = '<h3 class="text-warning fw-bold m-0">฿${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>';
let newHtml = '<h3 class="text-warning fw-bold m-0" id="totalSavingsValue">฿${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>';
html = html.replace(oldHtml, newHtml);

fs.writeFileSync('index.html', html);
console.log("Fixed null reference innerText error");
