#!/usr/bin/env node
/* One-off: the log sheet and the Plans diet card use the AmountStepper primitive (outlined pill, small solid round buttons). */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) throw new Error('unchanged ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const addImport = (s) => s.replace(/(\nimport [^\n]*\n)(?![\s\S]*\nimport )/, "$1import { AmountStepper } from '@/design-system/primitives/AmountStepper';\n");

edit('src/features/today/LogMealsSheet.tsx', (s) => {
  const a = s.indexOf("                  <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 2, height: 38");
  const b = s.indexOf('                  </View>\n', a) + '                  </View>\n'.length;
  if (a < 0 || b < a) throw new Error('sheet stepper');
  s = s.slice(0, a) + "                  <AmountStepper text={fmtQty(cur, qty.unit)} unit={qty.unit} onLess={() => to(cur - step)} onMore={() => to(cur + step)} lessDisabled={cur <= step} moreDisabled={cur >= max} />\n" + s.slice(b);
  // the old local button helper is no longer used
  const c = s.indexOf('  const stepBtn = (label: string');
  if (c >= 0) { const d = s.indexOf('  );\n', c) + '  );\n'.length; s = s.slice(0, c) + s.slice(d); }
  return addImport(s);
});

edit('src/features/plans/DietPlan.tsx', (s) => {
  const a = s.indexOf('  const b = (label: string, on: () => void, off: boolean, icon: React.ReactNode) => (');
  const b = s.indexOf("      {changed && <View accessibilityLabel=\"Changed from plan\"", a);
  if (a < 0 || b < a) throw new Error('diet stepper');
  s = s.slice(0, a) + `  return (
    <View style={{ alignSelf: 'flex-start' }}>
      <AmountStepper text={text} unit={qty.unit} onLess={() => go(cur - step)} onMore={() => go(cur + step)} lessDisabled={cur <= step} moreDisabled={cur >= max}
        accessibilityLabel={\`Amount \${text}\${changed ? ', changed from plan' : ''}. Hold for units and reset\`}
        onLongPress={() => { haptic.medium(); openSheet(<QtySheet mid={mid} itemKey={it.key} />, { label: 'Change amount' }); }} />
` + s.slice(b);
  return addImport(s);
});
console.log('amount stepper pass done');
