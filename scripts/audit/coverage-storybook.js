#!/usr/bin/env node
/*
 * Writes the data behind the Storybook "Coverage" page (src/design-system/stories/coverage.json): every library component with how
 * many places in the app use it, and every element that is still hand-built (the one count in docs/hand-built.json) or hand-built on purpose
 * (docs/coverage-exceptions.md).
 *
 *   node scripts/audit/coverage.js --json && node scripts/audit/hand-built.js && node scripts/audit/coverage-storybook.js
 *
 * Run it after the coverage audit; `npm run build-storybook` runs it too.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const src = path.join(root, 'src');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx?|jsx?)$/.test(e.name) ? [path.join(d, e.name)] : []));
const rel = (p) => path.relative(root, p).split(path.sep).join('/');

// library components: every exported function in primitives and patterns that starts with a capital letter
const lib = [];
for (const group of ['primitives', 'patterns']) {
  for (const f of fs.readdirSync(path.join(src, 'design-system', group)).filter((x) => x.endsWith('.tsx'))) {
    const s = fs.readFileSync(path.join(src, 'design-system', group, f), 'utf8');
    for (const m of s.matchAll(/^export function ([A-Z]\w*)/gm)) lib.push({ name: m[1], group, file: `src/design-system/${group}/${f}`, doc: fs.existsSync(path.join(src, 'design-system', 'docs', f.replace('.tsx', '.md'))) });
  }
}
// uses in the app: <Name ... in files outside the design system (stories and docs do not count). A component that is imported under another
// name (`Name as Other`) is counted under that name too. Uses inside the library files (its own file included) are counted separately ("inLibrary"): MetaRow,
// for example, is used by WorkoutCard and MealsCard, so it is on screen even though no screen writes <MetaRow>.
const dsFiles = walk(path.join(src, 'design-system')).filter((p) => !/[\\/](stories|docs|_archive)[\\/]/.test(p));
const appFiles = walk(src).filter((p) => !p.includes(`${path.sep}design-system${path.sep}`));
const texts = appFiles.map((p) => fs.readFileSync(p, 'utf8'));
const dsTexts = dsFiles.map((p) => ({ p, t: fs.readFileSync(p, 'utf8') }));
const count = (t, names) => names.reduce((n, nm) => n + (t.match(new RegExp(`<${nm}(?=[\\s/>])`, 'g')) || []).length, 0);
for (const c of lib) {
  const names = new Set([c.name]);
  for (const t of [...texts, ...dsTexts.map((x) => x.t)]) for (const m of t.matchAll(new RegExp(`\\b${c.name} as (\\w+)`, 'g'))) names.add(m[1]);
  let uses = 0, files = 0;
  for (const t of texts) { const n = count(t, [...names]); uses += n; if (n) files++; }
  c.uses = uses; c.files = files;
  c.inLibrary = dsTexts.reduce((n, x) => n + count(x.t, [...names]), 0);
}

// hand-built: the one count from scripts/audit/hand-built.js (outside the dev-only demo panel; on purpose ones are listed separately)
const HB = JSON.parse(fs.readFileSync(path.join(root, 'docs/hand-built.json'), 'utf8'));
const hand = HB.items.filter((h) => !h.onPurpose).map((h) => ({ where: `src/${h.file}:${h.line}`, kind: h.kind, look: h.look, jsx: h.text, group: h.group }))
  .sort((a, b) => a.kind.localeCompare(b.kind) || a.where.localeCompare(b.where));

// on purpose: the rows of docs/coverage-exceptions.md
const exc = fs.readFileSync(path.join(root, 'docs/coverage-exceptions.md'), 'utf8').split('\n')
  .filter((l) => /^\| `src\//.test(l)).map((l) => { const c = l.split('|').map((x) => x.trim()); return { where: c[1].replace(/`/g, ''), what: c[2], why: c[3] }; });

const out = { generated: new Date().toISOString().slice(0, 10), library: lib, count: HB.count, toBuild: HB.toBuild, onPurpose: HB.onPurpose, demoPanelExcluded: HB.demoPanelExcluded, byGroup: HB.byGroup, handBuilt: hand, exceptions: exc };
fs.writeFileSync(path.join(src, 'design-system/stories/coverage.json'), JSON.stringify(out, null, 1));
console.log(`coverage.json: ${lib.length} library components, ${HB.count} hand-built (${hand.length} still to build, ${HB.onPurpose} on purpose)`);
