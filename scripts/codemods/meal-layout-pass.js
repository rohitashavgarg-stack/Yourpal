#!/usr/bin/env node
/* One-off: fixes the pill label, puts the pill after the meal name, and lists the foods one per line (name left, amount right). */
const fs = require('fs');
const p = 'src/design-system/patterns/MealsCard.tsx';
let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 80)); s = s.replace(a, b); };

rep("const label = logged ? .trim() : skipped ? 'Skipped' : time;", "const label = logged ? ('Logged ' + (loggedAt ?? '')).trim() : skipped ? 'Skipped' : time;");
rep('// The small filled pill in front of the meal name:', '// The small filled pill after the meal name:');

// swap the sides: name first, pill after
const i = s.indexOf('          <StatusPill status={meal.status} time={meal.meta.time} loggedAt={meal.loggedAt} />\n');
const j = s.indexOf('          <Txt style={{ flexShrink: 1, fontFamily: font.semibold, fontSize: fontSizes.xl');
const k = s.indexOf('\n', j) + 1;
if (i < 0 || j < 0 || j < i) throw new Error('header order');
const pillLine = s.slice(i, j); const nameLine = s.slice(j, k);
s = s.slice(0, i) + nameLine + pillLine + s.slice(k);

// the foods: one per line, name on the left, amount on the right, no icon in front of the whole list
const a = s.indexOf('        <View accessible accessibilityLabel={`${meal.name}: ${line}`}');
const b = s.indexOf('        <Button kind={meal.status');
if (a < 0 || b < 0) throw new Error('foods block');
s = s.slice(0, a) + `        <View accessible accessibilityLabel={\`\${meal.name}: \${line}\`} style={{ paddingHorizontal: 4 }}>
          {rows.map((r, k) => (
            <Row key={k} style={{ gap: 10, minHeight: 40, borderTopWidth: k ? 1 : 0, borderTopColor: c.line }}>
              <FoodMark type={r.type} />
              <Txt numberOfLines={1} style={{ flex: 1, fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 22, color: meal.skipped ? c.muted : c.ink, textDecorationLine: meal.skipped ? 'line-through' : 'none' }}>{r.name}</Txt>
              {meal.status === 'partial' && r.eaten && <Check size={14} strokeWidth={3} color={c.good} />}
              {!!r.amount && <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, color: c.muted }}>{r.amount}</Txt>}
            </Row>
          ))}
        </View>
` + s.slice(b);
rep("  const line = [...meal.items.map((it) => (it.amount ? it.amount + ' ' : '') + it.name), ...meal.extras.map((e) => e.name)].join(', ');",
  "  const rows = [...meal.items.map((it) => ({ name: it.name, amount: it.amount, type: it.type, eaten: it.eaten })), ...meal.extras.map((e) => ({ name: e.name, amount: e.est ? 'estimated' : '', type: e.type ?? ('veg' as FoodType), eaten: true }))];\n  const line = rows.map((r) => (r.amount ? r.amount + ' ' : '') + r.name).join(', ');");
fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('layout pass done');
