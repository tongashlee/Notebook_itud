const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The string `\\n  </script>\\n</body>\\n</html>\\n` got appended as literals due to Powershell.
let literalStr = '\\n  </script>\\n</body>\\n</html>\\n';
if (html.endsWith(literalStr)) {
  html = html.substring(0, html.length - literalStr.length);
}

// Check again
if (html.indexOf('\\n  </script>\\n</body>\\n</html>\\n') !== -1) {
  html = html.replace('\\n  </script>\\n</body>\\n</html>\\n', '');
}

// Also it might have added `\\n` as actual `\n` characters
html = html.trimEnd() + '\n  </script>\n</body>\n</html>\n';
fs.writeFileSync('index.html', html);
console.log('Fixed tags properly');
