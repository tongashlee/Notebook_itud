const fs = require('fs');

let html = fs.readFileSync('c:/Users/Dimondz/Documents/notebookitud/index.html', 'utf8');

const uiHtml = `
            <!-- Trade-in Section within Sale -->
            <div class="row g-2 mb-3">
              <div class="col-12">
                <div class="form-check form-switch p-3 bg-light rounded border border-purple">
                  <input class="form-check-input ms-0 me-2" type="checkbox" id="hasTradeIn" onchange="toggleTradeIn()">
                  <label class="form-check-label fw-bold text-purple" for="hasTradeIn"> มีสินค้าเทิร์นหรือไม่? (ลูกค้านำเครื่องเก่ามาเทิร์น)</label>
                </div>
              </div>
            </div>

            <div id="tradeInBox" class="p-3 mb-3 rounded" style="display:none; background-color:#faf5ff; border: 1px solid #c4b5fd;">
              <h6 class="fw-bold text-purple mb-3"><i class="fa-solid fa-laptop-medical"></i> รายละเอียดเครื่องเทิร์น</h6>
              <div class="row g-2">
                <div class="col-md-5">
                  <label class="small fw-bold text-muted">ชื่อ/รุ่น เครื่องที่นำมาเทิร์น</label>
                  <input type="text" class="form-control" id="tradeInName" placeholder="เช่น iPhone 13 Pro Max">
                </div>
                <div class="col-md-4">
                  <label class="small fw-bold text-muted">ยี่ห้อ (Brand)</label>
                  <input type="text" class="form-control" id="tradeInBrand" placeholder="เช่น Apple">
                </div>
                <div class="col-md-3">
                  <label class="small fw-bold text-muted">ราคาตีเทิร์น (ส่วนลด)</label>
                  <input type="number" class="form-control text-danger fw-bold" id="tradeInValue" value="0" min="0" step="0.01" oninput="calcVAT()">
                </div>
              </div>
            </div>
`;

const netHtml = `
              <div class="col-md-4 offset-md-8 mt-2" id="netTotalBox" style="display:none;">
                <label class="small fw-bold text-danger">หักส่วนลดเทิร์นสินค้า</label>
                <input type="text" class="form-control bg-light text-danger fw-bold" id="saleTradeInDisplay" readonly value="0.00">
                <label class="small fw-bold text-success mt-2">ยอดสุทธิที่ต้องชำระ (Net)</label>
                <input type="text" class="form-control bg-success-subtle text-success fw-bold fs-5" id="saleNetTotal" readonly value="0.00">
              </div>
`;

// Inject uiHtml before the row containing "saleShippingCost"
let shippingIndex = html.indexOf('id="saleShippingCost"');
let rowStart = html.lastIndexOf('<div class="row g-2 mb-3">', shippingIndex);
if (rowStart !== -1) {
    html = html.substring(0, rowStart) + uiHtml + html.substring(rowStart);
} else {
    console.log("Could not find rowStart for shipping");
}

// Inject netHtml after "ยอดรวมทั้งสิ้น (รวม VAT)"
let totalIndex = html.indexOf('ยอดรวมทั้งสิ้น (รวม VAT)');
let totalEnd = html.indexOf('</div>', totalIndex);
if (totalEnd !== -1) {
    html = html.substring(0, totalEnd + 6) + netHtml + html.substring(totalEnd + 6);
} else {
    console.log("Could not find totalEnd");
}

