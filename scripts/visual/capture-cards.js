#!/usr/bin/env node
/*
 * Screenshots of the two Today cards in every state, light and dark, from the developer page /dev-cards (src/app/dev-cards.tsx).
 *
 *   node scripts/visual/capture-cards.js docs/visual-baseline/cards        a baseline
 *   node scripts/visual/capture-cards.js .visual-cards                     a new run, then:
 *   node scripts/visual/compare.js docs/visual-baseline/cards .visual-cards
 *
 * Add --only=goal- or --only=budget- (names that start with it; comma separated) to capture a part.
 * Files: <outDir>/<theme>/goal-<state>.png, goal-onTrack-stale.png, goal-flat.png, budget-<state>.png, budget-goal-<state>.png
 * Each image is 390 x 320: the card alone at the top of the page.
 */
const fs = require('fs'); const path = require('path'); const os = require('os'); const { spawn } = require('child_process');
const BASE = process.env.APP_URL || 'http://localhost:8082';
const out = process.argv[2]; if (!out) { console.error('usage: capture-cards.js <outDir>'); process.exit(1); }
const GOAL_STATES = ['onTrack', 'behind', 'almost', 'complete', 'frozen', 'paused', 'comeback', 'backOn', 'noGoal'];
const only = ((process.argv.find((a) => a.startsWith('--only=')) || '').slice(7) || '').split(',').filter(Boolean); // e.g. --only=goal- or --only=budget-
const ALL = [
  ...GOAL_STATES.map((s) => ['goal-' + s, '/dev-cards?c=goal&s=' + s]),
  ['goal-onTrack-stale', '/dev-cards?c=goal&s=onTrack&w=12'],
  ['goal-flat', '/dev-cards?c=goal&v=flat'],
  ...['default', 'nothing-eaten', 'all-logged', 'workout-done', 'watch'].map((s) => ['budget-' + s, '/dev-cards?c=budget&s=' + s]),
  ...GOAL_STATES.map((s) => ['budget-goal-' + s, '/dev-cards?c=budget&s=default&g=' + s]),
];
const SHOTS = ALL.filter(([name]) => !only.length || only.some((w) => name.startsWith(w)));
const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const port = 9300 + Math.floor(Math.random() * 500); const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-cards-'));
  const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore' });
  let ws; let id = 0; const pending = new Map();
  try {
    let list; for (let i = 0; i < 60; i++) { try { list = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); if (list.find((t) => t.type === 'page')) break; } catch {} await sleep(500); }
    ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
    const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (d) => (d.error ? rej(new Error(method + ': ' + d.error.message)) : res(d.result))); ws.send(JSON.stringify({ id: i, method, params })); });
    const js = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
    await send('Page.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 320, deviceScaleFactor: 1, mobile: false });
    let n = 0;
    for (const theme of ['light', 'dark']) {
      fs.mkdirSync(path.join(out, theme), { recursive: true });
      for (const [name, p] of SHOTS) {
        await send('Page.navigate', { url: BASE + p + '&signedin=1&theme=' + theme });
        for (let i = 0; i < 80; i++) { if ((await js('document.body ? document.body.innerText.length : 0')) > 5) break; await sleep(250); }
        await sleep(2500);
        const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(out, theme, name + '.png'), Buffer.from(r.data, 'base64')); n++; process.stdout.write('.');
      }
    }
    console.log('\nsaved ' + n + ' screenshots to ' + out);
  } finally { try { ws && ws.close(); } catch {} proc.kill(); }
})().catch((e) => { console.error(e); process.exit(1); });
