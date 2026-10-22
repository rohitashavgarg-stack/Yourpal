#!/usr/bin/env node
/*
 * Screenshots of anything in scripts/visual/shots-list.js: bottom sheets, onboarding steps, empty, loading and error states, and screens that
 * need a tap. Both themes, 390 x 844, same layout as capture.js.
 *
 *   node scripts/visual/shots.js <outDir> [--only=sheet-,state-]     names that start with a word (comma separated)
 *   node scripts/visual/compare.js docs/visual-baseline/shots <outDir>
 *
 * Each entry is { name, url, clicks?: [text or aria-label, ...], wait? }. The page opens with ?signedin=1&theme=...; clicks happen in order
 * (each retried while the screen is still drawing), then the screenshot is taken after `wait` ms.
 */
const fs = require('fs'); const path = require('path'); const os = require('os'); const { spawn } = require('child_process');
const THEMES = (process.env.THEMES || 'light,dark').split(',').filter(Boolean); // THEMES=dark captures only the dark theme
const BASE = process.env.APP_URL || 'http://localhost:8082';
const out = process.argv[2]; if (!out) { console.error('usage: shots.js <outDir> [--only=a,b]'); process.exit(1); }
const only = ((process.argv.find((a) => a.startsWith('--only=')) || '').slice(7) || '').split(',').filter(Boolean);
const LIST = require('./shots-list.js').filter((e) => !only.length || only.some((w) => e.name.startsWith(w)));
const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const port = 9300 + Math.floor(Math.random() * 500); const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-shots-'));
  const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore' });
  let ws; let id = 0; const pending = new Map();
  try {
    let list; for (let i = 0; i < 60; i++) { try { list = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); if (list.find((t) => t.type === 'page')) break; } catch {} await sleep(500); }
    ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
    const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, (d) => (d.error ? rej(new Error(method + ': ' + d.error.message)) : res(d.result))); ws.send(JSON.stringify({ id: i, method, params })); });
    const js = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value;
    await send('Page.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    const clickExpr = (t) => '(() => { const q = ' + JSON.stringify(t) + '; const lab = [...document.querySelectorAll(\'[aria-label]\')].filter((x) => x.getAttribute(\'aria-label\') === q || x.getAttribute(\'aria-label\').startsWith(q)); let e = lab[lab.length - 1];'
      + ' if (!e) { const all = [...document.querySelectorAll(\'div,span\')].filter((x) => x.children.length === 0 && x.textContent.trim() === q); e = all[all.length - 1]; }'
      + ' if (!e) return false; let t = e; while (t && t !== document.body) { if (t.tabIndex >= 0 || t.getAttribute(\'role\') === \'button\' || t.getAttribute(\'role\') === \'radio\') break; t = t.parentElement; } (t && t !== document.body ? t : e).click(); return true; })()';
    const click = async (t) => { for (let i = 0; i < 12; i++) { if (await js(clickExpr(t))) return true; await sleep(700); } console.error('could not find: ' + t); return false; };
    let n = 0;
    for (const theme of THEMES) {
      fs.mkdirSync(path.join(out, theme), { recursive: true });
      for (const e of LIST) {
        const url = BASE + e.url + (e.url.includes('?') ? '&' : '?') + (e.noSignedIn ? '' : 'signedin=1&') + 'theme=' + theme;
        await send('Page.navigate', { url });
        for (let i = 0; i < 400; i++) { if ((await js('document.body ? document.body.innerText.length : 0')) > 5) break; await sleep(250); }
        await sleep(e.settle || 2500);
        for (const c of e.clicks || []) { await click(c); await sleep(900); }
        if (e.clicks && e.clicks.length) await sleep(e.wait || 1500);
        const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(out, theme, e.name + '.png'), Buffer.from(r.data, 'base64')); n++; process.stdout.write('.');
      }
    }
    console.log('\nsaved ' + n + ' screenshots to ' + out);
  } finally { try { ws && ws.close(); } catch {} proc.kill(); }
})().catch((e) => { console.error(e); process.exit(1); });
