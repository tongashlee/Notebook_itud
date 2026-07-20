const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let editRegex = /function editSaving\(id, dateStr, amount, note\) \{[\s\S]*?document\.getElementById\('sv_note'\)\.value = \(note && note !== '-'\) \? note : '';/g;
let editNew = `function editSaving(id, dateStr, amount, note, bank) {
      document.getElementById('sv_id').value = id;
      var parts = dateStr.split('/');
      if (parts.length === 3) {
        document.getElementById('sv_date').value = parts[2] + '-' + parts[1] + '-' + parts[0];
      }
      document.getElementById('sv_amount').value = amount;
      document.getElementById('sv_note').value = (note && note !== '-') ? note : '';
      if(document.getElementById('sv_bank')) {
          document.getElementById('sv_bank').value = bank || '';
      }`;

html = html.replace(editRegex, editNew);

let resetRegex = /function resetSavingForm\(\) \{[\s\S]*?document\.getElementById\('sv_note'\)\.value = '';/g;
let resetNew = `function resetSavingForm() {
      document.getElementById('sv_id').value = '';
      document.getElementById('sv_date').value = '';
      document.getElementById('sv_amount').value = '';
      document.getElementById('sv_note').value = '';
      if(document.getElementById('sv_bank')) {
          document.getElementById('sv_bank').value = '';
      }`;

html = html.replace(resetRegex, resetNew);

fs.writeFileSync('index.html', html);
console.log('Fixed editSaving and resetSavingForm');
