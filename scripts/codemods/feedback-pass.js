#!/usr/bin/env node
/* One-off: steps default to the green dot-matrix widget; gym logo gets a stroke; the update card's single button is full width;
 * the meals card lists the foods in one line with one food icon ("2 bowl dal, 4 roti, 1 bowl salad"). */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 90)); return s.replace(a, b); };
const cut = (s, a, b, r) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 60)); return s.slice(0, i) + r + s.slice(j); };

edit('src/features/today/StepsCards.tsx', (s) => rep(s, "design: 'Ruler' as StepsDesign, // the black ruler card is the default on Today", "design: 'Dot matrix' as StepsDesign, // the dark green dot-matrix card is the default on Today"));

edit('src/components/Brand.tsx', (s) => rep(s, "borderRadius: Math.round(size * 0.28), overflow: 'hidden', backgroundColor: '#000', flexShrink: 0 }}>", "borderRadius: Math.round(size * 0.28), borderWidth: 1, borderColor: 'rgba(240,170,60,0.5)', overflow: 'hidden', backgroundColor: '#000', flexShrink: 0 }}>"));

edit('src/features/today/ForYou.tsx', (s) => {
  const i = s.indexOf("<Row><Pressy accessibilityRole=\"button\" onPress={it.act}");
  if (i < 0) throw new Error('missing update button row');
  const j = s.indexOf('</Pressy></Row>', i);
  return s.slice(0, i) + s.slice(i, j + 15).replace('<Row><Pressy', '<View><Pressy').replace(/<\/Pressy><\/Row>$/, '</Pressy></View>') + s.slice(j + 15);
});

edit('src/design-system/patterns/MealsCard.tsx', (s) => {
  s = rep(s, "export type MealItemRow = { name: string; /** the amount, \"1 bowl\" */ sub: string; type?: FoodType; /** logged: a small tick at the right (display only) */ eaten: boolean };\nexport type MealExtraRow = { name: string; type?: FoodType; est?: boolean };",
    "export type MealItemRow = { name: string; /** the amount in front of the name, \"1 bowl\"; empty for a food the member swapped in */ amount: string; type?: FoodType; eaten: boolean };\nexport type MealExtraRow = { name: string; type?: FoodType; est?: boolean };");
  s = rep(s, "  /** The name of a food was tapped: opens its page (nutrition, recipe). */\n  onOpenFood?: (k: number, extra: boolean) => void;\n", "");
  s = cut(s, '// The meal on screen: the names of its foods', 'export function MealsCard(p', `// The meal on screen: its foods in one line with one food icon ("2 bowl dal, 4 roti, 1 bowl salad"), and one button that opens the sheet where it is logged.
function MealItems({ meal, onLogMeal }: Pick<MealsCardProps, 'onLogMeal'> & { meal: ShownMeal }) {
  const { c } = useTheme();
  const line = [...meal.items.map((it) => (it.amount ? it.amount + ' ' : '') + it.name), ...meal.extras.map((e) => e.name)].join(', ');
  return (
    <Animated.View layout={LinearTransition.duration(180)}>
      <FadeIn style={{ gap: 12, paddingBottom: 0 }}>
        <Row accessible accessibilityLabel={\`\${meal.name}: \${line}\`} style={{ gap: 12, alignItems: 'flex-start', paddingHorizontal: 4 }}>
          <IconBadge size={36} radius={radii.sm} bg={c.surface2}><UtensilsCrossed size={18} color={c.muted} /></IconBadge>
          <Txt style={{ flex: 1, minWidth: 0, fontSize: fontSizes.base, lineHeight: 24, paddingTop: 5, color: meal.skipped ? c.muted : c.ink, textDecorationLine: meal.skipped ? 'line-through' : 'none' }}>{line}</Txt>
        </Row>
        <Button kind="primary" label="Log meal" onPress={onLogMeal} />
      </FadeIn>
    </Animated.View>
  );
}

`);
  s = rep(s, "<MealItems meal={meal} onOpenFood={p.onOpenFood} onLogMeal={p.onLogMeal} />", "<MealItems meal={meal} onLogMeal={p.onLogMeal} />");
  s = rep(s, "import { FadeIn } from '@/design-system/primitives/FadeIn';", "import { FadeIn } from '@/design-system/primitives/FadeIn';\nimport { IconBadge } from '@/design-system/primitives/IconBadge';");
  return s;
});

edit('src/features/today/MealsCard.tsx', (s) => {
  s = rep(s, "return { name: r ? r.n : it.n, sub: r ? `Instead of ${it.n.toLowerCase()}` : q && por !== 1 ? fmtQty(Math.round(q.n * por * 100) / 100, q.unit) : it.q, type: it.type, eaten: x.eaten.includes(k) };", "return { name: r ? r.n : it.n, amount: r ? '' : q && por !== 1 ? fmtQty(Math.round(q.n * por * 100) / 100, q.unit) : it.q, type: it.type, eaten: x.eaten.includes(k) };");
  s = rep(s, " onOpenFood={openFood} onLogMeal={openLog(shown)} />", " onLogMeal={openLog(shown)} />");
  s = s.replace(/  const openFood = [^\n]*\n/, '');
  return s;
});
console.log('feedback pass done');
