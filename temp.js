<!DOCTYPE html>
<html lang="th">

<head>
  <script>
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
      window.location.replace('login.html');
    }
  </script>
  <meta charset="UTF-8">
  <title>ระบบจัดการ ห้างหุ้นส่วนจำกัด โน๊ตบุ๊ค ไอทีอุดร</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    :root {
      --dark-blue: #0f172a;
      --sidebar-bg: #1e293b;
      --orange: #f97316;
      --light-bg: #f8fafc;
      --white: #ffffff;
      --text-muted: #64748b;
      --shadow-sm: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    body {
      font-family: 'Prompt', sans-serif;
      background-color: var(--light-bg);
      color: #334155;
      overflow-x: hidden;
    }

    .text-orange {
      color: var(--orange) !important;
    }

    .text-dark-blue {
      color: var(--dark-blue) !important;
    }

    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: linear-gradient(180deg, var(--dark-blue) 0%, var(--sidebar-bg) 100%);
      color: var(--white);
      transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
      box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
    }

    .logo-area {
      padding: 30px 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .nav-links {
      list-style: none;
      padding: 0;
      margin-top: 20px;
    }

    .nav-links li {
      padding: 14px 20px;
      margin: 8px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 400;
      border-radius: 12px;
      color: #cbd5e1;
    }

    .nav-links li:hover,
    .nav-links li.active {
      background-color: rgba(249, 115, 22, 0.15);
      color: var(--orange);
      font-weight: 500;
      transform: translateX(5px);
    }

    .nav-links li i {
      margin-right: 15px;
      width: 20px;
      text-align: center;
      font-size: 1.1rem;
    }

    .main-content {
      margin-left: 280px;
      transition: 0.3s;
      min-height: 100vh;
    }

    .topbar {
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      padding: 15px 30px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 0;
      z-index: 999;
    }

    .card {
      box-shadow: var(--shadow-sm);
      border: none;
      border-radius: 1rem;
      transition: transform 0.3s ease;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: var(--white);
      padding: 25px 20px;
      border-radius: 1.2rem;
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.02);
    }

    .stat-card h6 {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin: 0;
      font-weight: 500;
    }

    .stat-card h3 {
      font-weight: 700;
      margin-top: 12px;
      margin-bottom: 0;
      font-size: 1.8rem;
    }

    .bg-icon {
      position: absolute;
      right: -15px;
      bottom: -15px;
      font-size: 6rem;
      color: rgba(0, 0, 0, 0.03);
      transform: rotate(-10deg);
      transition: 0.3s;
    }

    .btn-custom-orange {
      background: linear-gradient(135deg, var(--orange) 0%, #d94600 100%);
      color: var(--white);
      border: none;
      font-weight: 500;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }

    .form-control,
    .form-select {
      border-radius: 0.5rem;
      border-color: #e2e8f0;
      padding: 0.6rem 1rem;
    }

    .table th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.85rem;
      border-bottom: 2px solid #e2e8f0;
    }

    @media (max-width: 768px) {
      .sidebar {
        left: -280px;
      }

      .sidebar.show {
        left: 0;
      }

      .main-content {
        margin-left: 0;
      }
    }

    @media print {
      body * {
        visibility: hidden;
      }

      .print-area,
      .print-area * {
        visibility: visible;
      }

      .print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white;
        z-index: 99999;
      }

      .sidebar,
      .topbar,
      .d-print-none,
      .page-section,
      .card {
        display: none !important;
      }

      .print-wrapper-box.d-none {
        display: none !important;
      }

      .print-wrapper-box:not(.d-none) {
        display: block !important;
      }
    }

    .parcel-label {
      border: 3px dashed #1e293b;
      padding: 0;
      width: 100%;
      max-width: 650px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
    }

    .parcel-sender {
      background: #1e293b;
      color: #fff;
      padding: 18px 25px;
    }

    .parcel-receiver {
      padding: 25px;
    }

    .parcel-product-info {
      background: #f8fafc;
      border-top: 2px dashed #cbd5e1;
      padding: 15px 25px;
    }

    .parcel-footer {
      border-top: 2px dashed #cbd5e1;
      padding: 12px 25px;
      text-align: center;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }

    .double-bottom {
      border-bottom: 4px double #000 !important;
    }

    .invoice-box {
      background: #fff;
      padding: 30px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin: 0 auto;
      max-width: 850px;
    }
  </style>
</head>

