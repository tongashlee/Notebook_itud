// Script to add customer name search to reports and products pages
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add search box to Reports tab-history (after the existing action buttons, before </div>)
const historyTabMarker = 'id="tab-history">';
const historyTabIdx = content.indexOf(historyTabMarker);
if (historyTabIdx === -1) {
  console.error('Could not find tab-history marker');
  process.exit(1);
}

// Find the flex-wrap div and its closing </div>
const flexWrapStart = content.indexOf('d-flex gap-2 flex-wrap', historyTabIdx);
const selectedCountEnd = content.indexOf('</span>', content.indexOf('id="selectedCount"', flexWrapStart));
const closingDivAfterSelected = content.indexOf('</div>', selectedCountEnd);

// Replace the flex-wrap div to add align-items-center and the search box
const oldFlexContent = content.substring(
  content.lastIndexOf('<div', flexWrapStart),
  closingDivAfterSelected + 6
);

const newFlexContent = oldFlexContent
  .replace('d-flex gap-2 flex-wrap">', 'd-flex gap-2 flex-wrap align-items-center">')
  .replace(
    '</span>\r\n              </div>',
    `</span>
                <div class="ms-auto" style="min-width:260px; max-width:320px;">
                  <div class="search-autocomplete-wrapper">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" class="form-control form-control-sm search-input-styled" id="searchCusNameReport" placeholder="\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e0a\u0e37\u0e48\u0e2d\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32..." autocomplete="off" oninput="onSearchCusName(this, 'report')" onfocus="onSearchCusName(this, 'report')">
                    <button class="search-clear-btn" id="clearCusNameReport" onclick="clearCusNameSearch('report')" title="\u0e25\u0e49\u0e32\u0e07\u0e01\u0e32\u0e23\u0e04\u0e49\u0e19\u0e2b\u0e32"><i class="fa-solid fa-xmark"></i></button>
                    <div class="search-autocomplete-dropdown" id="dropdownCusNameReport"></div>
                  </div>
                  <div class="search-result-count" id="searchResultCountReport"></div>
                </div>
              </div>`
  )
  // Handle \n line ending too
  .replace(
    '</span>\n              </div>',
    `</span>
                <div class="ms-auto" style="min-width:260px; max-width:320px;">
                  <div class="search-autocomplete-wrapper">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" class="form-control form-control-sm search-input-styled" id="searchCusNameReport" placeholder="\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e0a\u0e37\u0e48\u0e2d\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32..." autocomplete="off" oninput="onSearchCusName(this, 'report')" onfocus="onSearchCusName(this, 'report')">
                    <button class="search-clear-btn" id="clearCusNameReport" onclick="clearCusNameSearch('report')" title="\u0e25\u0e49\u0e32\u0e07\u0e01\u0e32\u0e23\u0e04\u0e49\u0e19\u0e2b\u0e32"><i class="fa-solid fa-xmark"></i></button>
                    <div class="search-autocomplete-dropdown" id="dropdownCusNameReport"></div>
                  </div>
                  <div class="search-result-count" id="searchResultCountReport"></div>
                </div>
              </div>`
  );

content = content.replace(oldFlexContent, newFlexContent);
console.log('1. Added search box to Reports tab-history');

// 2. Add search box to Products page filter area
// Find the manageStockFilter select closing tag and its parent col-md-3 div
const manageStockFilterIdx = content.indexOf('id="manageStockFilter"');
if (manageStockFilterIdx === -1) {
  console.error('Could not find manageStockFilter');
  process.exit(1);
}

// Find the closing </select> after manageStockFilter
const stockFilterSelectEnd = content.indexOf('</select>', manageStockFilterIdx);
const stockFilterColEnd = content.indexOf('</div>', stockFilterSelectEnd);

// Insert new col after the stock filter col
const insertAfterProducts = stockFilterColEnd + 6; // after </div>
const supplierSearchHtml = `
            <div class="col-md-3">
              <div class="search-autocomplete-wrapper">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" class="form-control form-control-sm search-input-styled" id="searchSupplierProducts" placeholder="\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e0a\u0e37\u0e48\u0e2d\u0e1c\u0e39\u0e49\u0e02\u0e32\u0e22 / \u0e0b\u0e37\u0e49\u0e2d\u0e08\u0e32\u0e01..." autocomplete="off" oninput="onSearchSupplier(this)" onfocus="onSearchSupplier(this)">
                <button class="search-clear-btn" id="clearSupplierProducts" onclick="clearSupplierSearch()" title="\u0e25\u0e49\u0e32\u0e07\u0e01\u0e32\u0e23\u0e04\u0e49\u0e19\u0e2b\u0e32"><i class="fa-solid fa-xmark"></i></button>
                <div class="search-autocomplete-dropdown" id="dropdownSupplierProducts"></div>
              </div>
              <div class="search-result-count" id="searchResultCountProducts"></div>
            </div>`;

content = content.substring(0, insertAfterProducts) + supplierSearchHtml + content.substring(insertAfterProducts);
console.log('2. Added search box to Products page');

