#!/usr/bin/env node
/*
 * Finds hand-built card containers and, with --write, swaps the ones that match a Card variant exactly for <Card>.
 *
 *   node scripts/codemods/card-matches.js            report only
 *   node scripts/codemods/card-matches.js --write    replace the exact matches, then print the rest (also written to docs/card-review.md)
 *
 * A container is a <View style={...}> whose style is an object (or an array whose first item is an object followed only by
 * cardShadow(isDark) or other style values that stay as the `style` prop) with backgroundColor c.surface and no other key than
 * borderRadius, padding and gap. It is an exact match when radius, padding and gap equal a variant of src/design-system/primitives/Card.tsx
 * (default 28 / 20 / none, compact 24 / 18 / 10). Anything else (other keys, other numbers) is listed, not changed.
 */
const fs = require('fs'); const path = require('path'); const ts = require('typescript');
const WRITE = process.argv.includes('--write');
const RAD = { xs: 4, sm: 12, md: 18, lg: 22, xl: 28, pill: 999 };
const VARIANTS = { default: { r: 28, p: 20, g: undefined }, compact: { r: 24, p: 18, g: 10 } };
function* walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) yield* walk(p); else if (/\.tsx$/.test(e.name)) yield p.split(path.sep).join('/'); } }
const num = (n, sf) => { if (!n) return undefined; if (ts.isNumericLiteral(n)) return Number(n.text); const t = n.getText(sf); let m = t.match(/^radii\.(\w+)$/); if (m && RAD[m[1]] !== undefined) return RAD[m[1]]; m = t.match(/^radius\.(\w+)$/); if (m) return { sm: 14, md: 20, lg: 28, pill: 999 }[m[1]]; return NaN; };
const isSurface = (n, sf) => n && n.getText(sf) === 'c.surface';
const isShadowCall = (n, sf) => /^cardShadow\(\s*isDark\s*\)$/.test(n.getText(sf));
const matched = [], rest = [];
for (const file of walk('src')) {
  if (file.startsWith('src/design-system/')) continue;
  let text = fs.readFileSync(file, 'utf8'); const crlf = text.includes('\r\n'); text = text.split('\r\n').join('\n');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  (function visit(n) {
    if ((ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n))) {
      const open = ts.isJsxElement(n) ? n.openingElement : n;
      if (open.tagName.getText(sf) === 'View') {
        const attr = open.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === 'style');
        if (attr && attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
          let e = attr.initializer.expression; let extras = [];
          if (ts.isArrayLiteralExpression(e)) { const [first, ...others] = e.elements; extras = others; e = first; }
          if (e && ts.isObjectLiteralExpression(e)) {
            const props = Object.fromEntries(e.properties.filter(ts.isPropertyAssignment).map((p) => [p.name.getText(sf), p.initializer]));
            const keys = Object.keys(props); const line = sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
            if (isSurface(props.backgroundColor, sf) && 'borderRadius' in props) {
              const r = num(props.borderRadius, sf), p = num(props.padding, sf), g = props.gap ? num(props.gap, sf) : undefined;
              const only = keys.every((k) => ['backgroundColor', 'borderRadius', 'padding', 'gap'].includes(k)) && e.properties.every(ts.isPropertyAssignment);
              const v = Object.entries(VARIANTS).find(([, s]) => s.r === r && s.p === p && s.g === g);
              const shadowOk = extras.filter((x) => isShadowCall(x, sf)).length <= 1;
              const styleExtras = extras.filter((x) => !isShadowCall(x, sf));
              if (only && v && shadowOk && ts.isJsxElement(n)) {
                matched.push({ file, line, variant: v[0] });
                const closing = n.closingElement;
                const styleProp = styleExtras.length ? ' style={' + (styleExtras.length === 1 ? styleExtras[0].getText(sf) : '[' + styleExtras.map((x) => x.getText(sf)).join(', ') + ']') + '}' : '';
                const others = open.attributes.properties.filter((a) => a !== attr).map((a) => a.getText(sf)).join(' ');
                edits.push({ s: open.getStart(sf), e: open.getEnd(), t: '<Card' + (v[0] === 'default' ? '' : ' variant="' + v[0] + '"') + (props.gap && v[1].g !== g ? ' gap={' + props.gap.getText(sf) + '}' : '') + (others ? ' ' + others : '') + styleProp + '>' });
                edits.push({ s: closing.getStart(sf), e: closing.getEnd(), t: '</Card>' });
              } else rest.push({ file, line, r, p, g, keys: keys.join(', '), why: !only ? 'other style keys' : !v ? 'radius/padding not a variant' : 'other' });
            }
          }
        }
      }
    }
    ts.forEachChild(n, visit);
  })(sf);
  if (WRITE && edits.length) {
    let t = text; for (const x of edits.sort((a, b) => b.s - a.s)) t = t.slice(0, x.s) + x.t + t.slice(x.e);
    if (!/import\s*\{[^}]*\bCard\b[^}]*\}\s*from/.test(t)) {
      const imps = [...t.matchAll(/^import .*$/gm)]; const last = imps[imps.length - 1];
      const line = "import { Card } from '@/design-system/primitives/Card';";
      t = last ? t.slice(0, last.index + last[0].length) + '\n' + line + t.slice(last.index + last[0].length) : line + '\n' + t;
    }
    fs.writeFileSync(file, crlf ? t.split('\n').join('\r\n') : t);
  }
}
console.log((WRITE ? 'replaced ' : 'would replace ') + matched.length + ' containers with <Card>');
matched.forEach((m) => console.log('  ' + m.file + ':' + m.line + ' ' + m.variant));
console.log(rest.length + ' hand-built surface containers left as they are');
if (WRITE) {
  const L = ['# Card review', '', 'Hand-built white containers (`<View style={{ backgroundColor: c.surface, borderRadius: ... }}>`) that were **not** replaced by `<Card>` because they do not match a Card variant exactly. Generated by `node scripts/codemods/card-matches.js --write`.', '', '| Location | Radius | Padding | Gap | Style keys | Why |', '|---|---|---|---|---|---|'];
  rest.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line).forEach((r) => L.push('| `' + r.file.replace(/^src\//, '') + ':' + r.line + '` | ' + (Number.isNaN(r.r) ? 'expression' : r.r) + ' | ' + (r.p === undefined ? '' : Number.isNaN(r.p) ? 'expression' : r.p) + ' | ' + (r.g === undefined ? '' : r.g) + ' | ' + r.keys + ' | ' + r.why + ' |'));
  fs.writeFileSync('docs/card-review.md', L.join('\n') + '\n');
}
