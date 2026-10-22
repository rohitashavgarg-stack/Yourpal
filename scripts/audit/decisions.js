#!/usr/bin/env node
/*
 * Writes a section of docs/coverage-decisions.md: for each hand-built element of the given repeated patterns, the values it has next to the
 * values of the nearest library component, and what differs. Nothing is changed in the code.
 *   node scripts/audit/decisions.js buttons|cards
 */
const fs = require('fs');
const kind = process.argv[2];
const data = JSON.parse(fs.readFileSync('docs/coverage-data.json', 'utf8'));
const all = [...data.routes, ...data.shared].flatMap((m) => m.hand).filter((h) => !h.file.startsWith('web/'));
const SETS = {
  buttons: ['button 44 px high, radius radii.lg', 'button 32 px high, radius radii.md', 'button 48 px high, radius radii.card', 'button 72 px high, radius radii.lg'],
  cards: ['card radius radii.card, fill c.surface, padding 16', 'card radius radii.xl, fill c.surface', 'card radius radii.xl, fill c.surface, padding 18'],
};
const get = (s, re) => { const m = s.match(re); return m ? m[1].trim() : ''; };
function styleOf(h) {
  const L = fs.readFileSync('src/' + h.file, 'utf8').replace(/\r/g, '').split('\n');
  const chunk = L.slice(h.line - 1, h.line + 2).join(' ');
  const i = chunk.indexOf('style='); return chunk.slice(i, i + 700);
}
// library presets
const BUTTON = { 56: 'large: 56 high, radius radii.xl, side padding 20, text 16/21', 50: 'medium: 50 high, radius 25, side padding 20, text 15/21', 44: 'small: 44 high, radius radii.lg, side padding 20, text 13/18', 40: 'tight: 40 high, radius 20, side padding 16, text 13/20', 36: 'compact: 36 high, radius 18, side padding 14, text 12/17' };
const KINDS = 'kinds: primary (ink fill), accent, secondary (c.surface2 fill), ghost, outline (1 px c.line), white, glass';
const CARD = { default: 'default: radius 28 (radii.xl), padding 20, c.surface, card shadow in light mode', compact: 'compact: radius 24 (radii.card), padding 18, gap 10, c.surface, card shadow in light mode' };
let md = '';
if (kind === 'buttons') {
  md += '## Buttons: near-matches left as they are\n\nThe four repeated button patterns (44 px, 32 px, 48 px and 72 px high). No element matches a `Button` preset exactly, so none was replaced. "Library" is the nearest preset. Library ' + KINDS + '.\n\n';
  md += '| Where | Hand-built | Nearest library | Differs by |\n|---|---|---|---|\n';
  for (const h of all.filter((x) => SETS.buttons.includes(x.sig))) {
    const s = styleOf(h); const ht = +get(s, /\bheight:\s*(\d+)/) || +get(s, /minHeight:\s*(\d+)/);
    const px = get(s, /paddingHorizontal:\s*(\d+)/), rad = get(s, /borderRadius:\s*([\w.]+)/), bg = get(s, /backgroundColor:\s*([^,}]+)/), bw = get(s, /borderWidth:\s*([^,}]+)/), bc = get(s, /borderColor:\s*([^,}]+)/), dash = /dashed/.test(s);
    const lib = BUTTON[ht] || 'none at ' + ht + ' px (presets are 56, 50, 44, 40, 36)';
    const diff = [];
    if (!BUTTON[ht]) diff.push('height');
    if (px && BUTTON[ht] && ht !== 40 && +px !== 20 && ht >= 44) diff.push('side padding ' + px + ' vs 20');
    if (dash) diff.push('dashed border (no preset)');
    if (bw && !dash) diff.push('border ' + bw + (bc ? ' ' + bc : '') + ' (only outline has one: 1 px c.line)');
    if (bg && !/^'?transparent/.test(bg)) diff.push('fill ' + bg);
    if (/radii\.card|radii\.md/.test(rad) && ht !== 44) diff.push('radius ' + rad);
    if (/minWidth|flex: 1|selected/.test(s) || /accessibilityState=\{\{ selected/.test(fs.readFileSync('src/' + h.file, 'utf8').split('\n')[h.line - 1])) diff.push('selectable or sized by its row (not a plain Button)');
    md += `| \`${h.file}:${h.line}\` | ${ht} high, radius ${rad}${px ? ', side padding ' + px : ''}${bg ? ', fill ' + bg : ''}${bw ? ', border ' + bw + (bc ? ' ' + bc : '') : ''}${dash ? ' dashed' : ''} | ${lib} | ${diff.join('; ') || 'text style or fill'} |\n`;
  }
}
if (kind === 'cards') {
  md += '## Cards: near-matches left as they are\n\nThe three repeated card patterns. `Card` has three looks: ' + CARD.default + '; ' + CARD.compact + '; dark. No element matches one exactly (radius, padding, fill and shadow together), so none was replaced.\n\n';
  md += '| Where | Hand-built | Nearest library | Differs by |\n|---|---|---|---|\n';
  for (const h of all.filter((x) => SETS.cards.includes(x.sig))) {
    const s = styleOf(h);
    const rad = get(s, /borderRadius:\s*([\w.]+)/), pad = get(s, /\bpadding:\s*(\d+)/), bg = get(s, /backgroundColor:\s*([^,}]+)/), bw = get(s, /borderWidth:\s*([^,}]+)/), gap = get(s, /\bgap:\s*(\d+)/);
    const shadow = /cardShadow/.test(s) ? 'card shadow (same as Card in light mode)' : 'no shadow';
    const near = rad === 'radii.card' ? 'compact' : 'default';
    const diff = [];
    if (near === 'compact' && pad && +pad !== 18) diff.push('padding ' + pad + ' vs 18');
    if (near === 'default' && pad && +pad !== 20) diff.push('padding ' + pad + ' vs 20');
    if (near === 'default' && !pad) diff.push('padding is per side, not one value');
    if (near === 'default' && rad === 'radii.xl' && pad === '18') diff.push('radius 28 matches default');
    if (!/cardShadow/.test(s)) diff.push('Card adds the light-mode shadow; this has none');
    if (bw) diff.push('border ' + bw);
    if (/overflow/.test(s)) diff.push('clips its content (overflow hidden)');
    if (h.file.includes('plans/log')) diff.push('a field, not a card');
    md += `| \`${h.file}:${h.line}\` | radius ${rad}, padding ${pad || 'per side'}, fill ${bg}, ${shadow}${gap ? ', gap ' + gap : ''}${bw ? ', border ' + bw : ''} | ${near === 'compact' ? CARD.compact : CARD.default} | ${diff.join('; ')} |\n`;
  }
}
const f = 'docs/coverage-decisions.md';
const head = '# Decisions for the designer\n\nHand-built elements that are close to a library component but not the same, so they were left alone. Each row gives both sets of values. Say which way to go (change the element to the library look, or add a variant to the library) and it can be done in one pass.\n\n';
let cur = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n') : head;
const marker = md.split('\n')[0];
const idx = cur.indexOf(marker);
if (idx >= 0) { const next = cur.indexOf('\n## ', idx + 5); cur = cur.slice(0, idx) + (next >= 0 ? cur.slice(next + 1) : ''); }
fs.writeFileSync(f, cur.trimEnd() + '\n\n' + md);
console.log('wrote section: ' + marker);
