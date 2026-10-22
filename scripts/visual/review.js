#!/usr/bin/env node
/*
 * The screenshot review page: one HTML file with every screenshot that changed, before (baseline), after (current) and the diff side by side,
 * flagged ones first. Open it in a browser and look at each before you accept a change or refresh the baseline.
 *
 *   node scripts/visual/capture.js .visual-current                          take the new screenshots (dev server on :8082)
 *   node scripts/visual/review.js docs/visual-baseline .visual-current      writes .visual-current/review.html (and the diffs)
 *
 * Works for any pair of folders made by capture.js, capture-cards.js or shots.js. Options: --all (also list unchanged screens),
 * --tol and --max are passed to compare.js.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const [base, cur] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!base || !cur) { console.error('usage: review.js <baselineDir> <currentDir> [--all] [--tol=8] [--max=0.3]'); process.exit(1); }
const all = process.argv.includes('--all');
const pass = process.argv.filter((a) => /^--(tol|max)=/.test(a));
const diffDir = path.join(cur, '_diff');

const r = spawnSync(process.execPath, [path.join(__dirname, 'compare.js'), base, cur, `--save-diff=${diffDir}`, ...pass], { encoding: 'utf8' });
if (r.error) throw r.error;
// compare.js prints one row per image: theme, file, percent (or a note), changed area, FLAG
const rows = r.stdout.split('\n').map((l) => l.match(/^(\S+)\s+(\S+\.png)\s+(.+?)\s{2,}(.*?)\s*(FLAG)?\s*$/)).filter(Boolean)
  .map((m) => ({ theme: m[1], file: m[2], pct: m[3].trim(), area: (m[4] || '').trim(), flag: !!m[5] || m[3].startsWith('no baseline') }));
const changed = rows.filter((x) => x.flag || (x.pct !== '0.00%' && x.pct.endsWith('%')));
const shown = (all ? rows : changed).sort((a, b) => Number(b.flag) - Number(a.flag) || a.file.localeCompare(b.file) || a.theme.localeCompare(b.theme));

const out = path.join(cur, 'review.html');
const rel = (p) => path.relative(path.dirname(out), p).split(path.sep).join('/');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cell = (p, label) => `<figure><figcaption>${label}</figcaption>${fs.existsSync(p) ? `<img loading="lazy" src="${esc(rel(p))}" alt="${label}">` : '<div class="none">none</div>'}</figure>`;
const items = shown.map((x) => `
<section class="${x.flag ? 'flag' : ''}">
  <h2>${esc(x.file)} <span>${esc(x.theme)}</span> <b>${esc(x.pct)}</b>${x.flag ? ' <em>flagged</em>' : ''}${x.area ? ` <small>changed area ${esc(x.area)}</small>` : ''}</h2>
  <div class="row">${cell(path.join(base, x.theme, x.file), 'Before')}${cell(path.join(cur, x.theme, x.file), 'After')}${cell(path.join(diffDir, x.theme, x.file.replace('.png', '.diff.png')), 'Diff (red = changed)')}</div>
</section>`).join('\n');

fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Screenshot review</title>
<style>
  :root { color-scheme: light dark; --bg: #f5f7fa; --fg: #0b0e14; --muted: #5c6370; --line: #dde1e7; --flag: #c4372f; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0e1116; --fg: #f3f4f6; --muted: #9aa3b2; --line: #262b33; --flag: #ff7a70; } }
  body { margin: 0; padding: 24px 16px; background: var(--bg); color: var(--fg); font: 14px/1.45 system-ui, sans-serif; }
  header p { color: var(--muted); margin: 4px 0 0; }
  section { border-top: 1px solid var(--line); padding: 16px 0; }
  h2 { font-size: 15px; margin: 0 0 10px; } h2 span, h2 small { color: var(--muted); font-weight: 400; } h2 em { color: var(--flag); font-style: normal; }
  .row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  figure { margin: 0; } figcaption { color: var(--muted); font-size: 12px; margin-bottom: 4px; }
  img { width: 100%; height: auto; border: 1px solid var(--line); border-radius: 8px; }
  .none { padding: 40px 0; text-align: center; color: var(--muted); border: 1px dashed var(--line); border-radius: 8px; }
  @media (max-width: 640px) { .row { grid-template-columns: 1fr; } }
</style>
<header><h1>Screenshot review</h1><p>Baseline <code>${esc(base)}</code> against <code>${esc(cur)}</code>. ${rows.length} compared, ${changed.length} changed, ${rows.filter((x) => x.flag).length} flagged. ${all ? 'All screens listed.' : 'Only changed screens listed (add --all for every screen).'}</p></header>
${items || '<p>No screenshot changed.</p>'}
`);
console.log(`${rows.length} compared, ${changed.length} changed, ${rows.filter((x) => x.flag).length} flagged. Review page: ${out}`);
