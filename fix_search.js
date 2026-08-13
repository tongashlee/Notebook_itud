// Fix the duplicate lines issue
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the duplicate/broken lines (2253-2258 in 1-indexed)
// These lines contain the old broken remnants
const lines = content.split('\n');

// Find the problematic lines
let startRemove = -1;
let endRemove = -1;

for (let i = 0; i < lines.length; i++) {
  // Look for the broken line that starts with Thai text (พบ)
  if (lines[i].includes("\u0e1e\u0e1a <strong>") && lines[i].includes("filteredProducts.length") && lines[i].includes("\u0e23\u0e32\u0e22\u0e01\u0e32\u0e23';")) {
    startRemove = i;
    // Remove this line and the next few until we find ");"
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() === ');') {
        endRemove = j;
        break;
      }
    }
    break;
  }
}

if (startRemove >= 0 && endRemove >= 0) {
  console.log(`Removing lines ${startRemove + 1} to ${endRemove + 1} (1-indexed)`);
  console.log('Lines to remove:');
  for (let i = startRemove; i <= endRemove; i++) {
    console.log(`  ${i + 1}: ${lines[i].substring(0, 80)}`);
  }
  lines.splice(startRemove, endRemove - startRemove + 1);
  content = lines.join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed successfully!');
} else {
  console.log('Could not find the problematic lines to remove.');
  console.log('startRemove:', startRemove, 'endRemove:', endRemove);
}
