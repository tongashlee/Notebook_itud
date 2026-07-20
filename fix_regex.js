const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/filteredProducts\.sort\(\(a, b\) => {[\s\S]*?return a\.name\.localeCompare\(b\.name\);\s*}\);/g, 
`filteredProducts.sort((a, b) => {
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        // เรียงจากอัปเดตล่าสุดไปเก่าสุด
        let dateA = new Date(a.updatedAt || 0).getTime();
        let dateB = new Date(b.updatedAt || 0).getTime();
        if (isNaN(dateA)) dateA = 0;
        if (isNaN(dateB)) dateB = 0;
        if (dateA !== dateB) return dateB - dateA;
        return a.name.localeCompare(b.name);
      });`);

html = html.replace(/filtered\.sort\(\(a, b\) => {[\s\S]*?return a\.name\.localeCompare\(b\.name\);\s*}\);/g, 
`filtered.sort((a, b) => {
        if (a.stock > 0 && b.stock <= 0) return -1;
        if (a.stock <= 0 && b.stock > 0) return 1;
        // เรียงจากอัปเดตล่าสุดไปเก่าสุด
        let dateA = new Date(a.updatedAt || 0).getTime();
        let dateB = new Date(b.updatedAt || 0).getTime();
        if (isNaN(dateA)) dateA = 0;
        if (isNaN(dateB)) dateB = 0;
        if (dateA !== dateB) return dateB - dateA;
        return a.name.localeCompare(b.name);
      });`);

fs.writeFileSync('index.html', html);
console.log('Regex replace done.');
