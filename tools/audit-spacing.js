// Flags spacing and sizing values that are not multiples of 4 (house rule: multiples of 4 or 8).
// Skips type (font, letter-spacing), 1px and 2px borders and strokes, shadows, and pill radii.
// Run: node tools/audit-spacing.js
const fs = require('fs');
const path = require('path');
const SKIP = /^(font|letter-spacing|line-height|border(?!-radius)|outline|box-shadow|--shadow|stroke|--b\d|--h\d|--m3|--live|--grad|background)/;
let bad = 0;
for (const file of ['design-system.css', 'app.css']) {
  fs.readFileSync(path.join(__dirname, '..', file), 'utf8').split('\n').forEach((line, i) => {
    for (const decl of line.split(/;|\{/)) {
      const m = decl.match(/([a-z-]+)\s*:\s*(.+)$/i);
      if (!m || SKIP.test(m[1])) continue;
      const vals = [...m[2].matchAll(/(-?\d+(?:\.\d+)?)px/g)].map(x => +x[1]).filter(v => v !== 0 && v % 4 !== 0 && Math.abs(v) !== 1 && Math.abs(v) !== 2 && Math.abs(v) !== 999);
      if (vals.length) { bad++; console.log(`${file}:${i + 1}  ${m[1]}: ${m[2].trim().slice(0, 60)}   -> ${vals.join(', ')}`); }
    }
  });
}
console.log(bad ? `${bad} declarations off the 4px grid` : 'all spacing values are on the 4px grid');
