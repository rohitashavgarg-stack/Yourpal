#!/usr/bin/env node
/*
 * Token codemod (phase 2 of the design-system work).
 *
 *   node scripts/codemods/apply-tokens.js --only=colors     [--write]
 *   node scripts/codemods/apply-tokens.js --only=fontSizes  [--write]
 *   node scripts/codemods/apply-tokens.js --only=radii      [--write]
 *   node scripts/codemods/apply-tokens.js --review                      (writes docs/tokens-review.md, changes no source)
 *
 * Without --write it only prints what it would change. It reads the token values from src/design-system/tokens/*.ts,
 * so the scales are defined in one place. It edits with the TypeScript parser (never with a text search), keeps line endings,
 * and only changes the cases listed below. Everything else is left alone and written to docs/tokens-review.md.
 *
 * Safe cases
 *   colours   a '#rgb' / '#rrggbb' string that equals a `fixed` colour (same in light and dark) or is within 8 per channel of exactly one
 *             `fixed` colour. It becomes fixed.<name>. Theme colours (c.surface and so on) are never used as a replacement,
 *             because their value changes with the mode.
 *   fontSize  a numeric `fontSize` that equals a step of `fontSizes`, or is within 2 px of exactly one step.
 *   radius    a numeric borderRadius / border*Radius that equals a step of `radii`, or is within 2 px of exactly one step.
 * Not touched: a tie between two steps, anything farther than 2 px, colours with alpha (#rrggbbaa, rgba()), colours inside longer strings,
 * spacing (gap, padding, margin), and everything under src/design-system and src/theme.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const REVIEW = args.includes('--review');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7);

// ---------- tokens, read from the source ----------
const tok = (file) => fs.readFileSync(path.join('src/design-system/tokens', file), 'utf8').split('\r\n').join('\n');
const obj = (src, name) => { const m = src.match(new RegExp('export const ' + name + '\\s*=\\s*(\\{[^}]*\\})')); if (!m) throw new Error('token not found: ' + name); return Function('return (' + m[1] + ')')(); };
const FIXED = obj(tok('colors.ts'), 'fixed');
const FONT = obj(tok('typography.ts'), 'fontSizes');
const RAD = obj(tok('radius.ts'), 'radii');
const palettes = (() => { // every palette value, for the "nearest token" column of the review
  const src = tok('colors.ts'); const out = [];
  for (const mode of ['light', 'dark']) {
    const a = src.indexOf('export const ' + mode); const b = src.indexOf('};', a);
    for (const m of src.slice(a, b).matchAll(/([a-zA-Z0-9]+):\s*'([^']+)'/g)) out.push({ name: mode + '.' + m[1], value: m[2] });
  }
  return out;
})();

// ---------- helpers ----------
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const HEX_ANY = /#[0-9a-fA-F]{3,8}\b/;
const RGBA = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/;
const RGBA_ANY = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/;
const toRgb = (h) => { h = h.slice(1); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const norm = (h) => '#' + toRgb(h).map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
const chan = (a, b) => Math.max(...a.map((x, i) => Math.abs(x - b[i])));
const nearestFixed = (hex) => { const rgb = toRgb(hex); let best = null; let tie = false; for (const [n, v] of Object.entries(FIXED)) { const d = chan(rgb, toRgb(v)); if (!best || d < best.d) { best = { n, d }; tie = false; } else if (d === best.d) tie = true; } return { ...best, tie }; };
const decideHex = (hex) => { const n = nearestFixed(hex); if (n.d === 0) return { name: n.n, exact: true }; if (n.d <= 8 && !n.tie) return { name: n.n, exact: false, d: n.d }; return null; };
const nearestPalette = (hex) => { const rgb = toRgb(hex); let best = null; for (const p of palettes) { if (!HEX.test(p.value)) continue; const d = chan(rgb, toRgb(p.value)); if (!best || d < best.d) best = { ...p, d }; } for (const [n, v] of Object.entries(FIXED)) { const d = chan(rgb, toRgb(v)); if (!best || d < best.d) best = { name: 'fixed.' + n, value: v, d }; } return best; };
const parseRgba = (s) => { const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
const nearestRgba = (s) => { const a = parseRgba(s); if (!a) return null; let best = null; for (const p of palettes) { const b = parseRgba(p.value); if (!b) continue; const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) + Math.abs(a[3] - b[3]) * 100; if (!best || d < best.d) best = { ...p, d: Math.round(d) }; } return best; };
function snap(v, steps, skip) {
  const entries = Object.entries(steps).filter(([k]) => !(skip && skip.includes(k)));
  const exact = entries.find(([, s]) => s === v);
  if (exact) return { name: exact[0], exact: true };
  const ranked = entries.map(([k, s]) => ({ k, s, d: Math.abs(s - v) })).sort((a, b) => a.d - b.d);
  const [a, b] = ranked;
  if (a.d <= 2 && !(b && b.d === a.d)) return { name: a.k, exact: false, d: a.d, step: a.s };
  return { name: null, nearest: a, tie: b && b.d === a.d ? b : null };
}
const FONT_KEYS = ['fontSize'];
const RADIUS_KEYS = ['borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'];

function* walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) yield* walk(p); else if (/\.(ts|tsx)$/.test(e.name)) yield p.split(path.sep).join('/'); } }
const skipFile = (f) => f.startsWith('src/design-system/') || f.startsWith('src/theme/');
const numericLeaves = (e) => { if (!e) return []; if (ts.isNumericLiteral(e)) return [e]; if (ts.isParenthesizedExpression(e)) return numericLeaves(e.expression); if (ts.isConditionalExpression(e)) return [...numericLeaves(e.whenTrue), ...numericLeaves(e.whenFalse)]; return []; };
const keyName = (n) => (ts.isIdentifier(n) || ts.isStringLiteral(n) ? n.text : null);

// ---------- scan one file: edits (when applying) and leftovers (for the review) ----------
function scan(file, kinds) {
  let text = fs.readFileSync(file, 'utf8'); const crlf = text.includes('\r\n'); text = text.split('\r\n').join('\n');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = []; const left = []; const used = new Set(); const log = [];
  const lineOf = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const dim = (obj) => { // literal width / height in the same style object, if any
    if (!obj || !ts.isObjectLiteralExpression(obj)) return null; const d = [];
    for (const pr of obj.properties) if (ts.isPropertyAssignment(pr) && ['width', 'height'].includes(keyName(pr.name) || '') && ts.isNumericLiteral(pr.initializer)) d.push(Number(pr.initializer.text));
    return d.length ? Math.min(...d) : null;
  };
  const numeric = (leaf, steps, ns, kind, skip, owner) => {
    const v = Number(leaf.text);
    if (kind === 'radii' && v >= 500) { if (kinds.includes(kind)) { edits.push({ s: leaf.getStart(sf), e: leaf.getEnd(), t: 'radii.pill' }); used.add('radii'); } return; } // a full pill
    const r = snap(v, steps, skip);
    // A smaller radius can turn a circle or a pill into a rounded square. Only shrink a radius when the same style object has a literal
    // width or height that is clearly larger than twice the radius; otherwise leave it for review.
    if (r.name && kind === 'radii' && !r.exact && r.step < v) { const m = dim(owner); if (m == null || v * 2 > m - 2) { left.push({ kind, file, line: lineOf(leaf), value: v, nearest: { k: r.name, s: r.step, d: r.d }, tie: null, reason: 'may be a circle or pill, and the nearest step is smaller' }); return; } }
    if (r.name && kinds.includes(kind)) { edits.push({ s: leaf.getStart(sf), e: leaf.getEnd(), t: ns + '.' + r.name }); used.add(ns); if (!r.exact) log.push({ file, line: lineOf(leaf), from: v, to: ns + '.' + r.name + ' (' + r.step + ')' }); }
    else if (!r.name) left.push({ kind, file, line: lineOf(leaf), value: v, nearest: r.nearest, tie: r.tie });
  };
  (function visit(n) {
    if (ts.isPropertyAssignment(n) || ts.isJsxAttribute(n)) {
      const name = ts.isPropertyAssignment(n) ? keyName(n.name) : n.name.getText(sf);
      const init = ts.isPropertyAssignment(n) ? n.initializer : (n.initializer && ts.isJsxExpression(n.initializer) ? n.initializer.expression : null);
      if (name && FONT_KEYS.includes(name)) numericLeaves(init).forEach((l) => numeric(l, FONT, 'fontSizes', 'fontSizes'));
      if (name && RADIUS_KEYS.includes(name)) numericLeaves(init).forEach((l) => numeric(l, RAD, 'radii', 'radii', ['pill'], ts.isPropertyAssignment(n) ? n.parent : null));
    }
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const p = n.parent; const v = n.text;
      const skipCtx = ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || (ts.isPropertyAssignment(p) && p.name === n) || ts.isEnumMember(p);
      if (!skipCtx) {
        if (HEX.test(v)) {
          const d = decideHex(v);
          if (d && kinds.includes('colors')) {
            const isAttr = ts.isJsxAttribute(p);
            edits.push({ s: n.getStart(sf), e: n.getEnd(), t: isAttr ? '{fixed.' + d.name + '}' : 'fixed.' + d.name }); used.add('fixed');
            if (!d.exact) log.push({ file, line: lineOf(n), from: v, to: 'fixed.' + d.name + ' (' + FIXED[d.name] + ', gap ' + d.d + ')' });
          } else if (!d) left.push({ kind: 'hex', file, line: lineOf(n), value: v });
        } else if (RGBA.test(v)) left.push({ kind: 'rgba', file, line: lineOf(n), value: v });
        else if (HEX_ANY.test(v) || RGBA_ANY.test(v)) left.push({ kind: 'embedded', file, line: lineOf(n), value: v.length > 60 ? v.slice(0, 57) + '...' : v });
      }
    }
    if (ts.isTemplateExpression(n) && (HEX_ANY.test(n.getText(sf)) || RGBA_ANY.test(n.getText(sf)))) left.push({ kind: 'embedded', file, line: lineOf(n), value: n.getText(sf).slice(0, 60) });
    ts.forEachChild(n, visit);
  })(sf);
  return { text, sf, crlf, edits, left, used, log };
}
function applyEdits(file, r) {
  let t = r.text;
  const edits = r.edits.sort((a, b) => b.s - a.s);
  for (const e of edits) t = t.slice(0, e.s) + e.t + t.slice(e.e);
  // one import line for the names used
  const names = ['fixed', 'fontSizes', 'radii'].filter((n) => r.used.has(n));
  if (names.length) {
    const imps = r.sf.statements.filter((s) => ts.isImportDeclaration(s));
    const existing = imps.find((s) => s.moduleSpecifier.text === '@/design-system/tokens');
    if (existing) {
      const clause = existing.importClause && existing.importClause.namedBindings;
      const have = clause && ts.isNamedImports(clause) ? clause.elements.map((x) => x.name.text) : [];
      const add = names.filter((n) => !have.includes(n));
      if (add.length && clause) { const start = clause.getStart(r.sf) + 1; const shift = edits.filter((e) => e.s < start).reduce((a, e) => a + e.t.length - (e.e - e.s), 0); t = t.slice(0, start + shift) + ' ' + add.join(', ') + ',' + t.slice(start + shift); }
    } else {
      const last = imps[imps.length - 1];
      const line = "import { " + names.join(', ') + " } from '@/design-system/tokens';";
      if (last) { const at = last.getEnd() + edits.filter((e) => e.s < last.getEnd()).reduce((a, e) => a + e.t.length - (e.e - e.s), 0); t = t.slice(0, at) + '\n' + line + t.slice(at); }
      else t = line + '\n' + t;
    }
  }
  fs.writeFileSync(file, r.crlf ? t.split('\n').join('\r\n') : t);
}

// ---------- run ----------
const files = [...walk('src')].filter((f) => !skipFile(f));
if (REVIEW) { review(); return; }
if (!['colors', 'fontSizes', 'radii'].includes(ONLY)) { console.error('use --only=colors|fontSizes|radii or --review'); process.exit(1); }
let total = 0; const snaps = []; const touched = [];
for (const f of files) {
  const r = scan(f, [ONLY]);
  if (!r.edits.length) continue;
  total += r.edits.length; snaps.push(...r.log); touched.push(f);
  if (WRITE) applyEdits(f, r);
}
console.log((WRITE ? 'changed ' : 'would change ') + total + ' values in ' + touched.length + ' files (' + ONLY + ')');
console.log('exact matches: ' + (total - snaps.length) + ', snapped to a nearby step: ' + snaps.length);
snaps.forEach((s) => console.log('  snap ' + s.file + ':' + s.line + '  ' + s.from + ' -> ' + s.to));

// ---------- review file ----------
function review() {
  const rows = { hex: [], rgba: [], embedded: [], fontSizes: [], radii: [] };
  const spacing = {};
  for (const f of files) {
    const r = scan(f, []);
    r.left.forEach((l) => rows[l.kind].push(l));
    const text = r.text;
    for (const m of text.matchAll(/\b(gap|rowGap|columnGap|padding(?:Horizontal|Vertical|Top|Bottom|Left|Right)?|margin(?:Horizontal|Vertical|Top|Bottom|Left|Right)?):\s*(-?\d+(?:\.\d+)?)/g)) { const v = Math.abs(+m[2]); if (v % 4 !== 0) { const k = String(v); (spacing[k] ||= { n: 0, files: new Set() }); spacing[k].n++; spacing[k].files.add(f); } }
  }
  const rel = (f, l) => '`' + f.replace(/^src\//, '') + ':' + l + '`';
  const L = [];
  const tbl = (head, data) => { L.push('| ' + head.join(' | ') + ' |'); L.push('|' + head.map(() => '---').join('|') + '|'); data.forEach((r) => L.push('| ' + r.map((x) => String(x).replace(/\|/g, '\\|')).join(' | ') + ' |')); L.push(''); };
  L.push('# Token review');
  L.push('');
  L.push('Cases the codemod did **not** change, because the right token is not clear. Generated by `node scripts/codemods/apply-tokens.js --review`; run it again after you decide. Each row gives where the value is, what it is now, and the nearest token with the distance, so you can pick one of: map it to that token, add a new token, or leave it.');
  L.push('');
  L.push('How the nearest token is chosen: colours by the largest per-channel difference against every light and dark palette value and every `fixed` colour; `rgba()` by RGB distance plus the alpha difference against the rgba palette values; font sizes and radii by absolute difference to the nearest scale step. A tie means two steps are equally close.');
  L.push('');
  L.push('Counts: ' + rows.hex.length + ' hex, ' + rows.rgba.length + ' rgba, ' + rows.embedded.length + ' colours inside longer strings, ' + rows.fontSizes.length + ' font sizes, ' + rows.radii.length + ' radii.');
  L.push('');
  L.push('## Contents');
  L.push('1. Hex colours'); L.push('2. rgba colours'); L.push('3. Colours inside longer strings'); L.push('4. Font sizes'); L.push('5. Radii'); L.push('6. Spacing off the 4 px grid (summary)');
  L.push('');
  L.push('## 1. Hex colours');
  L.push('');
  const hexSorted = rows.hex.sort((a, b) => a.value.toUpperCase().localeCompare(b.value.toUpperCase()) || a.file.localeCompare(b.file) || a.line - b.line);
  tbl(['Location', 'Value', 'Nearest token', 'Gap (per channel)'], hexSorted.map((r) => { const n = nearestPalette(r.value); return [rel(r.file, r.line), '`' + r.value + '`', '`' + n.name + '` `' + n.value + '`', n.d]; }));
  L.push('## 2. rgba colours');
  L.push('');
  const rgbaSorted = rows.rgba.sort((a, b) => a.value.localeCompare(b.value) || a.file.localeCompare(b.file) || a.line - b.line);
  tbl(['Location', 'Value', 'Nearest rgba token', 'Distance'], rgbaSorted.map((r) => { const n = nearestRgba(r.value); return [rel(r.file, r.line), '`' + r.value + '`', n ? '`' + n.name + '` `' + n.value + '`' : 'none', n ? n.d : '']; }));
  L.push('## 3. Colours inside longer strings');
  L.push('');
  tbl(['Location', 'Value'], rows.embedded.map((r) => [rel(r.file, r.line), '`' + r.value + '`']));
  L.push('## 4. Font sizes');
  L.push('');
  L.push('Scale: ' + Object.entries(FONT).map(([k, v]) => k + ' ' + v).join(', ') + '.');
  L.push('');
  const why = (r) => (r.reason ? r.reason : r.tie ? 'tie between ' + r.nearest.k + ' (' + r.nearest.s + ') and ' + r.tie.k + ' (' + r.tie.s + ')' : 'more than 2 px from any step');
  tbl(['Location', 'Value', 'Nearest step', 'Distance', 'Why not changed'], rows.fontSizes.sort((a, b) => a.value - b.value || a.file.localeCompare(b.file) || a.line - b.line).map((r) => [rel(r.file, r.line), r.value, '`fontSizes.' + r.nearest.k + '` (' + r.nearest.s + ')', r.nearest.d, why(r)]));
  L.push('## 5. Radii');
  L.push('');
  L.push('Scale: ' + Object.entries(RAD).map(([k, v]) => k + ' ' + v).join(', ') + '.');
  L.push('');
  tbl(['Location', 'Value', 'Nearest step', 'Distance', 'Why not changed'], rows.radii.sort((a, b) => a.value - b.value || a.file.localeCompare(b.file) || a.line - b.line).map((r) => [rel(r.file, r.line), r.value, '`radii.' + r.nearest.k + '` (' + r.nearest.s + ')', r.nearest.d, why(r)]));
  L.push('## 6. Spacing off the 4 px grid (summary)');
  L.push('');
  L.push('Spacing (`gap`, `padding*`, `margin*`) is not changed by the codemod in this phase. This is the count of values that are not multiples of 4, so you can decide whether to snap them. Scale: ' + Object.entries(obj(tok('spacing.ts'), 'spacing')).map(([k, v]) => k + ' ' + v).join(', ') + '.');
  L.push('');
  const sp = Object.entries(spacing).sort((a, b) => b[1].n - a[1].n);
  tbl(['Value', 'Uses', 'Files', 'Nearest 4 px steps'], sp.map(([v, o]) => { const x = +v; const lo = Math.floor(x / 4) * 4, hi = lo + 4; return [v, o.n, o.files.size, x - lo === hi - x ? lo + ' or ' + hi + ' (tie)' : (x - lo < hi - x ? lo : hi)]; }));
  fs.writeFileSync('docs/tokens-review.md', L.join('\n'));
  console.log('wrote docs/tokens-review.md', Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.length])));
}
