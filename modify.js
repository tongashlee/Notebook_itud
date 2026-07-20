
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let savingsJs = fs.readFileSync('savings.js', 'utf8');

let insertPoint = html.indexOf('    window.onload = function () {');
if (insertPoint !== -1) {
  let before = html.substring(0, insertPoint);
  let after = html.substring(insertPoint);
  
  after = after.replace(
    /document\.getElementById\('tx_date'\)\.value = today;/, 
    'document.getElementById(\'tx_date\').value = today;\n      document.getElementById(\'sv_date\').value = today;'
  );

  let finalHtml = before + savingsJs + '\n' + after;
  fs.writeFileSync('index.html', finalHtml);
  console.log('Appended savings.js successfully!');
} else {
  console.log('window.onload not found!');
}

