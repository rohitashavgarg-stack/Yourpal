#!/usr/bin/env node
/*
 * Phase 3 step 4: merge the three Stepper definitions into src/design-system/primitives/Stepper.tsx.
 *
 *   node scripts/codemods/step4-stepper.js
 *
 * - app/onboarding.tsx: local Stepper deleted, <Stepper ...> becomes <Stepper variant="card" ...>
 * - features/workout/SetRow.tsx: local Stepper deleted, <Stepper ...> becomes <Stepper variant="inline" ...>
 * - features/plans/parts.tsx: the exported Stepper becomes a thin preset (variant "row"), so existing imports keep working
 */
const fs = require('fs'); const ts = require('typescript');
function edit(file, fn) { let s = fs.readFileSync(file, 'utf8'); const crlf = s.includes('\r\n'); s = s.split('\r\n').join('\n'); s = fn(s); fs.writeFileSync(file, crlf ? s.split('\n').join('\r\n') : s); }
function remove(s, file, name) {
  const sf = ts.createSourceFile(file, s, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name && st.name.text === name) {
      let start = st.getStart(sf);
      const lines = s.slice(0, start).split('\n'); lines.pop();
      while (lines.length && /^\s*\/\//.test(lines[lines.length - 1])) lines.pop();
      start = lines.length ? lines.join('\n').length + 1 : 0;
      return s.slice(0, start) + s.slice(st.getEnd()).replace(/^\n/, '');
    }
  }
  throw new Error(name + ' not found in ' + file);
}
const addImport = (s, line) => { const imps = [...s.matchAll(/^import [^\n]*;$/gm)]; const last = imps[imps.length - 1]; return s.slice(0, last.index + last[0].length) + '\n' + line + s.slice(last.index + last[0].length); };
const IMP = "import { Stepper } from '@/design-system/primitives/Stepper';";
let n = 0;
// the onboarding Stepper has no call site left in the app: its definition is deleted and the look lives on as the primitive's "card" variant
edit('src/app/onboarding.tsx', (s) => { s = remove(s, 'src/app/onboarding.tsx', 'Stepper'); let k = 0; s = s.replace(/<Stepper /g, () => { k++; n++; return '<Stepper variant="card" '; }); return k ? addImport(s, IMP) : s; });
edit('src/features/workout/SetRow.tsx', (s) => { s = remove(s, 'src/features/workout/SetRow.tsx', 'Stepper'); s = s.replace(/<Stepper(\s)/g, (m, ws) => { n++; return '<Stepper variant="inline"' + ws; }); return addImport(s, IMP); });
edit('src/features/plans/parts.tsx', (s) => {
  s = remove(s, 'src/features/plans/parts.tsx', 'Stepper');
  s = addImport(s, "import { Stepper as DSStepper, StepperProps } from '@/design-system/primitives/Stepper';");
  s += "\n// The stepper moved to src/design-system/primitives/Stepper.tsx. This is its \"row\" variant, kept under the old name for the plans screens.\nexport function Stepper(props: Omit<Extract<StepperProps, { variant: 'row' }>, 'variant'>) { return <DSStepper variant=\"row\" {...props} />; }\n";
  return s;
});
console.log('updated ' + n + ' call sites');
