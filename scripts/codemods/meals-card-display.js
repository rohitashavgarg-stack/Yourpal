#!/usr/bin/env node
/* One-off: the Today meals card shows the meal and its food items and has one "Log meal" button; logging happens in the bottom sheet. */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 80)); return s.replace(a, b); };
const cut = (s, a, b, r) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 60)); return s.slice(0, i) + r + s.slice(j); };

edit('src/design-system/patterns/MealsCard.tsx', (s) => {
  s = rep(s, "export type MealItemRow = { name: string; sub: string; kcal: string; type?: FoodType; eaten: boolean; /** swapped for something the member picked: shows \"Yours\" */ yours: boolean };\nexport type MealExtraRow = { name: string; kcal: number; type?: FoodType; est?: boolean };",
    "export type MealItemRow = { name: string; /** the amount, \"1 bowl\" */ sub: string; type?: FoodType; /** logged: a small tick at the right (display only) */ eaten: boolean };\nexport type MealExtraRow = { name: string; type?: FoodType; est?: boolean };");
  s = rep(s, "  /** The label of the quiet button: \"Skip meal\", \"Mark rest eaten\", \"Unmark all\", \"Undo skip\". */\n  allLabel: string;\n  /** The quiet button is drawn in ink instead of muted. */\n  allActive: boolean;\n", "");
  s = rep(s, "  onToggleItem?: (k: number) => void;\n  onOpenFood?: (k: number, extra: boolean) => void;\n  onRemoveExtra?: (j: number) => void;\n  onAteElse?: () => void;\n  onAll?: () => void;\n  onAskAteIt?: () => void;\n  onAskSomethingElse?: () => void;\n  onAskSkipped?: () => void;\n", "  /** The name of a food was tapped: opens its page (nutrition, recipe). */\n  onOpenFood?: (k: number, extra: boolean) => void;\n  /** \"Log meal\": opens the bottom sheet for the meal on screen. Logging happens there, not on the card. */\n  onLogMeal?: () => void;\n  /** The same button on the \"Did you have lunch?\" prompt, for the missed meal. */\n  onAskLog?: () => void;\n");
  s = cut(s, '// The prompt for a meal that passed', '// The items of the meal on screen', `// The prompt for a meal that passed with nothing logged: one button that opens the same sheet.
function MissedPrompt({ ask, onLog }: { ask: MissedAsk; onLog?: () => void }) {
  const { c } = useTheme();
  const n = ask.name.toLowerCase();
  return (
    <FadeIn style={{ borderRadius: radii.md, backgroundColor: c.warnSoft, padding: 12, gap: 10 }}>
      <Row style={{ gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.md, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}><Clock size={18} color={c.warn} /></View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21 }}>{\`Did you have \${n}?\`}</Txt>
          <Txt v="caption">{ask.more ? \`It was planned for \${ask.planned}. \${ask.more} earlier \${ask.more === 1 ? 'meal' : 'meals'} still to log.\` : \`It was planned for \${ask.planned}.\`}</Txt>
        </View>
      </Row>
      <Row><Button size="compact" kind="primary" label={\`Log \${n}\`} onPress={onLog} accessibilityLabel={\`Log \${n}\`} /></Row>
    </FadeIn>
  );
}

`);
  s = cut(s, '// The items of the meal on screen', 'export function MealsCard(p', `// The meal on screen: the names of its foods with the amount, and one button that opens the sheet where it is logged.
function MealItems({ meal, onOpenFood, onLogMeal }: Pick<MealsCardProps, 'onOpenFood' | 'onLogMeal'> & { meal: ShownMeal }) {
  const { c, isDark } = useTheme();
  return (
    <Animated.View layout={LinearTransition.duration(180)}>
      <FadeIn style={{ gap: 4, paddingBottom: 0 }}>
        {meal.items.map((it, k) => (
          <Row key={k} style={{ gap: 10, minHeight: 52, paddingLeft: 12, paddingRight: 12, paddingVertical: 4, borderRadius: radii.md, backgroundColor: it.eaten ? (isDark ? '#1E4A3F' : c.goodSoft) : c.surface2, borderWidth: it.eaten ? 1 : 0, borderColor: c.good + '66' }}>
            <FoodMark type={it.type} />
            <Pressy accessibilityRole="button" accessibilityLabel={\`\${it.name}: nutrition and recipe\`} onPress={() => onOpenFood?.(k, false)} scaleTo={0.98} style={{ flex: 1, minWidth: 0, paddingVertical: 4 }}>
              <Txt style={{ fontFamily: font.medium, color: meal.skipped ? c.muted : c.ink, textDecorationLine: meal.skipped ? 'line-through' : 'none' }}>{it.name}</Txt>
              <Txt v="caption">{it.sub}</Txt>
            </Pressy>
            {it.eaten && <Check size={16} strokeWidth={3} color={c.good} />}
          </Row>
        ))}
        {meal.extras.map((e, j) => (
          <Row key={\`x\${j}\`} style={{ gap: 10, minHeight: 52, paddingLeft: 12, paddingRight: 12, paddingVertical: 4, borderRadius: radii.md, backgroundColor: c.accentSoft }}>
            <FoodMark type={e.type ?? 'veg'} />
            <Pressy accessibilityRole="button" accessibilityLabel={\`\${e.name}: details\`} onPress={() => onOpenFood?.(j, true)} scaleTo={0.98} style={{ flex: 1, minWidth: 0, paddingVertical: 4 }}>
              <Txt style={{ fontFamily: font.medium }}>{e.name}</Txt>
              {e.est ? <Txt v="caption">Estimated</Txt> : null}
            </Pressy>
            <Check size={16} strokeWidth={3} color={c.good} />
          </Row>
        ))}
        <View style={{ marginTop: 4 }}><Button kind="primary" label="Log meal" onPress={onLogMeal} /></View>
      </FadeIn>
    </Animated.View>
  );
}

`);
  s = rep(s, "{p.ask && <MissedPrompt ask={p.ask} onAteIt={p.onAskAteIt} onSomethingElse={p.onAskSomethingElse} onSkipped={p.onAskSkipped} />}", "{p.ask && <MissedPrompt ask={p.ask} onLog={p.onAskLog} />}");
  s = rep(s, "<MealItems meal={meal} onToggleItem={p.onToggleItem} onOpenFood={p.onOpenFood} onRemoveExtra={p.onRemoveExtra} onAteElse={p.onAteElse} onAll={p.onAll} />", "<MealItems meal={meal} onOpenFood={p.onOpenFood} onLogMeal={p.onLogMeal} />");
  s = rep(s, "import { Card, Chip, Pressy, Row, Txt } from '@/components/ui';", "import { Button, Card, Chip, Pressy, Row, Txt } from '@/components/ui';");
  return s;
});

