#!/usr/bin/env node
/*
 * How many screens use each shared component that still lives outside the design system (src/components).
 * A screen is a route file under src/app (not _layout, not +html). It uses a component when that component is drawn (<Name ...>) in the
 * route file or in any file the route imports, directly or through other files (the import closure).
 *
 *   node scripts/audit/shared-usage.js            prints the table
 *   node scripts/audit/shared-usage.js --json     also writes docs/shared-usage.json
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const src = path.join(root, 'src');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx?|jsx?)$/.test(e.name) ? [path.join(d, e.name)] : []));
const rel = (p) => path.relative(src, p).split(path.sep).join('/');

const files = walk(src).filter((p) => !p.includes(`${path.sep}web${path.sep}`));
const text = new Map(files.map((p) => [rel(p), fs.readFileSync(p, 'utf8')]));

// resolve an import path to a file under src
const resolveImport = (from, spec) => {
  let base;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
  else return null;
  for (const ext of ['.tsx', '.ts', '.js', '/index.tsx', '/index.ts', '']) if (text.has(base + ext)) return base + ext;
  return null;
};
const deps = new Map();
for (const [f, t] of text) {
  const set = new Set();
  for (const m of t.matchAll(/(?:from|import|require\()\s*['"]([^'"]+)['"]/g)) { const r = resolveImport(f, m[1]); if (r) set.add(r); }
  for (const m of t.matchAll(/export\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g)) { const r = resolveImport(f, m[1]); if (r) set.add(r); }
  deps.set(f, set);
}
const routes = [...text.keys()].filter((f) => f.startsWith('app/') && !/_layout|\+html|\+not-found/.test(f));
const closure = new Map();
for (const r of routes) {
  const seen = new Set([r]); const stack = [r];
  while (stack.length) { const f = stack.pop(); for (const d of deps.get(f) || []) if (!seen.has(d)) { seen.add(d); stack.push(d); } }
  closure.set(r, seen);
}

// every exported component (capital letter) of the files outside the library
const outside = ['ui.tsx', 'bits.tsx', 'Brand.tsx', 'FloatingTabBar.tsx', 'TabScreen.tsx', 'GymHeader.tsx', 'OtpInput.tsx', 'Ruler.tsx', 'Wheel.tsx', 'TrendsButton.tsx', 'YourPalLogo.tsx', 'Glass.tsx'];
const comps = [];
for (const f of outside) {
  const t = text.get('components/' + f) || '';
  for (const m of t.matchAll(/^export (?:function|const) ([A-Z][A-Za-z]*)\b/gm)) {
    // YourPalLogo.tsx also exports constants (LOGO_BLUE): all caps are skipped by the pattern above
    comps.push({ name: m[1], file: 'src/components/' + f });
  }
}
const rows = [];
for (const c of comps) {
  const own = c.file.replace(/^src\//, '');
  const re = new RegExp(`<${c.name}(?=[\\s/>])`);
  const users = [...text.keys()].filter((f) => f !== own && re.test(text.get(f)));
  const screens = routes.filter((r) => [...closure.get(r)].some((f) => f !== own && users.includes(f)));
  rows.push({ name: c.name, file: c.file, screens: screens.length, files: users.length, usedAt: users.slice(0, 6) });
}
rows.sort((a, b) => b.screens - a.screens || a.name.localeCompare(b.name));
console.log(rows.map((r) => `${r.name.padEnd(18)} ${r.file.padEnd(34)} screens ${String(r.screens).padStart(3)}  files ${String(r.files).padStart(3)}`).join('\n'));
if (process.argv.includes('--json')) fs.writeFileSync(path.join(root, 'docs/shared-usage.json'), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), screens: routes.length, rows }, null, 1));
