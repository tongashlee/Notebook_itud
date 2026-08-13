// Fix escaped unicode in the supplier filter innerHTML
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the escaped unicode in supplier filter
content = content.replace(
  "if (resultEl) resultEl.innerHTML = '\\\\u0e1e\\\\u0e1a <strong>' + filteredProducts.length + '</strong> \\\\u0e23\\\\u0e32\\\\u0e22\\\\u0e01\\\\u0e32\\\\u0e23';",
  "if (resultEl) resultEl.innerHTML = '\u0e1e\u0e1a <strong>' + filteredProducts.length + '</strong> \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23';"
);

// Also check and fix the customer name filter in renderReportsTab
content = content.replace(
  "if (resultEl) resultEl.innerHTML = '\\\\u0e1e\\\\u0e1a <strong>' + sortedSales.length + '</strong> \\\\u0e23\\\\u0e32\\\\u0e22\\\\u0e01\\\\u0e32\\\\u0e23';",
  "if (resultEl) resultEl.innerHTML = '\u0e1e\u0e1a <strong>' + sortedSales.length + '</strong> \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23';"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed escaped unicode characters');
