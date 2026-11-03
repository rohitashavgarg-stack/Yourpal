// One-off alignment pass: make app.css and app.js use only tokens from "Yourpal Design System.fig".
const fs = require('fs');
const read = f => fs.readFileSync(f, 'utf8');

/* ---------------- design-system.css ---------------- */
let d = read('design-system.css');
// replace the "live values" block with aliases that resolve to Figma tokens
const a = d.indexOf('/* ---------- values measured on the live app');
const b = d.indexOf('/* ---------- type styles ---------- */');
d = d.slice(0, a) + `/* ---------- semantic aliases: every one resolves to a token from the Figma file ---------- */
:root{
  --brand:var(--primary-60); --brand-hover:var(--primary-70);
  --brand-06:var(--primary-05); --brand-10:var(--primary-05); --brand-15:var(--primary-10); --brand-soft:var(--primary-05);
  --ink:var(--text-primary); --slate-700:var(--text-secondary); --slate-500:var(--neutral-50); --slate-200:var(--neutral-20);
  --table-head:var(--neutral-05); --line:var(--neutral-20); --tile:var(--neutral-10);
  --icon-muted:var(--neutral-60); --icon-disabled:var(--neutral-40);
  --dot:var(--error-60); --ok:var(--success-60);
  --live-active-bg:var(--success-05); --live-active-line:var(--success-20); --live-active-ink:var(--success-90);
  --live-pending-bg:var(--warning-10); --live-pending-ink:var(--warning-90);
  --grad-header:linear-gradient(90deg,var(--primary-05),var(--white) 70%);
  --scrim:color-mix(in srgb,var(--neutral-100) 45%,transparent);
  --shadow-card:0 1px 2px color-mix(in srgb,var(--neutral-100) 6%,transparent);
  --shadow-thumb:0 1px 2px color-mix(in srgb,var(--neutral-100) 20%,transparent);
  --shadow-menu:0 8px 24px color-mix(in srgb,var(--neutral-100) 14%,transparent);
  --shadow-drawer:0 8px 40px color-mix(in srgb,var(--neutral-100) 16%,transparent);
}

` + d.slice(b);
// chips: Figma sizes M 32, S 24, XS 20; variants from the file; 13px text minimum
const c0 = d.indexOf('/* ---------- chips');
const c1 = d.indexOf('/* ---------- surfaces');
d = d.slice(0, c0) + `/* ---------- chips: Size M 32, S 24, XS 20 (Figma). Colours are the file's semantic scales. ---------- */
.chip{display:inline-flex;align-items:center;gap:var(--s-1);border-radius:var(--r-pill);font-family:var(--font);font-weight:var(--w-medium);white-space:nowrap;border:1px solid transparent;line-height:16px}
.chip.m{height:32px;padding:0 var(--s-3);font-size:var(--m3)}
.chip.s{height:24px;padding:0 var(--s-3);font-size:var(--m3)}
.chip.xs{height:20px;padding:0 var(--s-2);font-size:var(--m3)}
.chip svg{width:16px;height:16px;flex:none;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.chip .dot{width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block}
.chip .av24{width:24px;height:24px;border-radius:50%;background:var(--warning-20);color:var(--text-primary);display:grid;place-items:center;font:var(--w-bold) 13px/1 var(--font);font-style:normal;flex:none}
.chip.m:has(.av24){padding-left:var(--s-1)}
.chip.default{background:var(--neutral-10);color:var(--neutral-80)}
.chip.outlined{background:var(--white);color:var(--neutral-80);border-color:var(--neutral-30)}
.chip.outlined.brandtext{color:var(--primary-60);border-color:var(--primary-10);background:var(--primary-05)}
.chip.act{cursor:pointer}
.chip.primary{background:var(--primary-05);color:var(--primary-60)}
.chip.success{background:var(--success-05);color:var(--success-90);border-color:var(--success-20)}
.chip.warning{background:var(--warning-10);color:var(--warning-90);border-color:var(--warning-20)}
.chip.error{background:var(--error-05);color:var(--error-80);border-color:var(--error-10)}
.chip.info{background:var(--info-05);color:var(--info-90);border-color:var(--info-20)}
.chip.neutral{background:var(--neutral-10);color:var(--neutral-70)}
.chip.selectable{cursor:pointer;background:var(--white);color:var(--neutral-70);border-color:var(--neutral-30)}
.chip.selectable:hover{border-color:var(--primary-60)}
.chip.selectable.on{background:var(--primary-05);color:var(--primary-60);border-color:var(--primary-60);font-weight:var(--w-semibold)}

` + d.slice(c1);
d = d.replace(/--shadow-menu:[^;]*;\s*--shadow-drawer:[^;]*;/, '');
fs.writeFileSync('design-system.css', d);

/* ---------------- app.css ---------------- */
let c = read('app.css');
// drop custom chip rules; the .chip component replaces them
c = c.split('\n').filter(l => !/^\.(pchip|tagchip|wchip|expchip|tinychip|okchip|infochip|warnchip|stchip|cf|mini)\b/.test(l)
  && !/^\.chip\.(m\.selectable|success)/.test(l) && !/^\.banner \.chip\.error/.test(l)
  && !/^\.ti \.by/.test(l) && !/^\.okchip|^\.expchip/.test(l)).join('\n');
