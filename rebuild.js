const fs = require('fs');

// 1) Read index.html (HTML part only) and test.js (JS backup)
let html = fs.readFileSync('index.html', 'utf8');
let testJs = fs.readFileSync('test.js', 'utf8');

// 2) Get HTML part (everything before the config.js script tag)
let scriptStart = html.indexOf('<script src="config.js"></script>');
if (scriptStart === -1) {
  console.error('Could not find <script src="config.js">');
  process.exit(1);
}
let htmlPart = html.substring(0, scriptStart);

// 3) Extract the JS from test.js (skip login check)
let jsStart = testJs.indexOf('    let globalProducts = [], globalSales = [], globalTransactions = [];');
let cleanJs = testJs.substring(jsStart);

// 4) Fix known bugs in test.js:
//    Bug 1: Duplicate `}).join('');` at line 324
cleanJs = cleanJs.replace(
  "      }).join('');\r\n      }).join('');\r\n      document.getElementById('viewData')",
  "      }).join('');\r\n      document.getElementById('viewData')"
);

// 5) Remove window.onload (we'll add our own)
let windowOnloadIndex = cleanJs.indexOf('    window.onload = function () {');
let beforeOnload = cleanJs.substring(0, windowOnloadIndex);

// 6) Add renderSavings() call in refreshAllData
beforeOnload = beforeOnload.replace(
  "renderTransactionsTable();\r\n      } catch (error) {",
  "renderTransactionsTable();\r\n          renderSavings();\r\n      } catch (error) {"
);

// 7) Add renderSavings() call in applyDateSearch
beforeOnload = beforeOnload.replace(
  "renderTransactionsTable();\r\n    }\r\n\r\n    function clearDateSearch",
  "renderTransactionsTable();\r\n        renderSavings();\r\n    }\r\n\r\n    function clearDateSearch"
);

// 8) Add delete button in renderManageProducts
beforeOnload = beforeOnload.replace(
  `onclick="printProductDetail('\${p.id}')" title="พิมพ์ข้อมูลสินค้า"><i class="fa-solid fa-print"></i></button></td></tr>`,
  `onclick="printProductDetail('\${p.id}')" title="พิมพ์ข้อมูลสินค้า"><i class="fa-solid fa-print"></i></button><button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteProduct('\${p.id}')" title="ลบสินค้า"><i class="fa-solid fa-trash"></i></button></td></tr>`
);

