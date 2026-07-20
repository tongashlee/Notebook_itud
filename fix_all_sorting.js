const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix renderManageProducts sorting
let manageOld = `      filteredProducts.sort((a, b) => {
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        return a.name.localeCompare(b.name);
      });`;

let manageNew = `      filteredProducts.sort((a, b) => {
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
html = html.replace(manageOld, manageNew);

// 2. Fix renderViewProducts sorting
let viewOld = `      filtered.sort((a, b) => {
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        return a.name.localeCompare(b.name);
      });`;

let viewNew = `      filtered.sort((a, b) => {
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
html = html.replace(viewOld, viewNew);

// 3. Fix renderReportsTab sorting (make it ultra safe)
let reportsOld = `      // เรียงจากใหม่ไปเก่า และตัดรายการที่ถูกยกเลิก/ตีกลับออก
      let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => {
        let dateA = new Date(a.createdAt).getTime();
        let dateB = new Date(b.createdAt).getTime();
        if (isNaN(dateA)) dateA = 0;
        if (isNaN(dateB)) dateB = 0;
        return dateB - dateA;
      });`;

let reportsNew = `      // เรียงจากใหม่ไปเก่า และตัดรายการที่ถูกยกเลิก/ตีกลับออก
      let sortedSales = [...globalSales].filter(s => s.status !== 'CANCELLED').sort((a, b) => {
        let dateA = a.date.split('/').reverse().join('');
        let dateB = b.date.split('/').reverse().join('');
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return b.receiptId.localeCompare(a.receiptId);
      });`;
html = html.replace(reportsOld, reportsNew);

fs.writeFileSync('index.html', html);
console.log('Fixed sorting for products and reports!');
