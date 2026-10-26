#!/usr/bin/env node
/*
 * One command to check and publish the YourPal work. Works on Windows (git, node and the GitHub web API; no gh needed).
 *
 *   node scripts/publish.js check                    typecheck, lint, new hard-coded values. Changes nothing.
 *   node scripts/publish.js handoff [--yes]          checks, audits, screen map, skill catalogue, Storybook build, numbers in HANDOFF-STATUS.md, zip.
 *                                                    With --yes: also commits the refreshed docs, deploys Storybook and pushes the branch design-system-handoff.
 *   node scripts/publish.js web [--yes]              checks, then merges this work into main with a real merge commit and waits for the Vercel Production build.
 *                                                    Without --yes it only shows what it would do. Production: only with --yes.
 *   node scripts/publish.js mobile                   builds the iPhone, Android and web bundles (the check that Expo Go will open it). Changes nothing.
 *   node scripts/publish.js all [--yes]              check, handoff, web, mobile in that order.
 *
 * Options: --message "text"   commit message when there are uncommitted changes (they are committed first, tracked files and the source folders only)
 *          --skip-storybook   do not rebuild or deploy Storybook      --skip-zip   do not rebuild the zip
 *
 * Why a merge commit for web: Vercel never builds the same commit twice. A branch push is built as a Preview, so a fast-forward of that commit into main
 * would get no Production build. A merge commit is a new commit, so main always deploys.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const REPO = 'rohitashavgarg-stack/Yourpal';
const HANDOFF_BRANCH = 'design-system-handoff';
const SITE = 'https://yourpal-psi.vercel.app';
const STORYBOOK = 'https://yourpal-storybook.vercel.app';

const args = process.argv.slice(2);
const mode = args.find((a) => !a.startsWith('--') && !/^".*"$/.test(a)) || 'check';
const YES = args.includes('--yes');
const flag = (n) => args.includes('--' + n);
const optVal = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
const results = [];
let metrics = {};

const run = (cmd, o = {}) => {
  try { return { ok: true, out: execSync(cmd, { cwd: o.cwd || root, stdio: o.show ? 'inherit' : ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 }).toString().trim() }; }
  catch (e) { return { ok: false, out: ((e.stdout || '').toString() + (e.stderr || '').toString()).trim() }; }
};
const say = (s) => console.log(s);
const step = (name, fn) => {
  process.stdout.write(`... ${name}\n`);
  const t0 = Date.now();
  let r; try { r = fn(); } catch (e) { r = { ok: false, note: e.message }; }
  r = r || { ok: true };
  const secs = Math.round((Date.now() - t0) / 1000);
  results.push({ name, ok: r.ok !== false, skipped: !!r.skipped, note: r.note || '' });
  say(`${r.skipped ? '-- skipped' : r.ok === false ? 'XX FAILED' : 'ok'}: ${name} (${secs}s)${r.note ? ': ' + r.note : ''}`);
  if (r.ok === false) { summary(); process.exit(1); }
  return r;
};
const summary = () => {
  say('\n=== Summary ===');
  for (const r of results) say(`${r.skipped ? '[skipped]' : r.ok ? '[ok]     ' : '[FAILED] '} ${r.name}${r.note ? ' | ' + r.note : ''}`);
};
const dirty = () => run('git status --porcelain --untracked-files=no').out.length > 0;
const branch = () => run('git branch --show-current').out;
const sha = () => run('git rev-parse HEAD').out;

// ---------- steps ----------
const check = () => {
  step('typecheck (tsc)', () => { const r = run('npx tsc --noEmit'); metrics.tsc = r.ok; return { ok: r.ok, note: r.ok ? '0 errors' : r.out.split('\n').slice(0, 4).join(' / ') }; });
  step('lint (errors must be 0)', () => {
    const r = run('npx eslint . -f json');
    let e = 0, w = 0; try { for (const f of JSON.parse(r.out)) { e += f.errorCount; w += f.warningCount; } } catch { return { ok: false, note: 'could not read the lint result' }; }
    metrics.lintErrors = e; metrics.lintWarnings = w;
    return { ok: e === 0, note: `${e} errors, ${w} warnings` };
  });
  step('no new hard-coded colours, radii or font sizes', () => {
    const r = run('npm run lint:changed -- main'); const m = r.out.match(/New hard-coded values: (\d+)/);
    metrics.newHardcoded = m ? Number(m[1]) : null;
    return { ok: !!m && Number(m[1]) === 0, note: m ? `${m[1]} new` : r.out.split('\n').slice(-3).join(' / ') };
  });
};

const commitIfDirty = (fallbackMsg) => step('commit uncommitted changes', () => {
  if (!dirty()) return { skipped: true, note: 'nothing to commit' };
  const msg = optVal('message') || fallbackMsg;
  if (!msg) return { ok: false, note: 'there are uncommitted changes: commit them or pass --message "..."' };
  run('git add -u'); run('git add src docs scripts .storybook .claude package.json package-lock.json CLAUDE.md README.md');
  const r = run(`git commit -m "${msg.replace(/"/g, "'")}" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"`);
  return { ok: r.ok, note: r.ok ? msg : r.out.split('\n')[0] };
});

const numbers = () => step('write the numbers into docs/HANDOFF-STATUS.md', () => {
  const p = path.join(root, 'docs/HANDOFF-STATUS.md'); if (!fs.existsSync(p)) return { skipped: true, note: 'no status file' };
  const count = (d) => fs.readdirSync(path.join(root, 'src/design-system', d)).filter((f) => f.endsWith('.tsx')).length;
  const idx = path.join(root, 'storybook-static/index.json');
  const stories = fs.existsSync(idx) ? Object.values(JSON.parse(fs.readFileSync(idx, 'utf8')).entries).filter((e) => e.type === 'story').length : null;
  const hb = fs.existsSync(path.join(root, 'docs/hand-built.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'docs/hand-built.json'), 'utf8')) : null;
  const sep = (fs.readFileSync(path.join(root, 'docs/copy-separators.md'), 'utf8').match(/\*\*(\d+) lines in (\d+) files\*\*/) || []);
  const block = [
    '<!-- numbers:start -->',
    `Numbers written by \`scripts/publish.js\` on ${new Date().toISOString().slice(0, 16).replace('T', ' ')} from branch \`${branch()}\` at \`${sha().slice(0, 7)}\`:`,
    '',
    '| Measure | Value |', '|---|---|',
    `| Typecheck | ${metrics.tsc === undefined ? 'not run' : metrics.tsc ? '0 errors' : 'errors'} |`,
    `| Lint | ${metrics.lintErrors === undefined ? 'not run' : `${metrics.lintErrors} errors, ${metrics.lintWarnings} warnings`} |`,
    `| New hard-coded values on changed lines | ${metrics.newHardcoded === undefined ? 'not run' : metrics.newHardcoded} |`,
    `| Library files | ${count('primitives') + count('patterns')} (${count('primitives')} primitives, ${count('patterns')} patterns) |`,
    `| Storybook stories | ${stories ?? 'not built'} |`,
    `| Hand-built elements (outside the demo panel) | ${hb ? `${hb.count} (${hb.onPurpose} on purpose, ${hb.toBuild} to build)` : 'n/a'} |`,
    `| Dot-separator lines left | ${sep[1] ? `${sep[1]} in ${sep[2]} files` : 'n/a'} |`,
    '<!-- numbers:end -->',
  ].join('\n');
  let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
  if (s.includes('<!-- numbers:start -->')) s = s.replace(/<!-- numbers:start -->[\s\S]*<!-- numbers:end -->/, block);
  else s = s.replace(/(\n## What changed since the last status)/, `\n${block}\n$1`);
  fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s);
  return { ok: true };
});

