#!/usr/bin/env node
/* Lists component names defined more than once in src, with JSX uses per definition.
 * A "use" is a <Name in the defining file, or in a file that imports Name from the defining file (re-exports followed one level). */
const ts = require('typescript'); const fs = require('fs'); const path = require('path');
const root = path.resolve('src'); const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== '_archive') walk(p); } else if (/\.tsx?$/.test(e.name)) files.push(p); } })(root);
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const src = new Map(files.map((f) => [f, ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, f.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)]));
const hasJsx = (n) => { let h = false; (function v(x) { if (h) return; if (ts.isJsxElement(x) || ts.isJsxSelfClosingElement(x) || ts.isJsxFragment(x)) { h = true; return; } ts.forEachChild(x, v); })(n); return h; };
const defs = new Map(); // name -> [{file,line}]
for (const [f, sf] of src) for (const st of sf.statements) {
  const add = (name, node) => { if (!/^[A-Z][a-z]/.test(name) && !/^[A-Z]$/.test(name)) return; (defs.get(name) || defs.set(name, []).get(name)).push({ file: f, line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1 }); };
  if (ts.isFunctionDeclaration(st) && st.name && hasJsx(st)) add(st.name.text, st);
  if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer) || ts.isCallExpression(d.initializer)) && hasJsx(d.initializer)) add(d.name.text, d);
}
const resolve = (from, spec) => { let b = spec.startsWith('@/') ? path.join(root, spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(from), spec) : null; if (!b) return null; for (const c of [b + '.tsx', b + '.ts', path.join(b, 'index.tsx'), path.join(b, 'index.ts'), b]) if (fs.existsSync(c) && fs.statSync(c).isFile()) return c; return null; };
const uses = (f, name) => { const m = fs.readFileSync(f, 'utf8').match(new RegExp('<' + name + '(?=[\\s/>.])', 'g')); return m ? m.length : 0; };
const imports = new Map(); // file -> [{name, from}]
for (const [f, sf] of src) { const l = []; for (const st of sf.statements) if (ts.isImportDeclaration(st) && st.importClause && st.importClause.namedBindings && ts.isNamedImports(st.importClause.namedBindings)) { const from = resolve(f, st.moduleSpecifier.text); for (const el of st.importClause.namedBindings.elements) l.push({ name: (el.propertyName || el.name).text, local: el.name.text, from }); } imports.set(f, l); }
const reexp = new Map(); for (const [f, sf] of src) for (const st of sf.statements) if (ts.isExportDeclaration(st) && st.moduleSpecifier) reexp.set(f, [...(reexp.get(f) || []), resolve(f, st.moduleSpecifier.text)]);
const out = [];
for (const [name, list] of defs) if (list.length > 1) {
  const sites = list.map((d) => { let n = uses(d.file, name); const defFiles = new Set([d.file]); for (const [rf, tgts] of reexp) if (tgts.includes(d.file)) defFiles.add(rf);
    for (const [f, imps] of imports) if (f !== d.file) for (const i of imps) if (i.name === name && i.from && defFiles.has(i.from)) n += uses(f, i.local); return { ...d, uses: n }; });
  out.push({ name, sites, total: sites.reduce((a, s) => a + s.uses, 0) });
}
out.sort((a, b) => b.total - a.total);
console.log(JSON.stringify(out.map((o) => ({ name: o.name, total: o.total, sites: o.sites.map((s) => rel(s.file) + ':' + s.line + ' x' + s.uses) })), null, 0).replace(/\},\{/g, '},\n{'));
console.error(out.length + ' names defined more than once');
