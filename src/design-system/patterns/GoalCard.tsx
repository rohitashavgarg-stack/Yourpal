import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { ChevronRight, Flame, Target } from '@/lib/icons';
import { GoalVisual, goalShare, markerX, VisualSize } from '@/features/goalv2/GoalVisual';
import { useStreak } from '@/features/streak/useStreak';
import { FLAME } from '@/features/streak/StreakChip';
import { createStore } from '@/features/progress/store';
import { Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fmtDay, fmtVal, Goal2, statusLine, useGoalV2 } from '@/features/goalv2/model';
import { DEMO, GC, GoalCardState, goalCardStore, LOOK, RIGHT_TEXT, SEGMENTS, STALE_WEIGH_DAYS, SUFFIX, useGoalCardState } from '@/features/today/goalCardState';
import { radii, fontSizes, onDark, round } from '@/design-system/tokens';

// The Programme goal card (src/design-system/patterns/GoalCard.tsx; it was GoalTickCard in features/today). The goal at the top of Today (Figma "Your Pal Mobile app", node 40151:12923), with no card around it: it sits straight on the page,
// over a soft blue glow, the goal in one line, a status pill, the progress picture for this kind of goal (GoalVisual), and the numbers underneath.
// variant "flat" = not tappable (on the goal page itself).
// The glow from Figma (node 40152:13496): a blurred ellipse, #0C307E, tilted 16 deg, hugging the left edge, with a second copy blended
// "plus-lighter" that brightens its middle. SVG blur filters do not run in Expo Go, so the same shape is one tilted ellipse with a soft
// radial gradient (bright blue middle, #0C307E shoulders, fading to nothing).

// Demo panel: the smaller Today goal (default) or the current, taller one.
export type GoalSize = 'Smaller' | 'Current';
export const GOAL_SIZES: GoalSize[] = ['Smaller', 'Current'];
export const goalSizeStore = createStore(() => ({ size: 'Smaller' as GoalSize }));

// The glow of the Today card: a radial ellipse (about 300 x 230) behind the content, 50 px past the left edge and 80 px below the bottom, so only part of it
// shows, clipped by the card's rounded corners. Its colour comes from the state.
export function RadialGlow({ color, a, side = 'left', top }: { color: string; a: number; side?: 'left' | 'right'; top?: boolean }) {
  const W = 340, H = 260;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', ...(side === 'left' ? { left: -60 } : { right: -60 }), ...(top ? { top: -130 } : { bottom: -90 }), width: W, height: H }}>
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
function TickBar({ filled, color }: { filled: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: SEGMENTS }, (_, i) => <View key={i} style={{ flex: 1, height: 14, borderRadius: radii.xs, backgroundColor: i < filled ? color : GC.unfilled }} />)}
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
        <View style={{ height: 26, paddingHorizontal: 10, borderRadius: round(26), backgroundColor: c.ink, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: c.bg }}>{`${fmtVal(g, g.currentValue)} ${g.unit}`}</Txt>
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
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.basePlus, lineHeight: 22 }}>{v}</Txt>
          </View>
        ))}
      </Row>
    </View>
  );
}

