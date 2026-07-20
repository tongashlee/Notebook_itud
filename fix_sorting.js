const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The block that was accidentally added
let badBlock = `      // เรียงจากใหม่ไปเก่า และตัดรายการที่ถูกยกเลิก/ตีกลับออก
      let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => {
        let dateA = new Date(a.createdAt).getTime();
        let dateB = new Date(b.createdAt).getTime();
        if (isNaN(dateA)) dateA = 0;
        if (isNaN(dateB)) dateB = 0;
        return dateB - dateA;
      });`;

// We'll replace it in the first occurrence which is around line 1805
let idx = html.indexOf(badBlock);
if (idx !== -1) {
  html = html.substring(0, idx) + html.substring(idx + badBlock.length);
  // Also clean up any extra newlines if necessary
  html = html.replace(/\n\n\n    function renderManageProducts/g, '\n\n    function renderManageProducts');
}

// Now find the original logic inside renderReportsTab
let originalLogic = `      // เรียงจากใหม่ไปเก่า และตัดรายการที่ถูกยกเลิก/ตีกลับออก
      let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => b.receiptId.localeCompare(a.receiptId));`;

html = html.replace(originalLogic, badBlock);

// Now fix renderSavings to sort by date
let savingsOld = `      let html = '';
      let totalSavings = 0;
      let savings = globalTransactions.filter(function(t) { return t.type === 'เงินฝาก'; });
      
      savings.forEach(function(t) {`;

let savingsNew = `      let html = '';
      let totalSavings = 0;
      let savings = globalTransactions.filter(function(t) { return t.type === 'เงินฝาก'; });
      
      // Sort savings by date (newest first)
      savings.sort((a, b) => {
        let dateA = a.date.split('/').reverse().join('');
        let dateB = b.date.split('/').reverse().join('');
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return b.id.localeCompare(a.id);
      });
      
      savings.forEach(function(t) {`;

html = html.replace(savingsOld, savingsNew);

fs.writeFileSync('index.html', html);
console.log('Fixed renderReportsTab sorting and added sorting to renderSavings!');
