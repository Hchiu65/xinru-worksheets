const fs = require('fs');
const path = require('path');
const dir = path.resolve(__dirname, '..');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const broken = [];

files.forEach(file => {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const i = html.indexOf('GAME_LABELS');
  if (i === -1) return;
  const objStart = html.indexOf('{', i);
  const objEnd = html.indexOf('};', i) + 1;
  if (objStart === -1 || objEnd <= 0) return;
  try {
    eval('const x=' + html.substring(objStart, objEnd));
  } catch(e) {
    broken.push(file + ': ' + e.message);
  }
});

const total = files.filter(f =>
  fs.readFileSync(path.join(dir, f), 'utf8').includes('GAME_LABELS')
).length;

if (broken.length > 0) {
  console.error('\n❌ GAME_LABELS 語法錯誤，請修正後再 commit：');
  broken.forEach(b => console.error('   ' + b));
  console.error('\n常見原因：含 - 的鍵名未加引號');
  console.error("  錯誤: u8mingyan-mcq: '...'");
  console.error("  正確: 'u8mingyan-mcq': '...'");
  process.exit(1);
}

console.log(`✅ GAME_LABELS 語法檢查通過（${total} 個檔案）`);