// Let's also inject the Javascript functions
const jsCode = `
// ==================== Trade-in Sale Functions ====================
function toggleTradeIn() {
    let hasTradeIn = document.getElementById('hasTradeIn').checked;
    document.getElementById('tradeInBox').style.display = hasTradeIn ? 'block' : 'none';
    document.getElementById('netTotalBox').style.display = hasTradeIn ? 'block' : 'none';
    if (!hasTradeIn) {
        document.getElementById('tradeInName').value = '';
        document.getElementById('tradeInBrand').value = '';
        document.getElementById('tradeInValue').value = 0;
    }
    calcVAT();
}

// Intercept calcVAT to update Net Total
const originalCalcVAT = calcVAT;
calcVAT = function() {
    // Call the original function to calculate subTotal, VAT, totalSales
    // Wait, since calcVAT is redefined, let's just do the whole thing to be safe.
    let productOpt = document.getElementById('saleProduct').options[document.getElementById('saleProduct').selectedIndex];
    if (!productOpt || productOpt.value === "") return;
    let product = JSON.parse(decodeURIComponent(productOpt.getAttribute('data-product')));
    let qty = Number(document.getElementById('saleQty').value);
    let customPrice = Number(document.getElementById('saleCustomPrice').value);
    
    // Reverse VAT calculation
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

    document.getElementById('saleSubTotal').value = subTotal.toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('saleVat').value = vat.toLocaleString(undefined, {maximumFractionDigits: 2});
    document.getElementById('saleTotal').value = totalSales.toLocaleString(undefined, {maximumFractionDigits: 2});

    // Handle Trade-in
    let hasTradeIn = document.getElementById('hasTradeIn') && document.getElementById('hasTradeIn').checked;
    let tradeInValue = hasTradeIn ? Number(document.getElementById('tradeInValue').value) || 0 : 0;
    let netTotal = totalSales - tradeInValue;

    if (document.getElementById('saleTradeInDisplay')) {
        document.getElementById('saleTradeInDisplay').value = tradeInValue.toLocaleString(undefined, {maximumFractionDigits: 2});
        document.getElementById('saleNetTotal').value = netTotal.toLocaleString(undefined, {maximumFractionDigits: 2});
    }

    // Default payment to netTotal
    document.getElementById('salePayAmount').value = netTotal > 0 ? netTotal : 0;
};
`;

let jsIndex = html.indexOf('function submitSale(e)');
if (jsIndex !== -1) {
    html = html.substring(0, jsIndex) + jsCode + html.substring(jsIndex);
}

// Modify submitSale to handle Trade-in logic
const oldSubmitSale = /let subTotal = customPrice \* qty;([\s\S]*?)let isVat = document\.getElementById\('isVatEnabled'\) \? document\.getElementById\('isVatEnabled'\)\.checked : true;([\s\S]*?)let vat = isVat \? subTotal \* 0\.07 : 0;\s+let totalSales = subTotal \+ vat;/;

const newSubmitSale = `
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
      let totalCost = product.cost * qty;
      let shippingCost = Number(document.getElementById('saleShippingCost').value) || 0;
      let profit = subTotal - totalCost - shippingCost;

      // Handle Trade-in processing
      let hasTradeIn = document.getElementById('hasTradeIn') && document.getElementById('hasTradeIn').checked;
      let tradeInValue = 0;
      if (hasTradeIn) {
          tradeInValue = Number(document.getElementById('tradeInValue').value) || 0;
          let tradeInName = document.getElementById('tradeInName').value.trim() || 'สินค้ารับเทิร์น';
          let tradeInBrand = document.getElementById('tradeInBrand').value.trim() || '-';
          
          // Deduct trade-in value from profit? No, profit is still based on new product.
          // Wait, the gross sale is totalSales, but cash received is totalSales - tradeInValue.
          // In an accounting sense, the value received is cash + trade-in product (worth tradeInValue).
          // So gross revenue doesn't change! Profit doesn't change!
          // We just need to ADD the trade-in product to the inventory.
          let newProductId = 'P' + Date.now() + Math.floor(Math.random()*1000);
          globalProducts.push({
              id: newProductId,
              name: '[เทิร์น] ' + tradeInName,
              brand: tradeInBrand,
              cost: tradeInValue,
              price: tradeInValue, // Can be updated later by shop
              stock: 1
          });
      }
`;

html = html.replace(oldSubmitSale, newSubmitSale);

fs.writeFileSync('c:/Users/Dimondz/Documents/notebookitud/index.html', html, 'utf8');
console.log("UI and JS Injected");
