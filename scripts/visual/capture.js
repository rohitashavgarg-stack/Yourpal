#!/usr/bin/env node
/*
 * Screenshot capture for the design-system work (web, light and dark).
 *
 *   node scripts/visual/capture.js docs/visual-baseline                 every screen, both themes
 *   node scripts/visual/capture.js .visual-current --only=today,plans   only the screens whose name contains one of the words
 *
 * Needs the web dev server on http://localhost:8082 (npx expo start --port 8082 --web) and Microsoft Edge or Chrome installed.
 * It drives the browser over the DevTools protocol (no extra packages). Each screen is opened with ?signedin=1&theme=light|dark
 * at 390 x 844, given a moment for the fade-in to finish, and saved as <outDir>/<theme>/<name>.png. The four tab screens are also
 * saved scrolled to the bottom (<name>--bottom.png).
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const BASE = process.env.APP_URL || 'http://localhost:8082';
const out = process.argv[2];
const only = ((process.argv.find((a) => a.startsWith('--only=')) || '').slice(7) || '').split(',').filter(Boolean);
if (!out) { console.error('usage: capture.js <outDir> [--only=a,b]'); process.exit(1); }

// name, path (with its own query, signedin and theme are added), whether to also capture the bottom of the page
const SCREENS = [
  ['today', '/', true], ['plans', '/plans?day=2', true], ['progress', '/progress', true], ['gym', '/gym', true],
  ['checkin', '/checkin'], ['coach', '/coach'], ['exercise-search', '/exercise-search'], ['food', '/food?mid=lu&k=0&extra=0'],
  ['goal-detail', '/goal-detail'], ['goal', '/goal'], ['gym-assessments', '/gym/assessments'], ['gym-attendance', '/gym/attendance'],
  ['gym-break', '/gym/break'], ['gym-chat', '/gym/chat'], ['gym-confirm', '/gym/confirm'], ['gym-membership', '/gym/membership'],
  ['gym-pt', '/gym/pt'], ['log-height', '/log-height'], ['log-weight', '/log-weight'], ['notifications', '/notifications'],
  ['plans-ask', '/plans/ask'], ['plans-create', '/plans/create'], ['plans-edit', '/plans/edit'], ['plans-exercise', '/plans/exercise?name=Squat&sub=4%20%C3%97%208'],
  ['plans-history', '/plans/history'], ['plans-log', '/plans/log'], ['plans-updated', '/plans/updated'],
  ['profile', '/profile'], ['profile-appearance', '/profile/appearance'], ['profile-delete', '/profile/delete'], ['profile-details', '/profile/details'],
  ['profile-export', '/profile/export'], ['profile-health', '/profile/health'], ['profile-help', '/profile/help'], ['profile-join', '/profile/join'],
  ['profile-notifications', '/profile/notifications'], ['profile-privacy', '/profile/privacy'], ['profile-tracker-designs', '/profile/tracker-designs'],
  ['profile-trackers', '/profile/trackers'], ['profile-units', '/profile/units'],
  ['progress-assess', '/progress/assess'], ['progress-goal', '/progress/goal'], ['progress-lift', '/progress/lift'], ['progress-metric', '/progress/metric?k=weight'],
  ['progress-photos', '/progress/photos'], ['progress-streaks', '/progress/streaks'], ['workout', '/workout'],
  // signed out screens: no signedin flag
  ['welcome', '/welcome', false, true], ['login', '/login', false, true], ['onboarding', '/onboarding', false, true],
];

const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
if (!edge) { console.error('Edge or Chrome not found'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function main() {
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-shot-'));
  const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore' });
  let ws; let id = 0; const pending = new Map();
  try {
    let list;
    for (let i = 0; i < 60; i++) { try { list = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); if (list.find((t) => t.type === 'page')) break; } catch {} await sleep(500); }
    const target = list.find((t) => t.type === 'page');
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
    const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (d) => (d.error ? rej(new Error(method + ': ' + d.error.message)) : res(d.result))); ws.send(JSON.stringify({ id: i, method, params })); });
    const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    const list2 = SCREENS.filter(([n]) => !only.length || only.some((w) => n.includes(w)));
    let count = 0;
    for (const theme of ['light', 'dark']) {
      fs.mkdirSync(path.join(out, theme), { recursive: true });
      for (const [name, p, bottom, signedOut] of list2) {
        const url = BASE + p + (p.includes('?') ? '&' : '?') + (signedOut ? '' : 'signedin=1&') + 'theme=' + theme;
        await send('Page.navigate', { url });
        // wait for the app to render something, then for the first-load skeleton (about 1.1 s) and the fade-in to finish
        for (let i = 0; i < 80; i++) { const n = await evalJs('document.body ? document.body.innerText.length : 0'); if (n > 15) break; await sleep(250); }
        await sleep(3200);
        const shot = async (file) => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(out, theme, file), Buffer.from(r.data, 'base64')); count++; };
        await shot(name + '.png');
        if (bottom) {
          await evalJs(`(() => { const all = [...document.querySelectorAll('div')].filter((e) => e.scrollHeight > e.clientHeight + 40 && getComputedStyle(e).overflowY !== 'visible' && e.clientHeight > 300); const el = all.sort((a, b) => b.scrollHeight - a.scrollHeight)[0]; if (el) el.scrollTop = el.scrollHeight; return !!el; })()`);
          await sleep(900);
          await shot(name + '--bottom.png');
        }
        process.stdout.write('.');
      }
    }
    console.log('\nsaved ' + count + ' screenshots to ' + out);
  } finally { try { ws && ws.close(); } catch {} proc.kill(); }
}
main().catch((e) => { console.error(e); process.exit(1); });
