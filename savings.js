    function renderSavings() {
      let html = '';
      let totalSavings = 0;
      let savings = globalTransactions.filter(t => t.type === 'เงินฝาก');
      
      savings.forEach(t => {
        totalSavings += Number(t.amount);
        let actionButtons = `
          <button class="btn btn-xs btn-warning px-2 py-1 small btn-sm me-1" onclick="editSaving('${t.id}','${t.date}',${t.amount},'${t.note || ""}')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-xs btn-danger px-2 py-1 small btn-sm" onclick="deleteSavingConfirm('${t.id}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>
        `;
        html += `<tr>
               <td><span class="badge bg-dark" style="font-size:0.75rem;">${t.id}</span></td>
               <td>${t.date}</td>
               <td class="text-start fw-medium text-muted">${t.note || '-'}</td>
               <td class="fw-bold text-success">฿${fmtMoney(t.amount)}</td>
               <td>${actionButtons}</td>
            </tr>`;
      });
      document.getElementById('savingsTableBody').innerHTML = html || '<tr><td colspan="5" class="text-muted">ยังไม่มีประวัติการฝากเงิน</td></tr>';
      document.getElementById('totalSavingsValue').innerText = '฿' + totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 });
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
      let parts = dateStr.split('/');
      if (parts.length === 3) document.getElementById('sv_date').value = `${parts[2]}-${parts[1]}-${parts[0]}`;
      document.getElementById('sv_amount').value = amount;
      document.getElementById('sv_note').value = note !== '-' ? note : '';
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
