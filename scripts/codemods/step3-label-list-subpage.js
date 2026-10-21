#!/usr/bin/env node
/*
 * Phase 3 step 3: merge Label, ListCard and SubPage into the primitives
 * (src/design-system/primitives/SectionLabel.tsx, ListCard.tsx, SubPage.tsx).
 *
 *   node scripts/codemods/step3-label-list-subpage.js
 *
 * - The local Label components in coach.tsx, goal-detail.tsx and streaks.tsx are deleted and their <Label> call sites become <SectionLabel variant=...>.
 * - The Label, ListCard and SubPage in features/shell/parts.tsx and features/progress/parts.tsx become re-exports (shell) or a thin preset
 *   (progress SubPage = variant "progress"), so every old import path keeps working.
 * - The local ListCard in features/plans/WorkoutPlan.tsx is deleted and the primitive is imported.
 */
const fs = require('fs'); const ts = require('typescript');
function edit(file, fn) { let s = fs.readFileSync(file, 'utf8'); const crlf = s.includes('\r\n'); s = s.split('\r\n').join('\n'); s = fn(s); fs.writeFileSync(file, crlf ? s.split('\n').join('\r\n') : s); }
function remove(s, file, name) { // delete a top-level function or const declaration by name (with the comment lines directly above it)
  const sf = ts.createSourceFile(file, s, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const st of sf.statements) {
    const isFn = ts.isFunctionDeclaration(st) && st.name && st.name.text === name;
    const isVar = ts.isVariableStatement(st) && st.declarationList.declarations.some((d) => ts.isIdentifier(d.name) && d.name.text === name);
    if (isFn || isVar) {
      let start = st.getStart(sf);
      const before = s.slice(0, start); const lines = before.split('\n'); lines.pop();
      while (lines.length && /^\s*\/\//.test(lines[lines.length - 1])) lines.pop();
      start = lines.length ? lines.join('\n').length + 1 : 0;
      return s.slice(0, start) + s.slice(st.getEnd()).replace(/^\n/, '');
    }
  }
  throw new Error(name + ' not found in ' + file);
}
const addImport = (s, line) => { const imps = [...s.matchAll(/^import [^\n]*;$/gm)]; const last = imps[imps.length - 1]; return s.slice(0, last.index + last[0].length) + '\n' + line + s.slice(last.index + last[0].length); };
const IMP_LABEL = "import { SectionLabel } from '@/design-system/primitives/SectionLabel';";

// ----- Label call sites -----
for (const [file, open] of [['src/app/coach.tsx', '<SectionLabel variant="overline">'], ['src/app/progress/streaks.tsx', '<SectionLabel variant="overline" inset={4}>'], ['src/app/goal-detail.tsx', '<SectionLabel variant="quiet">']]) {
  edit(file, (s) => { s = remove(s, file, 'Label'); s = s.split('<Label>').join(open).split('</Label>').join('</SectionLabel>'); return addImport(s, IMP_LABEL); });
}
// ----- shell/parts.tsx -----
edit('src/features/shell/parts.tsx', (s) => {
  const f = 'src/features/shell/parts.tsx';
  s = remove(s, f, 'Label'); s = remove(s, f, 'ListCard'); s = remove(s, f, 'SubPage'); s = remove(s, f, 'goBack');
  s = addImport(s, "import { goBack, SubPage } from '@/design-system/primitives/SubPage';\nimport { ListCard } from '@/design-system/primitives/ListCard';\nimport { SectionLabel as Label } from '@/design-system/primitives/SectionLabel';");
  s += "\n// These three moved to src/design-system/primitives/ (SubPage, ListCard, SectionLabel). Re-exported here so every existing import keeps working.\nexport { goBack, SubPage, ListCard, Label };\n";
  return s;
});
// ----- progress/parts.tsx -----
edit('src/features/progress/parts.tsx', (s) => {
  const f = 'src/features/progress/parts.tsx';
  s = remove(s, f, 'SubPage'); s = remove(s, f, 'ListCard');
  s = addImport(s, "import { SubPage as DSSubPage, SubPageProps } from '@/design-system/primitives/SubPage';\nimport { ListCard } from '@/design-system/primitives/ListCard';");
  s += "\n// SubPage and ListCard moved to src/design-system/primitives/. The Progress, Gym and Goal pages use the \"progress\" layout of SubPage.\nexport function SubPage(props: Omit<SubPageProps, 'variant' | 'close' | 'gap'>) { return <DSSubPage variant=\"progress\" {...props} />; }\nexport { ListCard };\n";
  return s;
});
// ----- WorkoutPlan.tsx -----
edit('src/features/plans/WorkoutPlan.tsx', (s) => { s = remove(s, 'src/features/plans/WorkoutPlan.tsx', 'ListCard'); return addImport(s, "import { ListCard } from '@/design-system/primitives/ListCard';"); });
console.log('done');