edit('src/features/today/MealsCard.tsx', (s) => {
  // the card no longer logs: drop the tick, remove, skip and "something else" handlers, keep opening the food page
  s = cut(s, '  const withUndo = ', '  const openFood = ', '');
  s = cut(s, '  const ateElse = (id: MealId)', '  const state: MealsCardState', "  const openLog = (id: MealId) => gate(() => openSheet(<LogMealsSheet mealId={id} />, { label: 'Log meal' }));\n\n");
  s = rep(s, "      onAskAteIt={() => ask && answer(ask, toastCopy.mealAsPlanned(askMeal!.n), { eaten: askMeal!.items.map((_, k) => k), skip: false, at: askMeal!.t })}\n      onAskSomethingElse={() => ask && ateElse(ask)()}\n      onAskSkipped={() => ask && answer(ask, toastCopy.mealSkipped(askMeal!.n), { skip: true, eaten: [] })}\n      onToggleItem={toggle} onOpenFood={openFood} onRemoveExtra={removeExtra} onAteElse={ateElse(shown)} onAll={all} />", "      onAskLog={() => ask && openLog(ask)()}\n      onOpenFood={openFood} onLogMeal={openLog(shown)} />");
  s = rep(s, "      return { name: r ? r.n : it.n, sub: r ? `Instead of ${it.n.toLowerCase()}` : it.q, kcal: `${r ? r.k : it.k} kcal${r?.est ? '*' : ''}`, type: it.type, eaten: x.eaten.includes(k), yours: !!r };", "      const por = x.por?.[k] ?? 1; const q = !r ? parseQty(it.q) : null;\n      return { name: r ? r.n : it.n, sub: r ? `Instead of ${it.n.toLowerCase()}` : q && por !== 1 ? fmtQty(Math.round(q.n * por * 100) / 100, q.unit) : it.q, type: it.type, eaten: x.eaten.includes(k) };");
  s = rep(s, "x.extra.map((e) => ({ name: e.n, kcal: e.k, type: e.type, est: e.est }))", "x.extra.map((e) => ({ name: e.n, type: e.type, est: e.est }))");
  s = rep(s, "    allLabel: allL,\n    allActive: !!x.skip || v.any,\n", "");
  s = rep(s, "import { QuickLogSheet } from './QuickLogSheet';", "import { LogMealsSheet } from './LogMealsSheet';\nimport { fmtQty, parseQty } from '@/features/plans/qty';");
  return s;
});
console.log('done');
