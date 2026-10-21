#!/usr/bin/env node
/*
 * Replaces every fade-in wrapper with the one FadeIn primitive (src/design-system/primitives/FadeIn.tsx).
 *
 *   node scripts/codemods/fade-in.js          report only
 *   node scripts/codemods/fade-in.js --write
 *
 * 1. The four local wrappers (const E / const Enter = ({ i, children }) => <Animated.View entering={fade(i * 40)}>) are deleted and
 *    their <E i={..}> / <Enter i={..}> call sites become <FadeIn i={..}>.
 * 2. Every <Animated.View entering={fade(X)} ...> becomes <FadeIn delay={X} ...> (the other props pass through unchanged).
 *    entering={fade()} becomes plain <FadeIn>.
 * 3. The import of FadeIn is added; `fade` and the default `Animated` import are dropped from a file only when nothing else uses them.
 * Elements whose entering animation is not fade(...) are left alone.
 */
const fs = require('fs'); const path = require('path'); const ts = require('typescript');
const WRITE = process.argv.includes('--write');
function* walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) yield* walk(p); else if (/\.tsx$/.test(e.name)) yield p.split(path.sep).join('/'); } }
let wrappers = 0, direct = 0, files = 0;
for (const file of walk('src')) {
  if (file.startsWith('src/design-system/')) continue;
  let text = fs.readFileSync(file, 'utf8'); const crlf = text.includes('\r\n'); text = text.split('\r\n').join('\n');
  if (!/entering=\{fade\(|const (E|Enter) = /.test(text)) continue;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = []; const localNames = new Map(); let stepMatch;
  // 1. local wrapper definitions
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st) && st.declarationList.declarations.length === 1) {
      const d = st.declarationList.declarations[0];
      if (ts.isIdentifier(d.name) && ['E', 'Enter'].includes(d.name.text) && d.initializer && ts.isArrowFunction(d.initializer) && (stepMatch = d.initializer.body.getText(sf).replace(/\s+/g, ' ').trim().match(/^\(?\s*<Animated\.View entering=\{fade\(i \* (\d+)\)\}>\s*\{children\}\s*<\/Animated\.View>\s*\)?$/))) {
        localNames.set(d.name.text, +stepMatch[1]); edits.push({ s: st.getFullStart(), e: st.getEnd(), t: '' }); wrappers++;
      }
    }
  }
  const dead = edits.filter((x) => x.t === '').map((x) => [x.s, x.e]); // the removed wrapper definitions: do not edit inside them
  (function visit(n) {
    if (dead.some(([s0, e0]) => n.getStart(sf) >= s0 && n.getEnd() <= e0)) return;
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = n.tagName.getText(sf);
      if (localNames.has(tag)) {
        edits.push({ s: n.tagName.getStart(sf), e: n.tagName.getEnd(), t: 'FadeIn' + (localNames.get(tag) !== 40 ? ' step={' + localNames.get(tag) + '}' : '') });
        if (ts.isJsxOpeningElement(n)) { const el = n.parent; edits.push({ s: el.closingElement.tagName.getStart(sf), e: el.closingElement.tagName.getEnd(), t: 'FadeIn' }); }
      } else if (tag === 'Animated.View') {
        const attr = n.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === 'entering');
        const ex = attr && attr.initializer && ts.isJsxExpression(attr.initializer) ? attr.initializer.expression : null;
        if (ex && ts.isCallExpression(ex) && ex.expression.getText(sf) === 'fade' && ex.arguments.length <= 1) {
          edits.push({ s: n.tagName.getStart(sf), e: n.tagName.getEnd(), t: 'FadeIn' });
          if (ts.isJsxOpeningElement(n)) { const el = n.parent; edits.push({ s: el.closingElement.tagName.getStart(sf), e: el.closingElement.tagName.getEnd(), t: 'FadeIn' }); }
          // drop the attribute and its leading space, add delay={X}
          const s0 = attr.getFullStart();
          edits.push({ s: s0, e: attr.getEnd(), t: ex.arguments.length ? ' delay={' + ex.arguments[0].getText(sf) + '}' : '' });
          direct++;
        }
      }
    }
    ts.forEachChild(n, visit);
  })(sf);
  if (!edits.length) continue;
  files++;
  if (!WRITE) continue;
  let t = text; for (const x of edits.sort((a, b) => b.s - a.s)) t = t.slice(0, x.s) + x.t + t.slice(x.e);
  // imports
  const uses = (name, src) => new RegExp('(^|[^\\w.$])' + name + '(?![\\w$])', 'm').test(src.split('\n').filter((l) => !/^\s*import\b/.test(l)).join('\n'));
  if (!uses('fade', t)) { t = t.replace(/^import \{\s*fade\s*\} from '[^']+';\n/m, '').replace(/^(import \{[^}]*?)\bfade,\s*/m, '$1').replace(/^(import \{[^}]*?),\s*fade\s*(\} from)/m, '$1 $2'); }
  if (!/\bAnimated\./.test(t)) { t = t.replace(/^import Animated from 'react-native-reanimated';\n/m, '').replace(/^import Animated,\s*\{/m, 'import {'); }
  const imps = [...t.matchAll(/^import [^\n]*;$/gm)]; const last = imps[imps.length - 1];
  const line = "import { FadeIn } from '@/design-system/primitives/FadeIn';";
  t = last ? t.slice(0, last.index + last[0].length) + '\n' + line + t.slice(last.index + last[0].length) : line + '\n' + t;
  fs.writeFileSync(file, crlf ? t.split('\n').join('\r\n') : t);
}
console.log((WRITE ? 'changed ' : 'would change ') + wrappers + ' wrapper definitions and ' + direct + ' direct fade() elements in ' + files + ' files');
