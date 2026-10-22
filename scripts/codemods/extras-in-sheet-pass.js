#!/usr/bin/env node
/* One-off: foods added with "Ate something else?" appear in the log sheet first (the sheet reopens after the add), then on the meal card. */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 90)); return s.replace(a, b); };

edit('src/features/today/QuickLogSheet.tsx', (s) => {
  s = rep(s, "export function QuickLogSheet({ mealId, mode: initial = 'scan', replaceIdx }: { mealId: MealId; mode?: Mode; replaceIdx?: number }) {", "// backTo: after something is added, go back to the sheet that opened this one (the log sheet shows the new food first).\nexport function QuickLogSheet({ mealId, mode: initial = 'scan', replaceIdx, backTo }: { mealId: MealId; mode?: Mode; replaceIdx?: number; backTo?: () => void }) {");
  s = rep(s, "        toast(`Added to ${meal.n.toLowerCase()}. Coach sees what changed`, { undo: () => set({ meals: prev }) });\n      }", "        toast(`Added to ${meal.n.toLowerCase()}. Coach sees what changed`, { undo: () => set({ meals: prev }) });\n        backTo?.();\n      }");
  return s;
});

edit('src/features/today/LogMealsSheet.tsx', (s) => {
  s = rep(s, "closeSheet(() => openSheet(<QuickLogSheet mealId={mealId} mode=\"scan\" />, { label: 'Log a meal' }))", "closeSheet(() => openSheet(<QuickLogSheet mealId={mealId} mode=\"scan\" backTo={() => openSheet(<LogMealsSheet mealId={mealId} />, { label: 'Log meal' })} />, { label: 'Log a meal' }))");
  s = rep(s, "  const kcal = now.reduce((a, n) => a + n.k, 0), prot = now.reduce((a, n) => a + n.p, 0);", "  const kcal = now.reduce((a, n) => a + n.k, 0) + x.extra.reduce((a, e) => a + e.k, 0), prot = now.reduce((a, n) => a + n.p, 0) + x.extra.reduce((a, e) => a + e.p, 0);\n  const removeExtra = gate((j: number) => { const prev = d.meals; const gone = x.extra[j]; patch(mealId, { extra: x.extra.filter((_, i) => i !== j) }); toast(toastCopy.removed(gone?.n ?? 'item'), { undo: () => set({ meals: prev }) }); });");
  s = rep(s, "{`${m.items.length} items · ~${kcal} kcal · P ${prot} g`}", "{`${m.items.length + x.extra.length} items · ~${kcal} kcal · P ${prot} g`}");
  // the added foods, after the planned ones
  const a = s.indexOf("        <Row style={{ gap: 8 }}>\n          <Pressy accessibilityRole=\"button\" accessibilityLabel=\"Ate something else? Log it\"");
  if (a < 0) throw new Error('bottom row');
  s = s.slice(0, a) + `        {x.extra.map((e, j) => (
          <Row key={\`x\${j}\`} style={{ gap: 8, minHeight: 64, paddingLeft: 12, paddingRight: 4, borderRadius: radii.md, backgroundColor: c.goodSoft }}>
            <FoodMark type={e.type ?? 'veg'} />
            <View style={{ flex: 1, minWidth: 0, gap: 4, paddingVertical: 10 }}>
              <Txt numberOfLines={2} style={{ fontFamily: font.medium }}>{e.n}</Txt>
              <Txt v="caption" numberOfLines={1}>{\`Added by you · ~\${e.k} kcal · P \${e.p} · C \${Math.round((e.k * 0.5) / 4)} · F \${Math.round((e.k * 0.3) / 9)} g\`}</Txt>
            </View>
            <CheckCircle on size={40} tone="good" label={\`Remove \${e.n}\`} onPress={() => removeExtra(j)} />
          </Row>
        ))}
` + s.slice(a);
  return s;
});
console.log('extras-in-sheet pass done');
