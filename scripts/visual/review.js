#!/usr/bin/env node
/*
 * The review page: one HTML file with every screenshot, before on the left and after on the right, with a light / dark switch.
 * It only lays the two sets next to each other. It does not compare them and does not decide whether anything matches: you look.
 * A row links to its entry in docs/review-changes.md when that file lists the screenshot.
 *
 *   node scripts/visual/capture-all.js docs/review/after                                   the dev server on :8082
 *   APP_URL=http://localhost:8083 node scripts/visual/capture-all.js docs/review/before    another checkout (main) on :8083
 *   node scripts/visual/review.js docs/review/before docs/review/after                     writes docs/review/index.html
 *
 * Options: --out=<file> (default <parent of the two folders>/index.html), --changes=<markdown> (default docs/review-changes.md).
 * Screenshot names are <folder>/<light|dark>/<name>.png; a name only in one folder shows "not captured" on the other side.
 */
const fs = require('fs');
const path = require('path');

const [before, after] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!before || !after) { console.error('usage: review.js <beforeDir> <afterDir> [--out=file] [--changes=file]'); process.exit(1); }
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const out = path.resolve(opt('out', path.join(path.dirname(path.resolve(after)), 'index.html')));
const changesFile = path.resolve(opt('changes', 'docs/review-changes.md'));

// names present in either folder, and the themes that were captured (a run made with --themes=dark has only dark)
const names = new Set();
const themes = new Set();
for (const dir of [before, after]) for (const theme of ['light', 'dark']) {
  const d = path.join(dir, theme);
  if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith('.png')) { names.add(f.slice(0, -4)); themes.add(theme); }
}
const both = themes.size > 1;
const first = themes.has('dark') && !themes.has('light') ? 'dark' : 'light';
if (!names.size) { console.error('No screenshots found in', before, 'or', after); process.exit(1); }

// docs/review-changes.md: every <a id="x"></a> starts a section; the screenshot names in the ### heading's backticks belong to it
const links = new Map();
if (fs.existsSync(changesFile)) {
  const md = fs.readFileSync(changesFile, 'utf8');
  const rel = path.relative(path.dirname(out), changesFile).split(path.sep).join('/');
  for (const m of md.matchAll(/<a id="([^"]+)"><\/a>\s*\n###[^\n]*/g)) {
    links.set(m[1], `${rel}#${m[1]}`);
    for (const t of m[0].matchAll(/`([^`]+)`/g)) links.set(t[1].replace(/\s.*/, ''), `${rel}#${m[1]}`);
  }
}
const linkFor = (name) => links.get(name) ?? (links.get(name.replace(/--bottom$/, '')) ?? '');

