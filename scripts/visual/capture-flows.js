#!/usr/bin/env node
/*
 * Screenshots of screens that only exist after a tap (capture.js cannot reach them): the workout in progress (steppers in the set rows)
 * and the plan editor's change-an-exercise sheet (row steppers). Same setup and output layout as capture.js.
 *
 *   node scripts/visual/capture-flows.js <outDir>
 *
 * Files: <outDir>/<theme>/flow-workout-warmup.png, flow-workout-main.png, flow-plans-edit-stepper.png
 * Compare two folders with compare.js as usual (run it once before a change and once after, since the baseline folder does not have these).
 */
const fs = require('fs'); const path = require('path'); const os = require('os'); const { spawn } = require('child_process');
const BASE = process.env.APP_URL || 'http://localhost:8082';
const out = process.argv[2]; if (!out) { console.error('usage: capture-flows.js <outDir>'); process.exit(1); }
const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const port = 9300 + Math.floor(Math.random() * 500); const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-flow-'));
  const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore' });
  let ws; let id = 0; const pending = new Map();
  try {
    let list; for (let i = 0; i < 60; i++) { try { list = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); if (list.find((t) => t.type === 'page')) break; } catch {} await sleep(500); }
    ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
    const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (d) => (d.error ? rej(new Error(method + ': ' + d.error.message)) : res(d.result))); ws.send(JSON.stringify({ id: i, method, params })); });
    const js = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
    await send('Page.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    const open = async (p, theme) => { await send('Page.navigate', { url: BASE + p + (p.includes('?') ? '&' : '?') + 'signedin=1&theme=' + theme }); for (let i = 0; i < 400; i++) { if ((await js('document.body ? document.body.innerText.length : 0')) > 15) break; await sleep(250); } await sleep(3200); };
    // click the topmost element with this aria-label, or the leaf element with exactly this text
    const click1 = (t) => js(`(() => { const q = ${JSON.stringify(t)}; const lab = [...document.querySelectorAll('[aria-label="' + q + '"]')]; let e = lab[lab.length - 1]; if (!e) { const all = [...document.querySelectorAll('div,span')].filter((x) => x.children.length === 0 && x.textContent.trim() === q); e = all[all.length - 1]; } if (!e) return false; e.click(); return true; })()`); // the last match is the screen on top (earlier screens stay mounted underneath)
    const click = async (t) => { for (let i = 0; i < 12; i++) { if (await click1(t)) return true; await sleep(700); } console.error('could not find: ' + t + ' on ' + (await js('location.pathname'))); return false; }; // retry while the screen is still drawing
    const shot = async (theme, name) => { fs.mkdirSync(path.join(out, theme), { recursive: true }); const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(out, theme, name + '.png'), Buffer.from(r.data, 'base64')); process.stdout.write('.'); };
    for (const theme of ['light', 'dark']) {
      await open('/', theme); await click('Start workout'); await sleep(3500); await shot(theme, 'flow-workout-warmup');
      await click('Start main workout'); await sleep(2500); await shot(theme, 'flow-workout-main');
      await open('/plans?day=2', theme); const a = await click('Plan menu'); await sleep(2000); const b = await click('Edit plan'); await sleep(3500);
      const url = await js('location.pathname'); const d = await click('Barbell bench press'); await sleep(2000);
      if (!(a && b && d) || url !== '/plans/edit') console.error('plans flow (' + theme + '): menu ' + a + ', edit ' + b + ', page ' + url + ', row ' + d);
      await shot(theme, 'flow-plans-edit-stepper');
    }
    console.log('\nsaved to ' + out);
  } finally { try { ws && ws.close(); } catch {} proc.kill(); }
})().catch((e) => { console.error(e); process.exit(1); });
