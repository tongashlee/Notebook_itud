const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update error message to show exactly what went wrong
let oldCatch = `Swal.fire('แจ้งเตือน', 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบการตั้งค่า Supabase', 'error');`;
let newCatch = `Swal.fire('แจ้งเตือน', 'ข้อผิดพลาด: ' + (error.message || JSON.stringify(error)), 'error');`;

html = html.replace(oldCatch, newCatch);
fs.writeFileSync('index.html', html);
console.log("Updated error message display");
