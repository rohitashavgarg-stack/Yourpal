import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { X } from '@/lib/icons';
import { fade, fadeOut } from '@/theme/motion';
import { Pill, Pressy, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { LIFT_DATA, LIFT_METRICS, LIFT_TITLES } from '@/features/progress/data';
import { cardShadow, DrawLine, ListCard, SubPage, toPts } from '@/features/progress/parts';
import { LiftName, progressStore } from '@/features/progress/store';
import { useProgressScenarios } from '@/features/progress/scenarios';

const H = 170;

export default function LiftDetail() {
  const { c, isDark } = useTheme();
  const { state } = useStore();
  const ps = progressStore.use();
  const [tip, setTip] = useState<number | null>(null);
  const [w, setW] = useState(0);
  const isPT = state.sc.member === 'PT member';
  const L = LIFT_DATA[ps.lift];
  const vals = L.v[ps.metric];
  const unit = ps.metric === 2 ? ' t' : ' kg';

  useProgressScenarios(`Lift · ${ps.lift}`, [
    { label: 'Lift', options: Object.keys(LIFT_DATA), value: ps.lift, onPick: (v) => { progressStore.set({ lift: v as LiftName }); setTip(null); } },
    { label: 'Plateau hint (Bench press)', options: ['Shown', 'Dismissed'], value: ps.stallGone ? 'Dismissed' : 'Shown', onPick: (v) => progressStore.set({ stallGone: v === 'Dismissed' }) },
  ], [], [ps.lift, ps.stallGone]);

  // Chart geometry in real pixels so the tap columns line up with the points.
  const cw = Math.max(1, w - 24);
  const pts = w ? toPts(vals, cw, H, 10, 15) : [];
  const colW = cw / vals.length;
  const aria = `${ps.lift} ${['estimated 1RM', 'top weight', 'volume'][ps.metric]} over 12 weeks, from ${vals[0]}${unit} to ${vals[11]}${unit}`;

  return (
    <SubPage title={ps.lift} fallback="/progress">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} style={{ marginHorizontal: -16 }}>
        <View style={{ width: 10 }} />
        {(Object.keys(LIFT_DATA) as LiftName[]).map((k) => <Pill key={k} label={k} on={ps.lift === k} onPress={() => { progressStore.set({ lift: k }); setTip(null); }} />)}
        <View style={{ width: 10 }} />
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {LIFT_METRICS.map((l, i) => <Pill key={l} label={l} on={ps.metric === i} onPress={() => { progressStore.set({ metric: i as 0 | 1 | 2 }); setTip(null); }} style={{ flex: 1, paddingHorizontal: 8 }} />)}
      </View>

      <View style={[{ backgroundColor: c.surface, borderRadius: 28, paddingTop: 16, paddingHorizontal: 12, paddingBottom: 12, gap: 6 }, cardShadow(isDark)]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 6, minHeight: 26 }}>
          <Txt v="label">{LIFT_TITLES[ps.metric]}</Txt>
          {tip !== null && <Animated.View entering={fade()} exiting={fadeOut()}><Tag label={`Week ${tip + 1} · ${vals[tip]}${unit}`} bg={c.ink} fg={c.bg} /></Animated.View>}
        </Row>
        <View accessible accessibilityRole="image" accessibilityLabel={aria} style={{ height: H }}>
          {w > 0 && (
            <Svg width={cw} height={H} style={{ overflow: 'visible' }}>
              <Path d={`M10 150H${cw - 10}M10 105H${cw - 10}M10 60H${cw - 10}M10 15H${cw - 10}`} stroke={c.line} strokeWidth={1} />
              <DrawLine key={`${ps.lift}-${ps.metric}`} pts={pts} color={c.accent} width={3} />
              {pts.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={tip === i ? 7 : 4} fill={tip === i ? c.ink : c.accent} />)}
            </Svg>
          )}
          {/* Full-height tap columns: bigger targets than the dots themselves */}
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: cw, flexDirection: 'row' }}>
            {vals.map((v, i) => (
              <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Week ${i + 1}, ${v}${unit}`} onPress={() => { haptic.tap(); setTip(i); }} style={{ width: colW, height: '100%' }} />
            ))}
          </View>
        </View>
        <Txt v="caption" style={{ paddingHorizontal: 6 }}>12 weeks · warm-ups excluded · tap a point</Txt>
      </View>

      <ListCard mono rows={[{ l: L.pr, v: L.prd }, { l: L.last, v: '24 Sep' }]} />

      {L.stall && !ps.stallGone && (
        <Animated.View entering={fade()} exiting={fadeOut()} style={{ padding: 16, borderRadius: 22, backgroundColor: c.accentSoft, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Txt style={{ flex: 1, fontSize: 14, color: c.accentText }}>
            {isPT ? 'Same weight for 3 weeks. Coach Vikram will adjust this in your next plan.' : 'Same weight for 3 weeks. Try a lighter week, or ask Coach Vikram about personal training.'}
          </Txt>
          <Pressy accessibilityRole="button" accessibilityLabel="Dismiss hint" onPress={() => progressStore.set({ stallGone: true })} style={{ width: 44, height: 44, marginTop: -12, marginRight: -12, alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={c.accentText} />
          </Pressy>
        </Animated.View>
      )}
    </SubPage>
  );
}
