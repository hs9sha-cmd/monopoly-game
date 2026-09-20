const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');
  
  // Replace Swal.fire({ ... }) with Swal.fire({ ..., background: '#0f172a', color: '#e2e8f0' })
  code = code.replace(/Swal\.fire\(\{/g, "Swal.fire({\n        background: '#0f172a',\n        color: '#e2e8f0',");
  
  // Replace shorthand Swal.fire(title, text, icon) with standard object structure
  code = code.replace(/Swal\.fire\('ข้อผิดพลาด', 'ไม่พบข้อมูลทีม กรุณาเข้าร่วมใหม่', 'error'\);/g,
    "Swal.fire({title: 'ข้อผิดพลาด', text: 'ไม่พบข้อมูลทีม กรุณาเข้าร่วมใหม่', icon: 'error', background: '#0f172a', color: '#e2e8f0'});");

  code = code.replace(/Swal\.fire\('รีเซ็ตเกม!', 'ทุกทีมจะกลับไปจุดเริ่มต้น', 'info'\);/g,
    "Swal.fire({title: 'รีเซ็ตเกม!', text: 'ทุกทีมจะกลับไปจุดเริ่มต้น', icon: 'info', background: '#0f172a', color: '#e2e8f0'});");

  code = code.replace(/Swal\.fire\('ห้องถูกปิด', 'แอดมินได้ทำการปิดห้องการแข่งขันนี้แล้ว!', 'warning'\);/g,
    "Swal.fire({title: 'ห้องถูกปิด', text: 'แอดมินได้ทำการปิดห้องการแข่งขันนี้แล้ว!', icon: 'warning', background: '#0f172a', color: '#e2e8f0'});");

  code = code.replace(/Swal\.fire\('เข้าห้องไม่ได้', data\.error \|\| 'กรุณาตรวจสอบ PIN', 'error'\);/g,
    "Swal.fire({title: 'เข้าห้องไม่ได้', text: data.error || 'กรุณาตรวจสอบ PIN', icon: 'error', background: '#0f172a', color: '#e2e8f0'});");

  code = code.replace(/Swal\.fire\('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error'\);/g,
    "Swal.fire({title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', icon: 'error', background: '#0f172a', color: '#e2e8f0'});");

  fs.writeFileSync(filepath, code);
}

patchFile('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/board/[matchId]/page.tsx');
patchFile('/Users/pongsaklaocharoensuk/Monopoly/frontend/src/app/page.tsx');
