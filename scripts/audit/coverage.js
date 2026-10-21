#!/usr/bin/env node
/*
 * Coverage audit. Walks every route and the feature files it imports, and lists
 *   - the sheets opened from them (openSheet calls),
 *   - the edge cases registered with useScenarios,
 *   - the design-system components they use,
 *   - the hand-built elements: JSX with a style that makes it look like a button, chip, card, input, icon badge or bar.
 *
 *   node scripts/audit/coverage.js            prints a summary
 *   node scripts/audit/coverage.js --json     writes docs/coverage-data.json
 *
 * "Hand-built" is a heuristic on the style object of the element, see classify(). A hit is a candidate to replace with a library
 * component or to turn into one. Elements inside src/design-system/ are never reported.
 */
const ts = require('typescript'); const fs = require('fs'); const path = require('path');
const SRC = path.resolve('src');
const rel = (p) => path.relative(SRC, p).split(path.sep).join('/');
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== '_archive') walk(p); } else if (/\.tsx?$/.test(e.name)) files.push(p); } })(SRC);
const parsed = new Map();
const parse = (f) => { if (!parsed.has(f)) parsed.set(f, ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)); return parsed.get(f); };
const resolve = (from, spec) => { const b = spec.startsWith('@/') ? path.join(SRC, spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(from), spec) : null; if (!b) return null; for (const c of [b + '.tsx', b + '.ts', path.join(b, 'index.tsx'), path.join(b, 'index.ts')]) if (fs.existsSync(c)) return c; return null; };
const importsOf = (f) => { const out = []; for (const st of parse(f).statements) if (ts.isImportDeclaration(st)) { const r = resolve(f, st.moduleSpecifier.text); if (r) out.push(r); } return out; };

