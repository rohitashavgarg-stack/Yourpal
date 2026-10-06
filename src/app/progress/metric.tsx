import React from 'react';
import { HEALTH_NAME } from '@/lib/health';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { fade } from '@/theme/motion';
import { Button, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { StepsSheet } from '@/features/today/StepsCards';
import { WaterSheet } from '@/features/today/Trackers';
import { QuickLogSheet } from '@/features/today/QuickLogSheet';
import { nextMeal } from '@/features/today/meals';
import { LOG_SHEETS, ManualLogSheet } from '@/features/progress/LogSheets';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { METRIC_TITLES, MetricKey } from '@/features/progress/data';
import { cardShadow, CornerGlow, Hint, ListCard, SubPage } from '@/features/progress/parts';
import { useLook } from '@/features/progress/look';
import { progressStore } from '@/features/progress/store';
import { RANGES, Range, shift, trend } from '@/features/progress/trends';
import { RangeBar, TrendChart } from '@/features/progress/TrendUI';
import { useProgressScenarios } from '@/features/progress/scenarios';

const TIP_UNIT: Record<MetricKey, string> = { weight: ' kg', meas: ' cm', steps: ' steps', water: ' L', hr: ' bpm', sleep: '', diet: '', cons: ' workouts' };

export default function MetricDetail() {
  const { c, isDark } = useTheme();
  const { d, set } = useDomain();
  const { openSheet } = useOverlay();
  const rawK = useLocalSearchParams<{ k?: string }>().k;
  const look = useLook(rawK && rawK in METRIC_TITLES ? (rawK as MetricKey) : 'weight');
  const ps = progressStore.use();
  const raw = useLocalSearchParams<{ k?: string }>().k;
  const k: MetricKey = raw && raw in METRIC_TITLES ? (raw as MetricKey) : 'weight';
  const paused = d.membership === 'Grace over';
  const anchor = new Date(ps.anchor);
  const t = trend(k, ps.range, anchor, { weight: d.weight, water: d.water });

  useProgressScenarios(`Progress · ${METRIC_TITLES[k]}`, [
    { label: 'Period', options: RANGES.map((r) => r.label), value: RANGES.find((r) => r.value === ps.range)!.label, onPick: (v) => progressStore.set({ range: RANGES.find((r) => r.label === v)!.value as Range }) },
    ...(k === 'weight' ? [{ label: 'Membership (logging)', options: ['Active', 'Grace over'], value: paused ? 'Grace over' : 'Active', onPick: (v: string) => set({ membership: v as any }) }] : []),
  ], [], [ps.range, paused, k]);

  const swipe = (dir: 1 | -1) => {
    if ((dir > 0 && !t.win.canNext) || (dir < 0 && !t.win.canPrev)) { haptic.warn(); return; }
    haptic.tick();
    progressStore.set({ anchor: shift(ps.range, anchor, dir).getTime() });
  };

  const bigUnit = k === 'steps' ? (ps.range === 'day' ? ' steps' : ' steps / day') : k === 'water' ? (ps.range === 'day' ? ' L' : ' L / day') : k === 'cons' && Number(t.big) === 1 ? ' workout' : t.unit;
  const extra = k === 'steps' ? [{ l: 'Source', v: d.hc ? HEALTH_NAME : 'Phone sensor' }, { l: 'Daily goal', v: '8,000' }]
    : k === 'water' ? [{ l: 'Daily target', v: '3 L' }]
    : k === 'hr' ? [{ l: 'Source', v: HEALTH_NAME }]
    : k === 'weight' ? [{ l: 'Started', v: '74.5 kg · 2 Sep' }] : [];
  const rows = [...t.stats, ...extra];

  return (
    <SubPage title={METRIC_TITLES[k]} fallback="/progress">
      <RangeBar />
      <View style={[{ backgroundColor: c.surface, borderRadius: 28, padding: 18, gap: 8, overflow: 'hidden' }, cardShadow(isDark)]}>
        <CornerGlow color={look.tint} size={320} />
        <View style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: look.tint + '26', alignItems: 'center', justifyContent: 'center' }}><look.Icon size={19} color={look.tint} /></View>
        <Animated.View key={t.key + 'h'} entering={fade()}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: 42, lineHeight: 52, letterSpacing: -1 }}>
            {t.big}{bigUnit && t.hasData ? <Txt style={{ fontFamily: font.display, fontSize: 18, color: c.muted }}>{bigUnit}</Txt> : null}
          </Txt>
          <Txt muted style={{ fontSize: 14 }}>{t.hasData ? t.sub : (t.empty ?? '')}</Txt>
        </Animated.View>
        <TrendChart t={t} unit={TIP_UNIT[k]} height={190} onSwipe={swipe} color={look.tint} />
      </View>
      {rows.length > 0 && <ListCard rows={rows} />}
      {k === 'steps' && <Button label="Add steps" onPress={() => openSheet(<StepsSheet />, { label: 'Add steps' })} />}
      {k === 'water' && <Button label="Log water" onPress={() => openSheet(<WaterSheet />, { label: 'Water' })} />}
      {k === 'diet' && <Button label="Log a meal" onPress={() => openSheet(<QuickLogSheet mealId={nextMeal(d) ?? 'sn'} mode="write" />, { label: 'Log a meal' })} />}
      {(k === 'hr' || k === 'sleep' || k === 'meas' || k === 'cons') && <Button label={LOG_SHEETS[k].button} onPress={() => openSheet(<ManualLogSheet {...LOG_SHEETS[k].props} />, { label: LOG_SHEETS[k].props.title })} />}
      {k === 'weight' && (paused ? (
        <View style={{ padding: 16, borderRadius: 22, backgroundColor: c.surface2, gap: 4 }}>
          <Txt style={{ fontFamily: font.semibold }}>Logging paused</Txt>
          <Txt muted style={{ fontSize: 14 }}>Your membership grace period ended. History stays here; renew at the front desk to log again.</Txt>
        </View>
      ) : (
        <>
          <Button label="Log weight" onPress={() => router.push('/log-weight')} />
          <Hint>Weight is shared with the Today tracker.</Hint>
        </>
      ))}
    </SubPage>
  );
}