// The strip variant: the goal row at the top of the Daily budget card on Today. A thin ring with the share done in it, the goal name with
// the state pill beside it, and one line under it: how far the member got in the goal's own words and the end date ("1.6 of 6.0 kg lost, by 30 Nov").
// A weight or muscle goal whose last weigh-in is 10 days or more old says "Needs a weigh-in" in amber; no goal says so in the name.
const STRIP = { white: onDark.text, soft: onDark.soft, muted: onDark.muted, track: 'rgba(255,255,255,0.14)' };
const RING = 44, RW = 3.5;
function GoalStripRow({ name, line, lineColor, pct, ringColor, pill, none }: { name: string; line: string; lineColor: string; pct: number; ringColor: string; pill?: { label: string; bg: string; fg: string }; none: boolean }) {
  const r = (RING - RW) / 2, len = 2 * Math.PI * r;
  return (
    <Pressy accessibilityRole="link" accessibilityLabel={none ? 'No goal set yet. Open' : `Your goal: ${name}, ${Math.round(pct * 100)} percent${pill ? `, ${pill.label}` : ''}. ${line}. Open`} onPress={() => router.push('/goal-detail')} scaleTo={0.98}
      style={{ minHeight: 76, paddingHorizontal: 18, paddingVertical: 14, justifyContent: 'center' }}>
      <Row style={{ gap: 14 }}>
        <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={RING} height={RING} style={{ position: 'absolute' }}>
            <Circle cx={RING / 2} cy={RING / 2} r={r} stroke={STRIP.track} strokeWidth={RW} fill="none" />
            {!none && pct > 0 && <Circle cx={RING / 2} cy={RING / 2} r={r} stroke={ringColor} strokeWidth={RW} fill="none" strokeLinecap="round"
              strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - Math.min(1, pct))} transform={`rotate(-90 ${RING / 2} ${RING / 2})`} />}
          </Svg>
          {none ? <Target size={18} color={GC.emptyTitle} /> : <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xs2, lineHeight: 15, color: STRIP.white }}>{`${Math.round(pct * 100)}%`}</Txt>}
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Row style={{ gap: 8 }}>
            <Txt numberOfLines={1} style={{ flexShrink: 1, fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24, color: none ? GC.emptyTitle : STRIP.white }}>{name}</Txt>
            {!!pill && <View style={{ height: 22, paddingHorizontal: 9, borderRadius: round(22), backgroundColor: pill.bg, justifyContent: 'center' }}><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, color: pill.fg }}>{pill.label}</Txt></View>}
          </Row>
          {!!line && <Txt numberOfLines={1} style={{ fontSize: fontSizes.sm, lineHeight: 18, color: lineColor }}>{line}</Txt>}
        </View>
        <ChevronRight size={18} color={STRIP.muted} />
      </Row>
    </Pressy>
  );
}

/**
 * "Programme goal": the member's goal, in three looks. All of them follow the same goal state (GoalCardState).
 *   card   the dark card on Progress: name, date, status pill, progress picture, numbers
 *   flat   the header of the goal page: no card, status colours of the page, a large visual with a "now" bubble
 *   strip  one row, the goal inside the Daily budget card on Today: target icon, "Goal", the name, and how far the member got ("1.6 of 6.0 kg")
 * `state` and `weighDays` pin a state for the demo panel and the screenshot page; without them the state comes from the member's data.
 */
export type GoalCardVariant = 'card' | 'flat' | 'strip';
export type GoalCardProps = { variant?: GoalCardVariant; state?: GoalCardState; weighDays?: number };

