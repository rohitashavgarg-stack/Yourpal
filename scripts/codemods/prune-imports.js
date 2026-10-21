#!/usr/bin/env node
// Removes import names that nothing in the file uses any more (never React, never side-effect imports).
//   node scripts/codemods/prune-imports.js src/features/shell/parts.tsx src/features/progress/parts.tsx
const fs = require('fs'); const ts = require('typescript');
for (const file of process.argv.slice(2)) {
  let text = fs.readFileSync(file, 'utf8'); const crlf = text.includes('\r\n'); text = text.split('\r\n').join('\n');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const used = new Set();
  (function walk(n) { if (ts.isImportDeclaration(n)) return; if (ts.isIdentifier(n)) used.add(n.text); ts.forEachChild(n, walk); })(sf);
  const edits = []; let removed = 0;
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause) continue;
    const ic = st.importClause; const keepDefault = !ic.name || ic.name.text === 'React' || used.has(ic.name.text);
    const nb = ic.namedBindings; let names = [];
    if (nb && ts.isNamedImports(nb)) names = nb.elements.filter((e) => used.has(e.name.text) || e.name.text === 'React');
    const nsKeep = nb && ts.isNamespaceImport(nb) ? used.has(nb.name.text) : true;
    const total = (ic.name ? 1 : 0) + (nb && ts.isNamedImports(nb) ? nb.elements.length : 0);
    const kept = (ic.name && keepDefault ? 1 : 0) + names.length;
    if (nb && ts.isNamedImports(nb) && kept === total) continue;
    if (!nb || ts.isNamedImports(nb)) {
      removed += total - kept;
      const def = ic.name && keepDefault ? ic.name.text : '';
      const named = names.length ? '{ ' + names.map((e) => e.getText(sf)).join(', ') + ' }' : '';
      const clause = [def, named].filter(Boolean).join(', ');
      edits.push({ s: st.getStart(sf), e: st.getEnd() + (clause ? 0 : 1), t: clause ? 'import ' + clause + " from " + st.moduleSpecifier.getText(sf) + ';' : '' });
    }
  }
  for (const x of edits.sort((a, b) => b.s - a.s)) text = text.slice(0, x.s) + x.t + text.slice(x.e);
  fs.writeFileSync(file, crlf ? text.split('\n').join('\r\n') : text);
  console.log(file + ': removed ' + removed + ' unused import names');
}