// 9) New functions to add
let newFunctions = `
    function deleteProduct(productId) {
      Swal.fire({
        title: 'ยืนยันลบสินค้า?',
        text: "คุณต้องการลบสินค้ารายการนี้ออกจากระบบใช่หรือไม่! การลบจะไม่สามารถย้อนกลับได้",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'ยืนยันลบ',
        cancelButtonText: 'ยกเลิก'
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.showLoading();
          try {
            const { error } = await supabaseClient.from('products').delete().eq('id', productId);
            if (error) throw error;
            Swal.fire('ลบสินค้าสำเร็จ', '', 'success');
            refreshAllData();
          } catch (error) {
            console.error(error);
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบสินค้าได้', 'error');
          }
        }
      });
    }

    function renderSavings() {
      let html = '';
      let totalSavings = 0;
      let savings = globalTransactions.filter(function(t) { return t.type === 'เงินฝาก'; });
      
      savings.forEach(function(t) {
        totalSavings += Number(t.amount);
        let actionButtons = '<button class="btn btn-xs btn-warning px-2 py-1 small btn-sm me-1" onclick="editSaving(\\'' + t.id + '\\',\\'' + t.date + '\\',' + t.amount + ',\\'' + (t.note || '') + '\\')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="btn btn-xs btn-danger px-2 py-1 small btn-sm" onclick="deleteSavingConfirm(\\'' + t.id + '\\')" title="ลบ"><i class="fa-solid fa-trash"></i></button>';
        html += '<tr>' +
               '<td><span class="badge bg-dark" style="font-size:0.75rem;">' + t.id + '</span></td>' +
               '<td>' + t.date + '</td>' +
               '<td class="text-start fw-medium text-muted">' + (t.note || '-') + '</td>' +
               '<td class="fw-bold text-success">\\u0e3f' + fmtMoney(t.amount) + '</td>' +
               '<td>' + actionButtons + '</td>' +
            '</tr>';
      });
      document.getElementById('savingsTableBody').innerHTML = html || '<tr><td colspan="5" class="text-muted">ยังไม่มีประวัติการฝากเงิน</td></tr>';
      document.getElementById('totalSavingsValue').innerText = '\\u0e3f' + totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 });
    }

    async function submitSaving(e) {
      e.preventDefault();
      let id = document.getElementById('sv_id').value;
      let txData = {
        date: document.getElementById('sv_date').value,
        type: 'เงินฝาก',
        category: 'ฝากเงินออมทรัพย์',
        amount: Number(document.getElementById('sv_amount').value),
        note: document.getElementById('sv_note').value
      };
      Swal.showLoading();
      try {
        if (id) {
          const { error } = await supabaseClient.from('transactions').update(txData).eq('tx_id', id);
          if (error) throw error;
        } else {
          txData.tx_id = "SAV-" + Date.now();
          const { error } = await supabaseClient.from('transactions').insert([txData]);
          if (error) throw error;
        }
        Swal.fire('สำเร็จ', 'บันทึกรายการฝากเงินเรียบร้อย', 'success');
        resetSavingForm();
        refreshAllData();
      } catch (error) {
        console.error(error);
        Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
      }
    }

    function editSaving(id, dateStr, amount, note) {
      document.getElementById('sv_id').value = id;
      var parts = dateStr.split('/');
      if (parts.length === 3) {
        document.getElementById('sv_date').value = parts[2] + '-' + parts[1] + '-' + parts[0];
      }
      document.getElementById('sv_amount').value = amount;
      document.getElementById('sv_note').value = (note && note !== '-') ? note : '';
      document.getElementById('btnSaveSaving').className = "btn btn-primary fw-bold text-white";
      document.getElementById('btnSaveSaving').innerHTML = '<i class="fa-solid fa-check"></i> อัปเดตรายการฝาก';
      document.getElementById('btnCancelSavingEdit').classList.remove('d-none');
      document.getElementById('savingsForm').scrollIntoView({ behavior: 'smooth' });
    }

    function resetSavingForm() {
      document.getElementById('savingsForm').reset();
      document.getElementById('sv_id').value = '';
      document.getElementById('sv_date').value = new Date().toISOString().split('T')[0];
      document.getElementById('btnSaveSaving').className = "btn btn-warning fw-bold text-dark";
      document.getElementById('btnSaveSaving').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> บันทึกเงินฝาก';
      document.getElementById('btnCancelSavingEdit').classList.add('d-none');
    }

    function deleteSavingConfirm(id) {
      Swal.fire({
        title: 'ยืนยันลบเงินฝาก?',
        text: "คุณต้องการลบรายการฝากเงินนี้ใช่หรือไม่!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'ยืนยันลบ',
        cancelButtonText: 'ยกเลิก'
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.showLoading();
          try {
            const { error } = await supabaseClient.from('transactions').delete().eq('tx_id', id);
            if (error) throw error;
            Swal.fire('ลบรายการสำเร็จ', '', 'success');
            refreshAllData();
          } catch (error) {
            console.error(error);
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
          }
        }
      });
    }

    window.onload = function () {
      let today = new Date().toISOString().split('T')[0];
      document.getElementById('p_date').value = today;
      document.getElementById('saleDate').value = today;
      document.getElementById('tx_date').value = today;
      if (document.getElementById('sv_date')) {
        document.getElementById('sv_date').value = today;
      }
      refreshAllData();
    };
`;

// 10) Assemble final HTML
let finalHtml = htmlPart + '<script src="config.js"></script>\r\n  <script>\r\n' + beforeOnload + newFunctions + '\r\n  </script>\r\n</body>\r\n</html>\r\n';

fs.writeFileSync('index.html', finalHtml);

// 11) Verify syntax
let regex2 = /<script>([\s\S]*?)<\/script>/g;
let m2;
let bn = 0;
while ((m2 = regex2.exec(finalHtml)) !== null) {
  bn++;
  if (bn === 2) {
    fs.writeFileSync('_temp_check.js', m2[1]);
    const { execSync } = require('child_process');
    try {
      execSync('node --check _temp_check.js', { stdio: 'pipe' });
      console.log('Syntax verification: PASSED!');
    } catch (err) {
      console.error('Syntax verification: FAILED');
      console.error(err.stderr.toString());
    }
    fs.unlinkSync('_temp_check.js');
    break;
  }
}

console.log('Total file size:', finalHtml.length, 'bytes');
