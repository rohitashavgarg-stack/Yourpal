#!/usr/bin/env node
/*
 * The one count of hand-built elements. docs/coverage.md and the Storybook Coverage page both read its output (docs/hand-built.json),
 * so they always show the same number.
 *
 * Counted: every element the audit finds (docs/coverage-data.json: routes and shared files), one per file and line,
 * outside src/web (the demo panel beside the phone is dev-only and is not part of the app).
 * Of these, the ones listed in docs/coverage-exceptions.md are "on purpose". A row there must point at a real element
 * (`src/<file>:<line>`), or this script stops and says which one moved.
 *
 *   node scripts/audit/coverage.js --json && node scripts/audit/hand-built.js && node scripts/audit/coverage-md.js && node scripts/audit/coverage-storybook.js
 *   (or: npm run audit:coverage)
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'docs/coverage-data.json'), 'utf8'));

// Screen groups. First match wins. Sheets and overlays are grouped by what they are, not by the screen that opens them.
const GROUPS = [
  ['Bottom sheets', (f, fn) => /Sheet/.test(fn || '') || /Sheet/.test(path.basename(f)) || /^features\/shell\/Switcher/.test(f)],
  ['Modals and toasts', (f) => /Overlay|Snackbar|Toast|PushBanner|RestTimer|Dialog|Modal/i.test(f)],
  ['Workout session', (f) => /^(app\/workout|features\/workout)/.test(f)],
  ['Today', (f) => /^(app\/\(tabs\)\/index|app\/food|app\/checkin|features\/today|features\/checkin|features\/reminders)/.test(f)],
  ['Progress', (f) => /progress|^features\/(streak|body)|^app\/(log-height|log-weight|goal-detail|goal)\b/.test(f)],
  ['Plans and food logging', (f) => /^(app\/\(tabs\)\/plans|app\/plans|app\/exercise-search|features\/plans)/.test(f)],
  ['Gym tab', (f) => /^(app\/gym|app\/coach|features\/gym|features\/chat)/.test(f)],
  ['Profile and settings', (f) => /^(app\/profile|app\/notifications|features\/shell)/.test(f)],
  ['Onboarding and login', (f) => /^(app\/onboarding|app\/login|app\/welcome|features\/onboarding|components\/OtpInput|components\/Ruler)/.test(f)],
  ['Shared components (outside the library)', (f) => /^components\//.test(f)],
];
const groupOf = (f, fn) => (GROUPS.find(([, t]) => t(f, fn)) || ['Other'])[0];

// unique file:line
const seen = new Map();
for (const r of [...data.routes, ...data.shared]) for (const h of r.hand || []) {
  const file = h.file || r.file;
  const id = `${file}:${h.line}`;
  if (!seen.has(id)) seen.set(id, { file, line: h.line, kind: h.kind, look: h.sig || '', fn: h.fn || '', text: (h.text || '').slice(0, 140) });
}
const all = [...seen.values()];
const demo = all.filter((h) => /^web\//.test(h.file));
const app = all.filter((h) => !/^web\//.test(h.file));

// on purpose: rows of docs/coverage-exceptions.md
const exc = fs.readFileSync(path.join(root, 'docs/coverage-exceptions.md'), 'utf8').split(/\r?\n/)
  .filter((l) => /^\| `src\//.test(l))
  .map((l) => { const c = l.split('|').map((x) => x.trim()); return { where: c[1].replace(/`/g, ''), what: c[2], why: c[3] }; });
const stale = [];
for (const e of exc) { if (!seen.has(e.where.replace(/^src\//, ''))) stale.push(e.where); }
if (stale.length) { console.error('docs/coverage-exceptions.md points at elements that moved or are gone: ' + stale.join(', ')); process.exit(1); }
const excKeys = new Set(exc.map((e) => e.where.replace(/^src\//, '')));
for (const h of all) h.onPurpose = excKeys.has(`${h.file}:${h.line}`);

const tally = (list, key) => list.reduce((a, h) => { const k = key(h); a[k] = (a[k] || 0) + 1; return a; }, {});
const groups = {};
for (const h of app) {
  h.group = groupOf(h.file, h.fn);
  const g = (groups[h.group] = groups[h.group] || { total: 0, onPurpose: 0 });
  g.total++; if (h.onPurpose) g.onPurpose++;
}
const out = {
  generated: new Date().toISOString().slice(0, 10),
  rule: 'unique elements outside src/web; on purpose = rows of docs/coverage-exceptions.md',
  count: app.length,
  onPurpose: app.filter((h) => h.onPurpose).length,
  toBuild: app.filter((h) => !h.onPurpose).length,
  demoPanelExcluded: demo.length,
  exceptionRows: exc.length,
  byKind: tally(app, (h) => h.kind),
  byGroup: groups,
  items: app,
};
fs.writeFileSync(path.join(root, 'docs/hand-built.json'), JSON.stringify(out, null, 1));
console.log(`hand-built: ${out.count} (on purpose ${out.onPurpose}, still to build ${out.toBuild}); demo panel excluded: ${out.demoPanelExcluded}`);
