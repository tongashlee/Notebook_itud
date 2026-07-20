const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The exact HTML from the file (taken from my Select-String output)
let formOld = `<div class="col-md-5">
                  <label class="small fw-bold text-muted mb-1">รายละเอียด / หมายเหตุ</label>
                  <input type="text" class="form-control" id="sv_note" placeholder="เช่น ฝากประจำเดือน...">
                </div>`;

let formNew = `<div class="col-md-3">
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
                  <label class="small fw-bold text-muted mb-1">รายละเอียด / หมายเหตุ</label>
                  <input type="text" class="form-control" id="sv_note" placeholder="เช่น ฝากประจำเดือน...">
                </div>`;

html = html.replace(formOld, formNew);

// Now fix the table headers. Based on the screenshot, the headers are:
// รหัสอ้างอิง | วันที่ฝาก | รายละเอียด | จำนวนเงินฝาก | จัดการ
// Let's replace the exact HTML for the savings table headers.
let savingsTableStart = html.indexOf('<div class="table-responsive">', html.indexOf('ประวัติการฝากเงิน'));
let savingsTableEnd = html.indexOf('<tbody>', savingsTableStart);
let savingsTableHead = html.substring(savingsTableStart, savingsTableEnd);

// Replace "รายละเอียด" with "ธนาคาร" and "รายละเอียด"
let newSavingsTableHead = savingsTableHead.replace(
  '<th class="text-start">รายละเอียด</th>',
  '<th>ธนาคาร</th><th class="text-start">รายละเอียด</th>'
);
if(newSavingsTableHead === savingsTableHead) {
    // try finding it without class
    newSavingsTableHead = savingsTableHead.replace(
        '<th>รายละเอียด</th>',
        '<th>ธนาคาร</th>\n                  <th>รายละเอียด</th>'
    );
}
html = html.replace(savingsTableHead, newSavingsTableHead);

// And fix renderSavings row HTML
let renderSavingsStart = html.indexOf('function renderSavings()');
let renderSavingsEnd = html.indexOf('document.getElementById(\'savingsTableBody\')', renderSavingsStart);
let renderSavingsFunc = html.substring(renderSavingsStart, renderSavingsEnd);

let rowOld1 = `'<td class="text-start fw-medium text-muted">' + (t.note || '-') + '</td>' +`;
let rowNew1 = `'<td><span class="badge border border-primary text-primary">' + (t.bank || '-') + '</span></td>' +
               '<td class="text-start fw-medium text-muted">' + (t.note || '-') + '</td>' +`;
let newRenderSavingsFunc = renderSavingsFunc.replace(rowOld1, rowNew1);

// What if my previous replace ALREADY modified renderSavings?
// If it has '<td class="text-start fw-medium text-muted">', and NO t.bank, we apply it.
if (!newRenderSavingsFunc.includes('t.bank')) {
    // the replace failed, let's just use string finding
    let insertIndex = newRenderSavingsFunc.indexOf('<td class="text-start fw-medium text-muted">');
    if(insertIndex !== -1) {
       newRenderSavingsFunc = newRenderSavingsFunc.substring(0, insertIndex - 1) + 
          `'<td><span class="badge border border-primary text-primary">' + (t.bank || '-') + '</span></td>' +\n               '` +
          newRenderSavingsFunc.substring(insertIndex);
    }
}
html = html.replace(renderSavingsFunc, newRenderSavingsFunc);

fs.writeFileSync('index.html', html);
console.log('Fixed UI successfully!');
