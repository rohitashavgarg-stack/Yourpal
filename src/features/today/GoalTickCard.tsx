import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { Flame } from '@/lib/icons';
import { GoalVisual, goalShare, markerX, VisualSize } from '@/features/goalv2/GoalVisual';
import { useStreak } from '@/features/streak/useStreak';
import { FLAME } from '@/features/streak/StreakChip';
import { createStore } from '@/features/progress/store';
import { Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fmtDay, fmtVal, Goal2, statusLine, useGoalV2 } from '@/features/goalv2/model';
import { DEMO, GC, GoalCardState, goalCardStore, LOOK, RIGHT_TEXT, SEGMENTS, STALE_WEIGH_DAYS, SUFFIX, useGoalCardState } from '@/features/today/goalCardState';

// The goal at the top of Today (Figma "Your Pal Mobile app", node 40151:12923), with no card around it: it sits straight on the page,
// over a soft blue glow, the goal in one line, a status pill, the progress picture for this kind of goal (GoalVisual), and the numbers underneath.
// `flat` = not tappable (on the goal page itself).
// The glow from Figma (node 40152:13496): a blurred ellipse, #0C307E, tilted 16 deg, hugging the left edge, with a second copy blended
// "plus-lighter" that brightens its middle. SVG blur filters do not run in Expo Go, so the same shape is one tilted ellipse with a soft
// radial gradient (bright blue middle, #0C307E shoulders, fading to nothing).

// Demo panel: the smaller Today goal (default) or the current, taller one.
export type GoalSize = 'Smaller' | 'Current';
export const GOAL_SIZES: GoalSize[] = ['Smaller', 'Current'];
export const goalSizeStore = createStore(() => ({ size: 'Smaller' as GoalSize }));

// The glow of the Today card: a radial ellipse (about 300 x 230) behind the content, 50 px past the left edge and 80 px below the bottom, so only part of it
// shows, clipped by the card's rounded corners. Its colour comes from the state.
function Glow({ color, a }: { color: string; a: number }) {
  const W = 340, H = 260;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: -60, bottom: -90, width: W, height: H }}>
      <Svg width={W} height={H}>
        <Defs>
          <RadialGradient id={`goalGlow-${color}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={a} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={W / 2} cy={H / 2} rx={W / 2} ry={H / 2} fill={`url(#goalGlow-${color})`} />
      </Svg>
    </View>
  );
}

// 36 segments, a 2 px gap, 14 px high. Filled = round(36 x the share of time passed), at least 1 once the goal has started.
function Segments({ filled, color }: { filled: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: SEGMENTS }, (_, i) => <View key={i} style={{ flex: 1, height: 14, borderRadius: 2, backgroundColor: i < filled ? color : GC.unfilled }} />)}
    </View>
  );
}

