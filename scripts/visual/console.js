#!/usr/bin/env node
/* Opens one URL in headless Edge at 390 x 844 and prints the runtime exceptions and console errors of that page load (not stale ones).
 *   node scripts/visual/console.js "/dev-cards?c=meals&s=missed" */
const fs = require('fs'); const path = require('path'); const os = require('os'); const { spawn } = require('child_process');
const url = (process.env.APP_URL || 'http://localhost:8082') + process.argv[2] + (process.argv[2].includes('?') ? '&' : '?') + 'signedin=1&theme=dark';
const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const port = 9300 + Math.floor(Math.random() * 500); const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-con-'));
  const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=' + port, '--user-data-dir=' + profile, 'about:blank'], { stdio: 'ignore' });
  try {
    let list; for (let i = 0; i < 60; i++) { try { list = await (await fetch('http://127.0.0.1:' + port + '/json')).json(); if (list.find((t) => t.type === 'page')) break; } catch {} await sleep(500); }
    const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0; const pending = new Map();
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
      if (d.method === 'Runtime.exceptionThrown') console.log('EXCEPTION', (d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description || d.params.exceptionDetails.text).slice(0, 600));
      if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') console.log('CONSOLE.ERROR', d.params.args.map((a) => a.value || a.description || '').join(' ').slice(0, 600)); };
    const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    await send('Runtime.enable'); await send('Page.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url }); await sleep(Number(process.env.WAIT || 20000));
    const r = await send('Runtime.evaluate', { expression: 'document.body.innerText.slice(0,400)', returnByValue: true });
    console.log('TEXT:', JSON.stringify(r.result.result.value));
    ws.close();
  } finally { proc.kill(); }
})();
