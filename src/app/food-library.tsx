import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from '@/lib/icons';
import { Field, Row, Txt } from '@/components/ui';
import { Button, IconButton } from '@/design-system/primitives/Button';
import { FoodCard } from '@/design-system/patterns/FoodCard';
import { useOverlay } from '@/components/Overlay';
import { CATALOG, CatalogItem, FOOD_CATS, FoodCat, MealId, OFTEN, SWAPS } from '@/lib/data';
import { allowedFor, usePlans } from '@/features/plans/store';
import { Option } from '@/design-system/primitives/Option';
import { mealLog, useDomain } from '@/lib/domain';
import { useLeaveIfPaused } from '@/lib/logGate';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { fontSizes, round } from '@/design-system/tokens';
import { mealById } from '@/features/today/meals';

// The food library as a full page: search, tick what you ate, add it to the meal.
export default function FoodLibrary() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  useLeaveIfPaused();
  const p = useLocalSearchParams<{ mealId?: MealId; replaceIdx?: string }>();
  const { p: plans } = usePlans();
  const mealId = (p.mealId ?? 'sn') as MealId;
  const meal = mealById(mealId);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  // Swapping a planned item: the shelf Suggested comes first and holds what is related to that item. Logging something else: Most eaten comes first.
  const replaceIdx = p.replaceIdx != null ? Number(p.replaceIdx) : null;
  const repl = replaceIdx != null ? meal.items[replaceIdx] : null;
  const related: CatalogItem[] = repl ? (SWAPS[repl.n] ?? SWAPS.any).filter((o) => allowedFor(plans.diet, o.type) && `${o.q} ${o.n}`.toLowerCase() !== `${repl.q} ${repl.n}`.toLowerCase()).map((o) => ({ n: `${o.n}, ${o.q}`, k: o.k, p: o.p, type: o.type, cat: 'Meals' as FoodCat, meals: [mealId] })) : [];
  const pool = [...related, ...CATALOG.filter((x) => !related.some((o) => o.n === x.n))];
  const shelves = (repl ? ['Suggested', 'Most eaten', ...FOOD_CATS] : ['Most eaten', 'Suggested', ...FOOD_CATS]) as ('Suggested' | 'Most eaten' | FoodCat)[];
  const [cat, setCat] = useState<'Suggested' | 'Most eaten' | FoodCat>(shelves[0]);
  const qq = q.toLowerCase();
  const shelf = cat === 'Suggested' ? [...related, ...CATALOG.filter((x) => x.meals.includes(mealId) && !related.some((o) => o.n === x.n))] : cat === 'Most eaten' ? CATALOG.filter((x) => OFTEN.includes(x.n)) : CATALOG.filter((x) => x.cat === cat);
  const res = qq ? pool.filter((x) => x.n.toLowerCase().includes(qq)) : shelf;
  const picked = pool.filter((x) => sel.includes(x.n));
  const total = picked.reduce((a, x) => a + x.k, 0);

  const add = () => {
    if (!picked.length) return;
    const prev = d.meals;
    const cur = mealLog(d, mealId);
    if (repl && replaceIdx != null) {
      const label = picked.map((x) => x.n).join(' + ');
      set({ meals: { ...d.meals, [mealId]: { ...cur, repl: { ...cur.repl, [replaceIdx]: { n: label, k: total, p: picked.reduce((a, x) => a + x.p, 0), est: false, type: picked[0]?.type ?? 'veg' } }, skip: false } }, openMeal: mealId });
      haptic.success();
      toast(`Swapped ${repl.n.toLowerCase()} for ${label}`, { undo: () => set({ meals: prev }) });
      router.back();
      return;
    }
    set({ meals: { ...d.meals, [mealId]: { ...cur, extra: [...cur.extra, ...picked.map((x) => ({ n: x.n, k: x.k, p: x.p, est: false, type: x.type ?? 'veg' }))], at: cur.at ?? d.min, skip: false } }, openMeal: mealId });
    haptic.success();
    toast(`Added to ${meal.n.toLowerCase()}. Coach sees what changed`, { undo: () => set({ meals: prev }) });
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      {/* no heading: the search box and a cross at the top right */}
      <Row style={{ gap: 10, paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ flex: 1 }}><Field accessibilityLabel="Search the food library" value={q} onChangeText={setQ} placeholder="Search poha, dal, curd…" autoFocus /></View>
        <IconButton label="Close" onPress={() => router.back()} glass><X size={20} color={c.ink} /></IconButton>
      </Row>
      {/* the shelves: Suggested (for this meal) first, then the rest. Typing in the search box looks through all of them. */}
      {!qq && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 4 }}>
          {shelves.map((k) => (
            <Option key={k} selected={cat === k} role="tab" accessibilityLabel={k === 'Suggested' ? `Suggested for ${meal.n.toLowerCase()}` : k} offLine={c.line} radius={round(36)} height={36} padX={14} onPress={() => { haptic.tick(); setCat(k); }}>
              <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, color: cat === k ? c.bg : c.ink }}>{k}</Txt>
            </Option>
          ))}
        </ScrollView>
      )}
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {res.map((f) => {
          const on = sel.includes(f.n);
          const tog = () => setSel((l) => (on ? l.filter((x) => x !== f.n) : [...l, f.n]));
          return <FoodCard key={f.n} state={on ? 'eaten' : 'todo'} name={f.n} kcal={`${f.k} kcal`} macros={`P ${f.p} g`} onPress={tog} onCheck={tog} checkLabel={f.n} label={f.n} />;
        })}
        {res.length === 0 && <Txt muted style={{ fontSize: fontSizes.md, paddingVertical: 16 }}>{qq ? 'Nothing in the library matches that. Go back and type it instead.' : 'Nothing here yet.'}</Txt>}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>
        <Button kind="primary" label={picked.length ? repl ? `Swap for ${total} kcal` : `Add ${total} kcal to ${meal.n.toLowerCase()}` : repl ? 'Pick a swap' : 'Pick what you ate'} disabled={!picked.length} onPress={add} />
      </View>
    </KeyboardAvoidingView>
  );
}