// Also change the col-md-3 sizes in the products filter to make room
// The existing filters each use col-md-3, let's shrink them to col-md-2
const productFilterAreaStart = content.indexOf('id="manageDateFilter"');
const filterRowStart = content.lastIndexOf('<div class="row', productFilterAreaStart);
const filterRowEnd = content.indexOf('</div>\r\n          </div>', filterRowStart + 100);
if (filterRowEnd === -1) {
  // try \n line ending
  const filterRowEnd2 = content.indexOf('</div>\n          </div>', filterRowStart + 100);
}

// 3. Add JavaScript functions for search autocomplete
// Find the last </script> and insert before it
const scriptInsertPoint = content.lastIndexOf('</script>');
const searchFunctions = `

    // ====== Customer Name Search Autocomplete ======
    let currentCusNameFilter = '';
    let currentSupplierFilter = '';

    function highlightMatch(text, query) {
      if (!query) return text;
      let idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return text;
      return text.substring(0, idx) + '<span class="match-highlight">' + text.substring(idx, idx + query.length) + '</span>' + text.substring(idx + query.length);
    }

    function getUniqueCusNames() {
      let names = new Set();
      globalSales.forEach(s => {
        if (s.cusName && s.cusName !== '-' && s.cusName.trim() !== '') {
          names.add(s.cusName.trim());
        }
      });
      return [...names].sort();
    }

    function getUniqueSuppliers() {
      let names = new Set();
      globalProducts.forEach(p => {
        if (p.supplier && p.supplier !== '-' && p.supplier.trim() !== '' && p.supplier !== 'null' && p.supplier !== 'undefined') {
          names.add(p.supplier.trim());
        }
      });
      return [...names].sort();
    }

    function onSearchCusName(inputEl, context) {
      let query = inputEl.value.trim();
      let dropdown = document.getElementById('dropdownCusNameReport');
      let clearBtn = document.getElementById('clearCusNameReport');

      clearBtn.style.display = query.length > 0 ? 'block' : 'none';

      let allNames = getUniqueCusNames();
      let filtered = query.length > 0
        ? allNames.filter(n => n.toLowerCase().includes(query.toLowerCase()))
        : allNames;

      if (filtered.length === 0 && query.length > 0) {
        dropdown.innerHTML = '<div class="no-results"><i class="fa-solid fa-circle-exclamation me-1"></i> \u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32\u0e17\u0e35\u0e48\u0e04\u0e49\u0e19\u0e2b\u0e32</div>';
        dropdown.classList.add('show');
      } else if (filtered.length > 0) {
        dropdown.innerHTML = filtered.map(name =>
          '<div class="dropdown-item-custom" onclick="selectCusName(\\'' + name.replace(/'/g, "\\\\'") + '\\')">' +
          '<i class="fa-solid fa-user item-icon"></i>' +
          '<span>' + highlightMatch(name, query) + '</span>' +
          '</div>'
        ).join('');
        dropdown.classList.add('show');
      } else {
        dropdown.classList.remove('show');
      }

      // Apply filter in real-time as user types
      currentCusNameFilter = query;
      renderReportsTab();
    }

    function selectCusName(name) {
      let input = document.getElementById('searchCusNameReport');
      input.value = name;
      currentCusNameFilter = name;
      document.getElementById('dropdownCusNameReport').classList.remove('show');
      document.getElementById('clearCusNameReport').style.display = 'block';
      renderReportsTab();
    }

    function clearCusNameSearch(context) {
      let input = document.getElementById('searchCusNameReport');
      input.value = '';
      currentCusNameFilter = '';
      document.getElementById('dropdownCusNameReport').classList.remove('show');
      document.getElementById('clearCusNameReport').style.display = 'none';
      document.getElementById('searchResultCountReport').innerHTML = '';
      renderReportsTab();
    }

    function onSearchSupplier(inputEl) {
      let query = inputEl.value.trim();
      let dropdown = document.getElementById('dropdownSupplierProducts');
      let clearBtn = document.getElementById('clearSupplierProducts');

      clearBtn.style.display = query.length > 0 ? 'block' : 'none';

      let allNames = getUniqueSuppliers();
      let filtered = query.length > 0
        ? allNames.filter(n => n.toLowerCase().includes(query.toLowerCase()))
        : allNames;

      if (filtered.length === 0 && query.length > 0) {
        dropdown.innerHTML = '<div class="no-results"><i class="fa-solid fa-circle-exclamation me-1"></i> \u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e1c\u0e39\u0e49\u0e02\u0e32\u0e22\u0e17\u0e35\u0e48\u0e04\u0e49\u0e19\u0e2b\u0e32</div>';
        dropdown.classList.add('show');
      } else if (filtered.length > 0) {
        dropdown.innerHTML = filtered.map(name =>
          '<div class="dropdown-item-custom" onclick="selectSupplier(\\'' + name.replace(/'/g, "\\\\'") + '\\')">' +
          '<i class="fa-solid fa-store item-icon"></i>' +
          '<span>' + highlightMatch(name, query) + '</span>' +
          '</div>'
        ).join('');
        dropdown.classList.add('show');
      } else {
        dropdown.classList.remove('show');
      }

      currentSupplierFilter = query;
      renderManageProducts();
    }

    function selectSupplier(name) {
      let input = document.getElementById('searchSupplierProducts');
      input.value = name;
      currentSupplierFilter = name;
      document.getElementById('dropdownSupplierProducts').classList.remove('show');
      document.getElementById('clearSupplierProducts').style.display = 'block';
      renderManageProducts();
    }

    function clearSupplierSearch() {
      let input = document.getElementById('searchSupplierProducts');
      input.value = '';
      currentSupplierFilter = '';
      document.getElementById('dropdownSupplierProducts').classList.remove('show');
      document.getElementById('clearSupplierProducts').style.display = 'none';
      document.getElementById('searchResultCountProducts').innerHTML = '';
      renderManageProducts();
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.search-autocomplete-wrapper')) {
        document.querySelectorAll('.search-autocomplete-dropdown').forEach(d => d.classList.remove('show'));
      }
    });

    // Keyboard navigation for dropdowns
    document.addEventListener('keydown', function(e) {
      let activeDropdown = document.querySelector('.search-autocomplete-dropdown.show');
      if (!activeDropdown) return;
      let items = activeDropdown.querySelectorAll('.dropdown-item-custom');
      if (items.length === 0) return;
      let activeItem = activeDropdown.querySelector('.dropdown-item-custom.active');
      let idx = -1;
      if (activeItem) {
        idx = Array.from(items).indexOf(activeItem);
        activeItem.classList.remove('active');
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        idx = (idx + 1) % items.length;
        items[idx].classList.add('active');
        items[idx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        idx = idx <= 0 ? items.length - 1 : idx - 1;
        items[idx].classList.add('active');
        items[idx].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && idx >= 0) {
        e.preventDefault();
        items[idx].click();
      } else if (e.key === 'Escape') {
        activeDropdown.classList.remove('show');
      }
    });

  `;

