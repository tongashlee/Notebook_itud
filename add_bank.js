const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Bank select to the savingsForm
let formHtmlOld = `<div class="col-md-5">
                <label class="small fw-bold text-muted mb-1">รายละเอียด/หมายเหตุ</label>
                <input type="text" class="form-control" id="sv_note" placeholder="-">
              </div>`;
let formHtmlNew = `<div class="col-md-3">
                <label class="small fw-bold text-muted mb-1">ธนาคารที่นำเข้าฝาก</label>
                <select class="form-select" id="sv_bank" required>
                  <option value="">-- เลือกธนาคาร --</option>
                  <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ (BBL)</option>
                  <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย (KBANK)</option>
                  <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย (KTB)</option>
                  <option value="ธนาคารทหารไทยธนชาต">ธนาคารทหารไทยธนชาต (TTB)</option>
                  <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์ (SCB)</option>
                  <option value="ธนาคารกรุงศรีอยุธยา">ธนาคารกรุงศรีอยุธยา (BAY)</option>
                  <option value="ธนาคารเกียรตินาคิน">ธนาคารเกียรตินาคิน (KKP)</option>
                  <option value="ธนาคารซีไอเอ็มบีไทย">ธนาคารซีไอเอ็มบีไทย (CIMB)</option>
                  <option value="ธนาคารทิสโก้">ธนาคารทิสโก้ (TISCO)</option>
                  <option value="ธนาคารยูโอบี">ธนาคารยูโอบี (UOB)</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="small fw-bold text-muted mb-1">รายละเอียด/หมายเหตุ</label>
                <input type="text" class="form-control" id="sv_note" placeholder="-">
              </div>`;
html = html.replace(formHtmlOld, formHtmlNew);

// 2. Add Bank to submitSaving
let submitOld = `amount: Number(document.getElementById('sv_amount').value),
        note: document.getElementById('sv_note').value`;
let submitNew = `amount: Number(document.getElementById('sv_amount').value),
        bank: document.getElementById('sv_bank').value,
        note: document.getElementById('sv_note').value`;
html = html.replace(submitOld, submitNew);

// 3. Add Bank to table headers
let thOld = `<thead class="table-light text-center">
                <tr>
                  <th style="width:15%">รหัสอ้างอิง</th>
                  <th style="width:15%">วันที่ฝาก</th>
                  <th class="text-start" style="width:35%">หมายเหตุ</th>
                  <th style="width:20%">จำนวนเงินฝาก</th>
                  <th style="width:15%">จัดการ</th>
                </tr>
              </thead>`;
let thNew = `<thead class="table-light text-center">
                <tr>
                  <th style="width:10%">รหัสอ้างอิง</th>
                  <th style="width:15%">วันที่ฝาก</th>
                  <th style="width:20%">ธนาคาร</th>
                  <th class="text-start" style="width:25%">หมายเหตุ</th>
                  <th style="width:15%">จำนวนเงินฝาก</th>
                  <th style="width:15%">จัดการ</th>
                </tr>
              </thead>`;
html = html.replace(thOld, thNew);

// 4. Update renderSavings to include bank
let renderOld = `'<td class="text-start fw-medium text-muted">' + (t.note || '-') + '</td>' +`;
let renderNew = `'<td><span class="badge border border-primary text-primary">' + (t.bank || '-') + '</span></td>' +
               '<td class="text-start fw-medium text-muted">' + (t.note || '-') + '</td>' +`;
html = html.replace(renderOld, renderNew);

// 5. Update editSaving button to pass bank
let editOld = `onclick="editSaving('\\'' + t.id + '\\','\\'' + t.date + '\\',' + t.amount + ','\\'' + (t.note || '') + '\\')"`;
let editNew = `onclick="editSaving('\\'' + t.id + '\\','\\'' + t.date + '\\',' + t.amount + ','\\'' + (t.note || '') + '\\', '\\'' + (t.bank || '') + '\\')"`;
html = html.replace(editOld, editNew);

// 6. Update editSaving function signature and setting value
let editFuncOld = `function editSaving(id, date, amount, note) {
      document.getElementById('sv_id').value = id;
      document.getElementById('sv_date').value = date.split('/').reverse().join('-');
      document.getElementById('sv_amount').value = amount;
      document.getElementById('sv_note').value = note;
    }`;
let editFuncNew = `function editSaving(id, date, amount, note, bank) {
      document.getElementById('sv_id').value = id;
      document.getElementById('sv_date').value = date.split('/').reverse().join('-');
      document.getElementById('sv_amount').value = amount;
      document.getElementById('sv_note').value = note;
      document.getElementById('sv_bank').value = bank || '';
    }`;
html = html.replace(editFuncOld, editFuncNew);

// 7. Update resetSavingForm to clear bank
let resetOld = `document.getElementById('sv_note').value = '';`;
let resetNew = `document.getElementById('sv_note').value = '';
      document.getElementById('sv_bank').value = '';`;
html = html.replace(resetOld, resetNew);

// 8. Make mapTransaction include bank (if there's a mapTransaction function. wait, let's search for it first).
// We'll replace it inside getAllTransactions if mapTransaction doesn't exist.
let getAllTxOld = `note: t.note`;
let getAllTxNew = `note: t.note, bank: t.bank`;
if (html.includes(getAllTxOld)) {
    html = html.replace(getAllTxOld, getAllTxNew);
} else {
    // try finding where t.note is mapped
    console.log("Could not find note mapping for bank!");
}

fs.writeFileSync('index.html', html);
console.log('Bank field added to index.html successfully!');
