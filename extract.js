const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

let start = html.indexOf('<script>');
// There is one main script block that starts with <script> and ends with </script> near the bottom
let lastScriptEnd = html.lastIndexOf('</script>');

if (start !== -1) {
  let js = html.substring(start + 8, lastScriptEnd);
  fs.writeFileSync('temp.js', js);
  console.log('Extracted js');
} else {
  console.log('No simple <script> found');
}
