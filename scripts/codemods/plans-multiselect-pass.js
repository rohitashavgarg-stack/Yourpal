#!/usr/bin/env node
/* One-off: the food search on the Plans log page selects several foods at once (one Log button adds them all). Swapping one item stays single. */
const fs = require('fs');
const p = 'src/app/plans/log.tsx';
let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 90)); s = s.replace(a, b); };
const cut = (a, b, r) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error('missing ' + a.slice(0, 50)); s = s.slice(0, i) + r + s.slice(j); };

rep("  const [pick, setPick] = useState<Food | null>(null);\n", "  const [pick, setPick] = useState<Food | null>(null);\n  const [picks, setPicks] = useState<Food[]>([]); // the foods ticked in the search list (several at once)\n  const clearPick = () => { setPick(null); setPicks([]); };\n");
s = s.split('setPick(null)').join('clearPick()');
s = s.replace('const clearPick = () => { clearPick(); setPicks([]); };', 'const clearPick = () => { setPick(null); setPicks([]); };');
rep("  const cur = mode === 'write' ? wPick : pick;\n", "  // search mode while logging selects several foods; swapping one item, a scan and a written food are one food\n  const multi = mode === 'search' && !replaceIt;\n  const list: Food[] = mode === 'write' ? (wPick ? [wPick] : []) : multi ? picks : pick ? [pick] : [];\n  const cur = list[0] ?? null;\n  const toggle = (f: Food) => { haptic.tick(); setPortion(1); setPicks((a) => (a.some((x) => x.n === f.n) ? a.filter((x) => x.n !== f.n) : [...a, f])); };\n");
cut("  const diff = cur ? (() => {", "  const logL = ", `  const diff = cur ? (() => { const tk = list.reduce((a, f) => a + f.k * portion, 0), tp = list.reduce((a, f) => a + f.p * portion, 0); const dk = Math.round(tk - planK), dp = Math.round(tp - planP); return \`\${dk >= 0 ? '+' : '−'}\${Math.abs(dk)} kcal · \${dp >= 0 ? '+' : '−'}\${Math.abs(dp)} g protein vs \${replaceIt ? 'planned item' : 'plan'}\${list.some((f) => f.est) ? ' · estimated' : ''}\`; })() : '';

  const log = () => {
    if (!cur) return;
    const items = list.map((f) => ({ f, item: { n: f.n + (portion !== 1 ? (portion < 1 ? ' (less)' : ' (more)') : ''), k: Math.round(f.k * portion), p: Math.round(f.p * portion), type: f.type ?? 'veg', est: !!f.est } as Extra }));
    items.forEach(({ f }) => { if (f.written && wSave && !p.myFoods.some((x) => x.n === f.n)) setP((st) => ({ myFoods: [{ ...f, mine: true, est: false, written: false }, ...st.myFoods] })); });
    const saveMine = !!cur.written && wSave && !p.myFoods.some((x) => x.n === cur.n);
    const what = items.length > 1 ? \`\${items.length} foods\` : items[0].item.n;
    haptic.success();
    if (forEdit) {
      setP((st) => (st.draft?.kind === 'diet' ? { draft: { ...st.draft, rows: [...st.draft.rows, ...items.map(({ f, item }, i) => ({ key: \`n\${Date.now()}\${i}\`, n: item.n, k: item.k, p: item.p, por: 1, type: item.type ?? 'veg', mine: true, added: { ...f } }))] } } : {}));
      router.back();
      toast(\`Added \${what}. Save to keep it\`);
      return;
    }
    if (replaceIt) { A.applySwap(meal, replaceIt, items[0].item, false); router.back(); return; }
    items.forEach(({ item }) => A.addExtra(meal, item));
    setP({ seg: 'diet', openMeal: meal });
    router.back();
    toast(\`Logged \${items.length > 1 ? what : cur.n}\${saveMine ? '. Saved to your foods' : ''}\`);
  };
`);
rep("const logL = cur ? (replaceIt ? 'Swap it' : forEdit ? 'Add to the meal' : 'Log it')", "const logL = cur ? (replaceIt ? 'Swap it' : forEdit ? (list.length > 1 ? `Add ${list.length} foods to the meal` : 'Add to the meal') : list.length > 1 ? `Log ${list.length} foods` : 'Log it')");
// the rows
rep("    const on = pick?.n === f.n;\n    return (\n      <Pressy key={f.n} accessibilityRole=\"radio\" accessibilityState={{ selected: on }}", "    const on = multi ? picks.some((x) => x.n === f.n) : pick?.n === f.n;\n    return (\n      <Pressy key={f.n} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={multi ? { checked: on } : { selected: on }}");
rep("onPress={() => { setPick(f); setPortion(1); }} scaleTo={0.985}", "onPress={() => (multi ? toggle(f) : (setPick(f), setPortion(1)))} scaleTo={0.985}");
rep("<Txt style={{ fontFamily: font.monoBold, fontSize: fontSizes.sm }}>{f.k} kcal</Txt>\n      </Pressy>", "<Txt style={{ fontFamily: font.monoBold, fontSize: fontSizes.sm }}>{f.k} kcal</Txt>\n        {multi && <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : 'transparent', borderWidth: on ? 0 : 1.5, borderColor: c.surface3 }}>{on && <Check size={13} strokeWidth={3.5} color={fixed.white} />}</View>}\n      </Pressy>");
rep("on={pick?.n === n} onPress={() => { setPick(f); setPortion(1); }}", "on={multi ? picks.some((x) => x.n === n) : pick?.n === n} onPress={() => (multi ? toggle(f) : (setPick(f), setPortion(1)))}");
fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('plans multiselect pass done');
