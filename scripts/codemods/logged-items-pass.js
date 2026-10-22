#!/usr/bin/env node
/* One-off: the meals card is in the logged state as soon as any item is logged; items not eaten are struck through; eaten items get a green check badge. */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 90)); return s.replace(a, b); };

edit('src/features/today/MealsCard.tsx', (s) => rep(s, "status: x.skip ? 'skipped' : v.full ? 'logged' : v.any ? 'partial' : 'todo',", "status: x.skip ? 'skipped' : v.any ? 'logged' : 'todo',"));

edit('src/design-system/patterns/MealsCard.tsx', (s) => {
  s = rep(s, "  /** todo: nothing logged. partial: some foods logged. logged: all of them (the card shows when, and \"Edit log\"). skipped. */\n  status: 'todo' | 'partial' | 'logged' | 'skipped';",
    "  /** todo: nothing logged. logged: at least one food is logged (the card shows when, and \"Edit log\"; the foods not eaten are struck through). skipped: the whole meal. */\n  status: 'todo' | 'logged' | 'skipped';");
  const a = s.indexOf('          {rows.map((r, k) => (');
  const b = s.indexOf('          ))}\n', a) + '          ))}\n'.length;
  if (a < 0 || b < a) throw new Error('rows block');
  s = s.slice(0, a) + `          {rows.map((r, k) => {
            const eaten = meal.status === 'logged' && r.eaten;
            const left = meal.status === 'logged' && !r.eaten; // not eaten although the meal is logged: skipped
            const dim = meal.skipped || left;
            return (
              <Row key={k} style={{ gap: 10, minHeight: 40, borderTopWidth: k ? 1 : 0, borderTopColor: c.line }}>
                {eaten ? <IconBadge size={22} bg={c.good}><Check size={13} strokeWidth={3.5} color={c.bg} /></IconBadge> : <View style={{ opacity: dim ? 0.45 : 1 }}><FoodMark type={r.type} /></View>}
                <Txt numberOfLines={1} style={{ flex: 1, fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 22, color: dim ? c.muted : c.ink, textDecorationLine: dim ? 'line-through' : 'none' }}>{r.name}</Txt>
                {!!r.amount && <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, color: c.muted, textDecorationLine: dim ? 'line-through' : 'none' }}>{r.amount}</Txt>}
              </Row>
            );
          })}
` + s.slice(b);
  return s;
});
console.log('logged-items pass done');
