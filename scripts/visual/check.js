#!/usr/bin/env node
/*
 * One screenshot check for one change. Captures only what you name, in both themes, into a temporary folder, compares it with the
 * baselines under docs/visual-baseline/ and prints every image that is not identical (with the changed area).
 *
 *   node scripts/visual/check.js --screens=gym,today --shots=sheet-DaySheet,state-today --cards=workout-,banner-
 *   node scripts/visual/check.js --screens=gym --update       also copies the new images over the baseline (only after you have looked at the diffs)
 *
 * --screens  names for capture.js (screens whose name contains a word)   baseline: docs/visual-baseline/<theme>
 * --shots    names for shots.js (names that start with a word)            baseline: docs/visual-baseline/shots/<theme>
 * --cards    names for capture-cards.js (names that start with a word)    baseline: docs/visual-baseline/cards/<theme>
 * Needs the dev server on http://localhost:8082.
 */
const { spawnSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const arg = (k) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : ''; };
const update = process.argv.includes('--update');
const tmp = fs.mkdtempSync(path.join(process.env.TEMP || '.', 'check-'));
const jobs = [
  ['screens', 'capture.js', 'docs/visual-baseline', arg('screens')],
  ['shots', 'shots.js', 'docs/visual-baseline/shots', arg('shots')],
  ['cards', 'capture-cards.js', 'docs/visual-baseline/cards', arg('cards')],
].filter((j) => j[3]);
let flagged = 0, changed = 0, compared = 0;
for (const [name, script, base, only] of jobs) {
  const dir = path.join(tmp, name);
  const r = spawnSync('node', ['scripts/visual/' + script, dir, '--only=' + only], { stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8', timeout: 1500000 });
  if (r.status !== 0) { console.error(name + ': capture failed'); process.exit(2); }
  const c = spawnSync('node', ['scripts/visual/compare.js', base, dir], { encoding: 'utf8' });
  for (const line of c.stdout.split('\n')) {
    if (!/\.png/.test(line)) continue; compared++;
    if (!/ 0\.00%/.test(line)) { console.log(name.padEnd(8), line); changed++; if (/FLAG/.test(line)) flagged++; }
  }
  if (update) for (const theme of ['light', 'dark']) { const d = path.join(dir, theme); if (!fs.existsSync(d)) continue; for (const f of fs.readdirSync(d)) fs.copyFileSync(path.join(d, f), path.join(base, theme, f)); }
}
console.log(`${compared} images compared, ${changed} not identical, ${flagged} flagged (more than 0.3% of pixels)` + (update ? ', baseline updated' : ''));
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(flagged ? 1 : 0);
