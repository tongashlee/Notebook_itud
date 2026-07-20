const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
let regex = /<script>([\s\S]*?)<\/script>/g;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
  count++;
  if (count === 2) {
    let js = match[1];
    
    let mockJs = `
      // MOCK BROWSER ENVIRONMENT
      let globalSales = [{
        receiptId: 'INV-1', status: 'COMPLETED', createdAt: '2026-07-20T10:00:00Z', date: '20/07/2026', qty: 1, totalCost: 100, subTotal: 150, profit: 50, shippingCost: 0, depositRemaining: 0, paymentMethod: 'CASH', cusName: 'Test'
      }];
      let globalProducts = [];
      let globalTransactions = [];
      
      let document = {
        getElementById: () => ({ value: '2026-07', innerHTML: '', innerText: '' }),
        querySelectorAll: () => []
      };
      
      function updateSelectedCount() {}
      let Swal = { fire: console.log, showLoading: console.log };
      
      ` + js + `
      
      try {
        renderReportsTab();
        console.log('renderReportsTab ran successfully!');
      } catch(e) {
        console.error('Error in renderReportsTab:', e);
      }
    `;
    
    fs.writeFileSync('_test_render.js', mockJs);
    break;
  }
}