const handoff = () => {
  step('audits: coverage and hand-built count', () => { const r = run('npm run audit:coverage'); return { ok: r.ok, note: r.ok ? '' : r.out.split('\n').slice(-2).join(' / ') }; });
  step('screen map', () => { const r = run('node scripts/audit/screen-map.js'); return { ok: r.ok, note: r.out.split('\n').pop() }; });
  step('dot-separator list', () => { const r = run('node scripts/audit/separators.js'); return { ok: r.ok, note: r.out.split('\n')[0] }; });
  step('skill catalogue and changelog', () => { const r = run('node scripts/skill/learn.js'); return { ok: r.ok, note: r.out.split('\n').pop() }; });
  if (!flag('skip-storybook')) step('Storybook build', () => { const r = run('npm run build-storybook'); return { ok: r.ok, note: r.ok ? '' : r.out.replace(/\x1b\[[0-9;]*m/g, '').split('\n').filter((l) => /fail|error|resolve/i.test(l)).slice(0, 2).join(' / ') }; });
  numbers();
  if (!YES) { say('\n(no --yes: nothing committed, deployed or pushed. Run again with --yes to commit the refreshed docs, deploy Storybook and push.)'); return; }
  commitIfDirty('publish: refresh numbers, audits, screen map and skill catalogue');
  if (!flag('skip-storybook')) step('deploy Storybook', () => {
    const r = run('npm run deploy-storybook'); if (!r.ok) return { ok: false, note: r.out.split('\n').slice(-2).join(' / ') };
    return { ok: true, note: STORYBOOK };
  });
  if (!flag('skip-zip')) step('rebuild the handoff zip', () => { const r = run('npm run handoff'); return { ok: r.ok, note: r.ok ? 'handoff/yourpal-design-system-handoff.zip' : r.out.split('\n').slice(-2).join(' / ') }; });
  step(`push the branch ${HANDOFF_BRANCH}`, () => {
    run('git fetch origin');
    const anc = run(`git merge-base --is-ancestor origin/${HANDOFF_BRANCH} HEAD`);
    if (!anc.ok) return { ok: false, note: `origin/${HANDOFF_BRANCH} has commits this work does not have: merge it first, nothing was pushed` };
    const r = run(`git push origin HEAD:${HANDOFF_BRANCH}`);
    return { ok: r.ok, note: r.ok ? `pushed ${sha().slice(0, 7)} (the developer can pull it)` : r.out.split('\n').slice(-2).join(' / ') };
  });
};

const web = () => {
  if (dirty()) { if (!YES) { say('There are uncommitted changes. They would be committed first (--message needed).'); } else commitIfDirty(); }
  if (!YES) { say(`\nWould merge ${branch()} (${sha().slice(0, 7)}) into main with a merge commit, push it, and wait for the Vercel Production build of ${SITE}. Run again with --yes to do it.`); return; }
  const head = sha();
  let tmp;
  step('merge into main (real merge commit)', () => {
    run('git fetch origin');
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'yp-main-'));
    const a = run(`git worktree add --detach "${tmp}" origin/main`); if (!a.ok) return { ok: false, note: a.out.split('\n')[0] };
    const m = run(`git merge --no-ff ${head} -m "Publish ${branch()} to production" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"`, { cwd: tmp });
    if (!m.ok) { run('git merge --abort', { cwd: tmp }); run(`git worktree remove --force "${tmp}"`); return { ok: false, note: 'the merge has conflicts, nothing was pushed: ' + m.out.split('\n')[0] }; }
    return { ok: true, note: run('git rev-parse --short HEAD', { cwd: tmp }).out };
  });
  step('push main', () => {
    const msha = run('git rev-parse HEAD', { cwd: tmp }).out;
    const r = run('git push origin HEAD:main', { cwd: tmp }); run(`git worktree remove --force "${tmp}"`);
    if (!r.ok) return { ok: false, note: r.out.split('\n').slice(-2).join(' / ') };
    metrics.mainSha = msha; return { ok: true, note: msha.slice(0, 7) };
  });
  step('wait for the Vercel Production build', () => {
    const deadline = Date.now() + 15 * 60 * 1000;
    const poll = () => { const r = run(`curl -s https://api.github.com/repos/${REPO}/commits/${metrics.mainSha}/status`); try { const j = JSON.parse(r.out); return j.state; } catch { return 'pending'; } };
    let st = 'pending'; while (Date.now() < deadline) { st = poll(); if (st === 'success' || st === 'failure' || st === 'error') break; run('node -e "setTimeout(()=>{},8000)"'); }
    return { ok: st === 'success', note: st === 'success' ? `live at ${SITE}` : `Vercel says: ${st}` };
  });
};

const mobile = () => step('iPhone, Android and web bundles build (what Expo Go needs)', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'yp-export-'));
  const r = run(`npx expo export --platform all --output-dir "${out}"`); fs.rmSync(out, { recursive: true, force: true });
  return { ok: r.ok, note: r.ok ? 'Expo Go opens it from the dev server: npx expo start, then scan the QR code. No EAS update is set up.' : r.out.split('\n').slice(-3).join(' / ') };
});

// ---------- go ----------
say(`publish ${mode}${YES ? ' --yes' : ''} on branch ${branch()}\n`);
if (mode === 'check') check();
else if (mode === 'handoff') { if (YES) commitIfDirty(); check(); handoff(); }
else if (mode === 'web') { check(); web(); }
else if (mode === 'mobile') mobile();
else if (mode === 'all') { if (YES) commitIfDirty(); check(); handoff(); web(); mobile(); }
else { say('modes: check | handoff | web | mobile | all  (add --yes to commit, deploy and push)'); process.exit(2); }
summary();