export function GoalCard({ variant = 'card', state: stateProp, weighDays: weighProp }: GoalCardProps = {}) {
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

  // ---- the goal row inside the Daily budget card ----
  if (variant === 'strip') {
    const none = state === 'noGoal';
    const kgGoal = g.kind === 'weight' || g.kind === 'muscle';
    const sampleS = demo && kgGoal && !none ? DEMO[state] : null; // the same sample numbers the card shows when a state is pinned
    const lostS = sampleS ? sampleS.lost : done;
    const unit = g.unit === '%' ? '%' : ` ${g.unit}`;
    const amount = g.kind === 'consistency' ? `${g.currentValue} of ${g.weeklyTarget} this week` : `${fmtVal(g, lostS)} of ${fmtVal(g, total)}${unit} ${g.kind === 'agility' ? 'faster' : verb}`;
    const staleS = kgGoal && weighDays >= STALE_WEIGH_DAYS && state !== 'complete' && state !== 'backOn';
    const line = none ? '' : staleS ? 'Needs a weigh-in' : [amount, by].filter(Boolean).join(', ');
    const lineColor = staleS ? GC.amber : STRIP.muted;
    const look = none ? null : LOOK[state];
    // on track reads as good news in mint here; the other states keep their own pill
    const pill = look?.pill ? (state === 'onTrack' ? { label: look.pill.label, bg: 'rgba(46,230,168,0.16)', fg: GC.mint } : look.pill) : undefined;
    const share = sampleS ? sampleS.pct : pct;
    return <GoalStripRow name={none ? 'No goal set yet' : g.name} line={line} lineColor={lineColor} pct={state === 'complete' ? 1 : share} ringColor={look?.seg ?? GC.mint} pill={pill} none={none} />;
  }

  // ---- the goal page keeps its own header (no card around it, status colours): unchanged ----
  if (variant === 'flat') {
    const tone = g.status === 'ahead' || g.status === 'reached' ? 'good' : g.status === 'aBitBehind' || g.status === 'endingSoon' ? 'warn' : 'accent';
    const pill = tone === 'good' ? { bg: c.goodSoft, fg: c.good } : tone === 'warn' ? { bg: c.warnSoft, fg: c.warn } : { bg: c.accentSoft, fg: c.accentText };
    const label = g.kind === 'consistency' ? (g.currentValue >= g.weeklyTarget ? 'Week complete' : `${g.weeklyTarget - g.currentValue} to go`) : statusLine(g);
    const long = g.name.length > 14;
    return (
      <View style={{ paddingHorizontal: 4, paddingVertical: 4, gap: 16 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <View style={{ flexShrink: 1 }}>
            <Txt numberOfLines={2} style={{ fontFamily: font.displayBold, fontSize: long ? fontSizes.xl3 : fontSizes.xl4, lineHeight: long ? 34 : 42, letterSpacing: long ? -0.8 : -1.2, color: c.ink }}>{g.name}</Txt>
            <Txt style={{ fontSize: fontSizes.base, lineHeight: 22, color: c.muted }}>{g.status === 'reached' ? 'All the way there' : `${Math.round(pct * 100)}% of the way there`}</Txt>
          </View>
          <View style={{ minHeight: 40, paddingVertical: 2, paddingHorizontal: 16, borderRadius: radii.lg, backgroundColor: pill.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20, color: pill.fg }}>{label}</Txt>
          </View>
        </Row>
        <Journey g={g} />
      </View>
    );
  }

  const box = { borderRadius: radii.card, paddingVertical: 16, paddingHorizontal: 15, overflow: 'hidden' as const, borderWidth: 1 };

  if (state === 'noGoal') {
    // No goal yet: a different, quiet layout. No glow, no bar, no number.
    return (
      <Pressy accessibilityRole="link" scaleTo={0.98} onPress={() => router.push('/goal-detail')} accessibilityLabel="No goal set yet. Your coach sets this after your assessment. Open goal details">
        <View style={{ ...box, backgroundColor: GC.emptyBg, borderColor: GC.emptyBorder, borderStyle: 'dashed', gap: 4, marginBottom: 4 }}>
          <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl, lineHeight: 26, color: GC.emptyTitle }}>No goal set yet</Txt>
          <Txt style={{ fontSize: fontSizes.smPlus, lineHeight: 20, color: GC.emptySub }}>Your coach sets this after your assessment</Txt>
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
  const small = { fontSize: fontSizes.sm, lineHeight: 19 };
  return (
    <Pressy accessibilityRole="link" scaleTo={0.98} onPress={() => router.push('/goal-detail')}
      accessibilityLabel={`${g.name}, ${suffix}. ${leftBold}${leftRest}. ${look.pill ? `${look.pill.label}.` : ''}${right ? ` ${right.text}.` : ''} Open goal details`}>
      <View style={{ ...box, backgroundColor: GC.bg, borderColor: GC.border, gap: 12, marginBottom: 4 }}>
        <RadialGlow color={look.glow.color} a={look.glow.a} />
        {/* the title with the date as subtext under it, and the pill in front on the same row: the title wraps inside its own space, the pill never moves down or truncates */}
        <Row style={{ alignItems: 'flex-start', justifyContent: 'space-between', columnGap: 8 }}>
          <View style={{ flexShrink: 1 }}>
            <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2Plus, lineHeight: 32, letterSpacing: -0.24, color: GC.title }}>{g.name}</Txt>
            <Txt style={{ fontFamily: font.regular, fontSize: fontSizes.md, lineHeight: 20, color: GC.date }}>{suffix}</Txt>
          </View>
          {look.pill && (
            <View style={{ flexShrink: 0, paddingVertical: 6, paddingHorizontal: 13, borderRadius: radii.pill, backgroundColor: look.pill!.bg, borderWidth: look.pill!.border ? 1 : 0, borderColor: look.pill!.border }}>
              <Txt numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 18, color: look.pill!.fg }}>{look.pill!.label}</Txt>
            </View>
          )}
        </Row>
        {/* the 36-segment bar is for body-weight goals; every other kind keeps its own picture (ticks for body fat, staircase, stopwatch ruler, race lane, workout slots), in the state colour */}
        {kg ? <TickBar filled={filled} color={look.seg} /> : <GoalVisual g={g} size="mini" color={look.seg} track={GC.unfilled} ring={GC.rest} share={state === 'complete' && g.kind !== 'consistency' ? 1 : undefined} />}
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
export { RadialGlow as Glow }; // old name, kept so existing imports work
