const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Try executing renderReportsTab in a sandbox
let regex = /<script>([\s\S]*?)<\/script>/g;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
  count++;
  if (count === 2) {
    let js = match[1];
    
    let mockJs = js + `
      globalSales = [{
        receiptId: 'INV-1', status: 'COMPLETED', createdAt: '2026-07-20T10:00:00Z', date: '20/07/2026', qty: 1, totalCost: 100, subTotal: 150, profit: 50, shippingCost: 0, depositRemaining: 0, paymentMethod: 'CASH', cusName: 'Test',
        productName: 'Acer 15\\' test'
      }];
      globalProducts = [];
      globalTransactions = [];
      document = {
        getElementById: (id) => {
          if (id === 'monthFilter') return { value: '2026-07' };
          return { innerHTML: '', innerText: '' };
        },
        querySelectorAll: () => []
      };
      window = {};
      Swal = { fire: console.log };
      
      try {
        renderReportsTab();
        console.log('SUCCESS');
      } catch(e) {
        console.error('ERROR:', e);
      }
    `;
    fs.writeFileSync('_test_render3.js', mockJs);
    break;
  }
}
