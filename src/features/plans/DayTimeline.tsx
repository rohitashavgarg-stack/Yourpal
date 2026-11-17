/* eslint-disable react-hooks/refs -- the card reads its ref only when it is tapped (to remember where it is for the grow animation) */
import React from 'react';
import { Image, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { Check, ChevronRight, Dumbbell } from '@/lib/icons';
import { Pressy, Txt } from '@/components/ui';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { useDomain } from '@/lib/domain';
import { useGrowOpen } from '@/lib/cardGrow';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii, round } from '@/design-system/tokens';
import { dayWorkouts, setP, usePlans, type DayPlan } from './store';
import { clipIdFor, THUMBS_CLEAR } from '@/features/workout/clips';

// A workout still to do: the figures of its exercises in a small row, straight on the card (no tile, no white), the first five and a count for the rest.
function ExercisePhotos({ ex }: { ex: DayPlan['ex'] }) {
  const { c } = useTheme();
  return (
    <View accessible accessibilityLabel={`Exercises: ${ex.map((e) => e.name).join(', ')}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 48 }}>
      {ex.slice(0, 5).map((e) => {
        const src = THUMBS_CLEAR[clipIdFor(e.name) ?? ''];
        return src
          ? <Image key={e.id} source={src} resizeMode="contain" style={{ width: 48, height: 44 }} />
          : <View key={e.id} style={{ width: 48, height: 44, alignItems: 'center', justifyContent: 'center' }}><Dumbbell size={20} color={c.muted} /></View>;
      })}
      {ex.length > 5 && <Txt muted style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 19 }}>{`+${ex.length - 5}`}</Txt>}
    </View>
  );
}

// A done workout: the session as up to three low, soft blocks, like Outcurve's, with a small tick between them and a grey pill on each side for the warm-up and the cool-down.
// The exercises are split evenly into the blocks; a block is a little taller the more work (sets, reps, weight) its exercises were. A skipped exercise counts for nothing.
function SessionBlob({ ex }: { ex: DayPlan['ex'] }) {
  const { c } = useTheme();
  const [w, setW] = React.useState(0);
  const H = 44, G = 10;
  const load = ex.map((e) => (e.res === 'skip' ? 0 : Math.max(e.sets, 1) * (e.reps || (e.t ?? 30) / 3) * (1 + e.kg / 30)));
  const k = Math.min(3, ex.length);
  const per = Math.ceil(ex.length / k);
  const groups = Array.from({ length: k }, (_, i) => ({ n: ex.slice(i * per, (i + 1) * per).length, l: load.slice(i * per, (i + 1) * per).reduce((x, y) => x + y, 0) })).filter((g) => g.n > 0);
  const maxL = Math.max(...groups.map((g) => g.l), 1);
  const avail = Math.max(w - G * (groups.length - 1), 1);
  const totalN = groups.reduce((x, g) => x + g.n, 0);
  let x0 = 0;
  const blocks = groups.map((g) => {
    const gw = Math.max((g.n / totalN) * avail, 24);
    const hgt = 24 + 16 * (g.l / maxL);
    const out = { x: x0, y: (H - hgt) / 2, width: gw, height: hgt, rx: Math.min(hgt / 2, gw / 2) };
    x0 += gw + G;
    return out;
  });
  return (
    <View accessible accessibilityLabel={`Shape of the session: warm-up, ${ex.length} exercises, cool-down`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 22, height: 12, borderRadius: round(12), backgroundColor: c.surface3 }} />
      <View style={{ flex: 1, height: H }} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}>
        {w > 0 && (
          <Svg width={w} height={H}>
            {blocks.map((b, i) => <Rect key={i} x={b.x} y={b.y} width={b.width} height={b.height} rx={b.rx} fill={c.good} />)}
            {blocks.slice(0, -1).map((b, i) => <Rect key={`t${i}`} x={b.x + b.width + G / 2 - 2} y={H / 2 - 7} width={4} height={14} rx={2} fill={c.surface3} />)}
          </Svg>
        )}
      </View>
      <View style={{ width: 22, height: 12, borderRadius: round(12), backgroundColor: c.surface3 }} />
    </View>
  );
}

// One workout of the day as a plain grey card: the name, one line about it, a check on the right when it is done (an arrow when not),
// and below that, for a workout to do, the figures of its exercises, and for a done one the session as low soft blocks. Tapping opens that workout's details on a full page that grows out of the card.
// withTime: the planned time comes first in the line (on Today, where there is no timeline beside it). notMarked: the time has passed and the workout was not marked, so a small amber line says so.
export function WorkoutTile({ w, index, next, withTime = false, notMarked = false }: { w: DayPlan; index: number; next: boolean; withTime?: boolean; notMarked?: boolean }) {
  const { c } = useTheme();
  const grow = useGrowOpen();
  const sub = `${withTime && w.time ? `${w.time}, ` : ''}${w.ex.length} exercises${w.mins ? `, ${w.mins} min` : ''}`;
  return (
    <View ref={grow.ref}>
      <Pressy accessibilityRole="button" accessibilityLabel={`${w.name}, ${w.time}, ${sub}${w.done ? ', done' : next ? ', next' : ''}. Open the details`}
        onPressIn={grow.prime} onPress={() => { haptic.tap(); setP({ wi: index }); router.push('/plans/workout'); }} scaleTo={0.98}
        style={{ borderRadius: radii.card, backgroundColor: c.cardLift, padding: 16, gap: 12 }}>
        <CardEdge radius={radii.card} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2Plus, lineHeight: 30, letterSpacing: -0.5 }}>{w.name}</Txt>
            <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>{sub}</Txt>
            {notMarked && !w.done && <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 19, color: c.warn }}>Not marked</Txt>}
          </View>
          {w.done
            ? <View accessibilityLabel="Done" style={{ width: 32, height: 32, borderRadius: round(32), backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}><Check size={18} strokeWidth={3} color={c.bg} /></View>
            : <ChevronRight size={20} color={c.muted} />}
        </View>
        {w.done ? <SessionBlob ex={w.ex} /> : <ExercisePhotos ex={w.ex} />}
      </Pressy>
    </View>
  );
}

// A day with more than one workout: the day as a timeline. A thin line with a dot for each workout, its time right of the dot, and the card under the time.
export function DayTimeline() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();
  const list = dayWorkouts(d, p, p.day);
  if (list.length < 2) return null;
  const next = list.findIndex((x) => !x.done);
  return (
    <View accessibilityRole="list" accessibilityLabel={`${list.length} workouts, in time order`}>
      {list.map((w, i) => {
        const last = i === list.length - 1;
        return (
          <View key={`${w.name}${i}`} style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ width: 14, alignItems: 'center' }}>
              <View style={{ width: 14, height: 14, marginTop: 3, borderRadius: round(14), backgroundColor: w.done ? c.good : i === next ? c.ink : c.surface3, alignItems: 'center', justifyContent: 'center' }}>
                {w.done ? <Check size={9} color={c.bg} strokeWidth={4} /> : null}
              </View>
              {!last && <View style={{ flex: 1, width: 1, backgroundColor: c.line, marginTop: 4 }} />}
            </View>
            <View style={{ flex: 1, gap: 8, paddingBottom: last ? 0 : 18 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 19 }}>{w.time ?? ''}</Txt>
              <WorkoutTile w={w} index={i} next={i === next} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
