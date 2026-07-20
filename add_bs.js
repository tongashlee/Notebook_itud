const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('bootstrap.bundle.min.js')) {
    html = html.replace(
        '<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>',
        '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>'
    );
    fs.writeFileSync('index.html', html);
    console.log('Added Bootstrap JS successfully!');
} else {
    console.log('Bootstrap JS is already there!');
}
