import React from 'react';
import { View } from 'react-native';
import { Check } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { fmtT, MEALS } from '@/lib/data';
import { mealLog, useDomain } from '@/lib/domain';
import { useMeals } from '@/lib/domain';
import { useLogGate } from '@/lib/logGate';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { mealKcal, mealView } from './meals';

// The "Log meal" card in the updates opens this: every meal of the day in a list, one tick each. A tick logs the whole meal as eaten,
// a second tap takes it back. Each meal can still be opened on the meals card to log single items or something else.
export function LogMealsSheet() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { patch } = useMeals();
  const { gate } = useLogGate();
  const { closeSheet } = useOverlay();
  const toggle = gate((id: (typeof MEALS)[number]['id']) => {
    const m = MEALS.find((q) => q.id === id)!;
    const x = mealLog(d, id);
    const full = x.eaten.length === m.items.length;
    haptic.light();
    if (full) patch(id, { eaten: [] });
    else patch(id, { eaten: m.items.map((_, k) => k), skip: false, at: x.at ?? d.min });
  });
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 2, paddingHorizontal: 4 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 24, lineHeight: 32, letterSpacing: -0.4 }}>Log your meals</Txt>
        <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>Tick the meals you have eaten.</Txt>
      </View>
      <View>
        {MEALS.map((m, i) => {
          const x = mealLog(d, m.id);
          const v = mealView(d, m);
          const done = x.eaten.length === m.items.length;
          const skipped = !!x.skip;
          return (
            <Pressy key={m.id} accessibilityRole="checkbox" accessibilityState={{ checked: done }} accessibilityLabel={`${m.n}, ${fmtT(m.t).full}`} scaleTo={0.98} onPress={() => toggle(m.id)}
              style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
              {done
                ? <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}><Check size={16} color={c.bg} strokeWidth={3} /></View>
                : <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderStyle: skipped ? 'dashed' : 'solid', borderColor: c.muted }} />}
              <View style={{ flex: 1 }}>
                <Txt style={{ fontFamily: font.medium, fontSize: 16, lineHeight: 23 }}>{m.n}</Txt>
                <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{skipped ? 'Skipped' : `${fmtT(m.t).full}, ${v.any ? v.kcal : mealKcal(m)} kcal`}</Txt>
              </View>
            </Pressy>
          );
        })}
      </View>
      <Row>
        <View style={{ flex: 1 }}><Button label="Done" onPress={() => closeSheet()} /></View>
      </Row>
    </View>
  );
}
