const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let regex = /let sortedSales = \[\.\.\.globalSales\]\.filter\(s => s\.status !== 'CANCELLED'\)\.sort\(\(a, b\) =>\s*b\.receiptId\.localeCompare\(a\.receiptId\)\);/g;

let safeBlock = `let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => {
          let dateA = (a.date || '').split('/').reverse().join('');
          let dateB = (b.date || '').split('/').reverse().join('');
          if (dateA !== dateB) return dateB.localeCompare(dateA);
          let idA = a.receiptId || '';
          let idB = b.receiptId || '';
          return idB.localeCompare(idA);
        });`;

html = html.replace(regex, safeBlock);
fs.writeFileSync('index.html', html);
console.log('Regex replace fixed the crash properly this time!');
