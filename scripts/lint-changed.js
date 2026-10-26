#!/usr/bin/env node
/*
 * The design-system guard for a branch or PR: no NEW hard-coded hex colour, border radius or font size.
 * It lints the files this branch changed (with YP_LINT_STRICT=1, so the guard is an error there) and fails only on hits that sit on
 * lines the branch added or changed. Old leftovers on untouched lines are listed as a count, never a failure.
 *
 *   npm run lint:changed               compares with origin/main
 *   npm run lint:changed -- main       compares with another base
 */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const base = process.argv[2] || 'origin/main';
const sh = (cmd) => execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
const mergeBase = sh(`git merge-base ${base} HEAD`);

// the lines each file gained on this branch (committed, staged and unstaged), from a zero-context diff against the merge base
const added = new Map();
for (const block of sh(`git diff -U0 --diff-filter=d ${mergeBase} -- "src/*.ts" "src/*.tsx"`).split(/^diff --git /m).slice(1)) {
  const file = (block.match(/^\+\+\+ b\/(.+)$/m) || [])[1];
  if (!file) continue;
  const lines = new Set();
  for (const m of block.matchAll(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = +m[1], n = m[2] === undefined ? 1 : +m[2];
    for (let i = 0; i < n; i++) lines.add(start + i);
  }
  added.set(file, lines);
}
// a brand-new file that is not committed yet counts as all new
for (const f of sh('git ls-files --others --exclude-standard -- "src/*.ts" "src/*.tsx"').split('\n').filter(Boolean)) added.set(f, 'all');

const files = [...added.keys()];
if (!files.length) { console.log('No changed TypeScript files under src/.'); process.exit(0); }

const out = path.join(os.tmpdir(), `yp-lint-${process.pid}.json`);
try {
  execSync(`npx eslint -f json -o "${out}" ${files.map((f) => `"${f}"`).join(' ')}`, { stdio: 'inherit', env: { ...process.env, YP_LINT_STRICT: '1' } });
} catch { /* the linter exits 1 when it finds errors; the report is still written */ }
const report = JSON.parse(fs.readFileSync(out, 'utf8'));
fs.rmSync(out, { force: true });

let fresh = 0, old = 0;
for (const r of report) {
  const rel = path.relative(process.cwd(), r.filePath).split(path.sep).join('/');
  const lines = added.get(rel);
  for (const m of r.messages) {
    if (m.ruleId !== 'no-restricted-syntax') continue;
    if (lines === 'all' || (lines && lines.has(m.line))) { fresh++; console.log(`${rel}:${m.line}:${m.column}  ${m.message}`); }
    else old++;
  }
}
console.log(`\n${files.length} changed file(s) against ${base}. New hard-coded values: ${fresh}. Old ones on untouched lines (not a failure): ${old}.`);
process.exit(fresh ? 1 : 0);
