import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { Flame } from '@/lib/icons';
import { GoalVisual, goalShare, markerX, VisualSize } from '@/features/goalv2/GoalVisual';
import { useStreak } from '@/features/streak/useStreak';
import { FLAME } from '@/features/streak/StreakChip';
import { createStore } from '@/features/progress/store';
import { Card, Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font, radius } from '@/theme/tokens';
import { fmtDay, fmtVal, Goal2, progressLine, statusLine, useGoalV2 } from '@/features/goalv2/model';
import { GoalCardState, goalCardStore, GoalTone, pillText, STALE_WEIGH_DAYS, TONE, useGoalCardState } from '@/features/today/goalCardState';

// The goal at the top of Today (Figma "Your Pal Mobile app", node 40151:12923), with no card around it: it sits straight on the page,
// over a soft blue glow, the goal in one line, a status pill, the progress picture for this kind of goal (GoalVisual), and the numbers underneath.
// `flat` = not tappable (on the goal page itself).
// The glow from Figma (node 40152:13496): a blurred ellipse, #0C307E, tilted 16 deg, hugging the left edge, with a second copy blended
// "plus-lighter" that brightens its middle. SVG blur filters do not run in Expo Go, so the same shape is one tilted ellipse with a soft
// radial gradient (bright blue middle, #0C307E shoulders, fading to nothing).
const GW = 360, GH = 260;

// Demo panel: the smaller Today goal (default) or the current, taller one.
export type GoalSize = 'Smaller' | 'Current';
export const GOAL_SIZES: GoalSize[] = ['Smaller', 'Current'];
export const goalSizeStore = createStore(() => ({ size: 'Smaller' as GoalSize }));

