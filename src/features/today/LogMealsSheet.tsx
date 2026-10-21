import React from 'react';
import { View } from 'react-native';
import { Button, Row, Txt } from '@/components/ui';
import { Plus } from '@/lib/icons';
import { QuickLogSheet } from './QuickLogSheet';
import { CheckCircle, FoodMark } from '@/components/bits';
import { fmtT, MealId, MEALS } from '@/lib/data';
import { itemNow, mealLog, useDomain, useMeals } from '@/lib/domain';
import { useLogGate } from '@/lib/logGate';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';

// The "Log meal" card in the updates opens this for the meal that is due (lunch, dinner...): its food items, each with its own tick,
// like the meals card. Ticking an item logs it as eaten, a second tap takes it back.
export function LogMealsSheet({ mealId }: { mealId: MealId }) {
  const { c, isDark } = useTheme();
  const { d } = useDomain();
  const { toggleItem } = useMeals();
  const { gate } = useLogGate();
  const { closeSheet, openSheet } = useOverlay();
  const m = MEALS.find((q) => q.id === mealId)!;
  const x = mealLog(d, mealId);
  const tick = gate((k: number) => { haptic.light(); toggleItem(mealId, k); });
  const eaten = x.eaten.length;
  // something that is not on the plan: scan the plate, write it or pick from the catalogue (the same sheet the meals card opens)
  const elseFood = gate(() => closeSheet(() => openSheet(<QuickLogSheet mealId={mealId} mode="scan" />, { label: 'Log a meal' })));
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 2, paddingHorizontal: 4 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 24, lineHeight: 32, letterSpacing: -0.4 }}>{`Log your ${m.n.toLowerCase()}`}</Txt>
        <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{`${fmtT(m.t).full}. Tick what you ate.`}</Txt>
      </View>
      <View style={{ gap: 4 }}>
        {m.items.map((it, k) => {
          const on = x.eaten.includes(k);
          const n = itemNow(d, mealId, k);
          return (
            <Row key={k} style={{ gap: 10, minHeight: 56, paddingLeft: 12, paddingRight: 4, paddingVertical: 4, borderRadius: radii.md, backgroundColor: on ? (isDark ? '#1E4A3F' : c.goodSoft) : c.surface2, borderWidth: on ? 1 : 0, borderColor: c.good + '66' }}>
              <FoodMark type={it.type} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt style={{ fontFamily: font.medium }}>{n.n}</Txt>
                <Txt v="caption">{it.q}</Txt>
              </View>
              <Txt v="caption" style={{ alignSelf: 'center' }}>{`${n.k} kcal`}</Txt>
              <CheckCircle on={on} size={28} tone="good" label={`${on ? 'Unmark' : 'Mark'} ${n.n} as eaten`} onPress={() => tick(k)} />
            </Row>
          );
        })}
      </View>
      <Button kind="secondary" label="Ate something else" icon={<Plus size={18} color={c.ink} />} onPress={elseFood} />
      <Button label={eaten ? 'Done' : 'Close'} onPress={() => closeSheet()} />
    </View>
  );
}
