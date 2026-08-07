const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Fix submitSale VAT calculation (line ~2264-2270)
// Old: subTotal = customPrice * qty, vat = subTotal * 0.07, totalSales = subTotal + vat
// New: grandTotal = customPrice * qty, subTotal = grandTotal / 1.07, vat = grandTotal - subTotal, totalSales = grandTotal
const oldSubmitSale = /      let customPrice = Number\(document\.getElementById\('saleCustomPrice'\)\.value\);\r?\n      let subTotal = customPrice \* qty;\r?\n      let totalCost = product\.cost \* qty;\r?\n      let shippingCost = Number\(document\.getElementById\('saleShippingCost'\)\.value\) \|\| 0;\r?\n      let profit = subTotal - totalCost - shippingCost;\r?\n      let isVat = document\.getElementById\('isVatEnabled'\) \? document\.getElementById\('isVatEnabled'\)\.checked : true;\r?\n      let vat = isVat \? subTotal \* 0\.07 : 0;\r?\n      let totalSales = subTotal \+ vat;/;

const newSubmitSale = `      let customPrice = Number(document.getElementById('saleCustomPrice').value);
      let totalCost = product.cost * qty;
      let shippingCost = Number(document.getElementById('saleShippingCost').value) || 0;
      let isVat = document.getElementById('isVatEnabled') ? document.getElementById('isVatEnabled').checked : true;
      let grandTotalCalc = customPrice * qty;
      let subTotal, vat;
      if (isVat) {
        subTotal = grandTotalCalc / 1.07;
        vat = grandTotalCalc - subTotal;
      } else {
        subTotal = grandTotalCalc;
        vat = 0;
      }
      let totalSales = grandTotalCalc;
      let profit = subTotal - totalCost - shippingCost;`;

if (oldSubmitSale.test(html)) {
  html = html.replace(oldSubmitSale, newSubmitSale);
  console.log("Fixed submitSale VAT calculation");
} else {
  console.log("ERROR: Could not find submitSale pattern");
}

fs.writeFileSync('index.html', html, 'utf8');

// Verify
html = fs.readFileSync('index.html', 'utf8');
let count = (html.match(/subTotal \* 0\.07/g) || []).length;
console.log(`Remaining 'subTotal * 0.07': ${count} (should be 0)`);
console.log(`'grandTotalCalc / 1.07' exists: ${html.includes('grandTotalCalc / 1.07')}`);
console.log(`'subTotal / 1.07' exists: ${html.includes('subTotal / 1.07')}`);
