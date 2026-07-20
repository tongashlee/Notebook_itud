const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix 1: Form UI
let formRegex = /<div class=\"col-md-5\">\s*<label class=\"small fw-bold text-muted mb-1\">รายละเอียด \/ หมายเหตุ<\/label>\s*<input type=\"text\" class=\"form-control\" id=\"sv_note\" placeholder=\"เช่น ฝากประจำเดือน\.\.\.\">\s*<\/div>/g;

let formNew = `<div class="col-md-3">
                  <label class="small fw-bold text-muted mb-1">ธนาคารที่นำเข้าฝาก</label>
                  <select class="form-select" id="sv_bank" required>
                    <option value="">-- เลือกธนาคาร --</option>
                    <option value="ธนาคารกรุงเทพ">ธนาคารกรุงเทพ</option>
                    <option value="ธนาคารกสิกรไทย">ธนาคารกสิกรไทย</option>
                    <option value="ธนาคารกรุงไทย">ธนาคารกรุงไทย</option>
                    <option value="ธนาคารทหารไทย">ธนาคารทหารไทย</option>
                    <option value="ธนาคารไทยพาณิชย์">ธนาคารไทยพาณิชย์</option>
                    <option value="ธนาคารกรุงศรีอยุธยา">ธนาคารกรุงศรีอยุธยา</option>
                    <option value="ธนาคารเกียรตินาคิน">ธนาคารเกียรตินาคิน</option>
                    <option value="ธนาคารซีไอเอ็มบีไทย">ธนาคารซีไอเอ็มบีไทย</option>
                    <option value="ธนาคารทิสโก้">ธนาคารทิสโก้</option>
                    <option value="ธนาคารธนชาต">ธนาคารธนชาต</option>
                    <option value="ธนาคารยูโอบี">ธนาคารยูโอบี</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="small fw-bold text-muted mb-1">รายละเอียด / หมายเหตุ</label>
                  <input type="text" class="form-control" id="sv_note" placeholder="เช่น ฝากประจำเดือน...">
                </div>`;

html = html.replace(formRegex, formNew);

// Fix 2: Table Header
let tableHeaderRegex = /<th class=\"text-start\">รายละเอียด<\/th>/g;
html = html.replace(tableHeaderRegex, '<th>ธนาคาร</th>\n                  <th class="text-start">รายละเอียด</th>');

// Fix 3: Table Body (renderSavings)
let tableRowRegex = /'<td class=\"text-start fw-medium text-muted\">' \+ \(t\.note \|\| '-'\) \+ '<\/td>' \+/g;
html = html.replace(tableRowRegex, `'<td><span class="badge border border-primary text-primary">' + (t.bank || '-') + '</span></td>' +\n               '<td class="text-start fw-medium text-muted">' + (t.note || '-') + '</td>' +`);

fs.writeFileSync('index.html', html);
console.log('Fixed HTML layout robustly!');
