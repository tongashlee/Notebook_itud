const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let oldRow = `              <td class="text-primary fw-bold">฿\${Number(s.totalSales).toLocaleString()}</td>
              <td>\${s.shippingCost > 0 ? \`<span class="text-danger">-฿\${s.shippingCost.toLocaleString()}</span>\` : "-"}</td>
              <td>\${depositCol}</td>
              <td>\${remainCol}</td>
              <td class="text-start">\${s.cusName}</td>`;

let newRow = `              <td class="text-primary fw-bold">฿\${Number(s.totalSales).toLocaleString()}</td>
              <td class="text-danger">-฿\${Number(s.qty > 0 ? (s.totalCost / s.qty) : 0).toLocaleString()}</td>
              <td class="text-success fw-bold">฿\${Number(s.qty > 0 ? (s.profit / s.qty) : 0).toLocaleString()}</td>
              <td>\${s.shippingCost > 0 ? \`<span class="text-danger">-฿\${s.shippingCost.toLocaleString()}</span>\` : "-"}</td>
              <td>\${depositCol}</td>
              <td>\${remainCol}</td>
              <td class="text-start">\${s.cusName || "-"}</td>`;

html = html.replace(oldRow, newRow);

fs.writeFileSync('index.html', html);
console.log("Fixed table columns in reportsTab");