content = content.substring(0, scriptInsertPoint) + searchFunctions + content.substring(scriptInsertPoint);
console.log('3. Added search JavaScript functions');

// 4. Modify renderReportsTab to filter by customer name
// Find the line: let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED')
const renderReportsIdx = content.indexOf('function renderReportsTab()');
const sortedSalesLine = content.indexOf("let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED')", renderReportsIdx);

if (sortedSalesLine !== -1) {
  // Find the end of the sort function (the semicolon after .sort(...))
  const sortEndSemicolon = content.indexOf('});', sortedSalesLine + 100);
  const afterSortedSales = sortEndSemicolon + 3;
  
  // Insert customer name filter after the sortedSales definition
  const cusFilterCode = `

      // Filter by customer name search
      if (currentCusNameFilter) {
        sortedSales = sortedSales.filter(s => s.cusName && s.cusName.toLowerCase().includes(currentCusNameFilter.toLowerCase()));
        let resultEl = document.getElementById('searchResultCountReport');
        if (resultEl) resultEl.innerHTML = '\u0e1e\u0e1a <strong>' + sortedSales.length + '</strong> \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23';
      } else {
        let resultEl = document.getElementById('searchResultCountReport');
        if (resultEl) resultEl.innerHTML = '';
      }
`;
  
  content = content.substring(0, afterSortedSales) + cusFilterCode + content.substring(afterSortedSales);
  console.log('4. Modified renderReportsTab to filter by customer name');
} else {
  console.error('Could not find sortedSales line in renderReportsTab');
}

// 5. Modify renderManageProducts to filter by supplier name
const renderManageIdx = content.indexOf('function renderManageProducts()');
const stockFilterLine = content.indexOf("if (stockFilter === 'in_stock')", renderManageIdx);

if (stockFilterLine !== -1) {
  // Find the closing } of the stock filter block
  const outOfStockLine = content.indexOf("} else if (stockFilter === 'out_of_stock')", stockFilterLine);
  const outOfStockEnd = content.indexOf('}', content.indexOf('filteredProducts = filteredProducts.filter', outOfStockLine));
  const afterStockFilter = content.indexOf('}', outOfStockEnd + 1) + 1;

  // Insert supplier name filter
  const supplierFilterCode = `

      // Filter by supplier name search
      if (currentSupplierFilter) {
        filteredProducts = filteredProducts.filter(p => p.supplier && p.supplier.toLowerCase().includes(currentSupplierFilter.toLowerCase()));
        let resultEl = document.getElementById('searchResultCountProducts');
        if (resultEl) resultEl.innerHTML = '\u0e1e\u0e1a <strong>' + filteredProducts.length + '</strong> \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23';
      } else {
        let resultEl = document.getElementById('searchResultCountProducts');
        if (resultEl) resultEl.innerHTML = '';
      }
`;

  content = content.substring(0, afterStockFilter) + supplierFilterCode + content.substring(afterStockFilter);
  console.log('5. Modified renderManageProducts to filter by supplier name');
} else {
  console.error('Could not find stockFilter line in renderManageProducts');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\nDone! All changes applied successfully.');
