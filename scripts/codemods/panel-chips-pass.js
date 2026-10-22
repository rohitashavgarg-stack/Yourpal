#!/usr/bin/env node
/* One-off: the demo panel's Dropdown shows its options as chips right away (no collapsed row, no chevron). Also tidies a comment in the meals card. */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }

edit('src/web/ControlParts.tsx', (s) => {
  const a = s.indexOf('// A row that shows the chosen value and opens its options right under it');
  const b = s.indexOf('\n}\n', s.indexOf('export function Dropdown', a)) + 3;
  if (a < 0 || b < a) throw new Error('dropdown block');
  return s.slice(0, a) + `// A labelled row of chips: every option is visible at once and the chosen one is filled. (It used to collapse into a dropdown; the name is kept so the panel code did not change.)
export function Dropdown({ label, options, value, onPick, placeholder }: { label: string; options: string[]; value: string; onPick: (v: string) => void; placeholder?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text numberOfLines={1} accessibilityRole="header" style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, color: P.muted, paddingHorizontal: 2 }}>{placeholder && !value ? \`\${label}: \${placeholder}\` : label}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {options.map((o) => {
          const on = o === value;
          return (
            <Pressable key={o} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => onPick(o)}
              style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: on ? P.ink : P.chip, backgroundColor: on ? P.ink : 'transparent', justifyContent: 'center' }}>
              <Text style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, color: on ? fixed.white : P.ink }}>{o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
` + s.slice(b);
});

edit('src/design-system/patterns/MealsCard.tsx', (s) => s.replace(/\/\/ The small filled pill after the meal name:[^\n]*\n/, '// The small filled pill after the meal name: the time (text only), "Logged 7:10 am" in soft green once it is logged, or "Skipped".\n'));
console.log('panel chips pass done');
