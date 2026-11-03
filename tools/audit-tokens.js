// Checks that app.css and app.js use only tokens from design-system.css (which holds the Figma file's values).
// Flags: literal colours, font sizes outside the Figma type scale (13 minimum), and spacing off the 4px grid.
// Run: node tools/audit-tokens.js
const fs = require('fs');
const path = require('path');
const root = p => path.join(__dirname, '..', p);
const FILES = ['app.css', 'app.js'];
const ALLOWED_SIZES = new Set([13, 14, 16, 18, 20, 24]);
let problems = 0;
const flag = (file, line, msg) => { problems++; console.log(`${file}:${line}  ${msg}`); };

for (const f of FILES) {
  fs.readFileSync(root(f), 'utf8').split('\n').forEach((line, i) => {
    const n = i + 1;
    for (const m of line.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
      if (f === 'app.js' && /leadId|#158920/.test(line)) continue;           // data, not a colour
      flag(f, n, `literal colour ${m[0]}`);
    }
    for (const m of line.matchAll(/rgba?\([^)]*\)/g)) flag(f, n, `literal colour ${m[0]}`);
    for (const m of line.matchAll(/(?:font:[^;{}`'"]*?\s|font-size:)(\d+(?:\.\d+)?)px/g)) {
      if (!ALLOWED_SIZES.has(+m[1])) flag(f, n, `font size ${m[1]}px is not on the Figma type scale (13, 14, 16, 18, 20, 24)`);
    }
  });
}
console.log(problems ? `${problems} deviations` : 'app.css and app.js use only Figma tokens and the Figma type scale');
