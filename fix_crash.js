const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the bad block that is outside or at the very end
let orphanBlockRegex = /\s*\/\/ เรียงจากใหม่ไปเก่า และตัดรายการที่ถูกยกเลิก\/ตีกลับออก\s*let sortedSales = \[\.\.\.globalSales\]\.filter\(s => s\.status !== 'CANCELLED'\)\.sort\(\(a, b\) => \{\s*let dateA = \(a\.date \|\| ''\)\.split\('\/'\)\.reverse\(\)\.join\(''\);\s*let dateB = \(b\.date \|\| ''\)\.split\('\/'\)\.reverse\(\)\.join\(''\);\s*if \(dateA !== dateB\) return dateB\.localeCompare\(dateA\);\s*let idA = a\.receiptId \|\| '';\s*let idB = b\.receiptId \|\| '';\s*return idB\.localeCompare\(idA\);\s*\}\);/g;

html = html.replace(orphanBlockRegex, '');

// 2. Replace the crashing block INSIDE renderReportsTab with the safe block
let badBlockInside = `        // เรียงจากใหม่ไปเก่า และตัดรายการที่ถูกยกเลิก/ตีกลับออก
        let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => b.receiptId.localeCompare(a.receiptId));`;

let safeBlock = `        // เรียงจากใหม่ไปเก่า และตัดรายการที่ถูกยกเลิก/ตีกลับออก
        let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => {
          let dateA = (a.date || '').split('/').reverse().join('');
          let dateB = (b.date || '').split('/').reverse().join('');
          if (dateA !== dateB) return dateB.localeCompare(dateA);
          let idA = a.receiptId || '';
          let idB = b.receiptId || '';
          return idB.localeCompare(idA);
        });`;

html = html.replace(badBlockInside, safeBlock);

fs.writeFileSync('index.html', html);
console.log('Fixed renderReportsTab crashing bug!!');
