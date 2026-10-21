// ARCHIVED. The slim goal strip that lived in features/today/ForYou.tsx (ring, goal name, one line of numbers). Nothing renders it any more;
// the goal on Today is the Programme goal card (patterns/GoalCard) and the Daily budget card (patterns/BudgetCard). Kept here, re-exported from ForYou.tsx.
import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain, totals } from '@/lib/domain';
import { useGoalV2, progressLine, statusLine } from '@/features/goalv2/model';
import { KCAL_TARGET } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';

// ---------- Slim goal strip: the member's reason for opening the app, in one line ----------
export function GoalStrip() {
  const { c } = useTheme();
  const { d } = useDomain();
  const g = useGoalV2();
  const t = totals(d);
  const pct = Math.max(0, Math.min(1, g.pct));
  const R = 23, C = 2 * Math.PI * R;
  // a second number that matters for this kind of goal
  const kind = d.goal.type;
  const extra = kind === 'Weight loss' || kind === 'Lean body' ? `${Math.max(0, KCAL_TARGET - t.k).toLocaleString('en-IN')} kcal left today`
    : kind === 'Muscle gain' || kind === 'Strength' ? `Protein ${t.p} g today` : statusLine(g);
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`Your goal: ${g.name}. ${progressLine(g)}. ${statusLine(g)}`} onPress={() => router.navigate('/(tabs)/progress')} scaleTo={0.98}
      style={{ backgroundColor: c.surface, borderRadius: radii.xl, paddingVertical: 18, paddingHorizontal: 18 }}>
      <Row style={{ gap: 16 }}>
        <View style={{ width: 58, height: 58, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={58} height={58} viewBox="0 0 58 58" style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={29} cy={29} r={R} stroke={c.surface3} strokeWidth={5} fill="none" />
            <Circle cx={29} cy={29} r={R} stroke={c.accent} strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} />
          </Svg>
          <Txt style={{ position: 'absolute', fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18 }}>{Math.round(pct * 100)}%</Txt>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 26, letterSpacing: -0.3 }}>{g.name}</Txt>
          <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{progressLine(g)} · {extra}</Txt>
        </View>
      </Row>
    </Pressy>
  );
}
