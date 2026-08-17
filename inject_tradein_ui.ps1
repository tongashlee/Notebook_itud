$filePath = "c:\Users\Dimondz\Documents\notebookitud\index.html"
$linesList = [System.Collections.Generic.List[string]]::new([System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8))

# 1. Insert Trade-in UI into the Sale Form
# Find the row for shipping cost and totals, which contains id="saleShippingCost"
$uiHtml = @'
            <!-- Trade-in Section within Sale -->
            <div class="row g-2 mb-3">
              <div class="col-12">
                <div class="form-check form-switch p-3 bg-light rounded border border-purple">
                  <input class="form-check-input ms-0 me-2" type="checkbox" id="hasTradeIn" onchange="toggleTradeIn()">
                  <label class="form-check-label fw-bold text-purple" for="hasTradeIn"> มีสินค้าเทิร์นหรือไม่? (ลูกค้านำเครื่องเก่ามาเทิร์น)</label>
                </div>
              </div>
            </div>

            <div id="tradeInBox" class="p-3 mb-3 rounded" style="display:none; background-color:#faf5ff; border: 1px solid #c4b5fd;">
              <h6 class="fw-bold text-purple mb-3"><i class="fa-solid fa-laptop-medical"></i> รายละเอียดเครื่องเทิร์น</h6>
              <div class="row g-2">
                <div class="col-md-5">
                  <label class="small fw-bold text-muted">ชื่อ/รุ่น เครื่องที่นำมาเทิร์น</label>
                  <input type="text" class="form-control" id="tradeInName" placeholder="เช่น iPhone 13 Pro Max">
                </div>
                <div class="col-md-4">
                  <label class="small fw-bold text-muted">ยี่ห้อ (Brand)</label>
                  <input type="text" class="form-control" id="tradeInBrand" placeholder="เช่น Apple">
                </div>
                <div class="col-md-3">
                  <label class="small fw-bold text-muted">ราคาตีเทิร์น (ส่วนลด)</label>
                  <input type="number" class="form-control text-danger fw-bold" id="tradeInValue" value="0" min="0" step="0.01" oninput="calcVAT()">
                </div>
              </div>
            </div>
'@

# Find saleShippingCost to insert right before the Calculation Row
$foundShipping = $false
for ($i = 0; $i -lt $linesList.Count; $i++) {
    if ($linesList[$i] -match "id="saleShippingCost"") {
        # Go down to the end of that row </div>
        # Actually saleShippingCost is inside <div class="row g-2 mb-3">
        # Let's just insert before the Next row which is the Calculation Row ("รวมเงิน (ก่อน VAT)")
    }
    if ($linesList[$i] -match "รวมเงิน \(ก่อน VAT\)") {
        # $linesList[] is inside a col-md-4. The row start is earlier.
        # Let's search backward for the row start
        for ($j = $i; $j -ge 0; $j--) {
            if ($linesList[$j] -match "<div class="row g-2 mb-3">") {
                $linesList.Insert($j, $uiHtml)
                Write-Host "Injected Trade-in UI before line $j"
                break
            }
        }
        break
    }
}

# 2. Add Net Total line in the calculation row
$netHtml = @'
              <div class="col-md-4 offset-md-8 mt-2" id="netTotalBox" style="display:none;">
                <label class="small fw-bold text-danger">หักส่วนลดเทิร์นสินค้า</label>
                <input type="text" class="form-control bg-light text-danger fw-bold" id="saleTradeInDisplay" readonly value="0.00">
                <label class="small fw-bold text-success mt-2">ยอดสุทธิที่ต้องชำระ (Net)</label>
                <input type="text" class="form-control bg-success-subtle text-success fw-bold fs-5" id="saleNetTotal" readonly value="0.00">
              </div>
'@

for ($i = 0; $i -lt $linesList.Count; $i++) {
    if ($linesList[$i] -match "ยอดรวมทั้งสิ้น \(รวม VAT\)") {
        # Find the closing </div> of this row
        for ($j = $i + 1; $j -lt $linesList.Count; $j++) {
            if ($linesList[$j].Trim() -eq "</div>") {
                $linesList.Insert($j + 1, $netHtml)
                Write-Host "Injected Net Total UI after line $j"
                break
            }
        }
        break
    }
}

# Write back
$output = $linesList -join "
"
[System.IO.File]::WriteAllText($filePath, $output, [System.Text.Encoding]::UTF8)