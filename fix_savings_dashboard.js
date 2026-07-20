const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// --- 1. Change sv_note input type to "month" ---
let svNoteRegex = /<label class=\"small fw-bold text-muted mb-1\">รายละเอียด \/ หมายเหตุ<\/label>\s*<input type=\"text\" class=\"form-control\" id=\"sv_note\" placeholder=\"เช่น ฝากประจำเดือน\.\.\.\">/g;
let svNoteNew = `<label class="small fw-bold text-muted mb-1">เงินฝากประจำเดือน</label>
                  <input type="month" class="form-control" id="sv_note">`;
html = html.replace(svNoteRegex, svNoteNew);

// What if the regex fails because of my previous modifications? 
// Let's also do a more generic replacement just in case.
html = html.replace(
  '<label class="small fw-bold text-muted mb-1">รายละเอียด / หมายเหตุ</label>\n                  <input type="text" class="form-control" id="sv_note" placeholder="เช่น ฝากประจำเดือน...">',
  `<label class="small fw-bold text-muted mb-1">เงินฝากประจำเดือน</label>
                  <input type="month" class="form-control" id="sv_note">`
);

// --- 2. Fix the Table Header ---
// We need to change the table header for "รายละเอียด" to "เงินฝากประจำเดือน"
let thRegex = /<th class=\"text-start\">รายละเอียด<\/th>/g;
html = html.replace(thRegex, '<th class="text-start">เงินฝากประจำเดือน</th>');

let thRegex2 = /<th>รายละเอียด<\/th>/g;
html = html.replace(thRegex2, '<th>เงินฝากประจำเดือน</th>');

// --- 3. Fix the Dashboard Area ---
// Before: <div class="row mb-4"> ... </div>
// We need to give it an ID so we can dynamically inject the bank cards.
let dashboardRegex = /<div class=\"row mb-4\">\s*<div class=\"col-md-4\">\s*<div class=\"stat-card bg-white px-3 py-4 border-start border-warning border-4 shadow-sm\">\s*<h6>ยอดเงินฝากสะสมรวม<\/h6>\s*<h3 class=\"text-warning fw-bold m-0\" id=\"totalSavingsValue\">฿0<\/h3>\s*<i class=\"fa-solid fa-piggy-bank bg-icon\"><\/i>\s*<\/div>\s*<\/div>\s*<\/div>/g;

let dashboardNew = `<div class="row mb-4" id="savingsDashboardCards">
          <div class="col-md-4 mb-3">
            <div class="stat-card bg-white px-3 py-4 border-start border-warning border-4 shadow-sm h-100">
              <h6>ยอดเงินฝากสะสมรวม</h6>
              <h3 class="text-warning fw-bold m-0" id="totalSavingsValue">฿0</h3>
              <i class="fa-solid fa-piggy-bank bg-icon"></i>
            </div>
          </div>
        </div>`;

if(html.match(dashboardRegex)) {
    html = html.replace(dashboardRegex, dashboardNew);
} else {
    // try finding the block manually
    let dStart = html.indexOf('<div class="row mb-4">');
    let dEnd = html.indexOf('<div class="card p-4 border-top border-warning border-4 mb-4">');
    if(dStart !== -1 && dEnd !== -1) {
        html = html.substring(0, dStart) + dashboardNew + '\n        ' + html.substring(dEnd);
    }
}

// --- 4. Rewrite renderSavings() completely ---
let renderStart = html.indexOf('function renderSavings() {');
let renderEnd = html.indexOf('document.getElementById(\'savingsTableBody\').innerHTML = html;', renderStart);
if (renderStart !== -1 && renderEnd !== -1) {
    let oldRender = html.substring(renderStart, renderEnd + 61);
    
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
      document.getElementById('totalSavingsValue').innerText = '฿' + totalSavings.toLocaleString();
      
      let dashboardContainer = document.getElementById('savingsDashboardCards');
      if(dashboardContainer) {
          // Keep the first card (Total)
          let totalCardHtml = \`<div class="col-md-4 mb-3">
            <div class="stat-card bg-white px-3 py-4 border-start border-warning border-4 shadow-sm h-100">
              <h6>ยอดเงินฝากสะสมรวม</h6>
              <h3 class="text-warning fw-bold m-0">฿\${totalSavings.toLocaleString()}</h3>
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
                  
                  bankCardsHtml += \`<div class="col-md-4 mb-3">
                    <div class="stat-card bg-white px-3 py-4 border-start \${borderColor} border-4 shadow-sm h-100">
                      <h6>\${bank}</h6>
                      <h3 class="text-dark fw-bold m-0">฿\${bankTotals[bank].toLocaleString()}</h3>
                      <i class="fa-solid \${bankIcon} bg-icon" style="opacity: 0.05;"></i>
                    </div>
                  </div>\`;
              }
          }
          dashboardContainer.innerHTML = totalCardHtml + bankCardsHtml;
      }`;
      
    html = html.replace(oldRender, newRender);
}

fs.writeFileSync('index.html', html);
console.log('Features implemented!');
