import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from '@/lib/icons';
import { Field, Row, Txt } from '@/components/ui';
import { Button, IconButton } from '@/design-system/primitives/Button';
import { FoodCard } from '@/design-system/patterns/FoodCard';
import { useOverlay } from '@/components/Overlay';
import { CATALOG, MealId } from '@/lib/data';
import { mealLog, useDomain } from '@/lib/domain';
import { useLeaveIfPaused } from '@/lib/logGate';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { fontSizes } from '@/design-system/tokens';
import { mealById } from '@/features/today/meals';

// The food library as a full page: search, tick what you ate, add it to the meal.
export default function FoodLibrary() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  useLeaveIfPaused();
  const p = useLocalSearchParams<{ mealId?: MealId }>();
  const mealId = (p.mealId ?? 'sn') as MealId;
  const meal = mealById(mealId);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const qq = q.toLowerCase();
  const res = CATALOG.filter((x) => !qq || x.n.toLowerCase().includes(qq));
  const picked = CATALOG.filter((x) => sel.includes(x.n));
  const total = picked.reduce((a, x) => a + x.k, 0);

  const add = () => {
    if (!picked.length) return;
    const prev = d.meals;
    const cur = mealLog(d, mealId);
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
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        {res.map((f) => {
          const on = sel.includes(f.n);
          const tog = () => setSel((l) => (on ? l.filter((x) => x !== f.n) : [...l, f.n]));
          return <FoodCard key={f.n} state={on ? 'eaten' : 'todo'} name={f.n} kcal={`${f.k} kcal`} macros={`P ${f.p} g`} onPress={tog} onCheck={tog} checkLabel={f.n} label={f.n} />;
        })}
        {res.length === 0 && <Txt muted style={{ fontSize: fontSizes.md, paddingVertical: 16 }}>Nothing in the library matches that. Go back and type it instead.</Txt>}
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>
        <Button kind="primary" label={picked.length ? `Add ${total} kcal to ${meal.n.toLowerCase()}` : 'Pick what you ate'} disabled={!picked.length} onPress={add} />
      </View>
    </KeyboardAvoidingView>
  );
}
