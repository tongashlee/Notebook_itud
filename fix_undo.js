const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The block that was accidentally added
let badBlock = `      // เรียงจากใหม่ไปเก่า และตัดรายการที่ถูกยกเลิก/ตีกลับออก
      let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => {
        let dateA = (a.date || '').split('/').reverse().join('');
        let dateB = (b.date || '').split('/').reverse().join('');
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        let idA = a.receiptId || '';
        let idB = b.receiptId || '';
        return idB.localeCompare(idA);
      });`;

// Remove the one accidentally placed near printCustomInvoice (usually near the end)
let lastIdx = html.lastIndexOf(badBlock);
if (lastIdx !== -1) {
  html = html.substring(0, lastIdx) + html.substring(lastIdx + badBlock.length);
  html = html.replace(/\n\n    }\n\n    function printCustomInvoice/g, '\n    }\n\n    function printCustomInvoice');
}

// The old logic that we actually wanted to replace in renderReportsTab
let oldLogic = `      // เรียงจากใหม่ไปเก่า และตัดรายการที่ถูกยกเลิก/ตีกลับออก
      let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => {
        let dateA = a.date.split('/').reverse().join('');
        let dateB = b.date.split('/').reverse().join('');
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return b.receiptId.localeCompare(a.receiptId);
      });`;

html = html.replace(oldLogic, badBlock);

fs.writeFileSync('index.html', html);
console.log('Fixed renderReportsTab sorting SAFELY');
