const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Restore printProductDetail
let brokenPrint = '    function printProductDetail(productId) {\n      let p = globalProducts.find(x => String(x.id) === String(productId));\n      profitEl.className';
if(html.includes(brokenPrint)) {
    let fixedPrint = `    function printProductDetail(productId) {
      let p = globalProducts.find(x => String(x.id) === String(productId));
      if (!p) { Swal.fire('ไม่พบข้อมูล', 'ไม่พบข้อมูลสินค้าที่ต้องการพิมพ์', 'error'); return; }

      let today = new Date();
      let printDate = \`\${String(today.getDate()).padStart(2,'0')}/\${String(today.getMonth()+1).padStart(2,'0')}/\${today.getFullYear()}\`;
      let dateStr = p.updatedAt ? formatDateToTH(p.updatedAt.split('T')[0]) : "-";
      let profitPerUnit = p.actualPrice - p.cost;
      let totalCostValue = p.cost * p.stock;
      let totalSellValue = p.actualPrice * p.stock;

      document.getElementById('pdPrintDate').innerText = printDate;
      document.getElementById('pdProductName').innerText = p.name;
      document.getElementById('pdBrand').innerText = p.brand;
      document.getElementById('pdProductId').innerText = p.id;
      document.getElementById('pdDate').innerText = dateStr;
      document.getElementById('pdCost').innerText = '฿' + p.cost.toLocaleString();
      document.getElementById('pdSellPrice').innerText = '฿' + p.actualPrice.toLocaleString();

      let profitEl = document.getElementById('pdProfitPerUnit');
      profitEl.innerText = '฿' + profitPerUnit.toLocaleString();
      profitEl.className`;
    html = html.replace(brokenPrint, fixedPrint);
    console.log('Restored printProductDetail');
}

// Restore Dashboard calculations
let brokenDash = '          bestBrand = b;\n        }\n      globalSales.forEach(s => {';
if(html.includes(brokenDash)) {
    let fixedDash = `          bestBrand = b;
        }
      }

      document.getElementById('dashSales').innerText = "฿" + mSales.toLocaleString();
      document.getElementById('dashProfit').innerText = "฿" + mProfit.toLocaleString();
      document.getElementById('dashQty').innerText = mQty + " เครื่อง";
      document.getElementById('dashBestBrand').innerText = bestBrand !== "-" ? bestBrand : "-";
      document.getElementById('dashYearSales').innerText = "฿" + ySales.toLocaleString();
      document.getElementById('dashStock').innerText = totalStock + " ชิ้น";
      document.getElementById('dashInventoryValue').innerText = "฿" + invValue.toLocaleString();
      document.getElementById('dashRecentSales').innerHTML = recentHtml || '<tr><td colspan="4" class="text-muted">ไม่มีรายการขายในเดือนนี้</td></tr>';

      // คำนวณยอดค้างชำระ COD และมัดจำ
      let codPending = 0, depositPending = 0;
      globalSales.forEach(s => {`;
    html = html.replace(brokenDash, fixedDash);
    console.log('Restored Dashboard calculations');
}

// -------------------------------------------------------------
// NOW FIX THE TABLE COLUMNS PROPERLY!
// -------------------------------------------------------------
let oldRow = `              <td class="text-primary fw-bold">฿\${Number(s.totalSales).toLocaleString()}</td>
              <td>\${s.shippingCost > 0 ? \`<span class="text-danger">-฿\${s.shippingCost.toLocaleString()}</span>\` : "-"}</td>
              <td>\${depositCol}</td>
              <td>\${remainCol}</td>
              <td class="text-start">\${s.cusName}</td>`;
              
let newRow = `              <td class="text-primary fw-bold">฿\${Number(s.totalSales).toLocaleString()}</td>
              <td class="text-danger">-฿\${Number(s.qty > 0 ? (s.totalCost / s.qty) : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              <td class="text-success fw-bold">฿\${Number(s.qty > 0 ? (s.profit / s.qty) : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              <td>\${s.shippingCost > 0 ? \`<span class="text-danger">-฿\${s.shippingCost.toLocaleString()}</span>\` : "-"}</td>
              <td>\${depositCol}</td>
              <td>\${remainCol}</td>
              <td class="text-start">\${s.cusName || "-"}</td>`;

if(html.includes(oldRow)) {
    html = html.replace(oldRow, newRow);
    console.log('Fixed table columns successfully!');
} else {
    console.log('Could not find oldRow. Looking for close matches...');
    let searchStr = '<td>${s.shippingCost > 0 ? `<span class="text-danger">-฿${s.shippingCost.toLocaleString()}</span>` : "-"}</td>';
    if(html.includes(searchStr)) {
        console.log('Found it dynamically! Replacing...');
        let parts = html.split(searchStr);
        let before = parts[0];
        let after = parts[1];
        let insertBefore = searchStr.substring(0, 0); // we will prepend our new TDs to this string
        
        let newTds = `\n              <td class="text-danger">-฿\${Number(s.qty > 0 ? (s.totalCost / s.qty) : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>\n              <td class="text-success fw-bold">฿\${Number(s.qty > 0 ? (s.profit / s.qty) : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>\n              `;
        
        html = before + newTds + searchStr + after;
        console.log('Dynamic insert complete!');
    } else {
        console.log('Could not find the shipping cost cell either.');
    }
}

fs.writeFileSync('index.html', html);
console.log('Done.');
