#!/usr/bin/env node
/*
 * Writes docs/SCREEN-MAP.md: every screen with its route and file, where it opens from, where it leads to, the sheets it opens,
 * the library pieces it uses and the data it reads, plus a table of the data the whole app reads (what a backend has to supply).
 * Everything is read from the code, so run it again after a change:   node scripts/audit/screen-map.js
 *
 * "Leads to" and "data it reads" come from the route file and the files it imports from its own feature folder (one step), not from
 * shared code, so the shared tab bar and header do not show up on every screen. It is a first draft for the developer to confirm.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const src = path.join(root, 'src');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx?)$/.test(e.name) ? [path.join(d, e.name)] : []));
const rel = (p) => path.relative(src, p).split(path.sep).join('/');
const files = walk(src).filter((p) => !/[\\/]web[\\/]/.test(p));
const text = new Map(files.map((p) => [rel(p), fs.readFileSync(p, 'utf8')]));

const resolveImport = (from, spec) => {
  let base;
  if (spec.startsWith('@/')) base = spec.slice(2);
  else if (spec.startsWith('.')) base = path.posix.normalize(path.posix.join(path.posix.dirname(from), spec));
  else return null;
  for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts', '']) if (text.has(base + ext)) return base + ext;
  return null;
};
const imports = (f) => [...new Set([...(text.get(f) || '').matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)].map((m) => resolveImport(f, m[1])).filter(Boolean))];

// ---- screens: route table of docs/coverage.md ----
const md = fs.readFileSync(path.join(root, 'docs/coverage.md'), 'utf8').replace(/\r\n/g, '\n');
const section = (title) => { const a = md.indexOf('## ' + title); const b = md.indexOf('\n## ', a + 5); return md.slice(a, b < 0 ? undefined : b).split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| Screen') && !l.startsWith('|---')).map((l) => l.split('|').map((x) => x.trim())); };
const data = JSON.parse(fs.readFileSync(path.join(root, 'docs/coverage-data.json'), 'utf8'));
// two files share the route "/": the Today tab (app/(tabs)/index.tsx) and the entry redirect (app/index.tsx)
const findRoute = (route, name) => data.routes.find((r) => r.route === route && (route !== '/' || (name === 'Today') === /(tabs)/.test(r.file)));
const routeFile = Object.fromEntries(data.routes.map((r) => [r.route, r]));
const screens = section('Routes').map((r) => ({ name: r[1], route: r[2].replace(/`/g, '').split(' ')[0], reach: r[3] })).filter((s) => findRoute(s.route, s.name));
const nameOf = Object.fromEntries(screens.filter((s) => s.name !== 'Entry redirect').map((s) => [s.route, s.name]));
const knownRoutes = new Set(screens.map((s) => s.route));
const toRoute = (p) => {
  p = p.split('?')[0].replace(/\/$/, '') || '/';
  if (knownRoutes.has(p)) return p;
  const trimmed = p.replace(/\/\$\{.*$/, '');
  return knownRoutes.has(trimmed) ? trimmed : null;
};

// the files that make up a screen: its route file plus what it imports from its own feature folder (one step)
const scope = (f) => {
  const own = new Set([f]);
  for (const i of imports(f)) if (/^features\//.test(i) || /^app\//.test(i)) own.add(i);
  return [...own];
};
const navTargets = (fs_) => {
  const out = new Set();
  for (const f of fs_) {
    const t = text.get(f) || '';
    for (const m of t.matchAll(/router\.(?:push|replace|navigate)\(\s*(?:\{\s*pathname:\s*)?[`'"]([^`'"]+)[`'"]/g)) { const r = toRoute(m[1]); if (r) out.add(r); }
    for (const m of t.matchAll(/href=\{?\s*[`'"](\/[^`'"]*)[`'"]/g)) { const r = toRoute(m[1]); if (r) out.add(r); }
  }
  return out;
};
const sheetsOpened = (fs_) => {
  const out = new Set();
  for (const f of fs_) for (const m of (text.get(f) || '').matchAll(/openSheet\(\s*<(\w+)/g)) out.add(m[1]);
  return out;
};

// ---- data the screens read ----
const domainSrc = text.get('lib/domain.tsx') || '';
const domainBlock = domainSrc.slice(domainSrc.indexOf('export type Domain'), domainSrc.indexOf('export type Domain') + 6000);
const domainFields = new Set([...domainBlock.matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]));
const profileSrc = text.get('lib/store.tsx') || '';
const dataExports = new Set([...(text.get('lib/data.ts') || '').matchAll(/^export (?:const|function|type) (\w+)/gm)].map((m) => m[1]));
const reads = (fs_) => {
  const dom = new Set(), prof = new Set(), stores = new Set(), sample = new Set();
  for (const f of fs_) {
    const t = text.get(f) || '';
    if (/useDomain\(/.test(t)) for (const m of t.matchAll(/\bd\.(\w+)/g)) if (domainFields.has(m[1])) dom.add(m[1]);
    for (const m of t.matchAll(/\bprofile\.(\w+)/g)) prof.add(m[1]);
    for (const m of t.matchAll(/\b(\w+Store)\.(?:use|get)\(/g)) stores.add(m[1]);
    for (const m of t.matchAll(/import\s*\{([^}]+)\}\s*from\s*'@\/lib\/data'/g)) for (const n of m[1].split(',')) { const k = n.trim().split(' as ')[0]; if (dataExports.has(k)) sample.add(k); }
  }
  return { dom, prof, stores, sample };
};

const rows = [];
for (const s of screens) {
  const r = findRoute(s.route, s.name);
  const sc = scope(r.file);
  rows.push({
    ...s, file: 'src/' + r.file,
    leads: [...navTargets(sc)].filter((x) => x !== s.route),
    sheets: [...sheetsOpened(sc)],
    ds: Object.entries(r.ds || {}).filter(([k]) => !['Txt', 'Row'].includes(k)).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k),
    reads: reads(sc), openedFrom: [],
  });
}
for (const a of rows) for (const to of a.leads) { const b = rows.find((x) => x.route === to && x.name !== 'Entry redirect'); if (b) b.openedFrom.push(a.route); }

const list = (arr, fmt = (x) => '`' + x + '`') => (arr.length ? arr.map(fmt).join(', ') : 'none');
const link = (route) => '[' + (nameOf[route] || route) + '](#' + (nameOf[route] || route).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + ')';

let o = `# Screen map

For the developer. Every screen of the app: where its code is, how a member gets there, where it leads, which sheets it opens, which library pieces it is built from and what data it reads. Generated from the code by \`node scripts/audit/screen-map.js\` (a first draft: confirm the data lists against the code before building the backend). Generated ${new Date().toISOString().slice(0, 10)}.

How to read it
- **Route** is the address of the screen (Expo Router: the file under \`src/app\` is the route).
- **Opens from** and **Leads to** are screens that link to each other with \`router.push\`, \`router.replace\` or a link. The tab bar (Today, Plans, Progress, Gym) is on every tab screen and is not repeated.
- A screen reached from inside a sheet (for example Food detail, opened from the meal log sheet) may not appear under the screen that opens the sheet. Its **Opens from** line names the code files that link to it.
- **Library pieces** are components from \`src/design-system\` (docs: \`docs/design-system-components.md\`). The text and row primitives are left out.
- **Data it reads** is what the screen takes from the app's state. Today all of it is **sample data** (\`src/lib/data.ts\`) or local state; none of it comes from a server yet. The table at the end lists what a backend has to supply.

## Main journeys

\`\`\`mermaid
flowchart LR
  W[Welcome] --> L[Log in]
  L --> O[Onboarding, 15 steps]
  O --> T[Today]
  T --> WK[Active workout]
  WK --> F[Finish screen]
  T --> FD[Food detail]
  T --> CI[Check-in map]
  T --> G[Goal]
  T --> PR[Profile]
  T -->|tab| PL[Plans]
  T -->|tab| PG[Progress]
  T -->|tab| GY[Gym]
  PL --> LG[What did you eat]
  PL --> ED[Edit plan]
  GY --> MB[Membership]
  GY --> CH[Coach chat]
\`\`\`

Onboarding steps, in order: welcome, facility, goal, experience, schedule, age, height, weight, target, plan, health, basics, consent (asks for notifications), building, ready.

## Screens

| Screen | Route | Code | Opens from | Leads to |
|---|---|---|---|---|
`;
for (const r of rows) o += `| ${r.name} | \`${r.route}\` | \`${r.file}\` | ${r.reach.replace(/\|/g, '/')} | ${r.leads.length ? r.leads.map(link).join(', ') : 'none found'} |\n`;

o += `\n## Each screen in detail\n`;
for (const r of rows) {
  o += `\n### ${r.name}\n\n- Route \`${r.route}\`, code \`${r.file}\`\n`;
  o += `- Opens from: ${r.openedFrom.length ? r.openedFrom.map(link).join(', ') : r.reach}\n`;
  o += `- Leads to: ${r.leads.length ? r.leads.map(link).join(', ') : 'none found'}\n`;
  o += `- Sheets it opens: ${list(r.sheets)}\n`;
  o += `- Library pieces: ${list(r.ds)}\n`;
  const d = r.reads;
  o += `- Data it reads: app state ${list([...d.dom])}; profile ${list([...d.prof])}; screen stores ${list([...d.stores])}; sample data ${list([...d.sample])}\n`;
}

// ---- what the whole app reads ----
const byField = {}, byStore = {}, bySample = {};
for (const r of rows) {
  for (const k of r.reads.dom) (byField[k] = byField[k] || []).push(r.name);
  for (const k of r.reads.stores) (byStore[k] = byStore[k] || []).push(r.name);
  for (const k of r.reads.sample) (bySample[k] = bySample[k] || []).push(r.name);
}
const table = (obj) => Object.entries(obj).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).map(([k, v]) => `| \`${k}\` | ${v.length} | ${v.slice(0, 6).join(', ')}${v.length > 6 ? ', ...' : ''} |`).join('\n');
o += `\n## What a backend has to supply

Everything below is made up or kept on the phone today. The three tables show what the screens read, with the screens that read it. They are the starting list for the API.

### App state (\`src/lib/domain.tsx\`)

The member's day: time of day, workout session, meals eaten, check-in, membership, goal and so on. Defined in \`src/lib/domain.tsx\` (type \`Domain\`).

| Field | Screens | Which |
|---|---|---|
${table(byField)}

### Screen stores (module state)

Small stores for one area (plans, progress, gym, coach, streak, reminders). Defined next to their feature.

| Store | Screens | Which |
|---|---|---|
${table(byStore)}

### Sample data (\`src/lib/data.ts\`)

Made-up content: meals, food details, workouts, plans, the weekly strip, assessments. A real app loads these from the server.

| Export | Screens | Which |
|---|---|---|
${table(bySample)}
`;
fs.writeFileSync(path.join(root, 'docs/SCREEN-MAP.md'), o);
console.log(rows.length + ' screens, ' + Object.keys(byField).length + ' app-state fields, ' + Object.keys(byStore).length + ' stores, ' + Object.keys(bySample).length + ' sample-data exports');
