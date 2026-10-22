#!/usr/bin/env node
/* One-off: chips become MetaRow (icon, words, thin separator) on the workout card and the meals card; the meals card shows protein. */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 90)); return s.replace(a, b); };

edit('src/lib/icons.ts', (s) => (s.includes('as Beef') ? s : rep(s, "export { default as Dumbbell } from 'lucide-react-native/icons/dumbbell';", "export { default as Beef } from 'lucide-react-native/icons/beef';\nexport { default as Dumbbell } from 'lucide-react-native/icons/dumbbell';")));

edit('src/design-system/patterns/WorkoutCard.tsx', (s) => {
  s = rep(s, "  /** upcoming and due: the info chips under the name (\"5 exercises\", \"~50 min\"). */\n  chips?: string[];", "  /** upcoming and due: facts under the name, each with an icon and a thin line between: \"7 exercises\", \"~50 min\". */\n  meta?: { kind: 'exercises' | 'time'; text: string }[];");
  s = rep(s, "when, chips = [],", "when, meta = [],");
  s = rep(s, "<Row style={{ gap: 6, flexWrap: 'wrap' }}>{chips.map((t) => <Chip key={t} label={t} onDark />)}</Row>", "<MetaRow color={W60} dividerColor=\"rgba(255,255,255,0.22)\" items={meta.map((m) => ({ icon: m.kind === 'exercises' ? <Dumbbell size={15} color={W60} /> : <Clock size={15} color={W60} />, text: m.text }))} />");
  s = rep(s, "import { CalendarClock, Check, Clock, Flame, Lock, Moon, X } from '@/lib/icons';", "import { CalendarClock, Check, Clock, Dumbbell, Flame, Lock, Moon, X } from '@/lib/icons';");
  s = rep(s, "import { Button } from '@/design-system/primitives/Button';", "import { Button } from '@/design-system/primitives/Button';\nimport { MetaRow } from '@/design-system/primitives/MetaRow';");
  return s;
});
edit('src/features/today/WorkoutCard.tsx', (s) => {
  s = rep(s, "const chips = comeback ? ['5 exercises', '~30 min', 'Lighter weights'] : [`${buildExercises().length} exercises`, `~${WORKOUT_MIN} min`];", "const meta = comeback ? [] : [{ kind: 'exercises' as const, text: `${buildExercises().length} exercises` }, { kind: 'time' as const, text: `~${WORKOUT_MIN} min` }];");
  s = rep(s, "chips={chips}", "meta={meta}");
  return s;
});

edit('src/design-system/patterns/MealsCard.tsx', (s) => {
  s = rep(s, "  /** \"650 kcal planned\" or \"290 kcal eaten\". */\n  caption: string;\n  /** The pill at the top right: a time, or a status word for another meal. */\n  pill: string;\n  /** Shows a small clock in the pill (the meal that is due or missed). */\n  clock: boolean;\n", "  /** Under the name, each with an icon and a thin line between: the time (or a status word), \"650 kcal planned\" or \"290 kcal eaten\", \"22 g protein\". */\n  meta: { time: string; kcal: string; protein: string };\n");
  const i = s.indexOf("      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>\n        <View>\n          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl");
  if (i < 0) throw new Error('missing meal header');
  const j = s.indexOf('      </Row>\n', i) + '      </Row>\n'.length;
  s = s.slice(0, i) + `      <View style={{ paddingHorizontal: 4, gap: 4 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 27, letterSpacing: -0.4 }}>{meal.name}</Txt>
        <MetaRow color={c.muted} dividerColor={c.line} items={[
          { icon: <Clock size={15} color={c.muted} />, text: meal.meta.time },
          { icon: <Flame size={15} color={c.muted} />, text: meal.meta.kcal },
          { icon: <Beef size={15} color={c.muted} />, text: meal.meta.protein },
        ]} />
      </View>
` + s.slice(j);
  s = rep(s, "import { Check, ChevronRight, Clock, Lock, Plus, UtensilsCrossed } from '@/lib/icons';", "import { Beef, Check, ChevronRight, Clock, Flame, Lock, Plus, UtensilsCrossed } from '@/lib/icons';");
  s = rep(s, "import { IconBadge } from '@/design-system/primitives/IconBadge';", "import { IconBadge } from '@/design-system/primitives/IconBadge';\nimport { MetaRow } from '@/design-system/primitives/MetaRow';");
  return s;
});
edit('src/features/today/MealsCard.tsx', (s) => {
  s = rep(s, "    caption: v.any ? `${v.kcal} kcal eaten` : `${mealKcal(m)} kcal planned`,\n    pill: shown === now || missed.includes(shown) ? fmtT(m.t).full : text(shown),\n    clock: shown === now || missed.includes(shown),\n", "    meta: {\n      time: shown === now || missed.includes(shown) ? fmtT(m.t).full : text(shown),\n      kcal: v.any ? `${v.kcal} kcal eaten` : `${mealKcal(m)} kcal planned`,\n      protein: `${protein} g protein`,\n    },\n");
  s = rep(s, "  const shownMeal: ShownMeal = {", "  // protein of what was eaten, or of the plan when nothing is logged yet (the same basis as the calories)\n  const protein = v.any\n    ? x.eaten.reduce((a, k) => a + itemNow(d, shown, k).p, 0) + x.extra.reduce((a, e) => a + e.p, 0)\n    : m.items.reduce((a, it) => a + it.p, 0);\n  const shownMeal: ShownMeal = {");
  s = rep(s, "import { mealLog, totals, useDomain, useMeals } from '@/lib/domain';", "import { itemNow, mealLog, totals, useDomain, useMeals } from '@/lib/domain';");
  return s;
});
console.log('meta pass done');
