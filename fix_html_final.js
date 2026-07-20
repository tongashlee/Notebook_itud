const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let brokenPrintStart = html.indexOf('function printProductDetail(productId) {');
let brokenPrintEnd = html.indexOf("profitEl.className = 'fw-bold ' + (profitPerUnit >= 0 ? 'text-success' : 'text-danger');");
if(brokenPrintStart !== -1 && brokenPrintEnd !== -1) {
    let brokenPart = html.substring(brokenPrintStart, brokenPrintEnd);
    let fixedPart = `function printProductDetail(productId) {
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
      `;
    html = html.replace(brokenPart, fixedPart);
    console.log("Fixed print");
}

let dashStart = html.indexOf('          bestBrand = b;');
let dashEnd = html.indexOf('      globalSales.forEach(s => {');
if(dashStart !== -1 && dashEnd !== -1) {
    let dashPart = html.substring(dashStart, dashEnd);
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
      `;
    html = html.replace(dashPart, fixedDash);
    console.log("Fixed dash");
}

fs.writeFileSync('index.html', html);