// ---- routes
const routes = files.filter((f) => rel(f).startsWith('app/') && !/_layout|dev-cards|\+not-found/.test(f)).map((f) => {
  let r = '/' + rel(f).replace(/^app\//, '').replace(/\.tsx$/, '').replace(/\(tabs\)\//, '').replace(/\/?index$/, '');
  if (r === '/') r = '/'; return { file: f, route: r === '' ? '/' : r };
});
routes.push({ file: path.join(SRC, 'app/_layout.tsx'), route: '(app shell)', shell: true });

// surface files: the route file plus the feature/component files it imports (two levels inside src/features and src/components), minus design-system
function surface(f) {
  const seen = new Set([f]); let frontier = [f];
  for (let depth = 0; depth < 2; depth++) {
    const next = [];
    for (const x of frontier) for (const i of importsOf(x)) {
      const r = rel(i);
      if (seen.has(i) || r.startsWith('design-system/') || r.startsWith('lib/') || r.startsWith('theme/') || r.startsWith('app/')) continue;
      if (/^(features|components)\//.test(r)) { seen.add(i); next.push(i); }
    }
    frontier = next;
  }
  return [...seen];
}

// ---- classify a JSX element by its style
const textOf = (n, sf) => n.getText(sf);
function styleText(el, sf) {
  const attrs = el.attributes.properties.filter((a) => ts.isJsxAttribute(a) && a.name.text === 'style');
  return attrs.length ? textOf(attrs[0], sf) : '';
}
const num = (s, key) => { const m = s.match(new RegExp('\\b' + key + ':\\s*(\\d+(?:\\.\\d+)?)')); return m ? +m[1] : null; };
function classify(tag, s) {
  if (!s) return null;
  const bg = /backgroundColor/.test(s), bw = /borderWidth/.test(s) || /borderColor/.test(s), br = /borderRadius/.test(s), pad = /padding/.test(s);
  const h = num(s, 'height'), mh = num(s, 'minHeight'), w = num(s, 'width');
  const press = /^(Pressy|Pressable|TouchableOpacity|Animated\.createAnimatedComponent)$/.test(tag);
  if (tag === 'TextInput') return 'input';
  if (press && br && (bg || bw) && (h || mh || /paddingVertical/.test(s))) return (h && w && h === w) || (h && h <= 48 && !/flex: 1/.test(s) && w) ? 'icon button' : 'button or pill';
  if ((tag === 'View' || tag === 'Animated.View') && br) {
    if (h && w && h === w && h <= 56 && (bg || bw)) return 'icon badge';
    if (h && h >= 20 && h <= 34 && (bw || bg) && /alignItems|justifyContent/.test(s) && !w) return 'chip';
    if (h && h <= 12 && bg) return 'bar';
    if (bg && pad && /radii\.(card|xl|lg|md)|borderRadius:\s*(1[2-9]|2\d)/.test(s) && !/position:\s*'absolute'/.test(s)) return 'card';
  }
  return null;
}

function scan(f) {
  const sf = parse(f); const hand = []; const ds = new Map(); const locals = [];
  const dsNames = new Set();
  for (const st of sf.statements) if (ts.isImportDeclaration(st) && st.importClause?.namedBindings && ts.isNamedImports(st.importClause.namedBindings)) {
    const m = st.moduleSpecifier.text;
    if (/design-system|components\/ui$|components\/Overlay$/.test(m)) for (const e of st.importClause.namedBindings.elements) dsNames.add(e.name.text);
  }
  (function v(n) {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = n.tagName.getText(sf);
      if (dsNames.has(tag)) ds.set(tag, (ds.get(tag) || 0) + 1);
      const k = classify(tag, styleText(n, sf));
      let top = n.parent; let fn = ''; while (top && top.parent && !ts.isSourceFile(top.parent)) top = top.parent; if (top && (ts.isFunctionDeclaration(top) || ts.isVariableStatement(top))) { fn = ts.isFunctionDeclaration(top) ? (top.name ? top.name.text : '') : top.declarationList.declarations[0].name.getText(sf); }
      if (k) hand.push({ kind: k, fn, line: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, tag, text: textOf(n, sf).replace(/\s+/g, ' ').slice(0, 110) });
    }
    ts.forEachChild(n, v);
  })(sf);
  return { hand, ds };
}

// ---- sheets and scenarios
function sheetsIn(f) {
  const sf = parse(f); const out = [];
  (function v(n) {
    if (ts.isCallExpression(n) && /openSheet$/.test(n.expression.getText(sf)) && n.arguments.length) {
      const a0 = n.arguments[0]; let comp = a0.getText(sf).replace(/\s+/g, ' ').slice(0, 60);
      const m = comp.match(/^<\s*([A-Za-z0-9_.]+)/); if (m) comp = m[1];
      const opts = n.arguments[1] ? n.arguments[1].getText(sf) : '';
      const lab = opts.match(/label:\s*['"`]([^'"`]+)/);
      let enc = n.parent; while (enc && !(ts.isFunctionDeclaration(enc) || ts.isVariableDeclaration(enc))) enc = enc.parent;
      out.push({ comp, label: lab ? lab[1] : '', line: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, in: enc && enc.name ? enc.name.getText(sf) : '' });
    }
    ts.forEachChild(n, v);
  })(sf);
  return out;
}
function scenariosIn(f) {
  const sf = parse(f); const out = [];
  (function v(n) {
    if (ts.isCallExpression(n) && n.expression.getText(sf) === 'useScenarios') {
      const t = n.getText(sf);
      const title = (t.match(/title:\s*['"`]([^'"`]+)/) || [])[1] || '';
      const rows = [...t.matchAll(/label:\s*['"`]([^'"`]+)['"`],\s*options:\s*\[([^\]]*)\]/g)].map((m) => m[1] + ': ' + m[2].replace(/['"`]/g, '').replace(/\s+/g, ' '));
      const acts = [...t.matchAll(/label:\s*['"`]([^'"`]+)['"`],\s*run/g)].map((m) => m[1]);
      out.push({ title, rows, actions: acts });
    }
    ts.forEachChild(n, v);
  })(sf);
  return out;
}
// where each route is navigated to from
const reach = new Map();
for (const f of files) {
  const sf = parse(f);
  (function v(n) {
    if (ts.isCallExpression(n)) {
      const t = n.expression.getText(sf);
      if (/router\.(push|navigate|replace)$/.test(t) && n.arguments.length) {
        const a = n.arguments[0].getText(sf); const m = a.match(/['"`](\/[a-zA-Z0-9/_-]*)/);
        if (m) { const k = m[1].replace(/\/$/, '') || '/'; (reach.get(k) || reach.set(k, new Set()).get(k)).add(rel(f)); }
      }
    }
    if (ts.isJsxAttribute(n) && n.name.text === 'href') { const m = n.initializer && n.initializer.getText(sf).match(/['"`](\/[a-zA-Z0-9/_-]*)/); if (m) { const k = m[1].replace(/\/$/, '') || '/'; (reach.get(k) || reach.set(k, new Set()).get(k)).add(rel(f)); } }
    ts.forEachChild(n, v);
  })(sf);
}

// ---- ownership: a file belongs to the one route that reaches it; files reached by several routes are "shared"
const closure = routes.map((r) => ({ r, fs: r.shell ? [r.file] : surface(r.file) }));
const reachCount = new Map(); closure.forEach((c) => c.fs.forEach((f) => { if (f !== c.r.file) reachCount.set(f, (reachCount.get(f) || 0) + 1); }));
const owned = (c) => c.fs.filter((f) => f === c.r.file || reachCount.get(f) === 1);
const sharedFiles = [...reachCount.entries()].filter(([, n]) => n > 1).map(([f]) => f);
const fileModel = (f) => ({ file: rel(f), ...(() => { const a = scan(f); return { hand: a.hand.map((h) => ({ ...h, file: rel(f) })), ds: Object.fromEntries(a.ds) }; })(), sheets: sheetsIn(f).map((x) => ({ ...x, file: rel(f) })), scenarios: scenariosIn(f).map((x) => ({ ...x, file: rel(f) })) });
const model = closure.map((c) => {
  const per = owned(c).map(fileModel);
  return { route: c.r.route, file: rel(c.r.file), files: per.map((p) => p.file), hand: per.flatMap((p) => p.hand), ds: per.reduce((a, p) => { for (const k in p.ds) a[k] = (a[k] || 0) + p.ds[k]; return a; }, {}), sheets: per.flatMap((p) => p.sheets), scenarios: per.flatMap((p) => p.scenarios), reachedFrom: [...(reach.get(c.r.route) || [])] };
});
const covered = new Set(closure.flatMap((c) => c.fs)); const orphan = files.filter((f) => !covered.has(f) && /^(features|components|web)/.test(rel(f)));
const shared = [...sharedFiles, ...orphan].map(fileModel).filter((m) => m.hand.length || m.sheets.length);
if (process.argv.includes('--json')) { fs.writeFileSync('docs/coverage-data.json', JSON.stringify({ routes: model, shared }, null, 1)); }
const total = model.reduce((a, m) => a + m.hand.length, 0) + shared.reduce((a, m) => a + m.hand.length, 0);
console.log(model.length + ' routes, ' + shared.length + ' shared files, ' + total + ' hand-built candidates (unique)');
for (const m of model) console.log(m.route.padEnd(26), String(m.hand.length).padStart(4), 'hand', String(m.sheets.length).padStart(3), 'sheets');
for (const m of shared) console.log('shared', m.file.padEnd(40), String(m.hand.length).padStart(4), 'hand', String(m.sheets.length).padStart(3), 'sheets');
