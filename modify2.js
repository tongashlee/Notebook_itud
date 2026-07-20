const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The line is:
// fa-print"></i></button></td></tr>`;
let targetStr = 'fa-print"></i></button></td></tr>`;';
let insertPoint = html.indexOf(targetStr);

if (insertPoint !== -1) {
  let before = html.substring(0, insertPoint);
  let after = html.substring(insertPoint + targetStr.length);
  
  let newHtml = before + 'fa-print\"></i></button><button class=\"btn btn-sm btn-outline-danger ms-1\" onclick=\"deleteProduct(\\'${p.id}\\')\" title=\"ลบสินค้า\"><i class=\"fa-solid fa-trash\"></i></button></td></tr>\`;' + after;
  
  fs.writeFileSync('index.html', newHtml);
  console.log('Added delete button!');
} else {
  console.log('Could not find target string');
}
