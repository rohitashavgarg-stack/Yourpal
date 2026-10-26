#!/usr/bin/env node
/*
 * Counts the hard-coded colours, radii and font sizes outside the design system, by folder, from a lint run.
 *
 *   node scripts/audit/hardcoded-by-folder.js          prints a markdown table
 *
 * (It runs ESLint on src, so it takes a minute.) The lint rule is a warning outside src/design-system, so the count does not fail the build;
 * `npm run lint:changed` stops new ones on any line you add or change.
 */
const { execSync } = require('child_process');
const path = require('path');

const json = execSync('npx eslint src -f json', { cwd: path.resolve(__dirname, '../..'), maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
const results = JSON.parse(json);
const kindOf = (m) => (/hex/i.test(m) ? 'colours' : /radius/i.test(m) ? 'radii' : 'font sizes');
const folders = {};
let total = 0;
for (const f of results) {
  const rel = path.relative(path.resolve(__dirname, '../../src'), f.filePath).split(path.sep).join('/');
  if (rel.startsWith('design-system/')) continue;
  const parts = rel.split('/');
  const key = parts.length > 2 ? parts.slice(0, 2).join('/') : parts[0] === 'lib' || parts[0] === 'theme' ? parts[0] : parts.slice(0, 2).join('/');
  for (const m of f.messages) {
    if (m.ruleId !== 'no-restricted-syntax') continue;
    const k = kindOf(m.message);
    const row = (folders[key] = folders[key] || { colours: 0, radii: 0, 'font sizes': 0 });
    row[k]++; total++;
  }
}
const rows = Object.entries(folders).sort((a, b) => (b[1].colours + b[1].radii + b[1]['font sizes']) - (a[1].colours + a[1].radii + a[1]['font sizes']));
console.log('| Folder | Colours | Radii | Font sizes | Total |\n|---|---|---|---|---|');
for (const [k, r] of rows) console.log(`| \`src/${k}\` | ${r.colours} | ${r.radii} | ${r['font sizes']} | ${r.colours + r.radii + r['font sizes']} |`);
const sum = (k) => rows.reduce((a, [, r]) => a + r[k], 0);
console.log(`| **Total** | **${sum('colours')}** | **${sum('radii')}** | **${sum('font sizes')}** | **${total}** |`);
