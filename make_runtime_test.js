const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Extract all JS and mock the DOM to test renderReportsTab
let regex = /<script>([\s\S]*?)<\/script>/g;
let scripts = [];
let match;
while ((match = regex.exec(html)) !== null) {
  scripts.push(match[1]);
}

let mockDomJs = `
const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
global.document = dom.window.document;
global.window = dom.window;

global.globalSales = [{
  receiptId: 'INV-1', status: 'COMPLETED', createdAt: '2026-07-20T10:00:00Z', date: '20/07/2026', qty: 1, totalCost: 100, subTotal: 150, profit: 50, shippingCost: 0, depositRemaining: 0, paymentMethod: 'CASH', cusName: 'Test Name',
  productName: 'Test Product 15\\\\' screen'
}];
global.globalProducts = [];
global.globalTransactions = [];

// Evaluate the app scripts
try {
  eval(\`${scripts[1].replace(/const /g, 'var ').replace(/let /g, 'var ')}\`);
  
  // Now run the function
  renderReportsTab();
  console.log('renderReportsTab completed successfully!');
  console.log('HTML Output:', document.getElementById('salesHistoryData').innerHTML.substring(0, 100) + '...');
} catch(e) {
  console.error('RUNTIME ERROR:', e);
}
`;
fs.writeFileSync('_test_runtime.js', mockDomJs);
