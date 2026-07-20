const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let target = "      let html = filteredProducts.map(p => {";
let safeSort = `      filteredProducts.sort((a, b) => {
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        let dateA = (a.updatedAt || '').split('T')[0];
        let dateB = (b.updatedAt || '').split('T')[0];
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        let nameA = a.name || '';
        let nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });
` + '\n' + target;

// Since we only want to apply this inside renderManageProducts
let start = html.indexOf('function renderManageProducts()');
let end = html.indexOf('function printProductDetail', start);
let func = html.substring(start, end);
let newFunc = func.replace(target, safeSort);

html = html.substring(0, start) + newFunc + html.substring(end);

// Also let's fix renderViewProducts to use the safe sorting string compare to avoid any NaN date bugs!
let oldViewSort = `      filteredProducts.sort((a, b) => {
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        // เรียงจากอัปเดตล่าสุดไปเก่าสุด
        let dateA = new Date(a.updatedAt || 0).getTime();
        let dateB = new Date(b.updatedAt || 0).getTime();
        if (isNaN(dateA)) dateA = 0;
        if (isNaN(dateB)) dateB = 0;
        if (dateA !== dateB) return dateB - dateA;
        return a.name.localeCompare(b.name);
      });`;

let newViewSort = `      filteredProducts.sort((a, b) => {
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        let dateA = (a.updatedAt || '').split('T')[0];
        let dateB = (b.updatedAt || '').split('T')[0];
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        let nameA = a.name || '';
        let nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });`;

html = html.replace(oldViewSort, newViewSort);

fs.writeFileSync('index.html', html);
console.log('Sorting applied to all product tables!');