const MAP = [
  ['box-shadow:0 1px 2px rgba(0,0,0,.2)', 'box-shadow:var(--shadow-thumb)'],
  ['box-shadow:0 1px 2px rgba(16,24,40,.04)', 'box-shadow:var(--shadow-card)'],
  ['box-shadow:0 1px 3px rgba(0,0,0,.02)', 'box-shadow:var(--shadow-card)'],
  ['box-shadow:0 20px 60px rgba(0,0,0,.15)', 'box-shadow:var(--shadow-drawer)'],
  ['box-shadow:-8px 0 40px rgba(0,0,0,.08)', 'box-shadow:var(--shadow-drawer)'],
  ['rgba(27,36,44,.45)', 'var(--scrim)'],
  ['border:1px solid rgba(63,81,181,.24)', 'border:1px solid var(--primary-10)'],
  ['#4FC3F7', 'var(--info-50)'],
  ['background:rgba(220,38,38,.06);border:1px solid rgba(220,38,38,.3);color:var(--dot)', 'background:var(--error-05);border:1px solid var(--error-20);color:var(--error-80)'],
  ['.alert.error span{color:var(--dot)}', '.alert.error span{color:var(--error-80)}'],
  ['border-color:#0284C7;color:#0284C7', 'border-color:var(--info-80);color:var(--info-80)'],
  ['border-color:#CA8A04;color:#CA8A04', 'border-color:var(--warning-70);color:var(--warning-70)'],
  ['background:rgba(239,68,68,.02);border:1px solid rgba(220,38,38,.18);border-left:4px solid var(--dot)', 'background:var(--error-05);border:1px solid var(--error-10);border-left:4px solid var(--error-60)'],
  ['background:rgba(220,38,38,.1);color:var(--dot)', 'background:var(--error-10);color:var(--error-70)'],
  ['.banner.red h4{font:var(--w-extrabold) 16px/24px var(--font);color:var(--dot)}', '.banner.red h4{font:var(--w-extrabold) 16px/24px var(--font);color:var(--error-80)}'],
  ['background:var(--dot);border-radius:var(--r-md)}', 'background:var(--error-60);border-radius:var(--r-md)}'],
  ['.banner .btn.filled.error:hover{background:#B91C1C}', '.banner .btn.filled.error:hover{background:var(--error-70)}'],
  ['.bar2 i{background:#15803D}', '.bar2 i{background:var(--success-70)}'],
  ['background:rgba(21,128,61,.1);border:0;color:#15803D', 'background:var(--success-05);border:1px solid var(--success-20);color:var(--success-70)'],
  ['border:1px solid rgba(254,154,72,.35);color:var(--secondary-60)', 'border:1px solid var(--secondary-20);color:var(--secondary-90)'],
  ['border:1px solid var(--secondary-60);display:grid', 'border:1px solid var(--secondary-70);display:grid'],
  ['background:rgba(158,158,158,.04)', 'background:var(--neutral-05)'],
  ['background:var(--grad-purple)', 'background:var(--primary-60)'],
  ['background:var(--grad-brand);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;width:max-content', 'color:var(--primary-70)'],
  ['background:var(--grad-brand);color:var(--white);display:grid;place-items:center;font:var(--w-bold) 14px', 'background:var(--primary-60);color:var(--white);display:grid;place-items:center;font:var(--w-bold) 14px'],
];
for (const [x, y] of MAP) { if (!c.includes(x)) console.log('css MISSING:', x.slice(0, 60)); c = c.split(x).join(y); }
c = c.replace(/\.av\{width:28px;height:28px;border-radius:var\(--r-md\);background:var\(--grad-brand\)/, '.av{width:28px;height:28px;border-radius:var(--r-md);background:var(--primary-60)');
// type scale: Figma H1 24, H2 20, H3 18, H4 16, body 16/14, medium 13. Line heights follow the file's 1.5 and 1.6 ratios.
const SIZE = { 15: 16, 17: 18, 22: 24 };
const LH = { 13: 20, 14: 22, 16: 24, 18: 28, 20: 30, 24: 36 };
function type(s) {
  return s.replace(/(font:[^;{}\n]*?\s)(\d+(?:\.\d+)?)px\/(\d+(?:\.\d+)?)px/g, (m, pre, sz, lh) => {
    const n = SIZE[+sz] || +sz; const l = LH[n]; return l ? `${pre}${n}px/${l}px` : `${pre}${n}px/${lh}px`; })
   .replace(/(font-size:)(\d+(?:\.\d+)?)px/g, (m, p, sz) => p + (SIZE[+sz] || +sz) + 'px');
}
c = type(c);
fs.writeFileSync('app.css', c);

/* ---------------- app.js ---------------- */
let s = read('app.js');
const R = (x, y) => { if (!s.includes(x)) { console.log('js MISSING:', x.slice(0, 70)); return; } s = s.split(x).join(y); };
R("const AV = ['#3F51B5','#1F7A5A','#7B2FA8','#B24D00','#1373CC','#992B28','#4552A9'];", "const AV = ['var(--primary-60)','var(--success-70)','var(--primary-80)','var(--secondary-90)','var(--info-80)','var(--error-80)','var(--primary-50)'];");
// folder illustration colours come from tokens
s = s.replace(/const folder = \(\) => `<svg[^`]*`;/, "const folder = () => `<svg class=\"art\" viewBox=\"0 0 160 128\" aria-hidden=\"true\"><ellipse cx=\"80\" cy=\"116\" rx=\"52\" ry=\"8\" style=\"fill:var(--primary-60);opacity:.12\"/><path d=\"M24 36a8 8 0 018-8h30l10 10h56a8 8 0 018 8v58a8 8 0 01-8 8H32a8 8 0 01-8-8z\" style=\"fill:var(--primary-70)\"/><rect x=\"38\" y=\"30\" width=\"84\" height=\"46\" rx=\"4\" style=\"fill:var(--white)\"/><rect x=\"46\" y=\"38\" width=\"44\" height=\"4\" rx=\"2\" style=\"fill:var(--primary-10)\"/><rect x=\"46\" y=\"48\" width=\"60\" height=\"4\" rx=\"2\" style=\"fill:var(--neutral-20)\"/><rect x=\"46\" y=\"58\" width=\"52\" height=\"4\" rx=\"2\" style=\"fill:var(--neutral-20)\"/><path d=\"M24 62a8 8 0 018-8h96a8 8 0 018 8v42a8 8 0 01-8 8H32a8 8 0 01-8-8z\" style=\"fill:var(--primary-60)\"/><path d=\"M24 78h112v26a8 8 0 01-8 8H32a8 8 0 01-8-8z\" style=\"fill:var(--primary-70)\"/></svg>`;");
R('class="pchip brand" data-act="assign"', 'class="chip s outlined brandtext act" data-act="assign"');
R('<span class="tagchip">${esc(t)}</span>', '<span class="chip s outlined">${esc(t)}</span>');
R('<span class="tagchip">No Tags</span>', '<span class="chip s outlined">No Tags</span>');
R('<span class="wchip">${m.waiver}</span>', '<span class="chip s warning">${m.waiver}</span>');
R('<span class="tagchip" style="justify-self:start">N/A</span>', '<span class="chip s outlined" style="justify-self:start">N/A</span>');
R('<span class="tagchip" style="height:20px">${x.tag}</span>', '<span class="chip xs outlined">${x.tag}</span>');
R('<span class="cf sm ${f.tags.includes(t)?\'on\':\'\'}" data-ftag="${t}">', '<span class="chip s selectable ${f.tags.includes(t)?\'on\':\'\'}" data-ftag="${t}">');
R('`<button class="cf ${cur===c?\'on\':\'\'}" ${attr}="${c}">${c}</button>`', '`<button class="chip m selectable ${cur===c?\'on\':\'\'}" ${attr}="${c}">${c}</button>`');
R('`<span class="cf ${i?\'\':\'on\'}">${c}</span>`', '`<span class="chip m selectable ${i?\'\':\'on\'}">${c}</span>`');
R('`<span class="cf ${i===2?\'on\':\'\'}">${c}</span>`', '`<span class="chip m selectable ${i===2?\'on\':\'\'}">${c}</span>`');
R('`<button class="cf ${i===cur?\'on\':\'\'}" data-pick>', '`<button class="chip m selectable ${i===cur?\'on\':\'\'}" data-pick>');
// membership status chips
R("const MS_CHIP = {Expired:'expchip', Active:'okchip', Frozen:'infochip', Suspended:'warnchip'};", "const MS_CHIP = {Expired:'chip s error', Active:'chip s success', Frozen:'chip s info', Suspended:'chip s warning'};");
R('<span class="${MS_CHIP[ms.status]} stchip"><i></i>${ms.status}</span>', '<span class="${MS_CHIP[ms.status]}"><i class="dot"></i>${ms.status}</span>');
R('<span class="tinychip">${ms.dur}</span>', '<span class="chip xs neutral">${ms.dur}</span>');
R('<span class="mini o">${p.label}</span><span class="mini i">${p.product}</span>', '<span class="chip xs warning">${p.label}</span><span class="chip xs info">${p.product}</span>');
// author chip: Figma chip M (32) with a 24px text avatar showing one initial
R('<span class="by"><i>${esc(initials(a.by))}</i>${esc(a.by)}</span>', '<span class="chip m outlined"><i class="av24">${esc(initials(a.by)[0])}</i>${esc(a.by)}</span>');
R('<span class="by"><span class="sa2">${esc(initials(x.by))}</span>${x.by}</span>', '<span class="chip m outlined by"><i class="av24">${esc(initials(x.by)[0])}</i>${x.by}</span>');
R('<span class="sa2" style="background:var(--grad-brand)">R</span>', '<span class="sa2" style="background:var(--primary-60)">R</span>');
fs.writeFileSync('app.js', s);
console.log('aligned');
