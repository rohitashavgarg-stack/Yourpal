import React from 'react';
import { View } from 'react-native';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { fmtT, MealId } from '@/lib/data';
import { itemNow, mealLog, useDomain } from '@/lib/domain';
import { useLogsPaused } from '@/lib/logGate';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';
import { FoodMark } from '@/components/bits';
import { mealById } from './meals';
import { LogMealsSheet } from './LogMealsSheet';

// A bottom sheet with what was logged for one meal: each food with its calories and protein, the total, and Edit log. Opens from the arrow on a meal in the "all logged" summary.
export function MealLoggedSheet({ mealId }: { mealId: MealId }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const { closeSheet, openSheet } = useOverlay();
  const paused = useLogsPaused();
  const m = mealById(mealId);
  const x = mealLog(d, mealId);
  const rows = [
    ...x.eaten.map((k) => { const it = itemNow(d, mealId, k); return { key: `p${k}`, name: it.n, sub: it.replaced ? 'Swapped in' : m.items[k].q, kcal: it.k, protein: it.p, type: m.items[k].type }; }),
    ...x.extra.map((e, i) => ({ key: `x${i}`, name: e.n, sub: e.est ? 'Estimated' : 'Added by you', kcal: e.k, protein: e.p, type: e.type })),
  ];
  const kcal = rows.reduce((a, r) => a + r.kcal, 0);
  const protein = rows.reduce((a, r) => a + r.protein, 0);
  return (
    <View style={{ gap: 14, paddingBottom: 8 }}>
      <View style={{ gap: 2 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl2Plus, lineHeight: 30, letterSpacing: -0.4 }}>{m.n}</Txt>
        <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{x.skip ? 'Skipped' : `Logged ${fmtT(x.at ?? m.t).full}`}</Txt>
      </View>
      {rows.length === 0 ? (
        <Txt muted>{x.skip ? 'You skipped this meal.' : 'Nothing was logged for this meal.'}</Txt>
      ) : (
        <View>
          {rows.map((r, i) => (
            <Row key={r.key} style={{ gap: 10, minHeight: 56, borderBottomWidth: i === rows.length - 1 ? 0 : 1, borderBottomColor: c.line }}>
              <FoodMark type={r.type} size={12} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt numberOfLines={1} style={{ fontFamily: font.medium }}>{r.name}</Txt>
                {!!r.sub && <Txt muted numberOfLines={1} style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{r.sub}</Txt>}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Txt style={{ fontFamily: font.semibold }}>{`${r.kcal} kcal`}</Txt>
                <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{`${r.protein} g protein`}</Txt>
              </View>
            </Row>
          ))}
        </View>
      )}
      {rows.length > 0 && (
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt muted>Total</Txt>
          <Txt style={{ fontFamily: font.semibold }}>{`${kcal} kcal, ${protein} g protein`}</Txt>
        </Row>
      )}
      {!paused && <Button kind="secondary" label="Edit log" onPress={() => closeSheet(() => openSheet(<LogMealsSheet mealId={mealId} />, { label: 'Log meal' }))} />}
    </View>
  );
}
