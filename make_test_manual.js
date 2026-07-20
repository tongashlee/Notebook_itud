const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
let match = html.match(/<script>([\s\S]*?)<\/script>/g);
let appJs = match[1].replace('<script>', '').replace('</script>', '');

let mockDOM = `
let globalSales = [{
  receiptId: 'INV-1', status: 'COMPLETED', createdAt: '2026-07-20T10:00:00Z', date: '20/07/2026', qty: 1, totalCost: 100, subTotal: 150, profit: 50, shippingCost: 0, depositRemaining: 0, paymentMethod: 'CASH', cusName: 'Test Name',
  productName: 'Test Product'
}, {
  receiptId: null, status: 'COMPLETED', createdAt: '2026-07-20T10:00:00Z', date: '20/07/2026', qty: 1, totalCost: 100, subTotal: 150, profit: 50, shippingCost: 0, depositRemaining: 0, paymentMethod: 'CASH', cusName: 'Test Name',
  productName: 'Test Product 2'
}];
let globalProducts = [];
let globalTransactions = [];

let document = {
  getElementById: (id) => {
    return {
      value: '2026-07',
      innerText: '',
      innerHTML: '',
      classList: { add: ()=>{}, remove: ()=>{} },
      style: {}
    };
  },
  querySelectorAll: () => {
    return { forEach: () => {}, length: 0 };
  }
};
let Swal = { fire: () => {} };
let window = {};
`;

// Replace the global var declarations in appJs so they don't throw syntax errors
appJs = appJs.replace(/let globalProducts = \[\], globalSales = \[\], globalTransactions = \[\];/, '');

fs.writeFileSync('_test_manual.js', mockDOM + appJs + '\n\nrenderReportsTab();\nconsole.log("SUCCESS!");');
