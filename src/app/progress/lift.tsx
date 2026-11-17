import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Dumbbell, Footprints, PersonStanding, X } from '@/lib/icons';
import { fadeOut } from '@/theme/motion';
import { Pill, Pressy, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { LIFT_DATA } from '@/features/progress/data';
import { CornerGlow, DrawLine, ListCard, SubPage, toPts } from '@/features/progress/parts';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { Card } from '@/design-system/primitives/Card';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { useLook } from '@/features/progress/look';
import { LiftName, progressStore } from '@/features/progress/store';
import { useProgressScenarios } from '@/features/progress/scenarios';
import { RangeBar } from '@/features/progress/TrendUI';
import { radii, fontSizes } from '@/design-system/tokens';
import { FadeIn } from '@/design-system/primitives/FadeIn';

const H = 170;
const LIFT_ICON = { 'Bench press': Dumbbell, Squat: PersonStanding, 'Leg press': Footprints } as const; // the icon on each lift's pill
const TOP_WEIGHT = 1; // the one measure on this page: the heaviest set of the week

// One lift at a time, picked from pills with an icon each. The trend is its top weight, in a card like the other trend pages.
export default function LiftDetail() {
  const { c } = useTheme();
  const { state } = useStore();
  const ps = progressStore.use();
  const [tip, setTip] = useState<number | null>(null);
  const [w, setW] = useState(0);
  const isPT = state.sc.member === 'PT member';
  const L = LIFT_DATA[ps.lift];
  // the weekly points follow the period: a day or a week shows the last 4 weeks, a month 8, a year all 12
  const weeks = ps.range === 'year' ? 12 : ps.range === 'month' ? 8 : 4;
  const vals = L.v[TOP_WEIGHT].slice(-weeks);
  const last = vals[vals.length - 1];
  const delta = Math.round((last - vals[0]) * 10) / 10;
  const unit = ' kg';

  useProgressScenarios(`Lift · ${ps.lift}`, [
    { label: 'Lift', options: Object.keys(LIFT_DATA), value: ps.lift, onPick: (v) => { progressStore.set({ lift: v as LiftName }); setTip(null); } },
    { label: 'Plateau hint (Bench press)', options: ['Shown', 'Dismissed'], value: ps.stallGone ? 'Dismissed' : 'Shown', onPick: (v) => progressStore.set({ stallGone: v === 'Dismissed' }) },
  ], [], [ps.lift, ps.stallGone]);

  // Chart geometry in real pixels so the tap columns line up with the points.
  const cw = Math.max(1, w - 24);
  const pts = w ? toPts(vals, cw, H, 10, 15) : [];
  const colW = cw / vals.length;
  const aria = `${ps.lift} top weight over the last ${weeks} weeks, from ${vals[0]}${unit} to ${last}${unit}`;

  const look = useLook('lifts'); // the amber of the Lifts card
  return (
    <SubPage title="Lifts and PRs" fallback="/progress" backdrop={<TopGlow color={look.tint} />}>
      <RangeBar />
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 8 }}>
        {(Object.keys(LIFT_DATA) as LiftName[]).map((k) => {
          const Ic = LIFT_ICON[k];
          return <Pill key={k} label={k} on={ps.lift === k} icon={(col) => <Ic size={16} color={col} />} style={{ paddingHorizontal: 12 }} onPress={() => { progressStore.set({ lift: k }); setTip(null); }} />;
        })}
      </View>

      <Card variant="roomy" clip gap={8}>
        <CornerGlow color={look.tint} size={320} />
        <IconBadge size={36} radius={radii.md} bg={look.tint + '26'} style={{ position: 'absolute', top: 16, right: 16 }}><look.Icon size={19} color={look.tint} /></IconBadge>
        <FadeIn key={ps.lift + weeks}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl6, lineHeight: 52, letterSpacing: -1 }}>
            {last}<Txt style={{ fontFamily: font.display, fontSize: fontSizes.lg, color: c.muted }}>{unit}</Txt>
          </Txt>
          <Txt muted style={{ fontSize: fontSizes.md }}>{delta === 0 ? `Top weight, no change in ${weeks} weeks` : `Top weight, ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} kg in ${weeks} weeks`}</Txt>
        </FadeIn>
        <View style={{ paddingTop: 8, paddingHorizontal: 12, gap: 6 }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
          <Row style={{ justifyContent: 'flex-end', paddingHorizontal: 6, minHeight: 26 }}>
            {tip !== null && <FadeIn exiting={fadeOut()}><Tag label={`Week ${12 - weeks + tip + 1}, ${vals[tip]}${unit}`} bg={c.ink} fg={c.bg} /></FadeIn>}
          </Row>
          <View accessible accessibilityRole="image" accessibilityLabel={aria} style={{ height: H }}>
            {w > 0 && (
              <Svg width={cw} height={H} style={{ overflow: 'visible' }}>
                <Path d={`M10 150H${cw - 10}M10 105H${cw - 10}M10 60H${cw - 10}M10 15H${cw - 10}`} stroke={c.line} strokeWidth={1} />
                <DrawLine key={`${ps.lift}-${weeks}`} pts={pts} color={look.tint} width={3} />
                {pts.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={tip === i ? 7 : 4} fill={tip === i ? c.ink : look.tint} />)}
              </Svg>
            )}
            {/* Full-height tap columns: bigger targets than the dots themselves */}
            <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: cw, flexDirection: 'row' }}>
              {vals.map((v, i) => (
                <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Week ${12 - weeks + i + 1}, ${v}${unit}`} onPress={() => { haptic.tap(); setTip(i); }} style={{ width: colW, height: '100%' }} />
              ))}
            </View>
          </View>
          <Txt v="caption" style={{ paddingHorizontal: 6 }}>{`Last ${weeks} weeks, warm-ups excluded, tap a point`}</Txt>
        </View>
      </Card>

      <ListCard mono rows={[{ l: L.pr, v: L.prd }, { l: L.last, v: '24 Sep' }]} />

      {L.stall && !ps.stallGone && (
        <FadeIn exiting={fadeOut()} style={{ padding: 16, borderRadius: radii.lg, backgroundColor: c.accentSoft, flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <Txt style={{ flex: 1, fontSize: fontSizes.md, color: c.accentText }}>
            {isPT ? 'Same weight for 3 weeks. Coach Vikram will adjust this in your next plan.' : 'Same weight for 3 weeks. Try a lighter week, or ask Coach Vikram about personal training.'}
          </Txt>
          <Pressy accessibilityRole="button" accessibilityLabel="Dismiss hint" onPress={() => progressStore.set({ stallGone: true })} style={{ width: 44, height: 44, marginTop: -12, marginRight: -12, alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color={c.accentText} />
          </Pressy>
        </FadeIn>
      )}
    </SubPage>
  );
}
