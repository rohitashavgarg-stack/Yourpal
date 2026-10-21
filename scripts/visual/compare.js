#!/usr/bin/env node
/*
 * Compare two screenshot folders made by capture.js.
 *
 *   node scripts/visual/compare.js docs/visual-baseline .visual-current [--tol=8] [--max=0.3] [--save-diff=.visual-diff]
 *
 * For every <theme>/<name>.png in the current folder it finds the same file in the baseline and counts the pixels where any colour
 * channel differs by more than --tol (default 8 of 255). A screen is flagged when more than --max percent of its pixels changed
 * (default 0.3, which absorbs the pulsing live dot and text anti-aliasing). Exit code 1 if anything is flagged.
 * With --save-diff it writes <theme>/<name>.diff.png (changed pixels in red over the dimmed current screenshot).
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const [base, cur] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const TOL = +opt('tol', 8), MAX = +opt('max', 0.3), DIFF = opt('save-diff', '');
if (!base || !cur) { console.error('usage: compare.js <baselineDir> <currentDir>'); process.exit(1); }

function decode(file) {
  const b = fs.readFileSync(file); let p = 8; let w, h, ct; const idat = [];
  while (p < b.length) { const len = b.readUInt32BE(p); const type = b.toString('ascii', p + 4, p + 8); const data = b.subarray(p + 8, p + 8 + len); if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; } if (type === 'IDAT') idat.push(data); p += 12 + len; }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 0; if (!bpp) throw new Error('unsupported PNG colour type ' + ct + ' in ' + file);
  const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = w * bpp; const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)]; const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, up = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      let v = row[x];
      if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const pa = Math.abs(up - c), pb = Math.abs(a - c), pc = Math.abs(a + up - 2 * c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      px[y * stride + x] = v & 255;
    }
  }
  return { w, h, bpp, px };
}
const crcTable = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = (buf) => { let c = 0xffffffff; for (const x of buf) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function encode(w, h, rgba) {
  const raw = Buffer.alloc(h * (w * 4 + 1)); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const rows = []; let flagged = 0;
for (const theme of fs.readdirSync(cur).filter((d) => fs.statSync(path.join(cur, d)).isDirectory())) {
  for (const f of fs.readdirSync(path.join(cur, theme)).filter((x) => x.endsWith('.png') && !x.endsWith('.diff.png')).sort()) {
    const bf = path.join(base, theme, f);
    if (!fs.existsSync(bf)) { rows.push([theme, f, 'no baseline', '', '']); flagged++; continue; }
    const A = decode(bf), B = decode(path.join(cur, theme, f));
    if (A.w !== B.w || A.h !== B.h) { rows.push([theme, f, 'size ' + A.w + 'x' + A.h + ' vs ' + B.w + 'x' + B.h, '', 'FLAG']); flagged++; continue; }
    let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const out = DIFF ? Buffer.alloc(A.w * A.h * 4) : null;
    for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) {
      const i = (y * A.w + x) * A.bpp, j = (y * A.w + x) * B.bpp; let d = 0;
      for (let k = 0; k < 3; k++) d = Math.max(d, Math.abs(A.px[i + k] - B.px[j + k]));
      const changed = d > TOL; if (changed) { n++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      if (out) { const o = (y * A.w + x) * 4; if (changed) { out[o] = 255; out[o + 1] = 40; out[o + 2] = 60; } else { out[o] = B.px[j] >> 1; out[o + 1] = B.px[j + 1] >> 1; out[o + 2] = B.px[j + 2] >> 1; } out[o + 3] = 255; }
    }
    const pct = (n / (A.w * A.h)) * 100; const flag = pct > MAX;
    if (flag) flagged++;
    rows.push([theme, f, pct.toFixed(2) + '%', n ? x0 + ',' + y0 + ' to ' + x1 + ',' + y1 : '', flag ? 'FLAG' : '']);
    if (out && n) { fs.mkdirSync(path.join(DIFF, theme), { recursive: true }); fs.writeFileSync(path.join(DIFF, theme, f.replace('.png', '.diff.png')), encode(A.w, A.h, out)); }
  }
}
const pad = (s, n) => String(s).padEnd(n);
rows.forEach((r) => console.log(pad(r[0], 6) + pad(r[1], 34) + pad(r[2], 12) + pad(r[3], 20) + r[4]));
console.log('\n' + rows.length + ' screenshots compared, ' + flagged + ' flagged (tolerance ' + TOL + ' per channel, ' + MAX + '% of pixels)');
process.exit(flagged ? 1 : 0);
