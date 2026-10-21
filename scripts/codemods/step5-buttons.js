#!/usr/bin/env node
/* Phase 3 part 2b, buttons: replaces the Button, PillBtn, RoundBtn, StepBtn definitions and the workout card's Btn and SmallBtn
 * with the Button and IconButton primitives (wrappers keep the old names). */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED', p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const cut = (s, a, b, repl) => { const i = s.indexOf(a); if (i < 0) throw new Error('missing ' + a.slice(0, 40)); const j = s.indexOf(b, i); if (j < 0) throw new Error('missing end ' + b.slice(0, 40)); return s.slice(0, i) + repl + s.slice(j); };

edit('src/components/ui.tsx', (s) => cut(s, 'type BtnKind', '// ---------- Card', "export { Button, IconButton } from '@/design-system/primitives/Button';\nexport type { ButtonProps, ButtonKind, ButtonSize, IconButtonProps } from '@/design-system/primitives/Button';\n\n"));

edit('src/components/bits.tsx', (s) => {
  s = cut(s, '// ---------- Small black pill button ----------', '// ---------- Soft ring', [
    '// ---------- Small black pill button ----------',
    '// The Button primitive with size="compact". Kept under its old name.',
    "const PILL_KIND = { ink: 'primary', white: 'white', soft: 'secondary' } as const;",
    "export function PillBtn({ label, onPress, tone = 'ink', icon, style, h = 36 }: { label: string; onPress?: () => void; tone?: 'ink' | 'white' | 'soft'; icon?: React.ReactNode; style?: StyleProp<ViewStyle>; h?: number }) {",
    '  return <Button size="compact" height={h} kind={PILL_KIND[tone]} label={label} onPress={onPress} icon={icon} style={style} />;',
    '}',
    '',
    ''].join('\n'));
  const i0 = s.indexOf('// Close / back button for full-screen pages.'); const j0 = s.indexOf('\n}\n', i0) + 3;
  s = s.slice(0, i0) + '// Close / back button for full-screen pages. The IconButton primitive under its old name.\nexport function RoundBtn(props: IconButtonProps) { return <IconButton {...props} />; }\n' + s.slice(j0);
  s = s.replace("import { Pressy } from './ui';", "import { Pressy } from './ui';\nimport { Button, IconButton, IconButtonProps } from '@/design-system/primitives/Button';");
  return s;
});

edit('src/features/progress/parts.tsx', (s) => cut(s, '// ---------- Round', '// ---------- Horizontal shake', [
  '// ---------- Round − / + stepper button ----------',
  "export function StepBtn({ label, sign, onPress }: { label: string; sign: '−' | '+'; onPress: () => void }) {",
  '  return <IconButton label={label} onPress={onPress} scaleTo={0.9}><Txt style={{ fontSize: fontSizes.xl, fontFamily: font.medium }}>{sign}</Txt></IconButton>;',
  '}',
  '',
  ''].join('\n')).replace(/(\nimport [^\n]*\n)(?![\s\S]*\nimport )/, "$1import { IconButton } from '@/design-system/primitives/Button';\n"));

edit('src/features/today/WorkoutCard.tsx', (s) => {
  s = cut(s, 'const Btn = (', 'const LiveDot', [
    '// The two buttons on the dark workout card are the Button primitive: white pill (medium) and the small white or glass pill (tight).',
    "const Btn = ({ label, onPress }: { label: string; onPress: () => void }) => <Button kind=\"white\" size=\"medium\" label={label} onPress={onPress} />;",
    "const SmallBtn = ({ label, onPress, solid = false }: { label: string; onPress: () => void; solid?: boolean }) => <Button kind={solid ? 'white' : 'glass'} size=\"tight\" label={label} onPress={onPress} />;",
    ''].join('\n'));
  return s.replace(/(\nimport [^\n]*\n)(?![\s\S]*\nimport )/, "$1import { Button } from '@/design-system/primitives/Button';\n");
});
console.log('ok');