function Glow({ small = false, tone = 'accent' }: { small?: boolean; tone?: GoalTone }) {
  const { c, isDark } = useTheme();
  if (tone === 'muted') return null; // frozen, paused, no goal: nothing is moving, so there is no light
  // Same Figma ellipse (tilted 16 deg, on the left edge), sized for each version and centred behind its heading: no scaling, so it never drifts.
  // Figma blurs a 184 x 68 ellipse by 27 px, so the light reaches ~50 px past it on every side: the ellipse here is that blurred size, with a long, even falloff.
  const g = small ? { rx: 140, ry: 62, cx: 24, cy: 48 } : { rx: 160, ry: 80, cx: 30, cy: 68 }; // centred on the heading, fading out before the header row
  const blue = tone === 'accent';
  const k = (isDark ? 1 : 0.4) * (blue ? 1 : 0.55); // on a light page the glow is a tint, not a light source; green and amber start softer than the blue
  const core = blue ? (isDark ? '#1F5FDB' : '#2F6BEA') : tone === 'good' ? c.good : c.warn;
  const edge = blue ? (isDark ? '#0C307E' : '#5C8DF0') : core;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: g.cx - GW / 2, top: g.cy - GH / 2, width: GW, height: GH }}>
      <Svg width={GW} height={GH}>
        <Defs>
          <RadialGradient id={`goalGlow-${tone}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={core} stopOpacity={k} />
            <Stop offset="0.3" stopColor={core} stopOpacity={0.8 * k} />
            <Stop offset="0.55" stopColor={edge} stopOpacity={0.45 * k} />
            <Stop offset="0.8" stopColor={edge} stopOpacity={0.14 * k} />
            <Stop offset="1" stopColor={edge} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={GW / 2} cy={GH / 2} rx={g.rx} ry={g.ry} fill={`url(#goalGlow-${tone})`} transform={`rotate(16 ${GW / 2} ${GH / 2})`} />
      </Svg>
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
  const { c, isDark } = useTheme();
  const g = useGoalV2();
  const small = !flat && goalSizeStore.use().size === 'Smaller';
  const pct = goalShare(g);
  const done = Math.abs(g.currentValue - g.startValue);
  const total = Math.abs(g.targetValue - g.startValue);
  const st = useStreak();
  const derived = useGoalCardState(g);
  const weighDays = weighProp ?? goalCardStore.use().weighDays;
  const state = stateProp ?? derived;
  const verb = g.kind === 'weight' ? 'lost' : g.kind === 'muscle' ? 'gained' : g.kind === 'lean' ? 'lower' : 'added';
  const left = g.kind === 'consistency' ? { big: `${g.currentValue} ${g.currentValue === 1 ? 'workout' : 'workouts'}`, small: `of ${g.weeklyTarget} this week` }
    : g.kind === 'agility' ? { big: `${fmtVal(g, done)} ${g.unit} faster`, small: `of ${fmtVal(g, total)} ${g.unit}` }
    : { big: `${fmtVal(g, done)} ${g.unit} ${verb}`, small: `of ${fmtVal(g, total)} ${g.unit}` };
  // Today: the percentage is the share of the goal's time that has passed (never the target hit), so the kg line beside it always says how far you got.
  // The bar fills by the same time share, so the two always agree. Nothing to show yet (0%) means no percentage at all, never "0%".
  const timeShare = state === 'complete' && g.expected != null ? 1 : g.expected; // Complete means the goal's time is over, so the picture shows all of it
  const timePct = timeShare != null && Math.round(timeShare * 100) > 0 ? Math.round(timeShare * 100) : null;
  const right = flat ? (g.status === 'reached' ? 'Goal reached' : `${Math.round(pct * 100)}%`) : timePct != null ? `${timePct}%` : null;
  const staleWeigh = !flat && weighDays >= STALE_WEIGH_DAYS && (g.kind === 'weight' || g.kind === 'muscle');
  const by = g.endDate ? `by ${fmtDay(g.endDate)}` : '';
  const standing = g.endDate ? null : 'Standing goal';
  // a short name keeps the date beside it (as in Figma); a long one puts it on its own line so the name is never cut off
  const inlineBy = !flat && !!by && g.name.length <= (small ? 12 : 10);
  const long = g.name.length > 14;
  // Today: the state sets the pill, the glow and the segments together. A target hit early keeps the green "Goal reached" while its time runs on.
  const tone: GoalTone = state === 'onTrack' && g.status === 'reached' ? 'good' : TONE[state];
  const pillLabel = state === 'onTrack' && g.status === 'reached' ? 'Goal reached' : pillText(state, g);
  const pillTones: Record<GoalTone, { bg: string; fg: string }> = {
    accent: { bg: isDark ? '#fff' : c.accentSoft, fg: isDark ? '#2034E6' : c.accentText },
    good: { bg: c.goodSoft, fg: c.good }, warn: { bg: c.warnSoft, fg: c.warn }, muted: { bg: c.surface2, fg: c.muted },
  };
  const segColor = tone === 'accent' ? undefined : tone === 'good' ? c.good : tone === 'warn' ? c.warn : c.muted; // undefined = the usual mint
  // On the goal page the pill colour carries the status: green ahead or reached, amber behind or ending soon.
  const flatTone = g.status === 'ahead' || g.status === 'reached' ? 'good' : g.status === 'aBitBehind' || g.status === 'endingSoon' ? 'warn' : 'accent';
  const pill = flat ? (flatTone === 'good' ? pillTones.good : flatTone === 'warn' ? pillTones.warn : { bg: c.accentSoft, fg: c.accentText }) : pillTones[tone];
  const pillText2 = flat ? (g.kind === 'consistency' ? pillText('onTrack', g) : statusLine(g)) : pillLabel;

  if (!flat && state === 'noGoal') {
    // No goal yet: no bar, no number. The coach sets it with the member after the assessment.
    return (
      <Pressy accessibilityRole="link" scaleTo={0.98} onPress={() => router.push('/goal-detail')} accessibilityLabel="No goal yet. Your coach sets your goal with you after your assessment. Open goal details">
        <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Txt style={{ flexShrink: 1, fontFamily: font.displayBold, fontSize: 24, lineHeight: 32, letterSpacing: -0.6, color: c.ink }}>Coach sets your goal</Txt>
            <View style={{ minHeight: 28, paddingVertical: 2, paddingHorizontal: 12, borderRadius: 22, backgroundColor: pillTones.muted.bg, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 17, color: pillTones.muted.fg }}>{pillText('noGoal', g)}</Txt>
            </View>
          </Row>
          <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>Your coach sets your goal with you after your assessment.</Txt>
        </Card>
      </Pressy>
    );
  }

  const header = (
    <Row style={{ justifyContent: 'space-between', alignItems: small ? 'center' : 'flex-end', gap: 8, flexWrap: flat ? 'nowrap' : 'wrap' }}>
      <View style={{ flexShrink: 1 }}>
        <Txt numberOfLines={2} style={small
          ? { fontFamily: font.displayBold, fontSize: 24, lineHeight: 32, letterSpacing: -0.6, color: c.ink }
          : { fontFamily: font.displayBold, fontSize: long ? 26 : 32, lineHeight: long ? 34 : 42, letterSpacing: long ? -0.8 : -1.2, color: c.ink }}>
          {g.name}{inlineBy ? ' ' : ''}{inlineBy && <Txt style={{ fontFamily: font.regular, fontSize: small ? 12 : 16, lineHeight: small ? 17 : 24, letterSpacing: small ? 0 : -0.4, color: c.muted }}>{by}</Txt>}
        </Txt>
        {!flat && (standing || (by && !inlineBy)) ? <Txt style={{ fontSize: small ? 12 : 14, lineHeight: small ? 17 : 20, color: c.muted }}>{standing ?? by}</Txt> : null}
        {flat && <Txt style={{ fontSize: 15, lineHeight: 22, color: c.muted }}>{g.status === 'reached' ? 'All the way there' : `${Math.round(pct * 100)}% of the way there`}</Txt>}
      </View>
      <View style={{ minHeight: small ? 28 : 40, paddingVertical: 2, paddingHorizontal: small ? 12 : 16, borderRadius: 22, backgroundColor: pill.bg, alignItems: 'center', justifyContent: 'center', marginBottom: small ? 0 : 4 }}>
        <Txt style={{ fontFamily: font.medium, fontSize: small ? 12 : 14, lineHeight: small ? 17 : 20, color: pill.fg }}>{pillText2}</Txt>
      </View>
    </Row>
  );

  if (flat) {
    return (
      <View style={{ paddingHorizontal: 4, paddingTop: 4, paddingBottom: 4, gap: small ? 12 : 16 }}>
        {header}
        <Journey g={g} />
      </View>
    );
  }

  return (
    <Pressy accessibilityRole="link" scaleTo={0.98} onPress={() => router.push('/goal-detail')}
      accessibilityLabel={`${g.name}, ${by}. ${progressLine(g)}. ${pillLabel}. ${staleWeigh ? 'Needs a weigh-in' : timePct != null ? `${timePct}% of the time` : ''}. Open goal details`}>
      <Card style={{ paddingTop: 20, paddingHorizontal: 16, paddingBottom: 16, gap: small ? 12 : 16 }}>
        {/* the glow stays inside the card's rounded corners */}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.lg, overflow: 'hidden' }}>
          <Glow small={small} tone={tone} />
        </View>
        {header}
        <View style={{ gap: 8 }}>
          <GoalVisual g={g} size={small ? 'mini' : 'compact'} color={segColor} share={g.kind === 'consistency' || timeShare == null ? undefined : timeShare} />
          <Row style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 8 }}>
            <Txt style={{ flexShrink: 1, fontFamily: font.medium, fontSize: small ? 13 : 15, lineHeight: small ? 19 : 22, color: c.ink }}>
              {left.big}<Txt style={{ fontFamily: font.regular, fontSize: 12, lineHeight: 18, color: c.muted }}>{`  ${left.small}`}</Txt>
            </Txt>
            {g.kind === 'consistency' ? (
              <Row style={{ gap: 4 }}>
                <Flame size={small ? 14 : 15} color={FLAME} fill={st.weeks ? FLAME : 'transparent'} />
                <Txt style={{ fontFamily: font.medium, fontSize: small ? 13 : 14, lineHeight: small ? 19 : 20, color: st.weeks ? FLAME : c.muted }}>{st.weeks ? `${st.weeks} ${st.weeks === 1 ? 'week' : 'weeks'}` : 'No streak yet'}</Txt>
              </Row>
            ) : staleWeigh ? <Txt style={{ fontFamily: font.medium, fontSize: small ? 13 : 14, lineHeight: small ? 19 : 20, color: c.warn }}>Needs a weigh-in</Txt>
              : right != null ? <Txt style={{ fontFamily: font.medium, fontSize: small ? 13 : 14, lineHeight: small ? 19 : 20, color: c.muted }}>{right}</Txt> : null}
          </Row>
        </View>
      </Card>
    </Pressy>
  );
}
