const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The original line
let oldLine = `          let saleStr = JSON.stringify(s).replace(/'/g, "\\\\'");`;
let newLine = `          let saleStr = encodeURIComponent(JSON.stringify(s));`;

// Original buttons
let oldBtns1 = `onclick='pullToInvoice(\${saleStr})'`;
let newBtns1 = `onclick="pullToInvoice(JSON.parse(decodeURIComponent('\${saleStr}')))"`;

let oldBtns2 = `onclick='pullToParcel(\${saleStr})'`;
let newBtns2 = `onclick="pullToParcel(JSON.parse(decodeURIComponent('\${saleStr}')))"`;

let oldBtns3 = `onclick='editSaleModal(\${saleStr})'`;
let newBtns3 = `onclick="editSaleModal(JSON.parse(decodeURIComponent('\${saleStr}')))"`;

// Replace them
html = html.replace(oldLine, newLine);
html = html.replace(oldBtns1, newBtns1);
html = html.replace(oldBtns2, newBtns2);
html = html.replace(oldBtns3, newBtns3);

fs.writeFileSync('index.html', html);
console.log('Fixed onclick HTML quoting bugs!');