<body>

  <div class="sidebar" id="sidebar">
    <div class="logo-area">
      <h5 class="m-0 fw-bold"><i class="fa-solid fa-laptop text-orange fs-3 mb-2"></i><br>ระบบจัดการร้าน</h5>
    </div>
    <ul class="nav-links">
      <li class="active" onclick="showPage('dashboard', this)"><i class="fa-solid fa-chart-pie"></i> แดชบอร์ดภาพรวมร้าน
      </li>
      <li onclick="showPage('view', this)"><i class="fa-solid fa-list-check"></i> ดูรายการสินค้า (สต็อก)</li>
      <li onclick="showPage('products', this)"><i class="fa-solid fa-boxes-stacked"></i> จัดการคลังสินค้า/ซื้อเข้า</li>
      <li onclick="showPage('sales', this)"><i class="fa-solid fa-cash-register"></i> ขายสินค้า/ตัดสต็อก</li>
      <li onclick="showPage('reports', this)"><i class="fa-solid fa-file-invoice-dollar"></i> รายงาน/พิมพ์เอกสาร</li>
      <li onclick="showPage('income-expense', this)"><i class="fa-solid fa-wallet"></i> รายรับ-รายจ่าย (เพื่อภาษี)</li>
      <li onclick="showPage('savings', this)"><i class="fa-solid fa-piggy-bank"></i> เงินฝาก (ออมทรัพย์)</li>
    </ul>
  </div>

  <div class="main-content" id="mainContent">
    <div class="topbar d-flex justify-content-between align-items-center d-print-none">
      <div class="d-flex align-items-center">
        <button class="btn d-md-none border fs-5 text-muted me-3" onclick="toggleSidebar()"><i
            class="fa-solid fa-bars"></i></button>
        <h6 class="m-0 fw-bold text-dark-blue"><i class="fa-solid fa-bolt text-orange me-2"></i> ข้อมูลเชื่อมต่อกับ
          Supabase Database</h6>
      </div>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <label class="small fw-bold text-muted mb-0"><i class="fa-regular fa-calendar-check text-orange"></i>
          เลือกเดือน:</label>
        <input type="month" id="monthFilter"
          class="form-control form-control-sm border-orange text-dark-blue fw-bold shadow-sm" style="max-width:160px;"
          onchange="refreshAllData()">
        <span class="text-muted small mx-1">|</span>
        <label class="small fw-bold text-muted mb-0"><i class="fa-solid fa-magnifying-glass text-info"></i>
          ค้นหาวันที่:</label>
        <input type="date" id="dateSearchFrom"
          class="form-control form-control-sm border-info text-dark-blue fw-bold shadow-sm" style="max-width:145px;"
          title="วันที่เริ่มต้น (ว/ด/ป)" onchange="applyDateSearch()">
        <span class="small text-muted">ถึง</span>
        <input type="date" id="dateSearchTo"
          class="form-control form-control-sm border-info text-dark-blue fw-bold shadow-sm" style="max-width:145px;"
          title="วันที่สิ้นสุด (ว/ด/ป)" onchange="applyDateSearch()">
        <button class="btn btn-sm btn-outline-secondary" onclick="clearDateSearch()" title="ล้างการค้นหาวันที่">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger ms-2" onclick="logout()">
          <i class="fa-solid fa-right-from-bracket"></i> ออกจากระบบ
        </button>
      </div>
    </div>

    <div class="container-fluid py-4 px-md-4">

      <div id="page-dashboard" class="page-section d-print-none">
        <h4 class="mb-4 fw-bold text-dark-blue">แดชบอร์ดประเมินร้าน (เรียลไทม์)</h4>

        <div class="row g-3 mb-3">
          <div class="col-6 col-md-4 col-lg-2">
            <div class="stat-card px-3 py-4">
              <h6>ยอดขายเดือนนี้</h6>
              <h3 class="text-orange" id="dashSales">฿0</h3><i class="fa-solid fa-coins bg-icon"></i>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="stat-card px-3 py-4">
              <h6>กำไรสุทธิเดือนนี้</h6>
              <h3 class="text-success" id="dashProfit">฿0</h3><i class="fa-solid fa-arrow-trend-up bg-icon"></i>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="stat-card px-3 py-4">
              <h6>ขายได้เดือนนี้</h6>
              <h3 class="text-primary" id="dashQty">0 เครื่อง</h3><i class="fa-solid fa-laptop bg-icon"></i>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="stat-card px-3 py-4">
              <h6>แบรนด์ขายดีสุด</h6>
              <h3 class="text-info fs-4 mt-3 fw-bold" id="dashBestBrand">-</h3><i class="fa-solid fa-award bg-icon"></i>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="stat-card px-3 py-4">
              <h6>สินค้าคงเหลือคลัง</h6>
              <h3 class="text-danger" id="dashStock">0 ชิ้น</h3><i class="fa-solid fa-box-open bg-icon"></i>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="stat-card px-3 py-4">
              <h6>ยอดขายปีนี้</h6>
              <h3 class="text-secondary" id="dashYearSales">฿0</h3><i class="fa-solid fa-calendar-check bg-icon"></i>
            </div>
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-6 col-md-4 col-lg-3">
            <div class="stat-card px-3 py-4 border-start border-info border-4">
              <h6>ค้างชำระ COD</h6>
              <h3 class="text-info" id="dashCodPending">฿0</h3><i class="fa-solid fa-truck-fast bg-icon"></i>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-3">
            <div class="stat-card px-3 py-4 border-start border-warning border-4">
              <h6>ค้างชำระมัดจำ</h6>
              <h3 class="text-warning" id="dashDepositPending">฿0</h3><i class="fa-solid fa-hand-holding-dollar bg-icon"></i>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-3">
            <div class="stat-card px-3 py-4 border-start border-danger border-4">
              <h6>ค่าขนส่งเดือนนี้</h6>
              <h3 class="text-danger" id="dashMonthlyShipping">฿0</h3><i class="fa-solid fa-truck bg-icon"></i>
            </div>
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-6 col-md-4 col-lg-4">
            <div class="stat-card px-3 py-4 border-start border-info border-4 bg-light">
              <h6>รายรับอื่นๆ (ไม่รวมโน๊ตบุ๊ค)</h6>
              <h3 class="text-info" id="dashOtherIncome">฿0</h3><i class="fa-solid fa-piggy-bank bg-icon"></i>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-4">
            <div class="stat-card px-3 py-4 border-start border-warning border-4 bg-light">
              <h6>รายจ่ายอื่นๆ (ไม่รวมโน๊ตบุ๊ค)</h6>
              <h3 class="text-warning" id="dashOtherExpense">฿0</h3><i class="fa-solid fa-wallet bg-icon"></i>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-4">
            <div class="stat-card px-3 py-4 border-start border-secondary border-4 bg-light">
              <h6>คงเหลือสุทธิอื่นๆ</h6>
              <h3 class="text-secondary" id="dashOtherBalance">฿0</h3><i class="fa-solid fa-coins bg-icon"></i>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-12">
            <div class="stat-card bg-dark text-white d-flex justify-content-between align-items-center py-3 px-4">
              <h6 class="text-light m-0">มูลค่าคลังทุนสินค้าปัจจุบันทั้งหมด</h6>
              <h3 class="text-warning m-0" id="dashInventoryValue">฿0</h3>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-lg-6 mb-3 mb-lg-0">
            <div class="card p-3 h-100 shadow-sm">
              <h6 class="fw-bold text-dark-blue mb-3"><i class="fa-solid fa-chart-bar text-orange"></i> กราฟยอดขายรายเดือน
                (ปีนี้)</h6>
              <div style="height: 250px;">
                <canvas id="salesChart"></canvas>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="card p-3 h-100 shadow-sm">
              <h6 class="fw-bold text-dark-blue mb-3"><i class="fa-solid fa-chart-line text-success"></i>
                กราฟยอดขายราย 15 วัน</h6>
              <div style="height: 250px;">
                <canvas id="profitChart"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-8">
            <div class="card p-4">
              <h5 class="fw-bold text-dark-blue mb-3">5 รายการขายล่าสุด (เรียลไทม์)</h5>
              <div class="table-responsive">
                <table class="table table-sm table-hover text-center align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>วันที่</th>
                      <th class="text-start">รายการสินค้า</th>
                      <th>ยอดรวม (รวม VAT)</th>
                      <th>กำไร</th>
                    </tr>
                  </thead>
                  <tbody id="dashRecentSales"></tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="card p-4 border-top border-danger border-4">
              <h5 class="fw-bold text-danger mb-3"><i class="fa-solid fa-triangle-exclamation"></i> สินค้าใกล้หมด
                (โชว์สูงสุด 10 รายการ)</h5>
              <div class="table-responsive">
                <table class="table table-sm table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>ชื่อสินค้า</th>
                      <th class="text-center">คงเหลือ</th>
                    </tr>
                  </thead>
                  <tbody id="dashLowStock"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="page-view" class="page-section d-none d-print-none">
        <h4 class="mb-4 fw-bold text-dark-blue">ตรวจสอบรายการสินค้าและสต็อกคงเหลือปัจจุบัน</h4>
        <div class="row mb-3">
          <div class="col-md-3">
            <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-filter text-orange"></i> กรองยี่ห้อ
              (Brand)</label>
            <select class="form-select form-select-sm" id="viewBrandFilter" onchange="renderViewProducts()">
              <option value="">-- ยี่ห้อทั้งหมด --</option>
            </select>
          </div>
        </div>
        <div class="card p-4">
          <table class="table table-hover align-middle">
            <thead class="text-center table-light">
              <tr>
                <th>รหัสสินค้า</th>
                <th>วันที่ลงรายการ</th>
                <th class="text-start">ชื่อสินค้า/รุ่น</th>
                <th>ยี่ห้อ</th>
                <th class="text-success">ราคาขายจริง</th>
                <th>จำนวนคงเหลือ</th>
                <th>Facebook</th>
                <th>สถานะมัดจำ</th>
              </tr>
            </thead>
            <tbody id="viewData" class="text-center"></tbody>
          </table>
        </div>

        <h5 class="mt-5 mb-3 fw-bold text-dark-blue border-start border-info border-4 ps-2"><i class="fa-solid fa-boxes-stacked me-2"></i> สรุปสต๊อกคงเหลือปัจจุบัน (รายการที่มีของ)</h5>
        <div class="card p-4 border-info border-top border-3">
          <table class="table table-hover align-middle">
            <thead class="text-center" style="background-color: #f0fdf4;">
              <tr>
                <th class="text-start">ชื่อสินค้า/รุ่น</th>
                <th>ยี่ห้อ</th>
                <th class="text-success">ราคาขาย/หน่วย</th>
                <th>จำนวนที่เหลือ</th>
                <th class="text-primary">มูลค่ารวม (บาท)</th>
                <th>สถานะ (COD/มัดจำ)</th>
              </tr>
            </thead>
            <tbody id="inStockSummaryData" class="text-center"></tbody>
            <tfoot id="inStockSummaryFooter" class="table-light fw-bold text-center"></tfoot>
          </table>
        </div>
      </div>

      <div id="page-products" class="page-section d-none d-print-none">
        <h4 class="mb-4 fw-bold text-dark-blue" id="productPageTitle">จัดการข้อมูลสินค้าในคลัง / นำเข้าสต็อก</h4>
        <div class="card p-4 mb-4 border-top border-orange border-4">
          <form id="formProduct" onsubmit="submitProduct(event)">
            <input type="hidden" id="p_id">
            <div class="row g-3 mb-3">
              <div class="col-md-3"><label class="small fw-bold text-muted mb-1">วันที่อัปเดต</label><input type="date"
                  class="form-control" id="p_date" required></div>
              <div class="col-md-4"><label class="small fw-bold text-muted mb-1">ชื่อสินค้า/รุ่นโน๊ตบุ๊ค</label><input
                  type="text" class="form-control" id="p_name" required></div>
              <div class="col-md-3">
                <label class="small fw-bold text-muted mb-1">ยี่ห้อ</label>
                <select class="form-select" id="p_brand" required>
                  <option value="">-- เลือกยี่ห้อ --</option>
                  <option value="ASUS">ASUS</option>
                  <option value="Acer">Acer</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="HP">HP</option>
                  <option value="Dell">Dell</option>
                  <option value="MSI">MSI</option>
                  <option value="Apple">Apple</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div class="col-md-2"><label class="small fw-bold text-muted mb-1">จำนวนคลัง</label><input type="number"
                  class="form-control" id="p_stock" required min="0"></div>
              <div class="col-md-6"><label class="small fw-bold text-muted mb-1">ราคาทุนต่อชิ้น (฿)</label><input
                  type="number" class="form-control" id="p_cost" required min="0" step="0.01" placeholder="0.00"></div>
              <div class="col-md-6"><label class="small fw-bold text-muted mb-1">ราคาขายหน้าร้านต่อชิ้น
                  (฿)</label><input type="number" class="form-control text-success" id="p_actualPrice" required min="0" step="0.01" placeholder="0.00">
              </div>

              <!-- New Product Specification Fields -->
              <div class="col-12 mt-4 mb-2"><h6 class="fw-bold text-secondary border-bottom pb-2"><i class="fa-solid fa-microchip me-1"></i> ข้อมูลสเปคสินค้า (ถ้ามี)</h6></div>
              <div class="col-md-4"><label class="small fw-bold text-muted mb-1">Serial Number</label><input type="text" class="form-control" id="p_serialNumber" placeholder="S/N"></div>
              <div class="col-md-4"><label class="small fw-bold text-muted mb-1">หน่วยประมวลผล (CPU)</label><input type="text" class="form-control" id="p_cpu" placeholder="เช่น Core i5, Ryzen 5"></div>
              <div class="col-md-4"><label class="small fw-bold text-muted mb-1">หน่วยความจำ (RAM)</label><input type="text" class="form-control" id="p_ram" placeholder="เช่น 8GB, 16GB"></div>
              <div class="col-md-3"><label class="small fw-bold text-muted mb-1">การ์ดจอ (GPU)</label><input type="text" class="form-control" id="p_gpu" placeholder="เช่น RTX 3050"></div>
              <div class="col-md-3"><label class="small fw-bold text-muted mb-1">ขนาดหน้าจอ</label><input type="text" class="form-control" id="p_screenSize" placeholder="เช่น 15.6 inch"></div>
              <div class="col-md-3"><label class="small fw-bold text-muted mb-1">สีตัวเครื่อง</label><input type="text" class="form-control" id="p_color" placeholder="เช่น Black, Silver"></div>
              <div class="col-md-3"><label class="small fw-bold text-muted mb-1">ระยะเวลาประกัน</label><input type="text" class="form-control" id="p_warranty" placeholder="เช่น 1 ปี, 6 เดือน"></div>
              <!-- End New Fields -->

              <div class="col-md-12"><label class="small fw-bold text-muted mb-1"><i class="fa-brands fa-facebook text-primary"></i> ลิ้งค์อ้างอิงจาก Facebook (ถ้ามี)</label><input
                  type="url" class="form-control" id="p_fbLink" placeholder="วาง URL ของโพสต์ Facebook ที่นี่"></div>
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-custom-orange w-100" id="btnSaveProduct"><i
                  class="fa-solid fa-floppy-disk"></i> บันทึกรายการ</button>
              <button type="button" class="btn btn-secondary d-none" id="btnCancelEdit" onclick="resetProductForm()"><i
                  class="fa-solid fa-xmark"></i> ยกเลิก</button>
            </div>
          </form>
        </div>
        <div class="card p-4">
          <div class="row g-2 mb-3 align-items-center">
            <div class="col-auto"><label class="fw-bold small text-muted">ตัวกรอง:</label></div>
            <div class="col-md-3">
              <input type="month" class="form-control form-control-sm" id="manageDateFilter" onchange="renderManageProducts()">
            </div>
            <div class="col-md-3">
              <select class="form-select form-select-sm" id="manageBrandFilter" onchange="renderManageProducts()">
                <option value="">-- ยี่ห้อทั้งหมด --</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select form-select-sm" id="manageStockFilter" onchange="renderManageProducts()">
                <option value="">-- คงเหลือทั้งหมด --</option>
                <option value="in_stock">มีสินค้า (>0)</option>
                <option value="out_of_stock">หมดสต็อก (0)</option>
              </select>
            </div>
          </div>
          <table class="table table-hover align-middle text-center">
            <thead class="table-light">
              <tr>
                <th>วันที่ลงรายการ</th>
                <th>ชื่อสินค้า</th>
                <th>ยี่ห้อ</th>
                <th>ทุน</th>
                <th>ขาย</th>
                <th>คงเหลือ</th>
                <th>Facebook</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody id="productData"></tbody>
          </table>
        </div>
      </div>

      <div id="page-sales" class="page-section d-none d-print-none">
        <h4 class="mb-4 fw-bold text-dark-blue">เปิดบิลขายสินค้า และตัดสต็อกสินค้าอัตโนมัติ</h4>
        <div class="card p-3 mb-4 border-start border-info border-4 bg-white shadow-sm">
          <h6 class="fw-bold text-info mb-2"><i class="fa-solid fa-magnifying-glass"></i> ค้นหาสินค้า / ตรวจสอบสต็อกด่วน
            (Real-time)</h6>
          <div class="row g-2 mb-2">
            <div class="col-md-4"><select class="form-select form-select-sm" id="filterBrand"
                onchange="filterStock()"></select></div>
            <div class="col-md-8"><input type="text" class="form-control form-control-sm" id="filterModel"
                placeholder="พิมพ์เพื่อค้นหาชื่อรุ่น..." onkeyup="filterStock()"></div>
          </div>
          <div class="table-responsive custom-scrollbar" style="max-height: 150px; overflow-y: auto;">
            <table class="table table-sm table-bordered table-hover text-center align-middle mb-0"
              style="font-size: 0.85rem;">
              <thead class="table-light position-sticky top-0">
                <tr>
                  <th class="text-start">ชื่อสินค้า/รุ่น</th>
                  <th>ยี่ห้อ</th>
                  <th>ราคา</th>
                  <th>คงเหลือ</th>
                </tr>
              </thead>
              <tbody id="liveStockBody"></tbody>
            </table>
          </div>
        </div>
        <div class="card p-4 border-top border-success border-4">
          <form id="formSale" onsubmit="submitSale(event)">
            <div class="row g-3 mb-3">
              <div class="col-md-4"><label class="small fw-bold text-muted">วันที่ขาย</label><input type="date"
                  class="form-control" id="saleDate" required></div>
              <div class="col-md-8"><label class="small fw-bold text-muted">เลือกสินค้าที่จะตัดสต็อก</label><select
                  class="form-select" id="saleProduct" required></select></div>
              <div class="col-md-4"><label class="small fw-bold text-muted">ราคาที่ขายจริงต่อหน่วย (ไม่รวม
                  VAT)</label><input type="number" class="form-control text-success fw-bold" id="saleCustomPrice"
                  required step="0.01" placeholder="0.00" oninput="calcVAT()"></div>
              <div class="col-md-4"><label class="small fw-bold text-muted">จำนวนที่ขาย</label><input type="number"
                  class="form-control" id="saleQty" required value="1" min="1" oninput="calcVAT()"></div>
              <div class="col-md-4"><label class="small fw-bold text-muted">ค่าขนส่ง (หักกำไร)</label><input type="number"
                  class="form-control text-danger fw-bold" id="saleShippingCost" value="0" min="0" step="0.01" placeholder="0.00" oninput="calcVAT()"></div>
              <div class="col-md-4"><label class="small fw-bold text-muted">รวมเงิน (ก่อน VAT)</label><input type="text"
                  class="form-control bg-light" id="saleSubTotal" readonly value="0.00"></div>
              <div class="col-md-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="small fw-bold text-muted mb-0">VAT 7%</label>
                  <div class="form-check form-switch m-0 p-0 d-flex align-items-center gap-2">
                    <input class="form-check-input m-0" type="checkbox" id="isVatEnabled" checked onchange="calcVAT()">
                    <label class="form-check-label small" for="isVatEnabled" style="margin-top: 2px;">คิด VAT</label>
                  </div>
                </div>
                <input type="text" class="form-control bg-light text-danger" id="saleVat" readonly value="0.00">
              </div>
              <div class="col-md-4"><label class="small fw-bold text-muted">ยอดรวมทั้งสิ้น (รวม VAT)</label><input
                  type="text" class="form-control bg-light text-primary fw-bold fs-5" id="saleGrandTotal" readonly
                  value="0.00"></div>
            </div>
            <hr>
            <div class="card p-3 mb-3 border-start border-warning border-4 bg-light">
              <label class="small fw-bold text-muted mb-2">รูปแบบการชำระเงิน</label>
              <div class="d-flex flex-wrap gap-3 mb-2">
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="paymentMethod" id="payCash" value="CASH" checked onchange="togglePaymentFields()">
                  <label class="form-check-label fw-bold text-success" for="payCash">ชำระเต็มจำนวน (เงินสด/โอน)</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="paymentMethod" id="payDeposit" value="DEPOSIT" onchange="togglePaymentFields()">
                  <label class="form-check-label fw-bold text-warning" for="payDeposit">ลูกค้าชำระมัดจำ (ไม่เต็มจำนวน)</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="paymentMethod" id="payCOD" value="COD" onchange="togglePaymentFields()">
                  <label class="form-check-label fw-bold text-info" for="payCOD">เก็บเงินปลายทาง (COD)</label>
                </div>
              </div>
              <div id="depositFields" style="display:none;">
                <div class="row g-3 align-items-end">
                  <div class="col-md-4">
                    <label class="small fw-bold text-muted">ยอดมัดจำที่ลูกค้าจ่าย (บาท)</label>
                    <input type="number" class="form-control fw-bold text-warning fs-5" id="depositAmount" min="0" step="0.01" placeholder="0.00" oninput="calcDepositRemaining()">
                  </div>
                  <div class="col-md-4">
                    <label class="small fw-bold text-muted">ยอดคงเหลือที่ต้องชำระ</label>
                    <input type="text" class="form-control fw-bold text-danger fs-5 bg-light" id="depositRemaining" readonly value="0.00">
                  </div>
                  <div class="col-md-4">
                    <div class="alert alert-warning py-2 px-3 mb-0 small">
                      <i class="fa-solid fa-circle-info"></i> สินค้าจะถูกตัดสต็อกทันที แต่จะบันทึกว่ายังชำระไม่ครบ
                    </div>
                  </div>
                </div>
              </div>
              <!-- Info alert for stock deduction -->
              <div class="alert alert-info py-2 px-3 mt-3 mb-0 small" id="codAlert" style="display:none;">
                <i class="fa-solid fa-truck-fast"></i> สินค้าจะถูกตัดสต็อกทันที สถานะออเดอร์: <strong>รอดำเนินการ (COD)</strong>
              </div>
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-6"><label class="small fw-bold text-muted">ชื่อลูกค้า
                  (ออกใบกำกับภาษี/ใบเสนอราคา)</label><input type="text" class="form-control" id="saleCusName"
                  placeholder="ชื่อ-นามสกุล หรือ ชื่อบริษัท"></div>
              <div class="col-md-6"><label class="small fw-bold text-muted">ที่อยู่ลูกค้า
                  (และเบอร์โทรศัพท์สำหรับพัสดุ)</label><input type="text" class="form-control" id="saleAddress"
                  placeholder="ระบุที่อยู่จัดส่งและออกใบกำกับภาษี"></div>
            </div>
            <button type="submit" class="btn btn-success w-100 py-3 fw-bold fs-5" id="btnSaveSale"><i
                class="fa-solid fa-check-circle"></i> ยืนยันการขาย ตัดสต็อกทันที</button>
          </form>
        </div>
      </div>

      <div id="page-reports" class="page-section d-none d-print-none">
        <h4 class="mb-4 fw-bold text-dark-blue">รายงานสรุป และเครื่องมือพิมพ์เอกสารจัดส่ง/ภาษี</h4>
        <div class="card p-4">
          <ul class="nav nav-pills mb-4" id="reportTabs">
            <li class="nav-item"><button class="nav-link active fw-bold" data-bs-toggle="tab"
                data-bs-target="#tab-summary">สรุปภาพรวมยอด</button></li>
            <li class="nav-item"><button class="nav-link fw-bold" data-bs-toggle="tab"
                data-bs-target="#tab-history">ประวัติการขายสินค้า (เรียลไทม์)</button></li>
            <li class="nav-item"><button class="nav-link fw-bold bg-light text-dark border me-2" data-bs-toggle="tab"
                data-bs-target="#tab-parcel"><i class="fa-solid fa-box text-primary"></i> ใบปะหน้ากล่องพัสดุ</button>
            </li>
            <li class="nav-item ms-auto"><button class="btn btn-outline-primary fw-bold"
                onclick="openInvoiceCreator()"><i class="fa-solid fa-file-circle-plus"></i>
                เปิดฟอร์มสร้างใบกำกับ/ใบเสนอราคาอิสระ</button></li>
          </ul>

          <div class="tab-content">
            <div class="tab-pane fade show active" id="tab-summary">
              <div class="row text-center g-3 mb-4">
                <div class="col-md-3">
                  <div class="p-3 bg-light rounded-3 shadow-sm border-start border-primary border-4">
                    <h6>เครื่องที่ขายได้เดือนนี้</h6>
                    <h4 class="text-primary fw-bold m-0" id="repQty">0 เครื่อง</h4>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 bg-light rounded-3 shadow-sm border-start border-info border-4">
                    <h6>ต้นทุนสะสมรวม</h6>
                    <h4 class="text-info fw-bold m-0" id="repCost">฿0.00</h4>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 bg-light rounded-3 shadow-sm border-start border-orange border-4">
                    <h6>รายรับขายรวม (ก่อน VAT)</h6>
                    <h4 class="text-orange fw-bold m-0" id="repSubTotal">฿0.00</h4>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="p-3 bg-light rounded-3 shadow-sm border-start border-success border-4">
                    <h6>กำไรขั้นต้นรวม</h6>
                    <h4 class="text-success fw-bold m-0" id="repProfit">฿0.00</h4>
                  </div>
                </div>
              </div>
            </div>

            <div class="tab-pane fade" id="tab-history">
              <div class="mb-3 d-flex gap-2">
                <button class="btn btn-sm btn-danger fw-bold shadow-sm" onclick="deleteSelectedSales()"><i class="fa-solid fa-trash"></i> ลบรายการที่เลือก</button>
                <span class="text-muted small align-self-center" id="selectedCount"></span>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle text-center" style="font-size:0.9rem;">
                  <thead class="table-light">
                    <tr>
                      <th><input type="checkbox" class="form-check-input" id="selectAllSales" onchange="toggleSelectAllSales()"></th>
                      <th>เลขบิลขาย</th>
                      <th>วันที่</th>
                      <th>รายการสินค้า</th>
                      <th>จำนวน</th>
                      <th>ยอดรวมสุทธิ</th>
                      <th>ต้นทุน/เครื่อง</th>
                      <th>กำไร/เครื่อง</th>
                      <th>ค่าขนส่ง</th>
                      <th>ยอดมัดจำ</th>
                      <th>คงเหลือ</th>
                      <th>ชื่อลูกค้า</th>
                      <th>การกระทำ / พิมพ์ด่วน</th>
                    </tr>
                  </thead>
                  <tbody id="salesHistoryData"></tbody>
                </table>
              </div>
            </div>

            <div class="tab-pane fade" id="tab-parcel">
              <div class="row g-3">
                <div class="col-lg-6">
                  <div class="card p-4 border-0 shadow-sm">
                    <h6 class="fw-bold mb-3 text-dark-blue"><i class="fa-solid fa-truck-fast text-orange me-2"></i>ข้อมูลผู้รับพัสดุ (RECEIVER)</h6>
                    <form id="parcelForm" onsubmit="event.preventDefault(); generateParcelLabel();">
                      <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-user me-1"></i> ชื่อ-นามสกุล ผู้รับพัสดุ</label>
                        <input type="text" class="form-control" id="pcName" placeholder="ระบุชื่อ-นามสกุล ผู้รับ" required>
                      </div>
                      <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-location-dot me-1"></i> ที่อยู่จัดส่งโดยละเอียด</label>
                        <textarea class="form-control" id="pcAddress" rows="3" placeholder="บ้านเลขที่ หมู่บ้าน/ซอย ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด รหัสไปรษณีย์" required></textarea>
                      </div>
                      <div class="row g-2 mb-3">
                        <div class="col-md-6">
                          <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-phone me-1"></i> เบอร์โทรศัพท์ผู้รับ</label>
                          <input type="text" class="form-control" id="pcPhone" placeholder="0xx-xxx-xxxx" required>
                        </div>
                        <div class="col-md-6">
                          <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-barcode me-1"></i> เลขพัสดุ / Tracking</label>
                          <input type="text" class="form-control" id="pcTracking" placeholder="ระบุเลข Tracking (ถ้ามี)">
                        </div>
                      </div>
                      <hr>
                      <h6 class="fw-bold mb-3 text-dark-blue"><i class="fa-solid fa-box text-warning me-2"></i>ข้อมูลสินค้าในกล่อง</h6>
                      <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-laptop me-1"></i> รายการสินค้า</label>
                        <input type="text" class="form-control" id="pcProductName" placeholder="ชื่อสินค้าที่จัดส่ง">
                      </div>
                      <div class="row g-2 mb-3">
                        <div class="col-md-4">
                          <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-cubes me-1"></i> จำนวน</label>
                          <input type="number" class="form-control" id="pcQty" value="1" min="1">
                        </div>
                        <div class="col-md-4">
                          <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-weight-hanging me-1"></i> น้ำหนัก (kg)</label>
                          <input type="text" class="form-control" id="pcWeight" placeholder="-">
                        </div>
                        <div class="col-md-4">
                          <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-coins me-1"></i> ยอด COD (฿)</label>
                          <input type="text" class="form-control" id="pcCodAmount" placeholder="-">
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1"><i class="fa-solid fa-note-sticky me-1"></i> หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                        <input type="text" class="form-control" id="pcNote" placeholder="ระบุหมายเหตุถ้าต้องการ เช่น สินค้าแตกง่าย, ระวังของแตก">
                      </div>
                      <button type="submit" class="btn btn-custom-orange w-100 py-2 fw-bold fs-6"><i class="fa-solid fa-print me-2"></i> พิมพ์ใบปะหน้ากล่องพัสดุ</button>
                    </form>
                  </div>
                </div>
                <div class="col-lg-6">
                  <div class="card p-4 border-0 shadow-sm h-100">
                    <h6 class="fw-bold mb-3 text-dark-blue"><i class="fa-solid fa-circle-info text-info me-2"></i>ข้อมูลผู้ส่ง (SENDER) — ดึงจากใบเสร็จอัตโนมัติ</h6>
                    <div class="p-3 rounded" style="background:#f0f9ff; border: 1px solid #bae6fd;">
                      <div class="mb-2"><span class="small text-muted">ชื่อผู้ส่ง:</span><br><strong>ห้างหุ้นส่วนจำกัด โน๊ตบุ๊ค ไอทีอุดร</strong></div>
                      <div class="mb-2"><span class="small text-muted">ที่อยู่:</span><br>119/138 มบ.พีเคธานี 4 ม.5 ถ.อุดรธานี-หนองคาย ต.หมู่ม่น อ.เมือง จ.อุดรธานี 41000</div>
                      <div><span class="small text-muted">โทรศัพท์:</span><br><strong>090-842-2774</strong></div>
                    </div>
                    <div class="alert alert-warning py-2 px-3 mt-3 mb-0 small">
                      <i class="fa-solid fa-lightbulb me-1"></i> <strong>เคล็ดลับ:</strong> สามารถกดปุ่ม <span class="badge bg-secondary"><i class="fa-solid fa-box"></i> ใบปะหน้า</span> จากตารางประวัติการขาย เพื่อดึงข้อมูลลูกค้ามากรอกอัตโนมัติ
                    </div>
                    <div class="mt-3 p-3 rounded" style="background:#fefce8; border: 1px solid #fde68a;">
                      <h6 class="fw-bold mb-2"><i class="fa-solid fa-eye me-1 text-warning"></i> ตัวอย่างใบปะหน้าที่จะพิมพ์ออก:</h6>
                      <div class="d-flex gap-2 flex-wrap small">
                        <span class="badge bg-dark"><i class="fa-solid fa-store"></i> ชื่อ+ที่อยู่ร้าน</span>
                        <span class="badge bg-primary"><i class="fa-solid fa-user"></i> ชื่อ+ที่อยู่ผู้รับ</span>
                        <span class="badge bg-success"><i class="fa-solid fa-phone"></i> เบอร์โทร</span>
                        <span class="badge bg-info"><i class="fa-solid fa-box"></i> สินค้า+จำนวน</span>
                        <span class="badge bg-warning text-dark"><i class="fa-solid fa-coins"></i> COD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-4 mt-4 d-print-none border-top border-warning border-4" id="invoiceCreatorCard"
          style="display:none;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark-blue m-0"><i class="fa-solid fa-file-signature"></i> เครื่องมือสร้างใบเสนอราคา
              / ใบกำกับภาษี</h5>
            <button class="btn btn-sm btn-outline-danger" onclick="closeInvoiceCreator()"><i
                class="fa-solid fa-xmark"></i> ปิดหน้านี้</button>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-3"><label class="small fw-bold">ประเภทเอกสาร</label><select id="qtDocType"
                class="form-select form-select-sm">
                <option value="ใบเสนอราคา / QUOTATION">ใบเสนอราคา (มี VAT)</option>
                <option value="ใบเสนอราคา / QUOTATION NO VAT">ใบเสนอราคา (ไม่มี VAT)</option>
                <option value="ใบกำกับภาษี / TAX INVOICE">ใบกำกับภาษี (มี VAT)</option>
                <option value="บิลเงินสด / CASH RECEIPT">บิลธรรมดา / เงินสด (ไม่มี VAT)</option>
              </select></div>
            <div class="col-md-3"><label class="small fw-bold">เลขที่เอกสาร</label><input type="text" id="qtDocId"
                class="form-control form-control-sm" placeholder="เช่น INV2026001"></div>
            <div class="col-md-3"><label class="small fw-bold">วันที่เอกสาร</label><input type="date" id="qtDate"
                class="form-control form-control-sm"></div>
            <div class="col-md-3"><label class="small fw-bold">เงื่อนไขการชำระเงิน</label><input type="text"
                id="qtPaymentTerm" class="form-control form-control-sm" value="เงินสด / โอนเงิน"></div>
            <div class="col-md-6"><label class="small fw-bold">ชื่อลูกค้า / บริษัท</label><input type="text"
                id="qtCusName" class="form-control form-control-sm"></div>
            <div class="col-md-6"><label class="small fw-bold">ที่อยู่ลูกค้า</label><input type="text" id="qtCusAddress"
                class="form-control form-control-sm"></div>
            <div class="col-md-6"><label class="small fw-bold">เลขที่ผู้เสียภาษีลูกค้า</label><input type="text" id="qtCusTaxId"
                class="form-control form-control-sm"></div>
            <div class="col-md-6"><label class="small fw-bold">เบอร์โทรศัพท์</label><input type="text" id="qtCusPhone"
                class="form-control form-control-sm"></div>
          </div>
          <div class="card p-3 mb-3 border-start border-info border-4 bg-light">
            <label class="small fw-bold text-info mb-1"><i class="fa-solid fa-magnifying-glass me-1"></i> เลือกสินค้าจากคลังเพื่อเพิ่มลงในรายการ</label>
            <div class="d-flex gap-2">
              <select class="form-select form-select-sm" id="qtProductSelect" onchange="if(this.value) addInvoiceRowFromProduct();">
                <option value="">-- เลือกสินค้าที่มี stock --</option>
              </select>
              <button type="button" class="btn btn-sm btn-info text-white fw-bold px-3" onclick="addInvoiceRowFromProduct()" style="white-space:nowrap;"><i class="fa-solid fa-plus me-1"></i> เพิ่มสินค้านี้</button>
            </div>
          </div>
          <table class="table table-sm table-bordered text-center align-middle" id="qtTable">
            <thead class="table-light">
              <tr>
                <th style="width:7%;">ลำดับ</th>
                <th>รายการสินค้า/รายละเอียด</th>
                <th style="width:12%;">จำนวน</th>
                <th style="width:15%;">ราคา/หน่วย</th>
                <th style="width:18%;">จำนวนเงิน (บาท)</th>
                <th style="width:10%;">ลบ</th>
              </tr>
            </thead>
            <tbody id="qtTableBody"></tbody>
          </table>
          <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-dark" onclick="addInvoiceRow()"><i class="fa-solid fa-plus"></i>
              เพิ่มแถวรายการสินค้า</button>
            <button class="btn btn-sm btn-warning fw-bold text-dark" onclick="printCustomInvoice()"><i
                class="fa-solid fa-print"></i> พิมพ์เอกสารฉบับนี้</button>
          </div>
        </div>
      </div>

      <div id="page-savings" class="page-section d-none d-print-none">
        <h4 class="mb-4 fw-bold text-dark-blue">จัดการเงินฝากออมทรัพย์รายเดือน</h4>
        
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="stat-card bg-white px-3 py-4 border-start border-warning border-4 shadow-sm">
              <h6>ยอดเงินฝากสะสมรวม</h6>
              <h3 class="text-warning fw-bold m-0" id="totalSavingsValue">฿0</h3>
              <i class="fa-solid fa-piggy-bank bg-icon"></i>
            </div>
          </div>
        </div>

        <div class="card p-4 border-top border-warning border-4 mb-4">
          <h5 class="fw-bold text-dark-blue mb-3"><i class="fa-solid fa-circle-plus text-primary"></i> เพิ่มรายการฝากเงิน</h5>
          <form id="savingsForm" onsubmit="submitSaving(event)">
            <input type="hidden" id="sv_id">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="small fw-bold text-muted mb-1">วันที่ฝาก</label>
                <input type="date" class="form-control" id="sv_date" required>
              </div>
              <div class="col-md-4">
                <label class="small fw-bold text-muted mb-1">จำนวนเงินที่ฝาก (บาท)</label>
                <input type="number" class="form-control text-success fw-bold" id="sv_amount" required min="1" step="0.01" placeholder="0.00">
              </div>
              <div class="col-md-5">
                <label class="small fw-bold text-muted mb-1">รายละเอียด / หมายเหตุ</label>
                <input type="text" class="form-control" id="sv_note" placeholder="เช่น ฝากประจำเดือน...">
              </div>
              <div class="col-12 mt-3">
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-warning fw-bold text-dark" id="btnSaveSaving"><i class="fa-solid fa-floppy-disk"></i> บันทึกเงินฝาก</button>
                  <button type="button" class="btn btn-secondary d-none" id="btnCancelSavingEdit" onclick="resetSavingForm()"><i class="fa-solid fa-xmark"></i> ยกเลิก</button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="card p-4">
          <h5 class="fw-bold text-dark-blue mb-3"><i class="fa-solid fa-clock-rotate-left"></i> ประวัติการฝากเงิน</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle text-center">
              <thead class="table-light">
                <tr>
                  <th>รหัสอ้างอิง</th>
                  <th>วันที่ฝาก</th>
                  <th class="text-start">รายละเอียด</th>
                  <th class="text-success">จำนวนเงินฝาก</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody id="savingsTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="page-income-expense" class="page-section d-none d-print-none">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="fw-bold text-dark-blue m-0">ระบบบันทึกรายรับ - รายจ่าย (เพื่อยื่นภาษีประจำปี)</h4>
          <button class="btn btn-warning fw-bold text-dark shadow-sm" onclick="printTxReport()">
            <i class="fa-solid fa-print"></i> พิมพ์รายงานบัญชี (ใบปะหน้าภาษี)
          </button>
        </div>
        <div class="card p-4 mb-4 border-top border-primary border-4">
          <h5 class="fw-bold text-dark-blue mb-3" id="txFormTitle"><i class="fa-solid fa-circle-plus text-primary"></i>
            เพิ่มรายการบัญชีรายรับ/รายจ่าย</h5>
          <form id="txForm" onsubmit="submitTransaction(event)">
            <input type="hidden" id="tx_id">
            <div class="row g-3">
              <div class="col-md-3"><label class="small fw-bold text-muted">วันที่บันทึก</label><input type="date"
                  class="form-control" id="tx_date" required></div>
              <div class="col-md-3">
                <label class="small fw-bold text-muted">ประเภทรายการ</label>
                <select class="form-select" id="tx_type" required>
                  <option value="รายรับ">รายรับ (+)</option>
                  <option value="รายจ่าย">รายจ่าย (-)</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="small fw-bold text-muted">หมวดหมู่บัญชี</label>
                <select class="form-select" id="tx_category" required onchange="toggleCustomCategory()">
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  <option value="ค่าน้ำ">ค่าน้ำ</option>
                  <option value="ค่าไฟ">ค่าไฟ</option>
                  <option value="ค่าข้าว">ค่าข้าว</option>
                  <option value="อุปกรณ์คอมพิวเตอร์">อุปกรณ์คอมพิวเตอร์</option>
                  <option value="ค่างวดรถ">ค่างวดรถ</option>
                  <option value="ค่าน้ำมัน">ค่าน้ำมัน</option>
                  <option value="ค่าขนส่ง">ค่าขนส่ง</option>
                  <option value="ขายสินค้า">ขายสินค้า</option>
                  <option value="ซื้อสินค้าเข้า">ซื้อสินค้าเข้า</option>
                  <option value="อื่นๆ">อื่นๆ (กรอกเอง)</option>
                </select>
                <input type="text" class="form-control mt-2" id="tx_category_custom"
                  placeholder="ระบุหมวดหมู่อื่นๆ เอง" style="display:none;">
              </div>
              <div class="col-md-3"><label class="small fw-bold text-muted">จำนวนเงินสุทธิ (บาท)</label><input
                  type="number" class="form-control fw-bold" id="tx_amount" min="0" step="0.01" placeholder="0.00" required></div>
              <div class="col-md-12"><label
                  class="small fw-bold text-muted">หมายเหตุอ้างอิงเอกสารเพิ่มเติม</label><input type="text"
                  class="form-control" id="tx_note" placeholder="รายละเอียดอื่นๆ เพื่อตรวจสอบทางบัญชี"></div>
            </div>
            <div class="d-flex gap-2 mt-3">
              <button type="submit" class="btn btn-primary w-100 fw-bold" id="btnSaveTx"><i
                  class="fa-solid fa-floppy-disk"></i> บันทึกข้อมูลบัญชี</button>
              <button type="button" class="btn btn-secondary d-none" id="btnCancelTxEdit" onclick="resetTxForm()"><i
                  class="fa-solid fa-xmark"></i> ยกเลิกการแก้ไข</button>
            </div>
          </form>
        </div>
        <div class="card p-4">
          <h5 class="fw-bold text-dark-blue mb-3"><i class="fa-solid fa-list-check"></i> ตารางแจกแจงรายการรายรับ-รายจ่าย
            (ประจำเดือนที่เลือก)</h5>
          <div class="table-responsive">
            <table class="table table-bordered table-hover align-middle text-center">
              <thead class="table-light">
                <tr>
                  <th>รหัสรายการ</th>
                  <th>วันที่</th>
                  <th>ประเภท</th>
                  <th>หมวดหมู่บัญชี</th>
                  <th>จำนวนเงิน</th>
                  <th>หมายเหตุอ้างอิง</th>
                  <th>จัดการรายการ</th>
                </tr>
              </thead>
              <tbody id="txTableBody"></tbody>
            </table>
          </div>
        </div>

        <div class="row mt-4" id="txSummarySection">
          <div class="col-md-4 mb-3">
            <div class="card p-3 shadow-sm border-start border-success border-4 h-100 bg-white">
              <h6 class="text-muted fw-bold mb-2"><i class="fa-solid fa-arrow-down-up-across-line text-success me-1"></i> รวมรายรับ (Income)</h6>
              <h3 class="fw-bold text-success m-0" id="txSumIncome">฿0</h3>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card p-3 shadow-sm border-start border-danger border-4 h-100 bg-white">
              <h6 class="text-muted fw-bold mb-2"><i class="fa-solid fa-arrow-up-right-from-square text-danger me-1"></i> รวมรายจ่าย (Expense)</h6>
              <h3 class="fw-bold text-danger m-0" id="txSumExpense">฿0</h3>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card p-3 shadow-sm border-start border-primary border-4 h-100 bg-white">
              <h6 class="text-muted fw-bold mb-2"><i class="fa-solid fa-scale-balanced text-primary me-1"></i> คงเหลือสุทธิ (Net Balance)</h6>
              <h3 class="fw-bold text-primary m-0" id="txSumBalance">฿0</h3>
            </div>
          </div>
        </div>

        <div class="row mt-1" id="txSummaryOtherSection">
          <div class="col-md-4 mb-3">
            <div class="card p-3 shadow-sm border-start border-info border-4 h-100 bg-light">
              <h6 class="text-muted fw-bold mb-2"><i class="fa-solid fa-piggy-bank text-info me-1"></i> รวมรายรับ (อื่นๆ ที่ไม่ใช่โน๊ตบุ๊ค)</h6>
              <h4 class="fw-bold text-info m-0" id="txSumIncomeOther">฿0</h4>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card p-3 shadow-sm border-start border-warning border-4 h-100 bg-light">
              <h6 class="text-muted fw-bold mb-2"><i class="fa-solid fa-wallet text-warning me-1"></i> รวมรายจ่าย (อื่นๆ ที่ไม่ใช่โน๊ตบุ๊ค)</h6>
              <h4 class="fw-bold text-warning m-0" id="txSumExpenseOther">฿0</h4>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card p-3 shadow-sm border-start border-secondary border-4 h-100 bg-light">
              <h6 class="text-muted fw-bold mb-2"><i class="fa-solid fa-coins text-secondary me-1"></i> คงเหลือสุทธิ (อื่นๆ)</h6>
              <h4 class="fw-bold text-secondary m-0" id="txSumBalanceOther">฿0</h4>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>

  <div class="print-area">
    <div id="printParcelSection" class="print-wrapper-box d-none" style="padding:30px; background:#fff;">
      <div style="text-align:center; margin-bottom:10px; font-size:0.8rem; color:#64748b;">
        <span id="lblPcPrintDateTime"></span> &mdash; ระบบจัดการ ห้างหุ้นส่วนจำกัด โน๊ตบุ๊ค ไอทีอุดร
      </div>
      <div class="parcel-label">
        <!-- SENDER -->
        <div class="parcel-sender">
          <div class="row align-items-center">
            <div class="col-5">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:2px; opacity:0.7; margin-bottom:4px;">SENDER / ผู้ส่ง</div>
              <div style="font-size:1.1rem; font-weight:700;">ห้างหุ้นส่วนจำกัด โน๊ตบุ๊ค ไอทีอุดร</div>
            </div>
            <div class="col-7 text-end" style="font-size:0.85rem; line-height:1.6; opacity:0.9;">
              119/138 มบ.พีเคธานี 4 ม.5 ถ.อุดรธานี-หนองคาย<br>
              ต.หมู่ม่น อ.เมือง จ.อุดรธานี 41000<br>
              <strong>โทร: 090-842-2774</strong>
            </div>
          </div>
        </div>

        <!-- RECEIVER -->
        <div class="parcel-receiver">
          <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:2px; color:#64748b; margin-bottom:8px;">RECEIVER / ผู้รับ</div>
          <div style="margin-bottom:15px;">
            <div style="font-size:1.5rem; font-weight:700; color:#0f172a; margin-bottom:6px;" id="lblPcName"></div>
            <div style="font-size:1.15rem; line-height:1.8; color:#334155;" id="lblPcAddress"></div>
          </div>
          <div style="display:flex; gap:20px; flex-wrap:wrap;">
            <div style="background:#f1f5f9; border-radius:8px; padding:10px 16px; flex:1; min-width:180px;">
              <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1px; color:#64748b;">เบอร์โทรศัพท์ / TEL</div>
              <div style="font-size:1.3rem; font-weight:700; color:#0f172a;" id="lblPcPhone"></div>
            </div>
            <div style="background:#f1f5f9; border-radius:8px; padding:10px 16px; flex:1; min-width:180px;" id="lblTrackingBox">
              <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:1px; color:#64748b;">TRACKING NO.</div>
              <div style="font-size:1.3rem; font-weight:700; color:#0f172a; font-family:monospace;" id="lblPcTracking">-</div>
            </div>
          </div>
        </div>


        <!-- FOOTER -->
        <div class="parcel-footer">
          <span style="font-size:0.75rem; color:#94a3b8;">ใบปะหน้าออกโดยระบบจัดการ &mdash; หจก. โน๊ตบุ๊ค ไอทีอุดร | โทร. 090-842-2774</span>
        </div>
      </div>
    </div>

    <div id="printInvoiceSection" class="print-wrapper-box d-none" style="padding: 20px; background:#fff; color:#000;">
      <div class="invoice-box">
        <div class="row mb-4">
          <div class="col-7 text-start">
            <h4 class="fw-bold m-0 text-dark-blue">ห้างหุ้นส่วนจำกัด โน๊ตบุ๊ค ไอทีอุดร</h4>
            <p class="small m-0">ทะเบียนนิติบุคคลเลขที่ 0413569001497 (สำนักงานใหญ่)<br>ที่อยู่: 119/138 มบ.พีเคธานี 4 ม.5 ถ.อุดรธานี-หนองคาย ต.หมู่ม่น อ.เมือง จ.อุดรธานี ปณ.41000<br>โทรศัพท์: 0908422774</p>
          </div>
          <div class="col-5 text-end">
            <h3 class="fw-bold text-orange m-0" id="invTitleDisplay">ใบกำกับภาษี / TAX INVOICE</h3>
            <p class="m-0 mt-2"><strong>เลขที่เอกสาร:</strong> <span id="invDocId"></span></p>
            <p class="m-0"><strong>วันที่ออกบิล:</strong> <span id="invDate"></span></p>
            <p class="m-0"><strong>เงื่อนไขชำระเงิน:</strong> <span id="invTerm">เงินสด</span></p>
          </div>
        </div>
        <div class="p-3 border rounded mb-4 bg-light" style="font-size:0.95rem;">
          <strong>ข้อมูลลูกค้า / Customer Details :</strong><br>
          <div class="mt-1"><strong>ชื่อ:</strong> <span id="invCusName"></span></div>
          <div><strong>ที่อยู่จัดส่ง / สาขา:</strong> <span id="invCusAddress"></span></div>
          <div><strong>เลขประจำตัวผู้เสียภาษี:</strong> <span id="invCusTaxId"></span></div>
          <div><strong>เบอร์โทรศัพท์:</strong> <span id="invCusPhone"></span></div>
        </div>
        <table class="table table-bordered align-middle text-center" style="font-size:0.95rem;">
          <thead class="table-light">
            <tr>
              <th style="width:8%;">ลำดับ</th>
              <th>รายการสินค้า / รายละเอียดการขาย</th>
              <th style="width:12%;">จำนวน</th>
              <th style="width:15%;">ราคาต่อหน่วย</th>
              <th style="width:18%;">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody id="invItemsBody"></tbody>
        </table>
        <div class="row justify-content-end text-end mt-3" style="font-size:0.95rem;">
          <div class="col-md-5">
            <div class="row py-1">
              <div class="col-7 text-muted">รวมเงินคงเหลือ (ก่อน VAT):</div>
              <div class="col-5 fw-bold" id="invSubTotal">฿0.00</div>
            </div>
            <div class="row py-1">
              <div class="col-7 text-danger">ภาษีมูลค่าเพิ่ม VAT (7%):</div>
              <div class="col-5 fw-bold text-danger" id="invVat">฿0.00</div>
            </div>
            <div class="row py-1 border-top mt-2 pt-2">
              <div class="col-7 fw-bold text-primary fs-6">ยอดรวมทั้งสิ้นสุทธิ (Grand Total):</div>
              <div class="col-5 fw-bold text-primary double-bottom fs-6" id="invGrandTotal">฿0.00</div>
            </div>
          </div>
        </div>
        <div class="row mt-5 text-center small pt-4" style="border-top: 1px dashed #cbd5e1;">
          <div class="col-4"><br><br>...................................................<br>ผู้รับเงิน / สินค้า</div>
          <div class="col-4"></div>
          <div class="col-4"><br><br>...................................................<br>ผู้รับมอบอำนาจ / ผู้จัดการ
          </div>
        </div>
      </div>
    </div>

    <div id="printTxReportSection" class="print-wrapper-box d-none" style="padding: 20px; background:#fff; color:#000;">
      <div class="invoice-box" style="max-width: 900px;">
        <div class="text-center mb-4">
          <h4 class="fw-bold text-dark-blue">รายงานบัญชีรายรับ - รายจ่าย</h4>
          <h5 class="fw-bold">ห้างหุ้นส่วนจำกัด โน๊ตบุ๊ค ไอทีอุดร</h5>
          <p class="m-0">ทะเบียนนิติบุคคลเลขที่ 0413569001497 (สำนักงานใหญ่)<br>ที่อยู่: 119/138 มบ.พีเคธานี 4 ม.5 ถ.อุดรธานี-หนองคาย ต.หมู่ม่น อ.เมือง จ.อุดรธานี ปณ.41000<br>โทรศัพท์: 0908422774</p>
          <p class="m-0 fw-bold" id="txPrintMonth">ประจำเดือน: ...</p>
        </div>
        <table class="table table-bordered align-middle text-center" style="font-size:0.9rem;">
          <thead class="table-light">
            <tr>
              <th style="width:8%;">ลำดับ</th>
              <th style="width:15%;">วัน/เดือน/ปี</th>
              <th class="text-start">รายการ (หมวดหมู่ / อ้างอิง)</th>
              <th style="width:18%;">รายรับ (บาท)</th>
              <th style="width:18%;">รายจ่าย (บาท)</th>
            </tr>
          </thead>
          <tbody id="txPrintBody"></tbody>
          <tfoot class="table-light fw-bold">
            <tr>
              <td colspan="3" class="text-end">รวมยอดสุทธิประจำงวด (Total)</td>
              <td class="text-success" id="txPrintTotalIncome">0.00</td>
              <td class="text-danger" id="txPrintTotalExpense">0.00</td>
            </tr>
          </tfoot>
        </table>
        <div class="row mt-4">
          <div class="col-12 text-end">
            <h5 class="fw-bold">ยอดยกไป (คงเหลือสุทธิ): <span id="txPrintBalance" class="text-primary">0.00</span> บาท
            </h5>
          </div>
        </div>
        <div class="row mt-5 text-center small pt-4">
          <div class="col-4"><br><br>...................................................<br>ผู้จัดทำบัญชี / รับเงิน
          </div>
          <div class="col-4"></div>
          <div class="col-4"><br><br>...................................................<br>ผู้ตรวจสอบ / ผู้จัดการ</div>
        </div>
      </div>
    </div>

    <div id="printTxDetailSection" class="print-wrapper-box d-none" style="padding: 20px; background:#fff; color:#000;">
      <div class="invoice-box" style="max-width: 800px; margin: auto; border: 1px solid #ddd; padding: 20px;">
        <div class="text-center mb-4">
          <h4 class="fw-bold m-0" style="color:#0f172a;">ห้างหุ้นส่วนจำกัด โน๊ตบุ๊ค ไอทีอุดร</h4>
          <h5 class="fw-bold mt-2" style="color:#f97316;">รายละเอียดรายการบัญชี (Transaction Slip)</h5>
        </div>
        
        <table class="table table-bordered">
          <tbody>
            <tr>
              <th style="width: 30%; background: #f8fafc;">รหัสรายการ (ID)</th>
              <td id="ptxId" class="fw-bold"></td>
            </tr>
            <tr>
              <th style="background: #f8fafc;">วันที่ (Date)</th>
              <td id="ptxDate"></td>
            </tr>
            <tr>
              <th style="background: #f8fafc;">ประเภท (Type)</th>
              <td id="ptxType" class="fw-bold"></td>
            </tr>
            <tr>
              <th style="background: #f8fafc;">หมวดหมู่ (Category)</th>
              <td id="ptxCategory"></td>
            </tr>
            <tr>
              <th style="background: #f8fafc;">จำนวนเงิน (Amount)</th>
              <td id="ptxAmount" class="fw-bold" style="font-size: 1.2rem;"></td>
            </tr>
            <tr>
              <th style="background: #f8fafc;">หมายเหตุ (Note)</th>
              <td id="ptxNote"></td>
            </tr>
          </tbody>
        </table>

        <div class="row mt-5 text-center small pt-4">
          <div class="col-6"><br><br>...................................................<br>ผู้พิมพ์รายการ</div>
          <div class="col-6"><br><br>...................................................<br>ผู้ตรวจสอบ</div>
        </div>
      </div>
    </div>

    <div id="printProductDetailSection" class="print-wrapper-box d-none" style="padding: 20px; background:#fff; color:#000;">
      <div class="invoice-box">
        <div class="row mb-4 pb-3" style="border-bottom: 3px solid #f97316;">
          <div class="col-7 text-start">
            <h4 class="fw-bold m-0" style="color:#0f172a;">ห้างหุ้นส่วนจำกัด โน๊ตบุ๊ค ไอทีอุดร</h4>
            <p class="small m-0">ทะเบียนนิติบุคคลเลขที่ 0413569001497 (สำนักงานใหญ่)<br>ที่อยู่: 119/138 มบ.พีเคธานี 4 ม.5 ถ.อุดรธานี-หนองคาย ต.หมู่ม่น อ.เมือง จ.อุดรธานี ปณ.41000<br>โทรศัพท์: 0908422774</p>
          </div>
          <div class="col-5 text-end">
            <h3 class="fw-bold m-0" style="color:#f97316;"><i class="fa-solid fa-boxes-stacked"></i> ข้อมูลสินค้าคลัง</h3>
            <p class="m-0 mt-2"><strong>วันที่พิมพ์:</strong> <span id="pdPrintDate"></span></p>
          </div>
        </div>

        <div class="p-4 mb-4" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div class="row">
            <div class="col-12 mb-3">
              <span class="small fw-bold text-muted text-uppercase" style="letter-spacing:1px;">ชื่อสินค้า / รุ่น</span>
              <h4 class="fw-bold mt-1 mb-0" style="color:#0f172a;" id="pdProductName">-</h4>
            </div>
          </div>
          <hr style="border-color:#e2e8f0;">
          <div class="row g-3">
            <div class="col-4">
              <span class="small fw-bold text-muted text-uppercase" style="letter-spacing:1px;">ยี่ห้อ (Brand)</span>
              <h5 class="fw-bold mt-1" id="pdBrand">-</h5>
            </div>
            <div class="col-4">
              <span class="small fw-bold text-muted text-uppercase" style="letter-spacing:1px;">รหัสสินค้า (ID)</span>
              <h5 class="fw-bold mt-1" style="font-family: monospace;" id="pdProductId">-</h5>
            </div>
            <div class="col-4">
              <span class="small fw-bold text-muted text-uppercase" style="letter-spacing:1px;">วันที่ลงรายการ</span>
              <h5 class="fw-bold mt-1" id="pdDate">-</h5>
            </div>
          </div>
          
          <hr style="border-color:#e2e8f0; margin-top: 20px; margin-bottom: 20px;">
          <h6 class="fw-bold text-secondary mb-3"><i class="fa-solid fa-list me-1"></i> ข้อมูลสเปคเครื่อง (Specification)</h6>
          <div class="row g-3">
            <div class="col-6">
              <table class="table table-sm table-borderless m-0">
                <tr><td class="text-muted" style="width: 100px;">S/N:</td><td class="fw-bold" id="pdSerialNumber">-</td></tr>
                <tr><td class="text-muted">CPU:</td><td class="fw-bold" id="pdCpu">-</td></tr>
                <tr><td class="text-muted">RAM:</td><td class="fw-bold" id="pdRam">-</td></tr>
                <tr><td class="text-muted">GPU:</td><td class="fw-bold" id="pdGpu">-</td></tr>
              </table>
            </div>
            <div class="col-6">
              <table class="table table-sm table-borderless m-0">
                <tr><td class="text-muted" style="width: 100px;">หน้าจอ:</td><td class="fw-bold" id="pdScreenSize">-</td></tr>
                <tr><td class="text-muted">สี:</td><td class="fw-bold" id="pdColor">-</td></tr>
                <tr><td class="text-muted">ประกัน:</td><td class="fw-bold" id="pdWarranty">-</td></tr>
              </table>
            </div>
          </div>
        </div>

        <table class="table table-bordered align-middle text-center" style="font-size: 0.95rem;">
          <thead style="background:#0f172a; color:#fff;">
            <tr>
              <th style="width:25%;">ราคาทุน (฿)</th>
              <th style="width:25%;">ราคาขายหน้าร้าน (฿)</th>
              <th style="width:25%;">กำไรต่อชิ้น (฿)</th>
              <th style="width:25%;">จำนวนคงเหลือ</th>
            </tr>
          </thead>
          <tbody>
            <tr style="font-size: 1.1rem;">
              <td class="fw-bold" id="pdCost">฿0</td>
              <td class="fw-bold text-success" id="pdSellPrice">฿0</td>
              <td class="fw-bold" id="pdProfitPerUnit">฿0</td>
              <td id="pdStock"><span class="fw-bold">0</span> ชิ้น</td>
            </tr>
          </tbody>
        </table>

        <div class="row g-3 mt-2">
          <div class="col-6">
            <div class="p-3 text-center" style="background:#f0fdf4; border-radius:10px; border:1px solid #bbf7d0;">
              <span class="small fw-bold text-muted">มูลค่าคลังทุนรวม</span>
              <h4 class="fw-bold text-success mt-1 mb-0" id="pdTotalCostValue">฿0</h4>
              <span class="small text-muted" id="pdTotalCostCalc">(ราคาทุน × จำนวน)</span>
            </div>
          </div>
          <div class="col-6">
            <div class="p-3 text-center" style="background:#eff6ff; border-radius:10px; border:1px solid #bfdbfe;">
              <span class="small fw-bold text-muted">มูลค่าคลังขายรวม</span>
              <h4 class="fw-bold text-primary mt-1 mb-0" id="pdTotalSellValue">฿0</h4>
              <span class="small text-muted" id="pdTotalSellCalc">(ราคาขาย × จำนวน)</span>
            </div>
          </div>
        </div>

        <div class="mt-3" id="pdFbLinkRow" style="display:none;">
          <div class="p-2 px-3" style="background:#e8f0fe; border-radius:8px; font-size:0.9rem;">
            <i class="fa-brands fa-facebook text-primary"></i> <strong>Facebook:</strong> <span id="pdFbLink">-</span>
          </div>
        </div>

        <div class="row mt-5 text-center small pt-4" style="border-top: 1px dashed #cbd5e1;">
          <div class="col-4"><br><br>...................................................<br>ผู้ตรวจสอบคลัง</div>
          <div class="col-4"></div>
          <div class="col-4"><br><br>...................................................<br>ผู้จัดการ / เจ้าของกิจการ</div>
        </div>

        <div class="text-center mt-4 small text-muted">เอกสารออกโดยระบบจัดการคลังสินค้า หจก. โน๊ตบุ๊ค ไอทีอุดร — พิมพ์อัตโนมัติ</div>
      </div>
    </div>
  </div>

  <script src="config.js">