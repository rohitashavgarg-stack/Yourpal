#!/usr/bin/env node
/* One-off: meals card logged state, a different foods icon, and the log sheet without a card inside the sheet. */
const fs = require('fs');
function edit(p, fn) { let s = fs.readFileSync(p, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n'); const o = s; s = fn(s); if (s === o) console.log('UNCHANGED ' + p); fs.writeFileSync(p, crlf ? s.replace(/\n/g, '\r\n') : s); }
const rep = (s, a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 90)); return s.replace(a, b); };

edit('src/lib/icons.ts', (s) => (s.includes('as Salad') ? s : rep(s, "export { default as Beef } from 'lucide-react-native/icons/beef';", "export { default as Beef } from 'lucide-react-native/icons/beef';\nexport { default as Salad } from 'lucide-react-native/icons/salad';")));

edit('src/design-system/patterns/MealsCard.tsx', (s) => {
  // data: the state of the meal
  s = rep(s, "  meta: { time: string; kcal: string; protein: string };\n", "  meta: { time: string; kcal: string; protein: string };\n  /** todo: nothing logged. partial: some foods logged. logged: all of them (the card shows when, and \"Edit log\"). skipped. */\n  status: 'todo' | 'partial' | 'logged' | 'skipped';\n  /** logged: the time it was logged, \"1:10 pm\". */\n  loggedAt?: string;\n");
  // the chip in front of the name and the icon in front of the foods
  s = rep(s, "          <Chip label={meal.meta.time} icon={<Clock size={13} color={c.ink} />} style={{ borderColor: isDark ? 'rgba(255,255,255,0.18)' : c.chipLine, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }} />",
    "          {meal.status === 'logged' ? <Chip tone=\"good\" label={`Logged ${meal.loggedAt ?? ''}`.trim()} icon={<Check size={13} strokeWidth={3} color={c.good} />} />\n            : meal.status === 'skipped' ? <Chip label=\"Skipped\" icon={<X size={13} color={c.muted} />} />\n            : <Chip label={meal.meta.time} icon={<Clock size={13} color={c.ink} />} style={{ borderColor: isDark ? 'rgba(255,255,255,0.18)' : c.chipLine, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }} />}");
  s = rep(s, "          <IconBadge size={36} radius={radii.sm} bg={c.surface2}><UtensilsCrossed size={18} color={c.muted} /></IconBadge>", "          <IconBadge size={36} radius={radii.sm} bg={meal.status === 'logged' ? c.goodSoft : c.surface2}>{meal.status === 'logged' ? <Check size={18} strokeWidth={3} color={c.good} /> : <Salad size={18} color={c.muted} />}</IconBadge>");
  s = rep(s, "<Button kind=\"primary\" label=\"Log meal\" onPress={onLogMeal} />", "<Button kind={meal.status === 'logged' ? 'secondary' : 'primary'} label={meal.status === 'logged' ? 'Edit log' : 'Log meal'} onPress={onLogMeal} />");
  s = rep(s, "import { Beef, Check, ChevronRight, Clock, Flame, Lock, Plus, UtensilsCrossed } from '@/lib/icons';", "import { Beef, Check, ChevronRight, Clock, Flame, Lock, Plus, Salad, UtensilsCrossed, X } from '@/lib/icons';");
  return s;
});

edit('src/features/today/MealsCard.tsx', (s) => {
  s = rep(s, "    skipped: !!x.skip,\n", "    skipped: !!x.skip,\n    status: x.skip ? 'skipped' : v.full ? 'logged' : v.any ? 'partial' : 'todo',\n    loggedAt: fmtT(x.at ?? m.t).full,\n");
  return s;
});

edit('src/features/today/LogMealsSheet.tsx', (s) => {
  s = rep(s, "      <View style={{ borderRadius: radii.card, borderWidth: 1, borderColor: c.line, padding: 12, gap: 8 }}>", "      <View style={{ gap: 8 }}>");
  s = rep(s, "<Row style={{ justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 2 }}>", "<Row style={{ justifyContent: 'space-between', paddingBottom: 2 }}>");
  return s;
});
console.log('logged-state pass done');
