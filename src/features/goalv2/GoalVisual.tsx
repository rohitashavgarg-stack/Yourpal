import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flag } from '@/lib/icons';
import { Row } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { Goal2 } from './model';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { radii, fixed } from '@/design-system/tokens';

// One progress picture per kind of goal, always the full width, in two sizes (compact on Today and the Progress card, large on the goal page).
//  weight / muscle / body fat: the value moves steadily from start to target, so a row of ticks that fill.
//  weekly workouts: it resets every week, so one slot per workout (done, the next one, still to come).
//  strength: it moves at tests, in steps, so a staircase that rises left to right and fills as the lift goes up.
//  flexibility: a hold time, so a stopwatch ruler (a mark per second, longer every 5 and 10) filled up to the best hold.
//  agility: lower is better, so a race lane toward the finish flag (going down still reads as moving forward).
export const MINT = '#3CCB9A';
export type VisualSize = 'mini' | 'compact' | 'large';

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export function goalShare(g: Goal2) {
  return g.status === 'reached' && g.kind !== 'consistency' ? 1 : clamp(g.pct);
}

// Where the "now" marker sits, in px from the left of a visual that is `w` wide: on the last filled tick or step, on the best second of the
// ruler, or on the runner in the lane (the lane is shorter than the row because of the flag).
export const TICKS = 36, STEPS = 18;
export function markerX(g: Goal2, w: number, size: VisualSize = 'large') {
  const share = goalShare(g);
  if (g.kind === 'weight' || g.kind === 'muscle' || g.kind === 'lean') {
    const i = Math.max(0, Math.round(share * TICKS) - 1);
    return 3 + (i * (w - 6)) / (TICKS - 1); // ticks are 6 wide, spread edge to edge
  }
  if (g.kind === 'strength') {
    const i = Math.max(0, Math.round(share * STEPS) - 1), gap = 4, bw = (w - gap * (STEPS - 1)) / STEPS;
    return i * (bw + gap) + bw / 2;
  }
  if (g.kind === 'flexibility') {
    const secs = Math.round(g.targetValue);
    return 1 + (Math.min(secs, Math.round(g.currentValue)) * (w - 2)) / secs; // marks are 2 wide, spread edge to edge
  }
  if (g.kind === 'agility') {
    const lane = w - (size === 'large' ? 24 : 20) - 10;
    return share * lane;
  }
  return 0;
}

// `track` and `ring` set the empty segments and the dashed next one (the Today card is always dark, so it passes its own).
// `color` and `share` let a caller colour the filled segments for a state and fill them by something other than the value done (Today fills by time elapsed).
export function GoalVisual({ g, size = 'compact', onColor, color, share: shareProp, track: trackProp, ring: ringProp }: { g: Goal2; size?: VisualSize; onColor?: boolean; color?: string; share?: number; track?: string; ring?: string }) {
  const { c } = useTheme();
  const big = size === 'large';
  const mini = size === 'mini';
  const fill = onColor ? fixed.white : color ?? MINT;
  const track = onColor ? 'rgba(255,255,255,0.24)' : trackProp ?? c.surface3;
  const ring = onColor ? 'rgba(255,255,255,0.7)' : ringProp ?? c.muted;
  const share = shareProp ?? goalShare(g);

  if (g.kind === 'weight' || g.kind === 'muscle' || g.kind === 'lean') {
    const n = TICKS, on = Math.round(share * n), h = big ? 32 : mini ? 14 : 24, tw = mini ? 4 : 6;
    return (
      <View style={{ height: big ? 36 : h, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {Array.from({ length: n }, (_, i) => <View key={i} style={{ width: tw, height: big && i === on - 1 ? 36 : h, borderRadius: tw / 2 + 1, backgroundColor: i < on ? fill : track }} />)}
      </View>
    );
  }

  if (g.kind === 'consistency') {
    const h = big ? 52 : mini ? 14 : 24;
    return (
      <Row style={{ gap: mini ? 6 : 8 }}>
        {Array.from({ length: g.weeklyTarget }, (_, i) => {
          const done = i < g.currentValue, next = i === g.currentValue;
          return <View key={i} style={{ flex: 1, height: h, borderRadius: big ? radii.md : h / 2, backgroundColor: done ? fill : next ? 'transparent' : track, borderWidth: next ? 1.5 : 0, borderStyle: 'dashed', borderColor: ring }} />;
        })}
      </Row>
    );
  }

  if (g.kind === 'strength') {
    const n = STEPS, on = Math.round(share * n), lo = big ? 12 : mini ? 6 : 8, hi = big ? 56 : mini ? 20 : 32;
    return (
      <View style={{ height: hi, flexDirection: 'row', alignItems: 'flex-end', gap: mini ? 3 : 4 }}>
        {Array.from({ length: n }, (_, i) => (
          <View key={i} style={{ flex: 1, height: lo + ((hi - lo) * i) / (n - 1), borderRadius: big ? 5 : mini ? radii.xs : radii.xs, backgroundColor: i < on ? fill : track }} />
        ))}
      </View>
    );
  }

  if (g.kind === 'flexibility') {
    const secs = Math.round(g.targetValue), at = Math.round(g.currentValue);
    const H = big ? 40 : mini ? 18 : 28;
    return (
      <View style={{ height: H, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {Array.from({ length: secs + 1 }, (_, s) => {
          const h = Math.round(s % 10 === 0 ? H : s % 5 === 0 ? H * 0.62 : H * 0.36);
          return <View key={s} style={{ width: 2, height: h, borderRadius: 1, backgroundColor: s <= at ? fill : track }} />;
        })}
      </View>
    );
  }

  // agility
  const h = big ? 36 : mini ? 14 : 24;
  return (
    <Row style={{ gap: mini ? 8 : 10 }}>
      <View style={{ flex: 1, height: h }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: h / 2, backgroundColor: track, overflow: 'hidden' }}>
          <LinearGradient colors={onColor ? ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.7)'] : color ? [color + '26', color + '99'] : ['rgba(60,203,154,0.15)', 'rgba(60,203,154,0.6)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ width: `${Math.max(8, share * 100)}%`, height: '100%' }} />
        </View>
        <IconBadge size={h} bg={fill} style={{ position: 'absolute', left: `${share * 100}%`, marginLeft: -h / 2, top: 0 }}><View style={{ width: h * 0.32, height: h * 0.32, borderRadius: h * 0.16, backgroundColor: onColor ? fixed.blue : fixed.white }} /></IconBadge>
      </View>
      <Flag size={big ? 24 : mini ? 16 : 20} color={onColor ? fixed.white : c.ink} />
    </Row>
  );
}
