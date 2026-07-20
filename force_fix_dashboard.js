const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The replacement for renderSavings
let renderStart = html.indexOf('function renderSavings() {');
let renderEnd = html.indexOf('document.getElementById(\'savingsTableBody\').innerHTML = html', renderStart);

if (renderStart !== -1 && renderEnd !== -1) {
    let renderEndFull = html.indexOf(';', renderEnd) + 1;
    let oldRender = html.substring(renderStart, renderEndFull);
    
    // There are some extra lines below the innerHTML assignment in the old code that need to be captured and replaced
    let nextEnd = html.indexOf('}', renderEndFull);
    oldRender = html.substring(renderStart, nextEnd + 1);

    let newRender = `function renderSavings() {
      let html = '';
      let totalSavings = 0;
      let savings = globalTransactions.filter(function(t) { return t.type === 'เงินฝาก'; });
      
      // Calculate bank totals
      let bankTotals = {};
      
      // Sort savings by date (newest first)
      savings.sort((a, b) => {
        let dateA = a.date.split('/').reverse().join('');
        let dateB = b.date.split('/').reverse().join('');
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return b.id.localeCompare(a.id);
      });
      
      savings.forEach(function(t) {
        totalSavings += Number(t.amount);
        let bankName = t.bank || 'ไม่ระบุธนาคาร';
        if (!bankTotals[bankName]) bankTotals[bankName] = 0;
        bankTotals[bankName] += Number(t.amount);
        
        let displayMonth = t.note || '-';
        if(displayMonth !== '-' && displayMonth.includes('-')) {
            // Format YYYY-MM to Month YYYY
            let parts = displayMonth.split('-');
            if(parts.length === 2) {
                let months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                displayMonth = months[parseInt(parts[1])-1] + ' ' + parts[0];
            }
        }
        
        let actionButtons = '<button class="btn btn-xs btn-warning px-2 py-1 small btn-sm me-1" onclick="editSaving(\\'' + t.id + '\\',\\'' + t.date + '\\',' + t.amount + ',\\'' + (t.note || '') + '\\', \\'' + (t.bank || '') + '\\')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="btn btn-xs btn-danger px-2 py-1 small btn-sm" onclick="deleteSavingConfirm(\\'' + t.id + '\\')" title="ลบ"><i class="fa-solid fa-trash"></i></button>';
        html += '<tr>' +
               '<td><span class="badge bg-dark" style="font-size:0.75rem;">' + t.id + '</span></td>' +
               '<td>' + t.date + '</td>' +
               '<td><span class="badge border border-primary text-primary">' + (t.bank || '-') + '</span></td>' +
               '<td class="text-start fw-medium text-muted">' + displayMonth + '</td>' +
               '<td class="fw-bold text-success">\\u0e3f' + fmtMoney(t.amount) + '</td>' +
               '<td>' + actionButtons + '</td>' +
            '</tr>';
      });
      
      document.getElementById('savingsTableBody').innerHTML = html || '<tr><td colspan="6" class="text-muted text-center py-3">ยังไม่มีประวัติการฝากเงิน</td></tr>';
      
      // Update Dashboard Cards
      document.getElementById('totalSavingsValue').innerText = '฿' + totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 });
      
      let dashboardContainer = document.getElementById('savingsDashboardCards');
      if(dashboardContainer) {
          // Keep the first card (Total)
          let totalCardHtml = \`<div class="col-md-4 mb-3">
            <div class="stat-card bg-white px-3 py-4 border-start border-warning border-4 shadow-sm h-100">
              <h6>ยอดเงินฝากสะสมรวม</h6>
              <h3 class="text-warning fw-bold m-0">฿\${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <i class="fa-solid fa-piggy-bank bg-icon"></i>
            </div>
          </div>\`;
          
          let bankCardsHtml = '';
          for (let bank in bankTotals) {
              if (bankTotals[bank] > 0) {
                  let bankIcon = 'fa-building-columns';
                  let borderColor = 'border-info';
                  if(bank.includes('กสิกร')) { borderColor = 'border-success'; }
                  else if(bank.includes('ไทยพาณิชย์')) { borderColor = 'border-primary'; }
                  else if(bank.includes('กรุงเทพ')) { borderColor = 'border-primary'; }
                  else if(bank.includes('กรุงศรี')) { borderColor = 'border-warning'; }
                  else if(bank.includes('ออมสิน')) { borderColor = 'border-danger'; }
                  
                  bankCardsHtml += \`<div class="col-md-4 mb-3">
                    <div class="stat-card bg-white px-3 py-4 border-start \${borderColor} border-4 shadow-sm h-100">
                      <h6>\${bank}</h6>
                      <h3 class="text-dark fw-bold m-0">฿\${bankTotals[bank].toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                      <i class="fa-solid \${bankIcon} bg-icon" style="opacity: 0.05;"></i>
                    </div>
                  </div>\`;
              }
          }
          dashboardContainer.innerHTML = totalCardHtml + bankCardsHtml;
      }
    }`;
      
    html = html.replace(oldRender, newRender);
    fs.writeFileSync('index.html', html);
    console.log('Replaced renderSavings logic successfully!');
} else {
    console.log('Could not find renderSavings');
}
