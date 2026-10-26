#!/usr/bin/env node
/*
 * Every screenshot of the app in one folder, both themes: all screens, the Today cards in every state, sheets, onboarding steps and
 * states, and the workout flows. Same file names in every run, so two runs can be put side by side (scripts/visual/review.js).
 *
 *   node scripts/visual/capture-all.js docs/review/after                          the dev server on http://localhost:8082
 *   APP_URL=http://localhost:8083 node scripts/visual/capture-all.js docs/review/before
 *
 * Output: <outDir>/light/<name>.png and <outDir>/dark/<name>.png. About 20 minutes for both themes.
 * --themes=dark (or light) captures one theme only, in about half the time.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const out = process.argv.slice(2).find((a) => !a.startsWith('--'));
const themes = (process.argv.find((a) => a.startsWith('--themes=')) || '').slice(9);
if (!out) { console.error('usage: capture-all.js <outDir>'); process.exit(1); }
let failed = 0;
for (const script of ['capture.js', 'capture-cards.js', 'shots.js', 'capture-flows.js']) {
  console.log(`\n== ${script} -> ${out}`);
  const r = spawnSync(process.execPath, [path.join(__dirname, script), out], { stdio: 'inherit', env: { ...process.env, ...(themes ? { THEMES: themes } : null) } });
  if (r.status !== 0) { failed++; console.error(`${script} exited with ${r.status}`); }
}
process.exit(failed ? 1 : 0);
