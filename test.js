
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
      window.location.replace('login.html');
    }
  





    let globalProducts = [], globalSales = [], globalTransactions = [];
    let mySalesChart = null;
    let myProfitChart = null;

    // Helper: เนเธเธฅเธเธงเธฑเธเธ—เธตเน YYYY-MM-DD เน€เธเนเธ DD/MM/YYYY (เธชเธณเธซเธฃเธฑเธเนเธชเธ”เธเธเธฅ)
    function formatDateToTH(dateString) {
      if (!dateString) return "";
      if (dateString.includes('/')) return dateString;
      let parts = dateString.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateString;
    }

    // Helper: เนเธเธฅเธเธงเธฑเธเธ—เธตเน DD/MM/YYYY เน€เธเนเธ YYYY-MM-DD (เธชเธณเธซเธฃเธฑเธเธเธฑเธเธ—เธถเธ DB)
    function formatDateToDB(dateString) {
      if (!dateString) return null;
      if (dateString.includes('-') && !dateString.includes('/')) return dateString; // already YYYY-MM-DD
      let parts = dateString.split('/');
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      return dateString;
    }

    function logout() {
      Swal.fire({
        title: 'เธญเธญเธเธเธฒเธเธฃเธฐเธเธ',
        text: 'เธเธธเธ“เธ•เนเธญเธเธเธฒเธฃเธญเธญเธเธเธฒเธเธฃเธฐเธเธเนเธเนเธซเธฃเธทเธญเนเธกเน?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'เนเธเน, เธญเธญเธเธเธฒเธเธฃเธฐเธเธ',
        cancelButtonText: 'เธขเธเน€เธฅเธดเธ'
      }).then((result) => {
        if (result.isConfirmed) {
          sessionStorage.removeItem('isLoggedIn');
          window.location.replace('login.html');
        }
      });
    }

    // Helper: map Supabase snake_case fields to local camelCase
    // sales.date & transactions.date เน€เธเนเธ type `date` (YYYY-MM-DD) เธเธฒเธ Supabase
    // เนเธเธฅเธเน€เธเนเธ DD/MM/YYYY เธชเธณเธซเธฃเธฑเธเนเธชเธ”เธเธเธฅเนเธ UI
    function mapProduct(p) {
      return { id: p.id, name: p.name, brand: p.brand, cost: Number(p.cost), actualPrice: Number(p.actual_price), stock: p.stock, updatedAt: p.updated_at, fbLink: p.fb_link || "" };
    }
    function mapSale(s) {
      return { receiptId: s.invoice_id, date: formatDateToTH(s.date), createdAt: s.created_at || s.date, productId: s.product_id, productName: s.product_name, qty: s.qty, totalCost: Number(s.total_cost), subTotal: Number(s.sub_total), profit: Number(s.profit), shippingCost: Number(s.shipping_cost || 0), cusName: s.cus_name, address: s.address, vat: Number(s.vat), totalSales: Number(s.grand_total), depositAmount: Number(s.deposit_amount || 0), depositRemaining: Number(s.deposit_remaining || 0), paymentMethod: s.payment_method || 'CASH', status: s.status || 'COMPLETED', completedDate: s.completed_date ? formatDateToTH(s.completed_date) : null };
    }
    function mapTransaction(t) {
      return { id: t.tx_id, date: formatDateToTH(t.date), type: t.type, category: t.category, amount: Number(t.amount), note: t.note };
    }

    function toggleSidebar() { document.getElementById('sidebar').classList.toggle('show'); }

    function showPage(pageId, element) {
      document.querySelectorAll('.page-section').forEach(p => p.classList.add('d-none'));
      document.getElementById('page-' + pageId).classList.remove('d-none');
      if (element) {
        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        element.classList.add('active');
      }
      if (window.innerWidth <= 768) toggleSidebar();
    }

    async function refreshAllData() {
      let mFilter = document.getElementById('monthFilter').value;
      if (!mFilter) {
        let today = new Date();
        mFilter = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, '0');
        document.getElementById('monthFilter').value = mFilter;
      }

      let manageDateFilter = document.getElementById('manageDateFilter');
      if (manageDateFilter && document.activeElement !== manageDateFilter) {
        manageDateFilter.value = mFilter;
      }

      try {
        // เธ”เธถเธเธเนเธญเธกเธนเธฅเธ—เธฑเนเธเธซเธกเธ”เธเธฒเธ Supabase เธเธฃเนเธญเธกเธเธฑเธ
        const [prodRes, salesRes, txRes] = await Promise.all([
          supabaseClient.from('products').select('*'),
          supabaseClient.from('sales').select('*'),
          supabaseClient.from('transactions').select('*')
        ]);

        if (prodRes.error) throw prodRes.error;
        if (salesRes.error) throw salesRes.error;
        if (txRes.error) throw txRes.error;

        globalProducts = (prodRes.data || []).map(mapProduct);
        globalSales = (salesRes.data || []).map(mapSale);
        globalTransactions = (txRes.data || []).map(mapTransaction);

        renderDashboard();
        renderViewProducts();
        renderManageProducts();
        renderSalesTab();
        renderReportsTab();
        renderTransactionsTable();
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire('เนเธเนเธเน€เธ•เธทเธญเธ', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เน€เธเธทเนเธญเธกเธ•เนเธญเธเธฒเธเธเนเธญเธกเธนเธฅเนเธ”เน เธเธฃเธธเธ“เธฒเธ•เธฃเธงเธเธชเธญเธเธเธฒเธฃเธ•เธฑเนเธเธเนเธฒ Supabase', 'error');
      }
    }

    function renderDashboard() {
      let filter = document.getElementById('monthFilter').value;
      let filterParts = filter.split('-');
      let targetMonth = filterParts[1] + "/" + filterParts[0];
      let targetYear = filterParts[0];

      let mSales = 0, mProfit = 0, ySales = 0, totalStock = 0, invValue = 0;
      let mQty = 0, mShipping = 0;
      let brandSales = {};
      let recentHtml = '', lowStockHtml = '';

      let monthlySales = {};
      let yearlySales = {};

      function getBrandByPid(pid) {
        let prod = globalProducts.find(p => p.id === pid);
        return prod ? prod.brand : 'เนเธกเนเธฃเธฐเธเธธ';
      }



      let lowStockCount = 0;
      globalProducts.forEach(p => {
        totalStock += p.stock;
        invValue += (p.cost * p.stock);
        if (p.stock > 0 && p.stock < 3 && lowStockCount < 10) {
          lowStockHtml += `<tr><td>${p.name}</td><td class="text-center text-danger fw-bold">${p.stock} เธเธดเนเธ</td></tr>`;
          lowStockCount++;
        }
      });

      let count = 0;
      // เน€เธฃเธตเธขเธเธเธฒเธเนเธซเธกเนเนเธเน€เธเนเธฒ เนเธ”เธขเนเธเน createdAt เนเธฅเธฐเธ•เธฑเธ”เธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเธขเธเน€เธฅเธดเธเธญเธญเธ
      let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => {
        let dateA = new Date(a.createdAt).getTime();
        let dateB = new Date(b.createdAt).getTime();
        if (isNaN(dateA)) dateA = 0;
        if (isNaN(dateB)) dateB = 0;
        return dateB - dateA;
      });

      sortedSales.forEach(s => {
        // เธชเธณเธซเธฃเธฑเธเธฃเธฒเธขเธเธฒเธฃเธกเธฑเธ”เธเธณเธ—เธตเนเธเธณเธฃเธฐเธเธฃเธเนเธฅเนเธง เนเธเน completedDate เน€เธเนเธเธงเธฑเธเธ—เธตเนเธเธฑเธเธขเธญเธ”
        let effectiveDate = s.date;
        if (s.paymentMethod === 'DEPOSIT' && s.completedDate && s.depositRemaining === 0) {
          effectiveDate = s.completedDate;
        }
        let dParts = effectiveDate.split('/');
        let sDay = dParts[0];
        let sMonth = dParts[1] + "/" + dParts[2];
        let sYear = dParts[2];

        if (sMonth === targetMonth) {
          mSales += Number(s.totalSales);
          mProfit += Number(s.profit);
          mQty += Number(s.qty);
          mShipping += Number(s.shippingCost || 0);

          let brand = getBrandByPid(s.productId);
          brandSales[brand] = (brandSales[brand] || 0) + s.qty;
        }
        if (sYear === targetYear) {
          ySales += Number(s.totalSales);
          let mNum = dParts[1];
          monthlySales[mNum] = (monthlySales[mNum] || 0) + Number(s.totalSales);
        }
        yearlySales[sYear] = (yearlySales[sYear] || 0) + Number(s.totalSales);

        if (count < 5) {
          recentHtml += `<tr><td>${s.date}</td><td class="text-start text-truncate" style="max-width:180px;">${s.productName}</td><td class="text-orange fw-bold">เธฟ${Number(s.totalSales).toLocaleString()}</td><td class="text-success">เธฟ${Number(s.profit).toLocaleString()}</td></tr>`;
          count++;
        }
      });

      let bestBrand = "-";
      let maxBrandQty = 0;
      for (let b in brandSales) {
        if (brandSales[b] > maxBrandQty) {
          maxBrandQty = brandSales[b];
          bestBrand = b;
        }
      }

      document.getElementById('dashSales').innerText = "เธฟ" + mSales.toLocaleString();
      document.getElementById('dashProfit').innerText = "เธฟ" + mProfit.toLocaleString();
      document.getElementById('dashQty').innerText = mQty + " เน€เธเธฃเธทเนเธญเธ";
      document.getElementById('dashBestBrand').innerText = bestBrand !== "-" ? bestBrand : "-";
      document.getElementById('dashYearSales').innerText = "เธฟ" + ySales.toLocaleString();
      document.getElementById('dashStock').innerText = totalStock + " เธเธดเนเธ";
      document.getElementById('dashInventoryValue').innerText = "เธฟ" + invValue.toLocaleString();
      document.getElementById('dashRecentSales').innerHTML = recentHtml || '<tr><td colspan="4" class="text-muted">เนเธกเนเธกเธตเธฃเธฒเธขเธเธฒเธฃเธเธฒเธขเนเธเน€เธ”เธทเธญเธเธเธตเน</td></tr>';

      // เธเธณเธเธงเธ“เธขเธญเธ”เธเนเธฒเธเธเธณเธฃเธฐ COD เนเธฅเธฐเธกเธฑเธ”เธเธณ
      let codPending = 0, depositPending = 0;
      globalSales.forEach(s => {
        if (s.status === 'PENDING_COD') codPending += Number(s.depositRemaining);
        if (s.paymentMethod === 'DEPOSIT' && s.depositRemaining > 0) depositPending += Number(s.depositRemaining);
      });
      document.getElementById('dashCodPending').innerText = "เธฟ" + codPending.toLocaleString();
      document.getElementById('dashDepositPending').innerText = "เธฟ" + depositPending.toLocaleString();
      document.getElementById('dashMonthlyShipping').innerText = "เธฟ" + mShipping.toLocaleString();

      if (lowStockCount > 0) {
        if (lowStockCount === 10) lowStockHtml += `<tr><td colspan="2" class="text-center text-muted small py-2">...เธกเธตเธชเธดเธเธเนเธฒเธญเธทเนเธเนเธเธฅเนเธซเธกเธ”เธญเธตเธ</td></tr>`;
        document.getElementById('dashLowStock').innerHTML = lowStockHtml;
      } else {
        document.getElementById('dashLowStock').innerHTML = '<tr><td colspan="2" class="text-success text-center">เธชเธดเธเธเนเธฒเน€เธเธตเธขเธเธเธญเธ—เธธเธเธฃเธฒเธขเธเธฒเธฃ</td></tr>';
      }

      renderCharts(targetYear, monthlySales, yearlySales);
    }

    function renderCharts(targetYear, monthlySales, yearlySales) {
      // Data for Monthly Sales
      let monthLabels = ["เธก.เธ.", "เธ.เธ.", "เธกเธต.เธ.", "เน€เธก.เธข.", "เธ.เธ.", "เธกเธด.เธข.", "เธ.เธ.", "เธช.เธ.", "เธ.เธข.", "เธ•.เธ.", "เธ.เธข.", "เธ.เธ."];
      let mSalesData = [];
      for (let i = 1; i <= 12; i++) {
        let mStr = ("0" + i).slice(-2);
        mSalesData.push(monthlySales[mStr] || 0);
      }

      // Data for Yearly Sales
      let yearLabels = Object.keys(yearlySales).sort();
      let ySalesData = yearLabels.map(y => yearlySales[y]);

      const ctxSales = document.getElementById('salesChart');
      const ctxProfit = document.getElementById('profitChart');

      if (mySalesChart) mySalesChart.destroy();
      if (myProfitChart) myProfitChart.destroy();

      mySalesChart = new Chart(ctxSales, {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [{ label: 'เธขเธญเธ”เธเธฒเธขเธฃเธฒเธขเน€เธ”เธทเธญเธ (เธเธฒเธ—)', data: mSalesData, backgroundColor: 'rgba(249, 115, 22, 0.8)', borderRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });

      myProfitChart = new Chart(ctxProfit, {
        type: 'line',
        data: {
          labels: yearLabels,
          datasets: [{ label: 'เธขเธญเธ”เธเธฒเธขเธฃเธฒเธขเธเธต (เธเธฒเธ—)', data: ySalesData, backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 1)', borderWidth: 2, fill: true, tension: 0.3 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }

    function renderViewProducts() {
      let filter = document.getElementById('monthFilter').value;
      let brandFilterEl = document.getElementById('viewBrandFilter');
      let brandFilter = brandFilterEl ? brandFilterEl.value : "";

      let filteredProducts = globalProducts;
      if (filter) {
        filteredProducts = filteredProducts.filter(p => {
          if (!p.updatedAt) return false;
          let dateOnly = p.updatedAt.split('T')[0];
          return dateOnly.startsWith(filter);
        });
      }

      if (brandFilterEl) {
        let currentBrand = brandFilterEl.value;
        let brandSet = new Set();
        globalProducts.forEach(p => brandSet.add(p.brand));
        let brandOptionsHtml = '<option value="">-- เธขเธตเนเธซเนเธญเธ—เธฑเนเธเธซเธกเธ” --</option>';
        brandSet.forEach(b => { if (b) brandOptionsHtml += `<option value="${b}">${b}</option>`; });
        brandFilterEl.innerHTML = brandOptionsHtml;
        brandFilterEl.value = currentBrand;
      }

      if (brandFilter) {
        filteredProducts = filteredProducts.filter(p => p.brand === brandFilter);
      }

      filteredProducts.sort((a, b) => {
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        return a.name.localeCompare(b.name);
      });

      let html = filteredProducts.map(p => {
        let dateStr = p.updatedAt ? formatDateToTH(p.updatedAt.split('T')[0]) : "-";
        // เธ•เธฃเธงเธเธชเธญเธเธชเธ–เธฒเธเธฐเธกเธฑเธ”เธเธณเนเธฅเธฐ COD เธเธฒเธเธเนเธญเธกเธนเธฅเธเธฒเธฃเธเธฒเธข
        let depositStatus = '';
        let pendingCodSales = globalSales.filter(s => s.productId === p.id && s.paymentMethod === 'COD' && s.status === 'PENDING_COD');
        let depositSales = globalSales.filter(s => s.productId === p.id && s.paymentMethod === 'DEPOSIT' && s.depositRemaining > 0);
        
        if (pendingCodSales.length > 0) {
          let totalCodQty = pendingCodSales.reduce((sum, s) => sum + Number(s.qty), 0);
          depositStatus += `<span class="badge bg-info text-dark mb-1"><i class="fa-solid fa-truck-fast"></i> เธฃเธญ COD ${totalCodQty} เน€เธเธฃเธทเนเธญเธ</span><br>`;
        }
        
        if (depositSales.length > 0) {
          let totalRemaining = depositSales.reduce((sum, s) => sum + s.depositRemaining, 0);
          depositStatus += `<span class="badge bg-warning text-dark"><i class="fa-solid fa-hand-holding-dollar"></i> เธ•เธดเธ”เธกเธฑเธ”เธเธณ</span><br><small class="text-danger fw-bold">เธเนเธฒเธ เธฟ${totalRemaining.toLocaleString()}</small>`;
        }
        
        if (!depositStatus) {
          depositStatus = '<span class="text-muted">-</span>';
        }
        let fbBtn = p.fbLink ? `<a href="${p.fbLink}" target="_blank" class="btn btn-sm btn-primary py-0 px-2" title="เธ”เธนเนเธเธชเธ•เนเธเธ Facebook"><i class="fa-brands fa-facebook-f"></i></a>` : '<span class="text-muted">-</span>';
        return `<tr><td><span class="badge bg-secondary">${p.id}</span></td><td>${dateStr}</td><td class="text-start fw-medium">${p.name}</td><td>${p.brand}</td><td class="text-success fw-bold">เธฟ${p.actualPrice.toLocaleString()}</td><td><span class="fw-bold ${p.stock < 3 ? 'text-danger' : 'text-dark'}">${p.stock}</span> เน€เธเธฃเธทเนเธญเธ</td><td>${fbBtn}</td><td>${depositStatus}</td></tr>`;
      }).join('');
      }).join('');
      document.getElementById('viewData').innerHTML = html || '<tr><td colspan="8" class="text-muted">เนเธกเนเธกเธตเธฃเธฒเธขเธเธฒเธฃเธชเธดเธเธเนเธฒเนเธเธฃเธฐเธเธเธ•เธฒเธกเน€เธเธทเนเธญเธเนเธเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>';

      renderInStockSummary();
    }

    function renderInStockSummary() {
      // เธ”เธถเธเน€เธเธเธฒเธฐเธชเธดเธเธเนเธฒเธ—เธตเนเธชเธ•เนเธญเธ > 0 เนเธฅเธฐเนเธกเนเธชเธ filter เนเธ”เน
      let inStockProducts = globalProducts.filter(p => p.stock > 0);
      inStockProducts.sort((a,b) => (a.brand || '').localeCompare(b.brand || '') || (a.name || '').localeCompare(b.name || ''));
      
      let html = '';
      let totalQty = 0;
      let totalValue = 0;

      if (inStockProducts.length === 0) {
         html = '<tr><td colspan="5" class="text-muted">เนเธกเนเธกเธตเธชเธดเธเธเนเธฒเธเธเน€เธซเธฅเธทเธญเนเธเธฃเธฐเธเธ</td></tr>';
         document.getElementById('inStockSummaryFooter').innerHTML = '';
      } else {
         html = inStockProducts.map(p => {
            let value = p.stock * p.actualPrice;
            totalQty += p.stock;
            totalValue += value;
            return `<tr><td class="text-start fw-medium">${p.name}</td><td><span class="badge bg-secondary">${p.brand}</span></td><td class="text-success">เธฟ${p.actualPrice.toLocaleString()}</td><td class="fw-bold fs-6">${p.stock}</td><td class="text-primary fw-bold">เธฟ${value.toLocaleString()}</td></tr>`;
         }).join('');
         
         document.getElementById('inStockSummaryFooter').innerHTML = `<tr><td colspan="3" class="text-end text-dark fs-6">เธฃเธงเธกเธฃเธฒเธขเธเธฒเธฃเธชเธดเธเธเนเธฒเธเธเน€เธซเธฅเธทเธญเธ—เธฑเนเธเธซเธกเธ”:</td><td class="text-dark fs-5">${totalQty} เน€เธเธฃเธทเนเธญเธ</td><td class="text-primary fs-4">เธฟ${totalValue.toLocaleString()}</td></tr>`;
      }
      document.getElementById('inStockSummaryData').innerHTML = html;
    }

    function renderManageProducts() {
      let dateFilterEl = document.getElementById('manageDateFilter');
      let brandFilterEl = document.getElementById('manageBrandFilter');
      let stockFilterEl = document.getElementById('manageStockFilter');

      let dateFilter = dateFilterEl ? dateFilterEl.value : "";
      let brandFilter = brandFilterEl ? brandFilterEl.value : "";
      let stockFilter = stockFilterEl ? stockFilterEl.value : "";

      let filteredProducts = globalProducts;
      if (dateFilter) {
        filteredProducts = filteredProducts.filter(p => {
          if (!p.updatedAt) return false;
          let dateOnly = p.updatedAt.split('T')[0];
          return dateOnly.startsWith(dateFilter);
        });
      }

      if (brandFilterEl) {
        let currentBrand = brandFilterEl.value;
        let brandSet = new Set();
        globalProducts.forEach(p => brandSet.add(p.brand));
        let brandOptionsHtml = '<option value="">-- เธขเธตเนเธซเนเธญเธ—เธฑเนเธเธซเธกเธ” --</option>';
        brandSet.forEach(b => { if (b) brandOptionsHtml += `<option value="${b}">${b}</option>`; });
        brandFilterEl.innerHTML = brandOptionsHtml;
        brandFilterEl.value = currentBrand;
      }

      if (brandFilter) {
        filteredProducts = filteredProducts.filter(p => p.brand === brandFilter);
      }

      if (stockFilter === 'in_stock') {
        filteredProducts = filteredProducts.filter(p => p.stock > 0);
      } else if (stockFilter === 'out_of_stock') {
        filteredProducts = filteredProducts.filter(p => p.stock === 0);
      }

      let html = filteredProducts.map(p => {
        let dateStr = p.updatedAt ? formatDateToTH(p.updatedAt.split('T')[0]) : "-";
        let fbBtn = p.fbLink ? `<a href="${p.fbLink}" target="_blank" class="btn btn-sm btn-primary py-0 px-2" title="เธ”เธนเนเธเธชเธ•เนเธเธ Facebook"><i class="fa-brands fa-facebook-f"></i></a>` : '<span class="text-muted">-</span>';
        return `<tr><td>${dateStr}</td><td class="text-start">${p.name}</td><td>${p.brand}</td><td>เธฟ${p.cost.toLocaleString()}</td><td class="text-success">เธฟ${p.actualPrice.toLocaleString()}</td><td><span class="fw-bold ${p.stock <= 0 ? 'text-danger' : 'text-dark'}">${p.stock}</span></td><td>${fbBtn}</td><td><button class="btn btn-sm btn-outline-warning me-1" onclick="editProduct('${p.id}','${p.updatedAt}','${p.name}','${p.brand}',${p.cost},${p.actualPrice},${p.stock},'${p.fbLink}')"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-outline-secondary" onclick="printProductDetail('${p.id}')" title="เธเธดเธกเธเนเธเนเธญเธกเธนเธฅเธชเธดเธเธเนเธฒ"><i class="fa-solid fa-print"></i></button></td></tr>`;
      }).join('');
      document.getElementById('productData').innerHTML = html || '<tr><td colspan="8" class="text-muted">เนเธกเนเธกเธตเธชเธดเธเธเนเธฒเธ•เธฒเธกเน€เธเธทเนเธญเธเนเธเธ—เธตเนเธเนเธเธซเธฒ</td></tr>';
    }

    function printProductDetail(productId) {
      let p = globalProducts.find(x => String(x.id) === String(productId));
      if (!p) { Swal.fire('เนเธกเนเธเธเธเนเธญเธกเธนเธฅ', 'เนเธกเนเธเธเธเนเธญเธกเธนเธฅเธชเธดเธเธเนเธฒเธ—เธตเนเธ•เนเธญเธเธเธฒเธฃเธเธดเธกเธเน', 'error'); return; }

      let today = new Date();
      let printDate = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;
      let dateStr = p.updatedAt ? formatDateToTH(p.updatedAt.split('T')[0]) : "-";
      let profitPerUnit = p.actualPrice - p.cost;
      let totalCostValue = p.cost * p.stock;
      let totalSellValue = p.actualPrice * p.stock;

      document.getElementById('pdPrintDate').innerText = printDate;
      document.getElementById('pdProductName').innerText = p.name;
      document.getElementById('pdBrand').innerText = p.brand;
      document.getElementById('pdProductId').innerText = p.id;
      document.getElementById('pdDate').innerText = dateStr;
      document.getElementById('pdCost').innerText = 'เธฟ' + p.cost.toLocaleString();
      document.getElementById('pdSellPrice').innerText = 'เธฟ' + p.actualPrice.toLocaleString();

      let profitEl = document.getElementById('pdProfitPerUnit');
      profitEl.innerText = 'เธฟ' + profitPerUnit.toLocaleString();
      profitEl.className = 'fw-bold ' + (profitPerUnit >= 0 ? 'text-success' : 'text-danger');

      let stockEl = document.getElementById('pdStock');
      stockEl.innerHTML = `<span class="fw-bold ${p.stock <= 0 ? 'text-danger' : 'text-success'}">${p.stock}</span> เธเธดเนเธ`;

      document.getElementById('pdTotalCostValue').innerText = 'เธฟ' + totalCostValue.toLocaleString();
      document.getElementById('pdTotalCostCalc').innerText = `(เธฟ${p.cost.toLocaleString()} ร— ${p.stock} เธเธดเนเธ)`;
      document.getElementById('pdTotalSellValue').innerText = 'เธฟ' + totalSellValue.toLocaleString();
      document.getElementById('pdTotalSellCalc').innerText = `(เธฟ${p.actualPrice.toLocaleString()} ร— ${p.stock} เธเธดเนเธ)`;

      if (p.fbLink) {
        document.getElementById('pdFbLinkRow').style.display = 'block';
        document.getElementById('pdFbLink').innerText = p.fbLink;
      } else {
        document.getElementById('pdFbLinkRow').style.display = 'none';
      }

      document.getElementById('printProductDetailSection').classList.remove('d-none');
      window.print();
      setTimeout(() => { document.getElementById('printProductDetailSection').classList.add('d-none'); }, 1000);
    }

    function renderSalesTab() {
      let selectHtml = '<option value="">-- เน€เธฅเธทเธญเธเธฃเธฒเธขเธเธฒเธฃเธชเธดเธเธเนเธฒเน€เธเธทเนเธญเธ—เธณเธเธฒเธฃเธ•เธฑเธ”เธชเธ•เนเธญเธ --</option>';
      let brandSet = new Set();
      globalProducts.forEach(p => {
        if (p.stock > 0) {
          selectHtml += `<option value="${p.id}" data-price="${p.actualPrice}">${p.name} (เธเธเน€เธซเธฅเธทเธญ: ${p.stock} | เนเธเธฃเธเธ”เน: ${p.brand})</option>`;
        }
        brandSet.add(p.brand);
      });
      document.getElementById('saleProduct').innerHTML = selectHtml;

      let filterBrandHtml = '<option value="">เนเธเธฃเธเธ”เนเธชเธดเธเธเนเธฒเธ—เธฑเนเธเธซเธกเธ”</option>';
      brandSet.forEach(b => { if (b) filterBrandHtml += `<option value="${b}">${b}</option>`; });
      document.getElementById('filterBrand').innerHTML = filterBrandHtml;

      document.getElementById('saleProduct').onchange = function () {
        let opt = this.options[this.selectedIndex];
        if (opt && opt.value) {
          document.getElementById('saleCustomPrice').value = opt.getAttribute('data-price');
          calcVAT();
        }
      };
      filterStock();
    }

    function filterStock() {
      let b = document.getElementById('filterBrand').value.toLowerCase();
      let s = document.getElementById('filterModel').value.toLowerCase();
      let filtered = globalProducts.filter(p => (b === "" || p.brand.toLowerCase() === b) && (s === "" || p.name.toLowerCase().includes(s)));

      filtered.sort((a, b) => {
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        return a.name.localeCompare(b.name);
      });

      document.getElementById('liveStockBody').innerHTML = filtered.map(p => `<tr><td class="text-start">${p.name}</td><td>${p.brand}</td><td>เธฟ${p.actualPrice.toLocaleString()}</td><td><span class="badge ${p.stock < 3 ? 'bg-danger' : 'bg-success'}">${p.stock}</span></td></tr>`).join('');
    }

    function calcVAT() {
      let prc = Number(document.getElementById('saleCustomPrice').value) || 0;
      let qty = Number(document.getElementById('saleQty').value) || 0;
      let isVat = document.getElementById('isVatEnabled') ? document.getElementById('isVatEnabled').checked : true;
      let sub = prc * qty;
      let vat = isVat ? sub * 0.07 : 0;
      document.getElementById('saleSubTotal').value = sub.toFixed(2);
      document.getElementById('saleVat').value = vat.toFixed(2);
      document.getElementById('saleGrandTotal').value = (sub + vat).toFixed(2);
      calcDepositRemaining();
    }

    function togglePaymentFields() {
      let isDeposit = document.getElementById('payDeposit').checked;
      let isCOD = document.getElementById('payCOD').checked;
      
      document.getElementById('depositFields').style.display = isDeposit ? 'block' : 'none';
      document.getElementById('codAlert').style.display = isCOD ? 'block' : 'none';

      if (!isDeposit) {
        document.getElementById('depositAmount').value = '';
        document.getElementById('depositRemaining').value = '0.00';
      }
    }

    function calcDepositRemaining() {
      let isDeposit = document.getElementById('payDeposit').checked;
      if (!isDeposit) return;
      let grandTotal = Number(document.getElementById('saleGrandTotal').value) || 0;
      let depositAmt = Number(document.getElementById('depositAmount').value) || 0;
      let remaining = grandTotal - depositAmt;
      if (remaining < 0) remaining = 0;
      document.getElementById('depositRemaining').value = remaining.toFixed(2);
    }

    async function submitSale(e) {
      e.preventDefault();

      let pId = document.getElementById('saleProduct').value;
      if (!pId) { Swal.fire('เน€เธ•เธทเธญเธ', 'เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธชเธดเธเธเนเธฒเธเนเธญเธเธเธฑเธเธ—เธถเธเธเธฒเธข', 'warning'); return; }

      let qty = Number(document.getElementById('saleQty').value);
      let product = globalProducts.find(p => p.id === pId);

      if (qty > product.stock) { Swal.fire('เน€เธ•เธทเธญเธ', 'เธชเธดเธเธเนเธฒเธเธเน€เธซเธฅเธทเธญเนเธกเนเธเธญเธเธฒเธข!', 'warning'); return; }

      let customPrice = Number(document.getElementById('saleCustomPrice').value);
      let subTotal = customPrice * qty;
      let totalCost = product.cost * qty;
      let shippingCost = Number(document.getElementById('saleShippingCost').value) || 0;
      let profit = subTotal - totalCost - shippingCost;
      let isVat = document.getElementById('isVatEnabled') ? document.getElementById('isVatEnabled').checked : true;
      let vat = isVat ? subTotal * 0.07 : 0;
      let totalSales = subTotal + vat;

      let receiptId = "INV-" + Date.now();

      let paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      let depositAmt = 0;
      let depositRemaining = 0;
      let orderStatus = 'COMPLETED';

      if (paymentMethod === 'DEPOSIT') {
        depositAmt = Number(document.getElementById('depositAmount').value) || 0;
        if (depositAmt <= 0) { Swal.fire('เน€เธ•เธทเธญเธ', 'เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธขเธญเธ”เธกเธฑเธ”เธเธณ', 'warning'); return; }
        if (depositAmt >= totalSales) { Swal.fire('เน€เธ•เธทเธญเธ', 'เธขเธญเธ”เธกเธฑเธ”เธเธณเธ•เนเธญเธเธเนเธญเธขเธเธงเนเธฒเธขเธญเธ”เธฃเธงเธก เธซเธฒเธเธเนเธฒเธขเน€เธ•เนเธกเธเธณเธเธงเธเนเธซเนเน€เธฅเธทเธญเธเธเธณเธฃเธฐเน€เธ•เนเธกเธเธณเธเธงเธ', 'warning'); return; }
        depositRemaining = totalSales - depositAmt;
      } else if (paymentMethod === 'COD') {
        depositAmt = 0;
        depositRemaining = totalSales; // เธเนเธฒเธเธเธณเธฃเธฐเน€เธ•เนเธกเธเธณเธเธงเธเธชเธณเธซเธฃเธฑเธ COD
        orderStatus = 'PENDING_COD';
      } else {
        // CASH
        depositAmt = totalSales;
        depositRemaining = 0;
      }

      let saleData = {
        invoice_id: receiptId,
        date: document.getElementById('saleDate').value,
        product_id: pId,
        product_name: product.name,
        qty: qty,
        sub_total: subTotal,
        total_cost: totalCost,
        profit: profit,
        shipping_cost: shippingCost,
        vat: vat,
        grand_total: totalSales,
        cus_name: document.getElementById('saleCusName').value || "-",
        address: document.getElementById('saleAddress').value || "-",
        deposit_amount: depositAmt,
        deposit_remaining: depositRemaining,
        payment_method: paymentMethod,
        status: orderStatus
      };

      Swal.showLoading();

      try {
        // 1. เธเธฑเธเธ—เธถเธเธเธฒเธฃเธเธฒเธข
        const { error: saleErr } = await supabaseClient.from('sales').insert([saleData]);
        if (saleErr) throw saleErr;

        // 2. เธ•เธฑเธ”เธชเธ•เนเธญเธ
        const { error: stockErr } = await supabaseClient.from('products')
          .update({ stock: product.stock - qty })
          .eq('id', pId);
        if (stockErr) throw stockErr;

        let successMsg = 'เธเธฑเธเธ—เธถเธเธเธฒเธฃเธเธฒเธขเนเธฅเธฐเธ•เธฑเธ”เธชเธ•เนเธญเธเน€เธฃเธตเธขเธเธฃเนเธญเธข';
        if (paymentMethod === 'DEPOSIT') {
          successMsg = `เธเธฑเธเธ—เธถเธเธเธฒเธฃเธเธฒเธข (เธกเธฑเธ”เธเธณ เธฟ${depositAmt.toLocaleString()}) เนเธฅเธฐเธ•เธฑเธ”เธชเธ•เนเธญเธเน€เธฃเธตเธขเธเธฃเนเธญเธข\nเธขเธญเธ”เธเธเน€เธซเธฅเธทเธญ: เธฟ${depositRemaining.toLocaleString()}`;
        } else if (paymentMethod === 'COD') {
          successMsg = `เธเธฑเธเธ—เธถเธเธญเธญเน€เธ”เธญเธฃเน COD เนเธฅเธฐเธ•เธฑเธ”เธชเธ•เนเธญเธเน€เธฃเธตเธขเธเธฃเนเธญเธข\nเธชเธ–เธฒเธเธฐ: เธฃเธญเธ”เธณเน€เธเธดเธเธเธฒเธฃ`;
        }
        Swal.fire('เธชเธณเน€เธฃเนเธ!', successMsg, 'success');
        document.getElementById('formSale').reset();
        document.getElementById('payCash').checked = true;
        if(document.getElementById('isVatEnabled')) document.getElementById('isVatEnabled').checked = true;
        togglePaymentFields();
        calcVAT();
        refreshAllData();
      } catch (error) {
        console.error(error);
        Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธเธฑเธเธ—เธถเธเธเธฒเธฃเธเธฒเธขเนเธ”เน', 'error');
      }
    }

    function renderReportsTab() {
      let filter = document.getElementById('monthFilter').value;
      let targetMonth = filter.split('-')[1] + "/" + filter.split('-')[0];

      let totalQty = 0, totalCost = 0, totalSub = 0, totalProfit = 0;
      let historyHtml = '';

      // เน€เธฃเธตเธขเธเธเธฒเธเนเธซเธกเนเนเธเน€เธเนเธฒ เนเธฅเธฐเธ•เธฑเธ”เธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเธ–เธนเธเธขเธเน€เธฅเธดเธ/เธ•เธตเธเธฅเธฑเธเธญเธญเธ
      let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => b.receiptId.localeCompare(a.receiptId));

      sortedSales.forEach(s => {
        // เธชเธณเธซเธฃเธฑเธเธฃเธฒเธขเธเธฒเธฃเธกเธฑเธ”เธเธณเธ—เธตเนเธเธณเธฃเธฐเธเธฃเธเนเธฅเนเธง เนเธเน completedDate เธเธฑเธเธขเธญเธ”เธเธฒเธขเน€เธ”เธทเธญเธเธ—เธตเนเนเธ”เนเธฃเธฑเธเน€เธเธดเธเธเธฃเธดเธ
        let effectiveDate = s.date;
        if (s.paymentMethod === 'DEPOSIT' && s.completedDate && s.depositRemaining === 0) {
          effectiveDate = s.completedDate;
        }
        let sMonth = effectiveDate.split('/')[1] + "/" + effectiveDate.split('/')[2];
        if (sMonth === targetMonth) {
          totalQty += Number(s.qty);
          totalCost += Number(s.totalCost);
          totalSub += Number(s.subTotal);
          totalProfit += Number(s.profit);

          let saleStr = JSON.stringify(s).replace(/'/g, "\\'");

          // เนเธชเธ”เธเธเนเธญเธกเธนเธฅเธชเธ–เธฒเธเธฐ
          let depositCol = '-';
          let remainCol = '-';
          let actionBtns = '';
          
          let trClass = '';
          if (s.status === 'CANCELLED') {
            trClass = 'table-danger text-decoration-line-through text-muted';
            depositCol = `<span class="badge bg-danger"><i class="fa-solid fa-xmark"></i> เธ•เธตเธเธฅเธฑเธ/เธขเธเน€เธฅเธดเธ</span>`;
          } else if (s.paymentMethod === 'COD') {
            if (s.status === 'PENDING_COD') {
              trClass = 'table-info';
              depositCol = `<span class="badge bg-info text-dark"><i class="fa-solid fa-truck-fast"></i> เธฃเธญ COD</span><br><span class="fw-bold text-info">เธฟ${Number(s.depositRemaining).toLocaleString()}</span>`;
              remainCol = `<span class="fw-bold text-danger">เธฟ${Number(s.depositRemaining).toLocaleString()}</span>`;
              actionBtns = `
                <button class="btn btn-sm btn-success fw-bold shadow-sm mt-1" onclick="updateOrderStatus('${s.receiptId}', '${s.productId}', ${s.qty}, 'COMPLETED')"><i class="fa-solid fa-check"></i> เธฃเธฑเธเน€เธเธดเธเนเธฅเนเธง</button>
                <button class="btn btn-sm btn-danger fw-bold shadow-sm mt-1" onclick="updateOrderStatus('${s.receiptId}', '${s.productId}', ${s.qty}, 'CANCELLED')"><i class="fa-solid fa-rotate-left"></i> เธ•เธตเธเธฅเธฑเธ</button>
              `;
            } else if (s.status === 'COMPLETED') {
              depositCol = `<span class="badge bg-success"><i class="fa-solid fa-check-circle"></i> COD เธชเธณเน€เธฃเนเธ</span>`;
              remainCol = `<span class="text-success">เธฟ0</span>`;
            }
          } else {
            // DEPOSIT OR CASH
            let isDepositSale = s.paymentMethod === 'DEPOSIT' && s.depositRemaining > 0;
            if (isDepositSale) {
              trClass = 'table-warning';
              depositCol = `<span class="badge bg-warning text-dark"><i class="fa-solid fa-hand-holding-dollar"></i> เธกเธฑเธ”เธเธณ</span><br><span class="fw-bold text-warning">เธฟ${Number(s.depositAmount).toLocaleString()}</span>`;
              remainCol = `<span class="fw-bold text-danger">เธฟ${Number(s.depositRemaining).toLocaleString()}</span>`;
              actionBtns = `<button class="btn btn-sm btn-warning fw-bold shadow-sm mt-1" onclick="payMoreDeposit('${s.receiptId}', ${s.depositAmount}, ${s.depositRemaining}, ${s.totalSales})"><i class="fa-solid fa-money-bill-wave"></i> เธเธณเธฃเธฐเน€เธเธดเนเธก</button>`;
            } else if (s.paymentMethod === 'DEPOSIT' && s.depositRemaining === 0) {
              depositCol = `<span class="badge bg-success"><i class="fa-solid fa-check-circle"></i> เธเธณเธฃเธฐเธเธฃเธ</span>`;
              remainCol = `<span class="text-success">เธฟ0</span>`;
            } else if (s.paymentMethod === 'CASH') {
              depositCol = `<span class="badge bg-success"><i class="fa-solid fa-check-circle"></i> เน€เธเธดเธเธชเธ”/เนเธญเธ</span>`;
            }
          }

          historyHtml += `<tr class="${trClass}">
              <td><input type="checkbox" class="form-check-input sale-checkbox" data-id="${s.receiptId}" data-pid="${s.productId}" data-qty="${s.qty}" onchange="updateSelectedCount()"></td>
              <td><span class="badge bg-dark">${s.receiptId}</span></td>
              <td>${s.date}</td>
              <td class="text-start">${s.productName}</td>
              <td>${s.qty}</td>
              <td class="text-primary fw-bold">เธฟ${Number(s.totalSales).toLocaleString()}</td>
              <td>${s.shippingCost > 0 ? `<span class="text-danger">-เธฟ${s.shippingCost.toLocaleString()}</span>` : "-"}</td>
              <td>${depositCol}</td>
              <td>${remainCol}</td>
              <td class="text-start">${s.cusName}</td>
              <td>
                 <div class="btn-group">
                   <button class="btn btn-sm btn-info text-white fw-bold shadow-sm" onclick='pullToInvoice(${saleStr})'><i class="fa-solid fa-file-invoice"></i> เธญเธญเธเธเธดเธฅเธ เธฒเธฉเธต</button>
                   <button class="btn btn-sm btn-secondary fw-bold shadow-sm" onclick='pullToParcel(${saleStr})'><i class="fa-solid fa-box"></i> เนเธเธเธฐเธซเธเนเธฒ</button>
                 </div>
                 ${actionBtns}
                 <div class="btn-group mt-1">
                   <button class="btn btn-sm btn-outline-warning" onclick='editSaleModal(${saleStr})' title="เนเธเนเนเธเธเนเธญเธกเธนเธฅ"><i class="fa-solid fa-pen"></i> เนเธเนเนเธ</button>
                   <button class="btn btn-sm btn-outline-danger" onclick="deleteSale('${s.receiptId}','${s.productId}',${s.qty})" title="เธฅเธเธฃเธฒเธขเธเธฒเธฃเธเธตเน"><i class="fa-solid fa-trash"></i> เธฅเธ</button>
                 </div>
              </td>
           </tr>`;
        }
      });

      document.getElementById('repQty').innerText = totalQty + " เน€เธเธฃเธทเนเธญเธ";
      document.getElementById('repCost').innerText = "เธฟ" + totalCost.toLocaleString();
      document.getElementById('repSubTotal').innerText = "เธฟ" + totalSub.toLocaleString();
      document.getElementById('repProfit').innerText = "เธฟ" + totalProfit.toLocaleString();
      document.getElementById('salesHistoryData').innerHTML = historyHtml || '<tr><td colspan="10" class="text-muted">เนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเธฒเธฃเธเธฒเธขเนเธเน€เธ”เธทเธญเธเธเธตเน</td></tr>';
      updateSelectedCount();
    }

    function toggleSelectAllSales() {
      let checked = document.getElementById('selectAllSales').checked;
      document.querySelectorAll('.sale-checkbox').forEach(cb => cb.checked = checked);
      updateSelectedCount();
    }

    function updateSelectedCount() {
      let count = document.querySelectorAll('.sale-checkbox:checked').length;
      let el = document.getElementById('selectedCount');
      el.innerText = count > 0 ? `เน€เธฅเธทเธญเธเนเธฅเนเธง ${count} เธฃเธฒเธขเธเธฒเธฃ` : '';
    }

    async function deleteSelectedSales() {
      let checkboxes = document.querySelectorAll('.sale-checkbox:checked');
      if (checkboxes.length === 0) {
        Swal.fire('เน€เธ•เธทเธญเธ', 'เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเธ•เนเธญเธเธเธฒเธฃเธฅเธเธเนเธญเธ', 'warning');
        return;
      }
      const { isConfirmed } = await Swal.fire({
        title: `เธฅเธ ${checkboxes.length} เธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเน€เธฅเธทเธญเธ?`,
        html: '<div class="text-danger">เธฃเธฐเธเธเธเธฐเธเธทเธเธชเธ•เนเธญเธเธเธฅเธฑเธเน€เธเนเธฒเธเธฅเธฑเธเนเธ”เธขเธญเธฑเธ•เนเธเธกเธฑเธ•เธด</div>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'เนเธเน, เธฅเธเธ—เธฑเนเธเธซเธกเธ”',
        cancelButtonText: 'เธขเธเน€เธฅเธดเธ'
      });
      if (!isConfirmed) return;
      Swal.showLoading();
      try {
        for (let cb of checkboxes) {
          let receiptId = cb.dataset.id;
          let productId = cb.dataset.pid;
          let qty = Number(cb.dataset.qty);
          // เธเธทเธเธชเธ•เนเธญเธ
          const product = globalProducts.find(p => p.id === productId);
          if (product) {
            const { error: stockErr } = await supabaseClient.from('products')
              .update({ stock: product.stock + qty })
              .eq('id', productId);
            if (stockErr) throw stockErr;
            product.stock += qty; // update local cache for next iteration
          }
          // เธฅเธเธฃเธฒเธขเธเธฒเธฃเธเธฒเธข
          const { error: saleErr } = await supabaseClient.from('sales')
            .delete()
            .eq('invoice_id', receiptId);
          if (saleErr) throw saleErr;
        }
        Swal.fire('เธฅเธเน€เธฃเธตเธขเธเธฃเนเธญเธข!', `เธฅเธ ${checkboxes.length} เธฃเธฒเธขเธเธฒเธฃเนเธฅเธฐเธเธทเธเธชเธ•เนเธญเธเน€เธฃเธตเธขเธเธฃเนเธญเธข`, 'success');
        refreshAllData();
      } catch (err) {
        console.error(err);
        Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธฅเธเธฃเธฒเธขเธเธฒเธฃเนเธ”เน', 'error');
      }
    }

    async function deleteSale(receiptId, productId, qty) {
      const { isConfirmed } = await Swal.fire({
        title: 'เธฅเธเธฃเธฒเธขเธเธฒเธฃเธเธฒเธขเธเธตเน?',
        html: `<div class="text-danger fw-bold">เน€เธฅเธเธเธดเธฅ: ${receiptId}</div><div class="text-muted small mt-1">เธฃเธฐเธเธเธเธฐเธเธทเธเธชเธ•เนเธญเธเธเธฅเธฑเธเน€เธเนเธฒเธเธฅเธฑเธเนเธ”เธขเธญเธฑเธ•เนเธเธกเธฑเธ•เธด</div>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'เนเธเน, เธฅเธเน€เธฅเธข',
        cancelButtonText: 'เธขเธเน€เธฅเธดเธ'
      });
      if (!isConfirmed) return;
      Swal.showLoading();
      try {
        // เธเธทเธเธชเธ•เนเธญเธ
        const product = globalProducts.find(p => p.id === productId);
        if (product) {
          const { error: stockErr } = await supabaseClient.from('products')
            .update({ stock: product.stock + qty })
            .eq('id', productId);
          if (stockErr) throw stockErr;
        }
        // เธฅเธเธฃเธฒเธขเธเธฒเธฃเธเธฒเธข
        const { error: saleErr } = await supabaseClient.from('sales')
          .delete()
          .eq('invoice_id', receiptId);
        if (saleErr) throw saleErr;
        Swal.fire('เธฅเธเน€เธฃเธตเธขเธเธฃเนเธญเธข!', 'เธฅเธเธฃเธฒเธขเธเธฒเธฃเนเธฅเธฐเธเธทเธเธชเธ•เนเธญเธเน€เธฃเธตเธขเธเธฃเนเธญเธข', 'success');
        refreshAllData();
      } catch (err) {
        console.error(err);
        Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธฅเธเธฃเธฒเธขเธเธฒเธฃเนเธ”เน', 'error');
      }
    }

    async function editSaleModal(s) {
      const { value: formValues } = await Swal.fire({
        title: `เนเธเนเนเธเธฃเธฒเธขเธเธฒเธฃเธเธฒเธข`,
        html: `
          <div class="text-start">
            <label class="small fw-bold mb-1">เธเธทเนเธญเธฅเธนเธเธเนเธฒ</label>
            <input id="edit_cusName" class="swal2-input" value="${s.cusName || ''}" placeholder="เธเธทเนเธญเธฅเธนเธเธเนเธฒ">
            <label class="small fw-bold mb-1">เธ—เธตเนเธญเธขเธนเน/เน€เธเธญเธฃเนเนเธ—เธฃเธจเธฑเธเธ—เน</label>
            <input id="edit_address" class="swal2-input" value="${s.address || ''}" placeholder="เธ—เธตเนเธญเธขเธนเน/เน€เธเธญเธฃเนเนเธ—เธฃเธจเธฑเธเธ—เน">
            <label class="small fw-bold mb-1">เธฃเธฒเธเธฒเธเธฒเธขเธเธฃเธดเธ (เธขเธญเธ”เธฃเธงเธกเธ—เธฑเนเธเธชเธดเนเธ)</label>
            <input id="edit_grandTotal" class="swal2-input" type="number" value="${Number(s.totalSales)}" placeholder="เธขเธญเธ”เธฃเธงเธก">
            <label class="small fw-bold mb-1">เธเนเธฒเธเธเธชเนเธ (เธเธฒเธ—)</label>
            <input id="edit_shippingCost" class="swal2-input" type="number" value="${Number(s.shippingCost || 0)}" placeholder="เธเนเธฒเธเธเธชเนเธ" min="0">
          </div>`,
        showCancelButton: true,
        confirmButtonText: 'เธเธฑเธเธ—เธถเธเธเธฒเธฃเนเธเนเนเธ',
        cancelButtonText: 'เธขเธเน€เธฅเธดเธ',
        preConfirm: () => ({
          cusName: document.getElementById('edit_cusName').value,
          address: document.getElementById('edit_address').value,
          grandTotal: Number(document.getElementById('edit_grandTotal').value),
          shippingCost: Number(document.getElementById('edit_shippingCost').value) || 0
        })
      });
      if (!formValues) return;
      Swal.showLoading();
      try {
        // เธเธณเธเธงเธ“เธเธณเนเธฃเนเธซเธกเน: เธเธณเนเธฃ = เธขเธญเธ”เธเธฒเธขเธเนเธญเธ VAT - เธ•เนเธเธ—เธธเธ - เธเนเธฒเธเธเธชเนเธ
        let newProfit = Number(s.subTotal) - Number(s.totalCost) - formValues.shippingCost;
        const { error } = await supabaseClient.from('sales')
          .update({ 
            cus_name: formValues.cusName, 
            address: formValues.address, 
            grand_total: formValues.grandTotal,
            shipping_cost: formValues.shippingCost,
            profit: newProfit
          })
          .eq('invoice_id', s.receiptId);
        if (error) throw error;
        Swal.fire('เธชเธณเน€เธฃเนเธ!', 'เธญเธฑเธเน€เธ”เธ•เน€เธฃเธตเธขเธเธฃเนเธญเธข', 'success');
        refreshAllData();
      } catch (err) {
        console.error(err);
        Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธเนเนเธเนเธ”เน', 'error');
      }
    }

    async function updateOrderStatus(receiptId, productId, qty, newStatus) {
      let actionText = newStatus === 'COMPLETED' ? 'เธขเธทเธเธขเธฑเธเธฃเธฑเธเน€เธเธดเธ COD เน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธงเนเธเนเธซเธฃเธทเธญเนเธกเน?' : 'เธขเธทเธเธขเธฑเธเธ•เธตเธเธฅเธฑเธ/เธขเธเน€เธฅเธดเธ เธญเธญเน€เธ”เธญเธฃเนเธเธตเน เนเธฅเธฐเธเธทเธเธชเธ•เนเธญเธเนเธเนเธซเธฃเธทเธญเนเธกเน?';
      
      const { isConfirmed } = await Swal.fire({
        title: 'เธขเธทเธเธขเธฑเธเธญเธฑเธเน€เธ”เธ•เธชเธ–เธฒเธเธฐ?',
        text: actionText,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'เนเธเน, เธญเธฑเธเน€เธ”เธ•',
        cancelButtonText: 'เธขเธเน€เธฅเธดเธ'
      });

      if (!isConfirmed) return;

      Swal.showLoading();
      try {
        if (newStatus === 'CANCELLED') {
          // เธ”เธถเธเธเนเธญเธกเธนเธฅเธชเธดเธเธเนเธฒเน€เธ”เธดเธกเธกเธฒเน€เธเธดเนเธกเธชเธ•เนเธญเธ
          const product = globalProducts.find(p => p.id === productId);
          if (product) {
            const { error: stockErr } = await supabaseClient.from('products')
              .update({ stock: product.stock + qty })
              .eq('id', productId);
            if (stockErr) throw stockErr;
          }
        }

        // เธญเธฑเธเน€เธ”เธ•เธชเธ–เธฒเธเธฐเธญเธญเน€เธ”เธญเธฃเน
        let updateData = { status: newStatus };
        if (newStatus === 'COMPLETED') {
          // เธ–เนเธฒ COD เธชเธณเน€เธฃเนเธ เธเธฐเธ–เธทเธญเธงเนเธฒเธเนเธฒเธขเธเธฃเธ (deposit_remaining = 0, deposit_amount = grand_total)
          const sale = globalSales.find(s => s.receiptId === receiptId);
          if (sale) {
            updateData.deposit_amount = sale.totalSales;
            updateData.deposit_remaining = 0;
            // เธเธฑเธเธ—เธถเธเธงเธฑเธเธ—เธตเนเธเธณเธฃเธฐเธเธฃเธ เน€เธเธทเนเธญเธเธฑเธเธขเธญเธ”เธเธฒเธขเธ•เธฒเธกเน€เธ”เธทเธญเธเธ—เธตเนเธฃเธฑเธเน€เธเธดเธเธเธฃเธดเธ
            updateData.completed_date = new Date().toISOString().split('T')[0];
          }
        }

        const { error: saleErr } = await supabaseClient.from('sales')
          .update(updateData)
          .eq('invoice_id', receiptId);

        if (saleErr) throw saleErr;

        Swal.fire('เธชเธณเน€เธฃเนเธ!', 'เธญเธฑเธเน€เธ”เธ•เธชเธ–เธฒเธเธฐเน€เธฃเธตเธขเธเธฃเนเธญเธข', 'success');
        refreshAllData();
      } catch (error) {
        console.error(error);
        Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธญเธฑเธเน€เธ”เธ•เธชเธ–เธฒเธเธฐเนเธ”เน', 'error');
      }
    }

    async function payMoreDeposit(receiptId, currentDeposit, currentRemaining, grandTotal) {
      const { value: payAmount } = await Swal.fire({
        title: 'เธเธณเธฃเธฐเน€เธเธดเธเน€เธเธดเนเธก',
        html: `<div class="text-start">
          <p><strong>เน€เธฅเธเธเธดเธฅ:</strong> ${receiptId}</p>
          <p><strong>เธขเธญเธ”เธฃเธงเธกเธ—เธฑเนเธเธซเธกเธ”:</strong> <span class="text-primary">เธฟ${grandTotal.toLocaleString()}</span></p>
          <p><strong>เธเธณเธฃเธฐเนเธฅเนเธง (เธกเธฑเธ”เธเธณ):</strong> <span class="text-warning">เธฟ${currentDeposit.toLocaleString()}</span></p>
          <p><strong>เธขเธญเธ”เธเนเธฒเธเธเธณเธฃเธฐ:</strong> <span class="text-danger fw-bold">เธฟ${currentRemaining.toLocaleString()}</span></p>
          <hr>
          <label class="fw-bold">เธเธณเธเธงเธเน€เธเธดเธเธ—เธตเนเธเธณเธฃเธฐเน€เธเธดเนเธก (เธเธฒเธ—):</label>
        </div>`,
        input: 'number',
        inputAttributes: { min: 1, max: currentRemaining, step: '0.01' },
        inputValue: currentRemaining,
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-check"></i> เธขเธทเธเธขเธฑเธเธเธณเธฃเธฐ',
        cancelButtonText: 'เธขเธเน€เธฅเธดเธ',
        confirmButtonColor: '#f97316',
        inputValidator: (value) => {
          if (!value || Number(value) <= 0) return 'เธเธฃเธธเธ“เธฒเธเธฃเธญเธเธเธณเธเธงเธเน€เธเธดเธเธ—เธตเนเธเธณเธฃเธฐ';
          if (Number(value) > currentRemaining) return `เธเธณเธเธงเธเน€เธเธดเธเธ•เนเธญเธเนเธกเนเน€เธเธดเธเธขเธญเธ”เธเนเธฒเธ เธฟ${currentRemaining.toLocaleString()}`;
        }
      });

      if (payAmount) {
        let newDeposit = currentDeposit + Number(payAmount);
        let newRemaining = currentRemaining - Number(payAmount);
        if (newRemaining < 0.01) newRemaining = 0; // เธเธฑเธ”เน€เธจเธฉ

        Swal.showLoading();
        try {
          let updateData = { deposit_amount: newDeposit, deposit_remaining: newRemaining };
          // เธ–เนเธฒเธเธณเธฃเธฐเธเธฃเธ โ’ เธเธฑเธเธ—เธถเธ completed_date เน€เธเนเธเธงเธฑเธเธ—เธตเนเธเธฑเธเธเธธเธเธฑเธ (เน€เธ”เธทเธญเธเธ—เธตเนเธฃเธฑเธเน€เธเธดเธ)
          if (newRemaining === 0) {
            updateData.completed_date = new Date().toISOString().split('T')[0];
          }
          const { error } = await supabaseClient.from('sales')
            .update(updateData)
            .eq('invoice_id', receiptId);
          if (error) throw error;

          let statusMsg = newRemaining === 0 ? 'เธเธณเธฃเธฐเธเธฃเธเน€เธ•เนเธกเธเธณเธเธงเธเนเธฅเนเธง! เธขเธญเธ”เธเธฒเธขเธเธฐเธเธฑเธเน€เธเนเธเธเธญเธเน€เธ”เธทเธญเธเธเธตเน' : `เธเธณเธฃเธฐเน€เธเธดเนเธก เธฟ${Number(payAmount).toLocaleString()} เธชเธณเน€เธฃเนเธ\nเธขเธญเธ”เธเธเน€เธซเธฅเธทเธญ: เธฟ${newRemaining.toLocaleString()}`;
          Swal.fire('เธชเธณเน€เธฃเนเธ!', statusMsg, 'success');
          refreshAllData();
        } catch (error) {
          console.error(error);
          Swal.fire('เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธเธฑเธเธ—เธถเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธเนเธ”เน', 'error');
        }
      }
    }

    function pullToInvoice(sale) {
      openInvoiceCreator();
      document.getElementById('qtDocId').value = sale.receiptId;
      document.getElementById('qtCusName').value = sale.cusName;
      document.getElementById('qtCusAddress').value = sale.address;

      let tbody = document.getElementById('qtTableBody');
      tbody.innerHTML = `<tr>
         <td>1</td>
         <td><input type="text" class="form-control form-control-sm text-start row-desc" value="${sale.productName}" required></td>
         <td><input type="number" class="form-control form-control-sm text-center row-qty" value="${sale.qty}" min="1" required oninput="calcCustomInvoiceTotal()"></td>
         <td><input type="number" class="form-control form-control-sm text-end row-price" value="${sale.subTotal / sale.qty}" min="0" required oninput="calcCustomInvoiceTotal()"></td>
         <td class="fw-bold row-total">เธฟ${Number(sale.subTotal).toLocaleString()}</td>
         <td><button class="btn btn-sm btn-link text-danger" onclick="this.closest('tr').remove();calcCustomInvoiceTotal();"><i class="fa-solid fa-trash"></i></button></td>
      </tr>`;
      calcCustomInvoiceTotal();
      document.getElementById('invoiceCreatorCard').scrollIntoView({ behavior: 'smooth' });
    }

    function pullToParcel(sale) {
      document.getElementById('pcName').value = sale.cusName || '';
      document.getElementById('pcAddress').value = sale.address !== "-" ? sale.address : "";
      document.getElementById('pcPhone').value = "";
      document.getElementById('pcProductName').value = sale.productName || '';
      document.getElementById('pcQty').value = sale.qty || 1;

      // เธ–เนเธฒเน€เธเนเธ COD เธ”เธถเธเธขเธญเธ”เธกเธฒเนเธชเน
      if (sale.paymentMethod === 'COD' || sale.status === 'PENDING_COD') {
        document.getElementById('pcCodAmount').value = Number(sale.totalSales || 0).toLocaleString();
      } else {
        document.getElementById('pcCodAmount').value = '';
      }

      const triggerTab = document.querySelector('#reportTabs button[data-bs-target="#tab-parcel"]');
      if (triggerTab) triggerTab.click();
      Swal.fire('เธ”เธถเธเธเนเธญเธกเธนเธฅเธชเธณเน€เธฃเนเธ', 'เธ”เธถเธเธเนเธญเธกเธนเธฅเธฅเธนเธเธเนเธฒเนเธฅเธฐเธชเธดเธเธเนเธฒเน€เธเนเธฒเนเธเธขเธฑเธเนเธ—เนเธเนเธเธเธฐเธซเธเนเธฒเธเธฑเธชเธ”เธธเน€เธฃเธตเธขเธเธฃเนเธญเธข', 'success');
    }

    function generateParcelLabel() {
      // Receiver info
      document.getElementById('lblPcName').innerText = document.getElementById('pcName').value;
      document.getElementById('lblPcAddress').innerText = document.getElementById('pcAddress').value;
      document.getElementById('lblPcPhone').innerText = document.getElementById('pcPhone').value || '-';

      // Tracking
      let tracking = document.getElementById('pcTracking').value;
      document.getElementById('lblPcTracking').innerText = tracking || '-';

      // Print datetime
      let now = new Date();
      let dateTimeStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      document.getElementById('lblPcPrintDateTime').innerText = dateTimeStr;

      document.getElementById('printParcelSection').classList.remove('d-none');
      window.print();
      setTimeout(() => { document.getElementById('printParcelSection').classList.add('d-none'); }, 1000);
    }

    function openInvoiceCreator() {
      document.getElementById('invoiceCreatorCard').style.display = 'block';
      let today = new Date().toISOString().split('T')[0];
      document.getElementById('qtDate').value = today;
      if (document.getElementById('qtTableBody').children.length === 0) addInvoiceRow();
      // Populate product selector
      let selectEl = document.getElementById('qtProductSelect');
      let optHtml = '<option value="">-- เน€เธฅเธทเธญเธเธชเธดเธเธเนเธฒเธ—เธตเนเธกเธต stock --</option>';
      globalProducts.forEach(p => {
        if (p.stock > 0) {
          optHtml += `<option value="${p.id}" data-name="${p.name}" data-price="${p.actualPrice}" data-brand="${p.brand}" data-stock="${p.stock}">${p.name} (เธขเธตเนเธซเนเธญ: ${p.brand} | เธฃเธฒเธเธฒ: เธฟ${p.actualPrice.toLocaleString()} | เธเธเน€เธซเธฅเธทเธญ: ${p.stock})</option>`;
        }
      });
      selectEl.innerHTML = optHtml;
    }

    function closeInvoiceCreator() { document.getElementById('invoiceCreatorCard').style.display = 'none'; }

    function addInvoiceRowFromProduct() {
      let selectEl = document.getElementById('qtProductSelect');
      let opt = selectEl.options[selectEl.selectedIndex];
      if (!opt || !opt.value) {
        return;
      }
      let productName = opt.getAttribute('data-name');
      let productPrice = Number(opt.getAttribute('data-price')) || 0;

      let tbody = document.getElementById('qtTableBody');
      
      // Check if there is an empty row we can reuse
      let emptyRow = null;
      for (let i = 0; i < tbody.children.length; i++) {
        let rowDesc = tbody.children[i].querySelector('.row-desc').value;
        if (!rowDesc || rowDesc.trim() === '') {
          emptyRow = tbody.children[i];
          break;
        }
      }

      if (emptyRow) {
        emptyRow.querySelector('.row-desc').value = productName;
        emptyRow.querySelector('.row-qty').value = 1;
        emptyRow.querySelector('.row-price').value = productPrice;
        emptyRow.querySelector('.row-total').innerText = "เธฟ" + productPrice.toLocaleString();
      } else {
        let idx = tbody.children.length + 1;
        let tr = document.createElement('tr');
        tr.innerHTML = `
           <td>${idx}</td>
           <td><input type="text" class="form-control form-control-sm text-start row-desc" value="${productName}" required></td>
           <td><input type="number" class="form-control form-control-sm text-center row-qty" value="1" min="1" required oninput="calcCustomInvoiceTotal()"></td>
           <td><input type="number" class="form-control form-control-sm text-end row-price" value="${productPrice}" min="0" required oninput="calcCustomInvoiceTotal()"></td>
           <td class="fw-bold row-total">เธฟ${productPrice.toLocaleString()}</td>
           <td><button type="button" class="btn btn-sm btn-link text-danger" onclick="this.closest('tr').remove();calcCustomInvoiceTotal();"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
      }
      
      calcCustomInvoiceTotal();
      selectEl.value = ''; // Reset select
    }

    function addInvoiceRow() {
      let tbody = document.getElementById('qtTableBody');
      let idx = tbody.children.length + 1;
      let tr = document.createElement('tr');
      tr.innerHTML = `
         <td>${idx}</td>
         <td><input type="text" class="form-control form-control-sm text-start row-desc" placeholder="เธฃเธฐเธเธธเธฃเธฒเธขเธเธฒเธฃเธชเธดเธเธเนเธฒ" required></td>
         <td><input type="number" class="form-control form-control-sm text-center row-qty" value="1" min="1" required oninput="calcCustomInvoiceTotal()"></td>
         <td><input type="number" class="form-control form-control-sm text-end row-price" value="0" min="0" required oninput="calcCustomInvoiceTotal()"></td>
         <td class="fw-bold row-total">เธฟ0.00</td>
         <td><button type="button" class="btn btn-sm btn-link text-danger" onclick="this.closest('tr').remove();calcCustomInvoiceTotal();"><i class="fa-solid fa-trash"></i></button></td>
      `;
      tbody.appendChild(tr);
      calcCustomInvoiceTotal();
    }

    function calcCustomInvoiceTotal() {
      let rows = document.querySelectorAll('#qtTableBody tr');
      let totalSub = 0;
      rows.forEach((row, i) => {
        row.children[0].innerText = i + 1;
        let qty = Number(row.querySelector('.row-qty').value) || 0;
        let prc = Number(row.querySelector('.row-price').value) || 0;
        let amt = qty * prc;
        totalSub += amt;
        row.querySelector('.row-total').innerText = "เธฟ" + amt.toLocaleString();
      });
    }

    function printCustomInvoice() {
      document.getElementById('invTitleDisplay').innerText = document.getElementById('qtDocType').value;
      document.getElementById('invDocId').innerText = document.getElementById('qtDocId').value || 'CUSTOM-เธเธดเธฅ';
      let dParts = document.getElementById('qtDate').value.split('-');
      document.getElementById('invDate').innerText = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : '-';
      document.getElementById('invTerm').innerText = document.getElementById('qtPaymentTerm').value;
      document.getElementById('invCusName').innerText = document.getElementById('qtCusName').value || 'เธฅเธนเธเธเนเธฒเธ—เธฑเนเธงเนเธ';
      document.getElementById('invCusAddress').innerText = document.getElementById('qtCusAddress').value || '-';

      let rows = document.querySelectorAll('#qtTableBody tr');
      let html = '', subTotal = 0;
      rows.forEach((row, i) => {
        let desc = row.querySelector('.row-desc').value;
        let qty = Number(row.querySelector('.row-qty').value) || 0;
        let prc = Number(row.querySelector('.row-price').value) || 0;
        let amt = qty * prc;
        subTotal += amt;
        html += `<tr><td>${i + 1}</td><td class="text-start">${desc}</td><td>${qty}</td><td>เธฟ${prc.toLocaleString()}</td><td>เธฟ${amt.toLocaleString()}</td></tr>`;
      });

      let docType = document.getElementById('qtDocType').value;
      let isNoVat = docType.includes('CASH RECEIPT') || docType.includes('NO VAT');
      let vat = isNoVat ? 0 : subTotal * 0.07;
      let grandTotal = subTotal + vat;

      document.getElementById('invItemsBody').innerHTML = html;
      document.getElementById('invSubTotal').innerText = "เธฟ" + subTotal.toLocaleString();
      document.getElementById('invVat').innerText = isNoVat ? "-" : "เธฟ" + vat.toLocaleString();
      document.getElementById('invGrandTotal').innerText = "เธฟ" + grandTotal.toLocaleString();

      document.getElementById('printInvoiceSection').classList.remove('d-none');
      window.print();
      setTimeout(() => { document.getElementById('printInvoiceSection').classList.add('d-none'); }, 1000);
    }

    function getAllTransactions() {
      let combined = [];
      let manualIds = new Set(globalTransactions.map(t => t.id));

      globalTransactions.forEach(t => {
        if (t.note !== 'DELETED_AUTO') {
          combined.push({
            id: t.id,
            date: t.date || "01/01/2000",
            type: t.type,
            category: t.category,
            amount: t.amount,
            note: t.note,
            source: 'manual'
          });
        }
      });

      globalSales.forEach(s => {
        if (!manualIds.has(s.receiptId)) {
          combined.push({
            id: s.receiptId,
            date: s.date || "01/01/2000",
            type: 'เธฃเธฒเธขเธฃเธฑเธ',
            category: 'เธเธฒเธขเธชเธดเธเธเนเธฒ: ' + s.productName,
            amount: s.totalSales,
            note: 'เธฅเธนเธเธเนเธฒ: ' + s.cusName + ' (เธเธณเธเธงเธ ' + s.qty + ' เน€เธเธฃเธทเนเธญเธ)',
            source: 'sale'
          });
        }
      });

      globalProducts.forEach(p => {
        let soldQty = 0;
        globalSales.forEach(s => {
          if (s.productId === p.id) {
            soldQty += Number(s.qty);
          }
        });
        let totalImported = Number(p.stock) + soldQty;
        if (totalImported > 0) {
          let impId = 'IMP-' + p.id;
          if (!manualIds.has(impId)) {
            let d = p.updatedAt ? p.updatedAt.split('T')[0] : "2000-01-01";
            combined.push({
              id: impId,
              date: formatDateToTH(d),
              type: 'เธฃเธฒเธขเธเนเธฒเธข',
              category: 'เธเธทเนเธญเธชเธดเธเธเนเธฒเน€เธเนเธฒ: ' + p.name,
              amount: Number(p.cost) * totalImported,
              note: 'เธเธณเธเธงเธเธเธฑเธ”เธเธทเนเธญเธฃเธงเธก ' + totalImported + ' เน€เธเธฃเธทเนเธญเธ (เธญเนเธฒเธเธญเธดเธเธเธฒเธเธเธฅเธฑเธเนเธฅเธฐเธขเธญเธ”เธเธฒเธข)',
              source: 'import'
            });
          }
        }
      });

      return combined;
    }

    function renderTransactionsTable() {
      let filter = document.getElementById('monthFilter').value;
      let targetMonth = filter.split('-')[1] + "/" + filter.split('-')[0];

      let html = '';
      let allTx = getAllTransactions();
      // เน€เธฃเธตเธขเธเธเธฒเธเนเธซเธกเนเนเธเน€เธเนเธฒ
      let sortedTx = allTx.sort((a, b) => {
        let dateA = a.date.split('/').reverse().join('');
        let dateB = b.date.split('/').reverse().join('');
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return b.id.localeCompare(a.id);
      });

      sortedTx.forEach(t => {
        let parts = t.date.split('/');
        let tMonth = parts.length === 3 ? parts[1] + "/" + parts[2] : "";
        if (tMonth === targetMonth) {
          let actionButtons = `
            <button class="btn btn-xs btn-warning px-2 py-1 small btn-sm" onclick="editTransaction('${t.id}','${t.date}','${t.type}','${t.category}',${t.amount},'${t.note || ""}')" title="เนเธเนเนเธเธฃเธฒเธขเธเธฒเธฃ"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-xs btn-danger px-2 py-1 small btn-sm" onclick="deleteTxConfirm('${t.id}')" title="เธฅเธเธฃเธฒเธขเธเธฒเธฃ"><i class="fa-solid fa-trash"></i></button>
          `;
          if (t.source !== 'manual') {
            actionButtons += ` <span class="badge bg-secondary small ms-1">Auto</span>`;
          }

          html += `<tr>
                 <td><span class="badge bg-dark" style="font-size:0.75rem;">${t.id}</span></td>
                 <td>${t.date}</td>
                 <td><span class="badge ${t.type === 'เธฃเธฒเธขเธฃเธฑเธ' ? 'bg-success' : 'bg-danger'}">${t.type}</span></td>
                 <td class="text-start fw-medium">${t.category}</td>
                 <td class="fw-bold">เธฟ${Number(t.amount).toLocaleString()}</td>
                 <td class="text-start text-muted" style="font-size:0.85rem;">${t.note || '-'}</td>
                 <td>${actionButtons}</td>
              </tr>`;
        }
      });
      document.getElementById('txTableBody').innerHTML = html || '<tr><td colspan="7" class="text-muted">เนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธฃเธฒเธขเธฃเธฑเธ-เธฃเธฒเธขเธเนเธฒเธขเนเธเน€เธ”เธทเธญเธเธเธตเนเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>';
    }

    function printTxReport() {
      let filter = document.getElementById('monthFilter').value;
      let targetMonth = filter ? filter.split('-')[1] + "/" + filter.split('-')[0] : "เธ—เธฑเนเธเธซเธกเธ”";

      document.getElementById('txPrintMonth').innerText = "เธเธฃเธฐเธเธณเน€เธ”เธทเธญเธ: " + targetMonth;

      let html = '';
      let totalIncome = 0;
      let totalExpense = 0;
      let count = 1;

      let allTx = getAllTransactions();
      // เธเธดเธกเธเนเน€เธฃเธตเธขเธเธ•เธฒเธกเน€เธงเธฅเธฒเน€เธเนเธฒเนเธเนเธซเธกเน
      let sortedTx = allTx.sort((a, b) => {
        let dateA = a.date.split('/').reverse().join('');
        let dateB = b.date.split('/').reverse().join('');
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return a.id.localeCompare(b.id);
      });

      sortedTx.forEach(t => {
        let parts = t.date.split('/');
        let tMonth = parts.length === 3 ? parts[1] + "/" + parts[2] : "";
        if (filter && tMonth !== targetMonth) return;

        let inc = t.type === 'เธฃเธฒเธขเธฃเธฑเธ' ? Number(t.amount) : 0;
        let exp = t.type === 'เธฃเธฒเธขเธเนเธฒเธข' ? Number(t.amount) : 0;

        totalIncome += inc;
        totalExpense += exp;

        html += `<tr>
             <td>${count++}</td>
             <td>${t.date}</td>
             <td class="text-start">${t.category} ${t.note ? ' <small class="text-muted">(' + t.note + ')</small>' : ''}</td>
             <td class="${inc > 0 ? 'text-success' : ''}">${inc > 0 ? inc.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
             <td class="${exp > 0 ? 'text-danger' : ''}">${exp > 0 ? exp.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}</td>
          </tr>`;
      });

      if (html === '') html = '<tr><td colspan="5" class="text-muted text-center py-4">เนเธกเนเธกเธตเธเธฃเธฐเธงเธฑเธ•เธดเธเนเธญเธกเธนเธฅเนเธเธเธงเธ”เน€เธ”เธทเธญเธเธ—เธตเนเน€เธฅเธทเธญเธ</td></tr>';

      document.getElementById('txPrintBody').innerHTML = html;
      document.getElementById('txPrintTotalIncome').innerText = totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 });
      document.getElementById('txPrintTotalExpense').innerText = totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 });

      let balance = totalIncome - totalExpense;
      let balElem = document.getElementById('txPrintBalance');
      balElem.innerText = balance.toLocaleString(undefined, { minimumFractionDigits: 2 });
      balElem.className = balance >= 0 ? 'text-primary' : 'text-danger';

      document.getElementById('printTxReportSection').classList.remove('d-none');
      window.print();
      setTimeout(() => { document.getElementById('printTxReportSection').classList.add('d-none'); }, 1000);
    }

    async function submitTransaction(e) {
      e.preventDefault();
      let id = document.getElementById('tx_id').value;
      let txData = {
        date: document.getElementById('tx_date').value,
        type: document.getElementById('tx_type').value,
        category: document.getElementById('tx_category').value,
        amount: Number(document.getElementById('tx_amount').value),
        note: document.getElementById('tx_note').value
      };

      Swal.showLoading();
      try {
        if (id) {
          let exists = globalTransactions.find(t => t.id === id);
          if (exists) {
            // Update
            const { error } = await supabaseClient.from('transactions').update(txData).eq('tx_id', id);
            if (error) throw error;
          } else {
            // Insert Override
            txData.tx_id = id;
            const { error } = await supabaseClient.from('transactions').insert([txData]);
            if (error) throw error;
          }
        } else {
          // Insert
          txData.tx_id = "TX-" + Date.now();
          const { error } = await supabaseClient.from('transactions').insert([txData]);
          if (error) throw error;
        }
        Swal.fire('เธชเธณเน€เธฃเนเธ', 'เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธฑเธเธเธตเน€เธฃเธตเธขเธเธฃเนเธญเธข', 'success');
        resetTxForm();
        refreshAllData();
      } catch (error) {
        console.error(error);
        Swal.fire('เธเธดเธ”เธเธฅเธฒเธ”', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเนเธ”เน', 'error');
      }
    }

    function editTransaction(id, date, type, category, amount, note) {
      document.getElementById('txFormTitle').innerHTML = `<i class="fa-solid fa-pen-to-square text-warning"></i> เนเธเนเนเธเธเนเธญเธกเธนเธฅเธฃเธฒเธขเธเธฒเธฃเธเธฑเธเธเธต (เธฃเธซเธฑเธช: ${id})`;
      document.getElementById('tx_id').value = id;

      let parts = date.split('/');
      if (parts.length === 3) document.getElementById('tx_date').value = `${parts[2]}-${parts[1]}-${parts[0]}`;

      document.getElementById('tx_type').value = type;
      document.getElementById('tx_category').value = category;
      document.getElementById('tx_amount').value = amount;
      document.getElementById('tx_note').value = note;

      document.getElementById('btnSaveTx').className = "btn btn-warning w-100 fw-bold";
      document.getElementById('btnSaveTx').innerHTML = '<i class="fa-solid fa-check"></i> เธญเธฑเธเน€เธ”เธ•เธฃเธฒเธขเธเธฒเธฃเนเธ–เธงเธเนเธญเธกเธนเธฅ';
      document.getElementById('btnCancelTxEdit').classList.remove('d-none');
      document.getElementById('txForm').scrollIntoView({ behavior: 'smooth' });
    }

    function resetTxForm() {
      document.getElementById('txFormTitle').innerHTML = '<i class="fa-solid fa-circle-plus text-primary"></i> เน€เธเธดเนเธกเธฃเธฒเธขเธเธฒเธฃเธเธฑเธเธเธตเธฃเธฒเธขเธฃเธฑเธ/เธฃเธฒเธขเธเนเธฒเธข';
      document.getElementById('txForm').reset();
      document.getElementById('tx_id').value = '';
      document.getElementById('btnSaveTx').className = "btn btn-primary w-100 fw-bold";
      document.getElementById('btnSaveTx').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธฑเธเธเธต';
      document.getElementById('btnCancelTxEdit').classList.add('d-none');
    }

    function deleteTxConfirm(id) {
      Swal.fire({
        title: 'เธขเธทเธเธขเธฑเธเธฅเธเธเนเธญเธกเธนเธฅ?',
        text: "เธเธธเธ“เธ•เนเธญเธเธเธฒเธฃเธฅเธเธฃเธฒเธขเธเธฒเธฃเธฃเธฒเธขเธฃเธฑเธ-เธฃเธฒเธขเธเนเธฒเธขเธฃเธซเธฑเธช " + id + " เธเธตเนเนเธเนเธซเธฃเธทเธญเนเธกเน!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'เธขเธทเธเธขเธฑเธเธฅเธ',
        cancelButtonText: 'เธขเธเน€เธฅเธดเธ'
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.showLoading();
          try {
            let isAuto = id.startsWith('INV-') || id.startsWith('IMP-');
            if (isAuto) {
              let exists = globalTransactions.find(t => t.id === id);
              let txData = { tx_id: id, type: 'เธฃเธฒเธขเธฃเธฑเธ', date: new Date().toISOString().split('T')[0], category: 'เธฅเธเธฃเธฒเธขเธเธฒเธฃ (เธเนเธญเธ)', amount: 0, note: 'DELETED_AUTO' };
              if (exists) {
                const { error } = await supabaseClient.from('transactions').update(txData).eq('tx_id', id);
                if (error) throw error;
              } else {
                const { error } = await supabaseClient.from('transactions').insert([txData]);
                if (error) throw error;
              }
            } else {
              const { error } = await supabaseClient.from('transactions').delete().eq('tx_id', id);
              if (error) throw error;
            }
            Swal.fire('เธฅเธเธฃเธฒเธขเธเธฒเธฃเธชเธณเน€เธฃเนเธ', '', 'success');
            refreshAllData();
          } catch (error) {
            console.error(error);
            Swal.fire('เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธฅเธเธเนเธญเธกเธนเธฅเนเธ”เน', 'error');
          }
        }
      });
    }

    async function submitProduct(e) {
      e.preventDefault();
      let id = document.getElementById('p_id').value;
      let prodData = {
        updated_at: new Date(document.getElementById('p_date').value).toISOString(),
        name: document.getElementById('p_name').value,
        brand: document.getElementById('p_brand').value,
        cost: Number(document.getElementById('p_cost').value),
        actual_price: Number(document.getElementById('p_actualPrice').value),
        stock: Number(document.getElementById('p_stock').value),
        fb_link: document.getElementById('p_fbLink').value || null
      };

      Swal.showLoading();
      try {
        if (id) {
          const { error } = await supabaseClient.from('products').update(prodData).eq('id', id);
          if (error) throw error;
        } else {
          prodData.id = "PROD-" + Date.now();
          const { error } = await supabaseClient.from('products').insert([prodData]);
          if (error) throw error;
        }
        Swal.fire('เธชเธณเน€เธฃเนเธ', 'เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธชเธดเธเธเนเธฒเน€เธฃเธตเธขเธเธฃเนเธญเธข', 'success');
        resetProductForm();
        refreshAllData();
      } catch (error) {
        console.error(error);
        Swal.fire('เธฅเนเธกเน€เธซเธฅเธง', 'เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเนเธ”เน', 'error');
      }
    }

    function editProduct(id, date, name, brand, cost, actualPrice, stock, fbLink = "") {
      document.getElementById('productPageTitle').innerText = "เนเธเนเนเธเธเนเธญเธกเธนเธฅเธชเธดเธเธเนเธฒ (เธฃเธซเธฑเธช: " + id + ")";
      document.getElementById('p_id').value = id;
      // updated_at เน€เธเนเธ timestamp ISO เธเธฒเธ Supabase เน€เธเนเธ 2026-06-25T08:00:00.000Z
      if (date && date.includes('T')) {
        document.getElementById('p_date').value = date.split('T')[0];
      } else if (date && date.includes('/')) {
        let parts = date.split('/');
        if (parts.length === 3) document.getElementById('p_date').value = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (date) {
        document.getElementById('p_date').value = date;
      }
      document.getElementById('p_name').value = name;
      document.getElementById('p_brand').value = brand;
      document.getElementById('p_cost').value = cost;
      document.getElementById('p_actualPrice').value = actualPrice;
      document.getElementById('p_stock').value = stock;
      document.getElementById('p_fbLink').value = fbLink && fbLink !== 'undefined' ? fbLink : "";
      document.getElementById('btnSaveProduct').className = "btn btn-primary w-100";
      document.getElementById('btnSaveProduct').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> เธญเธฑเธเน€เธ”เธ•เธเนเธญเธกเธนเธฅเธชเธดเธเธเนเธฒ';
      document.getElementById('btnCancelEdit').classList.remove('d-none');
    }

    function resetProductForm() {
      document.getElementById('productPageTitle').innerText = "เธเธฑเธ”เธเธฒเธฃเธเนเธญเธกเธนเธฅเธชเธดเธเธเนเธฒเนเธเธเธฅเธฑเธ / เธเธณเน€เธเนเธฒเธชเธ•เนเธญเธ";
      document.getElementById('formProduct').reset();
      document.getElementById('p_id').value = '';
      let today = new Date().toISOString().split('T')[0];
      document.getElementById('p_date').value = today;
      document.getElementById('btnSaveProduct').className = "btn btn-custom-orange w-100";
      document.getElementById('btnSaveProduct').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅ';
      document.getElementById('btnCancelEdit').classList.add('d-none');
    }

    window.onload = function () {
      let today = new Date().toISOString().split('T')[0];
      document.getElementById('p_date').value = today;
      document.getElementById('saleDate').value = today;
      document.getElementById('tx_date').value = today;

      // เน€เธฃเธดเนเธกเธ”เธถเธเธเนเธญเธกเธนเธฅเน€เธกเธทเนเธญเนเธซเธฅเธ”เธซเธเนเธฒเน€เธงเนเธ
      refreshAllData();
    };
  