const GROUPS = [
  ['Tab screens, top and bottom', (n) => /^(today|plans|progress|gym)(--bottom)?$/.test(n)],
  ['Screens', (n) => !/^(sheet-|step-|state-|flow-|goal-|budget-|workout-|meals-|week-|banner-|trackers-)/.test(n)],
  ['Sheets', (n) => n.startsWith('sheet-')],
  ['Onboarding steps', (n) => n.startsWith('step-')],
  ['States', (n) => n.startsWith('state-')],
  ['Workout flows', (n) => n.startsWith('flow-')],
  ['Cards in every state', () => true],
];
const groups = GROUPS.map(([title]) => ({ title, items: [] }));
for (const n of [...names].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))) {
  const i = GROUPS.findIndex(([, test]) => test(n));
  groups[i].items.push(n);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const relTo = (dir) => path.relative(path.dirname(out), path.resolve(dir)).split(path.sep).join('/');
const B = relTo(before), A = relTo(after);
const has = (dir, theme, n) => fs.existsSync(path.join(dir, theme, `${n}.png`));
// width and height from the PNG header, so a row has its final height before its image loads (anchors do not drift)
const size = (dir, theme, n) => { const b = Buffer.alloc(24); const fd = fs.openSync(path.join(dir, theme, `${n}.png`), 'r'); fs.readSync(fd, b, 0, 24, 0); fs.closeSync(fd); return `width="${b.readUInt32BE(16)}" height="${b.readUInt32BE(20)}"`; };
const cell = (side, dir, base, n) => `<figure><figcaption>${side}</figcaption>` +
  ['light', 'dark'].map((t) => (has(dir, t, n)
    ? `<img data-theme="${t}" ${size(dir, t, n)} loading="lazy" src="${esc(base)}/${t}/${esc(n)}.png" alt="${side}: ${esc(n)}, ${t}">`
    : `<div data-theme="${t}" class="none">not captured</div>`)).join('') + '</figure>';
const row = (n) => {
  const l = linkFor(n);
  return `<section id="${esc(n)}"><h3>${esc(n)}${l ? ` <a class="chg" href="${esc(l)}">changed: see review-changes.md</a>` : ''}</h3>
<div class="pair">${cell('Before (main)', before, B, n)}${cell('After (design-system-handoff)', after, A, n)}</div></section>`;
};
const body = groups.filter((g) => g.items.length).map((g) => `<h2 id="${esc(g.title)}">${esc(g.title)} <small>${g.items.length}</small></h2>\n${g.items.map(row).join('\n')}`).join('\n');
const nav = groups.filter((g) => g.items.length).map((g) => `<a href="#${esc(g.title)}">${esc(g.title)} (${g.items.length})</a>`).join(' ');

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `<!doctype html><html lang="en" data-theme="${first}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Screenshot review</title>
<style>
  :root { --bg: #f5f7fa; --fg: #0b0e14; --muted: #5c6370; --line: #dde1e7; --acc: #2358c9; }
  html[data-theme="dark"] { --bg: #0e1116; --fg: #f3f4f6; --muted: #9aa3b2; --line: #262b33; --acc: #8fb2ff; }
  html[data-theme="light"] [data-theme="dark"], html[data-theme="dark"] [data-theme="light"] { display: none; }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 14px/1.45 system-ui, sans-serif; }
  header { position: sticky; top: 0; z-index: 5; background: var(--bg); border-bottom: 1px solid var(--line); padding: 10px 16px; display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; }
  header h1 { font-size: 16px; margin: 0; } header nav { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 13px; }
  a { color: var(--acc); } .chg { font-size: 12px; font-weight: 400; margin-left: 8px; }
  .only { margin-left: auto; color: var(--muted); font-size: 13px; }
  button { font: inherit; padding: 6px 14px; border-radius: 16px; border: 1px solid var(--line); background: transparent; color: var(--fg); cursor: pointer; margin-left: auto; }
  main { padding: 0 16px 60px; max-width: 1000px; margin: 0 auto; }
  h2 { margin: 36px 0 4px; font-size: 18px; } h2 small { color: var(--muted); font-weight: 400; }
  section { border-top: 1px solid var(--line); padding: 14px 0; } h3 { margin: 0 0 8px; font-size: 14px; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; } figure { margin: 0; } figcaption { color: var(--muted); font-size: 12px; margin-bottom: 4px; }
  img { width: 100%; max-width: 390px; height: auto; border: 1px solid var(--line); border-radius: 8px; display: block; }
  .none { padding: 60px 0; text-align: center; color: var(--muted); border: 1px dashed var(--line); border-radius: 8px; max-width: 390px; }
  @media (max-width: 640px) { .pair { grid-template-columns: 1fr; } }
</style>
<header><h1>Screenshot review</h1><nav>${nav}</nav>${both ? '<button id="t" type="button" aria-label="Switch between light and dark screenshots">Showing light</button>' : `<span class="only">${first} mode only</span>`}</header>
<main>
<p style="color:var(--muted)">${names.size} screenshots. Before is main, after is this branch, same screen and same state. ${both ? 'Use the switch to see both themes.' : `Only ${first} mode was captured; the other can be added later with capture-all.js --themes=${first === 'dark' ? 'light' : 'dark'}.`} Nothing here is compared automatically.</p>
${body}
</main>
${both ? `<script>
  var b = document.getElementById('t'), h = document.documentElement;
  try { var s = localStorage.getItem('yp-review-theme'); if (s) h.setAttribute('data-theme', s); } catch (e) {}
  function label() { b.textContent = 'Showing ' + h.getAttribute('data-theme'); }
  b.onclick = function () { var n = h.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; h.setAttribute('data-theme', n); try { localStorage.setItem('yp-review-theme', n); } catch (e) {} label(); };
  label();
</script>` : ''}</html>
`);
console.log(`${names.size} screenshots, ${[...names].filter((n) => linkFor(n)).length} linked to review-changes.md. Review page: ${out}`);