// On the goal page: the large visual for this kind of goal, a "now" bubble on it, and what the two ends mean under it.
// (The share done is one plain line under the name; the chart further down shows time and pace.)
function Marker({ g, w, size }: { g: Goal2; w: number; size: VisualSize }) {
  const { c } = useTheme();
  const x = markerX(g, w, size);
  const BW = 120; // the bubble's box; it stays inside the row while its pointer stays on the marker
  const bx = Math.max(0, Math.min(w - BW, x - BW / 2));
  if (!w) return <View style={{ height: 32 }} />;
  return (
    <View style={{ height: 32 }}>
      <View style={{ position: 'absolute', left: bx, width: BW, alignItems: x - bx < 30 ? 'flex-start' : x - bx > BW - 30 ? 'flex-end' : 'center' }}>
        <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: c.ink, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: c.bg }}>{`${fmtVal(g, g.currentValue)} ${g.unit}`}</Txt>
        </View>
      </View>
      <View style={{ position: 'absolute', left: x - 4, top: 22, width: 8, height: 8, backgroundColor: c.ink, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

function Journey({ g }: { g: Goal2 }) {
  const [w, setW] = useState(0);
  const weekly = g.kind === 'consistency';
  const u = ` ${g.unit}`;
  const ends: [string, string][] = weekly
    ? [['Done this week', `${g.currentValue} ${g.currentValue === 1 ? 'workout' : 'workouts'}`], ['Weekly target', `${g.weeklyTarget} workouts`]]
    : [[g.kind === 'flexibility' ? 'Started at' : 'Start', `${fmtVal(g, g.startValue)}${u}`], ['Goal', `${fmtVal(g, g.targetValue)}${u}`]];
  return (
    <View style={{ gap: 6 }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {!weekly && <Marker g={g} w={w} size="large" />}
      <GoalVisual g={g} size="large" />
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {ends.map(([l, v], i) => (
          <View key={l} style={{ gap: 1, alignItems: i ? 'flex-end' : 'flex-start' }}>
            <Txt v="caption">{l}</Txt>
            <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{v}</Txt>
          </View>
        ))}
      </Row>
    </View>
  );
}

export function GoalTickCard({ flat = false, state: stateProp, weighDays: weighProp }: { flat?: boolean; state?: GoalCardState; weighDays?: number } = {}) {
  const { c } = useTheme();
  const g = useGoalV2();
  const pct = goalShare(g);
  const st = useStreak();
  const derived = useGoalCardState(g);
  const { force, weighDays: storeWeigh } = goalCardStore.use();
  const state = stateProp ?? derived;
  const demo = stateProp != null || force !== 'auto';
  const weighDays = weighProp ?? storeWeigh;
  const by = g.endDate ? `by ${fmtDay(g.endDate)}` : '';
  const done = Math.abs(g.currentValue - g.startValue);
  const total = Math.abs(g.targetValue - g.startValue);
  const verb = g.kind === 'weight' ? 'lost' : g.kind === 'muscle' ? 'gained' : g.kind === 'lean' ? 'lower' : 'added';

  // ---- the goal page keeps its own header (no card around it, status colours): unchanged ----
  if (flat) {
    const tone = g.status === 'ahead' || g.status === 'reached' ? 'good' : g.status === 'aBitBehind' || g.status === 'endingSoon' ? 'warn' : 'accent';
    const pill = tone === 'good' ? { bg: c.goodSoft, fg: c.good } : tone === 'warn' ? { bg: c.warnSoft, fg: c.warn } : { bg: c.accentSoft, fg: c.accentText };
    const label = g.kind === 'consistency' ? (g.currentValue >= g.weeklyTarget ? 'Week complete' : `${g.weeklyTarget - g.currentValue} to go`) : statusLine(g);
    const long = g.name.length > 14;
    return (
      <View style={{ paddingHorizontal: 4, paddingVertical: 4, gap: 16 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <View style={{ flexShrink: 1 }}>
            <Txt numberOfLines={2} style={{ fontFamily: font.displayBold, fontSize: long ? 26 : 32, lineHeight: long ? 34 : 42, letterSpacing: long ? -0.8 : -1.2, color: c.ink }}>{g.name}</Txt>
            <Txt style={{ fontSize: 15, lineHeight: 22, color: c.muted }}>{g.status === 'reached' ? 'All the way there' : `${Math.round(pct * 100)}% of the way there`}</Txt>
          </View>
          <View style={{ minHeight: 40, paddingVertical: 2, paddingHorizontal: 16, borderRadius: 22, backgroundColor: pill.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Txt style={{ fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: pill.fg }}>{label}</Txt>
          </View>
        </Row>
        <Journey g={g} />
      </View>
    );
  }

  const box = { borderRadius: 24, paddingVertical: 16, paddingHorizontal: 15, overflow: 'hidden' as const, borderWidth: 1 };

  if (state === 'noGoal') {
    // No goal yet: a different, quiet layout. No glow, no bar, no number.
    return (
      <Pressy accessibilityRole="link" scaleTo={0.98} onPress={() => router.push('/goal-detail')} accessibilityLabel="No goal set yet. Your coach sets this after your assessment. Open goal details">
        <View style={{ ...box, backgroundColor: GC.emptyBg, borderColor: GC.emptyBorder, borderStyle: 'dashed', gap: 4, marginBottom: 4 }}>
          <Txt style={{ fontFamily: font.display, fontSize: 20, lineHeight: 26, color: GC.emptyTitle }}>No goal set yet</Txt>
          <Txt style={{ fontSize: 13.5, lineHeight: 20, color: GC.emptySub }}>Your coach sets this after your assessment</Txt>
        </View>
      </Pressy>
    );
  }

  const look = LOOK[state];
  const kg = g.kind === 'weight' || g.kind === 'muscle';
  const sample = demo && kg ? DEMO[state] : null; // the demo panel shows the spec's sample numbers; a real member sees their own
  const lost = sample ? sample.lost : done;
  const leftBold = g.kind === 'consistency' ? `${g.currentValue} ${g.currentValue === 1 ? 'workout' : 'workouts'}`
    : g.kind === 'agility' ? `${fmtVal(g, lost)} ${g.unit} faster` : `${fmtVal(g, lost)} ${g.unit} ${verb}`;
  const leftRest = g.kind === 'consistency' ? ` of ${g.weeklyTarget} this week` : ` of ${fmtVal(g, total)} ${g.unit}`;
  // The percentage is the share of the goal's time that has passed (never the target hit), so the kg line beside it always says how far you got.
  const frac = state === 'complete' ? 1 : sample ? sample.pct : g.expected; // null: a weekly goal has no end date, so no percentage
  const pctText = frac != null && Math.round(frac * 100) > 0 ? `${Math.round(frac * 100)}%` : null; // never "0%"
  const stale = weighDays >= STALE_WEIGH_DAYS && kg;
  const rightText = RIGHT_TEXT[state];
  const filled = frac == null ? 0 : state === 'complete' ? SEGMENTS : Math.max(1, Math.round(SEGMENTS * frac));
  const suffix = (g.kind === 'consistency' ? 'standing goal' : SUFFIX(state, by)).replace(/ /g, '\u00A0'); // wraps as one piece, never in the middle of a date
  const right = rightText ? { text: rightText, color: GC.rest }
    : state === 'comeback' ? null
    : pctText ? (stale ? { text: 'Needs a weigh-in', color: GC.amber } : { text: pctText, color: GC.rest }) : null;
  const small = { fontSize: 13, lineHeight: 19 };
  return (
    <Pressy accessibilityRole="link" scaleTo={0.98} onPress={() => router.push('/goal-detail')}
      accessibilityLabel={`${g.name}, ${suffix}. ${leftBold}${leftRest}. ${look.pill.label}.${right ? ` ${right.text}.` : ''} Open goal details`}>
      <View style={{ ...box, backgroundColor: GC.bg, borderColor: GC.border, gap: 12, marginBottom: 4 }}>
        <Glow color={look.glow.color} a={look.glow.a} />
        {/* the title with the date as subtext under it, and the pill in front on the same row: the title wraps inside its own space, the pill never moves down or truncates */}
        <Row style={{ alignItems: 'flex-start', justifyContent: 'space-between', columnGap: 8 }}>
          <View style={{ flexShrink: 1 }}>
            <Txt style={{ fontFamily: font.display, fontSize: 24, lineHeight: 32, letterSpacing: -0.24, color: GC.title }}>{g.name}</Txt>
            <Txt style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 20, color: GC.date }}>{suffix}</Txt>
          </View>
          <View style={{ flexShrink: 0, paddingVertical: 6, paddingHorizontal: 13, borderRadius: 999, backgroundColor: look.pill.bg, borderWidth: look.pill.border ? 1 : 0, borderColor: look.pill.border }}>
            <Txt numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: look.pill.fg }}>{look.pill.label}</Txt>
          </View>
        </Row>
        {/* the 36-segment bar is for body-weight goals; every other kind keeps its own picture (ticks for body fat, staircase, stopwatch ruler, race lane, workout slots), in the state colour */}
        {kg ? <Segments filled={filled} color={look.seg} /> : <GoalVisual g={g} size="mini" color={look.seg} track={GC.unfilled} ring={GC.rest} share={state === 'complete' && g.kind !== 'consistency' ? 1 : undefined} />}
        <Row style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 8 }}>
          <Txt style={{ flexShrink: 1, ...small, color: GC.rest }}>
            <Txt style={{ ...small, fontFamily: font.semibold, color: GC.title }}>{leftBold}</Txt>{leftRest}
          </Txt>
          {g.kind === 'consistency' ? (
            <Row style={{ gap: 4 }}>
              <Flame size={14} color={FLAME} fill={st.weeks ? FLAME : 'transparent'} />
              <Txt style={{ ...small, fontFamily: font.medium, color: st.weeks ? FLAME : GC.rest }}>{st.weeks ? `${st.weeks} ${st.weeks === 1 ? 'week' : 'weeks'}` : 'No streak yet'}</Txt>
            </Row>
          ) : right ? <Txt style={{ ...small, fontFamily: font.medium, color: right.color }}>{right.text}</Txt> : null}
        </Row>
      </View>
    </Pressy>
  );
}
