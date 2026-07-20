const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add input field to HTML
let oldSelectHTML = `                  </select>
                </div>
                <div class="col-md-2">`;
                
let newSelectHTML = `                  </select>
                </div>
                <div class="col-md-3">
                  <label class="small fw-bold text-muted mb-1">ชื่อบัญชี / สาขา (ถ้ามี)</label>
                  <input type="text" class="form-control" id="sv_account" placeholder="เช่น บัญชีลูก, สาขาสยาม">
                </div>
                <div class="col-md-2">`;

html = html.replace(oldSelectHTML, newSelectHTML);

// 2. Modify submitSaving
let oldSubmitData = `      let txData = {
        date: document.getElementById('sv_date').value,
        type: 'เงินฝาก',
        category: 'ฝากเงินออมทรัพย์',
        amount: Number(document.getElementById('sv_amount').value),
        bank: document.getElementById('sv_bank').value,
        note: document.getElementById('sv_note').value
      };`;
      
let newSubmitData = `      let acc = document.getElementById('sv_account') ? document.getElementById('sv_account').value : '';
      let txData = {
        date: document.getElementById('sv_date').value,
        type: 'เงินฝาก',
        category: acc ? 'ฝากเงินออมทรัพย์ - ' + acc : 'ฝากเงินออมทรัพย์',
        amount: Number(document.getElementById('sv_amount').value),
        bank: document.getElementById('sv_bank').value,
        note: document.getElementById('sv_note').value
      };`;

html = html.replace(oldSubmitData, newSubmitData);

// 3. Update renderSavings to show account name and pass category
let oldActionBtns = `let actionButtons = '<button class="btn btn-xs btn-warning px-2 py-1 small btn-sm me-1" onclick="editSaving(\\'' + t.id + '\\',\\'' + t.date + '\\',' + t.amount + ',\\'' + (t.note || '') + '\\', \\'' + (t.bank || '') + '\\')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>' +`;
let newActionBtns = `let actionButtons = '<button class="btn btn-xs btn-warning px-2 py-1 small btn-sm me-1" onclick="editSaving(\\'' + t.id + '\\',\\'' + t.date + '\\',' + t.amount + ',\\'' + (t.note || '') + '\\', \\'' + (t.bank || '') + '\\', \\'' + (t.category || '') + '\\')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>' +`;
html = html.replace(oldActionBtns, newActionBtns);

let oldBankCol = `'<td><span class="badge border border-primary text-primary">' + (t.bank || '-') + '</span></td>' +`;
let newBankCol = `'<td><span class="badge border border-primary text-primary">' + (t.bank || '-') + '</span>' + (t.category && t.category.includes(' - ') ? '<br><small class="text-muted">' + t.category.split(' - ')[1] + '</small>' : '') + '</td>' +`;
html = html.replace(oldBankCol, newBankCol);

// 4. Update editSaving function signature and body
let oldEditFunc = `function editSaving(id, dateStr, amount, note, bank) {
      document.getElementById('sv_id').value = id;
      var parts = dateStr.split('/');
      if (parts.length === 3) {
        document.getElementById('sv_date').value = parts[2] + '-' + parts[1] + '-' + parts[0];
      }
      document.getElementById('sv_amount').value = amount;
      document.getElementById('sv_note').value = (note && note !== '-') ? note : '';
      if(document.getElementById('sv_bank')) {
          document.getElementById('sv_bank').value = bank || '';
      }
      document.getElementById('btnSaveSaving').className = "btn btn-primary fw-bold text-white";`;
      
let newEditFunc = `function editSaving(id, dateStr, amount, note, bank, category) {
      document.getElementById('sv_id').value = id;
      var parts = dateStr.split('/');
      if (parts.length === 3) {
        document.getElementById('sv_date').value = parts[2] + '-' + parts[1] + '-' + parts[0];
      }
      document.getElementById('sv_amount').value = amount;
      document.getElementById('sv_note').value = (note && note !== '-') ? note : '';
      if(document.getElementById('sv_bank')) {
          document.getElementById('sv_bank').value = bank || '';
      }
      if(document.getElementById('sv_account')) {
          document.getElementById('sv_account').value = (category && category.includes(' - ')) ? category.split(' - ')[1] : '';
      }
      document.getElementById('btnSaveSaving').className = "btn btn-primary fw-bold text-white";`;

html = html.replace(oldEditFunc, newEditFunc);

// 5. Update resetSavingForm to clear sv_account
let oldResetFunc = `function resetSavingForm() {
      document.getElementById('savingsForm').reset();
      document.getElementById('sv_id').value = '';
      document.getElementById('sv_date').value = new Date().toISOString().split('T')[0];`;
      
let newResetFunc = `function resetSavingForm() {
      document.getElementById('savingsForm').reset();
      document.getElementById('sv_id').value = '';
      if(document.getElementById('sv_account')) document.getElementById('sv_account').value = '';
      document.getElementById('sv_date').value = new Date().toISOString().split('T')[0];`;

html = html.replace(oldResetFunc, newResetFunc);

fs.writeFileSync('index.html', html);
console.log("Updated savings form successfully!");
