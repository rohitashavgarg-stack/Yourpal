import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { Flame } from '@/lib/icons';
import { GoalVisual, goalShare, markerX, VisualSize } from '@/features/goalv2/GoalVisual';
import { useStreak } from '@/features/streak/useStreak';
import { FLAME } from '@/features/streak/StreakChip';
import { Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fmtDay, fmtVal, Goal2, progressLine, statusLine, useGoalV2 } from '@/features/goalv2/model';
import { fixed } from '@/design-system/tokens';

// The goal at the top of Today (Figma "Your Pal Mobile app", node 40151:12923), with no card around it: it sits straight on the page,
// over a soft blue glow, the goal in one line, a status pill, the progress picture for this kind of goal (GoalVisual), and the numbers underneath.
// `flat` = not tappable (on the goal page itself).
// The glow from Figma (node 40152:13496): a blurred ellipse, #0C307E, tilted 16 deg, hugging the left edge, with a second copy blended
// "plus-lighter" that brightens its middle. SVG blur filters do not run in Expo Go, so the same shape is one tilted ellipse with a soft
// radial gradient (bright blue middle, #0C307E shoulders, fading to nothing).
const GW = 360, GH = 260;

function StripGlow({ small = false }: { small?: boolean }) {
  const { isDark } = useTheme();
  // Same Figma ellipse (tilted 16 deg, on the left edge), sized for each version and centred behind its heading: no scaling, so it never drifts.
  // Figma blurs a 184 x 68 ellipse by 27 px, so the light reaches ~50 px past it on every side: the ellipse here is that blurred size, with a long, even falloff.
  const g = small ? { rx: 140, ry: 62, cx: 24, cy: 52 } : { rx: 160, ry: 80, cx: 30, cy: 72 }; // centred on the heading, fading out before the header row
  const k = isDark ? 1 : 0.4; // on a light page the glow is a tint, not a light source
  const core = isDark ? '#1F5FDB' : fixed.blue;
  const edge = isDark ? '#0C307E' : '#5C8DF0';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: g.cx - GW / 2, top: g.cy - GH / 2, width: GW, height: GH }}>
      <Svg width={GW} height={GH}>
        <Defs>
          <RadialGradient id="goalGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={core} stopOpacity={k} />
            <Stop offset="0.3" stopColor={core} stopOpacity={0.8 * k} />
            <Stop offset="0.55" stopColor={edge} stopOpacity={0.45 * k} />
            <Stop offset="0.8" stopColor={edge} stopOpacity={0.14 * k} />
            <Stop offset="1" stopColor={edge} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={GW / 2} cy={GH / 2} rx={g.rx} ry={g.ry} fill="url(#goalGlow)" transform={`rotate(16 ${GW / 2} ${GH / 2})`} />
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

export function GoalStrip({ flat = false }: { flat?: boolean } = {}) {
  const { c, isDark } = useTheme();
  const g = useGoalV2();
  const small = !flat; // the smaller strip (the one we used on Today): the name and the date on one line, a short bar, no "Your goal" label
  const pct = goalShare(g);
  const done = Math.abs(g.currentValue - g.startValue);
  const total = Math.abs(g.targetValue - g.startValue);
  const st = useStreak();
  const verb = g.kind === 'weight' ? 'lost' : g.kind === 'muscle' ? 'gained' : g.kind === 'lean' ? 'lower' : 'added';
  const left = g.kind === 'consistency' ? { big: `${g.currentValue} ${g.currentValue === 1 ? 'workout' : 'workouts'}`, small: `of ${g.weeklyTarget} this week` }
    : g.kind === 'agility' ? { big: `${fmtVal(g, done)} ${g.unit} faster`, small: `of ${fmtVal(g, total)} ${g.unit}` }
    : { big: `${fmtVal(g, done)} ${g.unit} ${verb}`, small: `of ${fmtVal(g, total)} ${g.unit}` };
  const right = g.status === 'reached' ? 'Goal reached' : `${Math.round(pct * 100)}% Completed`;
  const by = g.endDate ? `by ${fmtDay(g.endDate)}` : '';
  const standing = g.endDate ? null : 'Standing goal';
  // a short name keeps the date beside it (as in Figma); a long one puts it on its own line so the name is never cut off
  const inlineBy = !flat && !!by && g.name.length <= (small ? 12 : 10);
  const long = g.name.length > 14;
  const pillText = g.kind === 'consistency' ? (g.currentValue >= g.weeklyTarget ? 'Week complete' : `${g.weeklyTarget - g.currentValue} to go`) : statusLine(g);
  // Today keeps the Figma pill (white on dark). On the goal page the pill colour carries the status: green ahead or reached, amber behind or ending soon.
  const tone = g.status === 'ahead' || g.status === 'reached' ? 'good' : g.status === 'aBitBehind' || g.status === 'endingSoon' ? 'warn' : 'accent';
  const pill = !flat ? { bg: isDark ? fixed.white : c.accentSoft, fg: isDark ? '#2034E6' : c.accentText }
    : tone === 'good' ? { bg: c.goodSoft, fg: c.good } : tone === 'warn' ? { bg: c.warnSoft, fg: c.warn } : { bg: c.accentSoft, fg: c.accentText };
  return (
    <Pressy accessibilityRole={flat ? undefined : 'link'} scaleTo={flat ? 1 : 0.98} onPress={flat ? undefined : () => router.push('/goal-detail')}
      accessibilityLabel={`Your goal: ${g.name}, ${by}. ${progressLine(g)}. ${statusLine(g)}. ${right}.${flat ? '' : ' Open goal details'}`}>
      <View style={{ paddingHorizontal: 4, paddingTop: flat ? 4 : 24, paddingBottom: flat ? 4 : 0, gap: small ? 12 : 16 }}>
        {!flat && <StripGlow small={small} />}
        <Row style={{ justifyContent: 'space-between', alignItems: small ? 'center' : 'flex-end', gap: 8 }}>
          <View style={{ flexShrink: 1 }}>
            {!flat && !small && <Txt style={{ fontSize: 16, lineHeight: 24, color: c.ink }}>Your goal</Txt>}
            <Txt numberOfLines={2} style={small
              ? { fontFamily: font.displayBold, fontSize: 24, lineHeight: 32, letterSpacing: -0.6, color: c.ink }
              : { fontFamily: font.displayBold, fontSize: long ? 26 : 32, lineHeight: long ? 34 : 42, letterSpacing: long ? -0.8 : -1.2, color: c.ink }}>
              {g.name}{inlineBy ? ' ' : ''}{inlineBy && <Txt style={{ fontFamily: font.regular, fontSize: small ? 12 : 16, lineHeight: small ? 17 : 24, letterSpacing: small ? 0 : -0.4, color: c.muted }}>{by}</Txt>}
            </Txt>
            {!flat && (standing || (by && !inlineBy)) ? <Txt style={{ fontSize: small ? 12 : 14, lineHeight: small ? 17 : 20, color: c.muted }}>{standing ?? by}</Txt> : null}
            {flat && <Txt style={{ fontSize: 15, lineHeight: 22, color: c.muted }}>{g.status === 'reached' ? 'All the way there' : `${Math.round(pct * 100)}% of the way there`}</Txt>}
          </View>
          <View style={{ height: small ? 28 : 40, paddingHorizontal: small ? 12 : 16, borderRadius: 22, backgroundColor: pill.bg, alignItems: 'center', justifyContent: 'center', marginBottom: small ? 0 : 4 }}>
            <Txt style={{ fontFamily: font.medium, fontSize: small ? 12 : 14, lineHeight: small ? 17 : 20, color: pill.fg }}>{pillText}</Txt>
          </View>
        </Row>
        {flat ? <Journey g={g} /> : (
          <>
            <View style={{ gap: 8 }}>
            <GoalVisual g={g} size={small ? 'mini' : 'compact'} />
            <Row style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Txt style={{ fontFamily: font.medium, fontSize: small ? 13 : 15, lineHeight: small ? 19 : 22, color: c.ink }}>
                {left.big}<Txt style={{ fontFamily: font.regular, fontSize: 12, lineHeight: 18, color: c.muted }}>{`  ${left.small}`}</Txt>
              </Txt>
              {g.kind === 'consistency' ? (
                <Row style={{ gap: 4 }}>
                  <Flame size={small ? 14 : 15} color={FLAME} fill={st.weeks ? FLAME : 'transparent'} />
                  <Txt style={{ fontFamily: font.medium, fontSize: small ? 13 : 14, lineHeight: small ? 19 : 20, color: st.weeks ? FLAME : c.muted }}>{st.weeks ? `${st.weeks} ${st.weeks === 1 ? 'week' : 'weeks'}` : 'No streak yet'}</Txt>
                </Row>
              ) : <Txt style={{ fontFamily: font.medium, fontSize: small ? 13 : 14, lineHeight: small ? 19 : 20, color: c.muted }}>{right}</Txt>}
            </Row>
            </View>
          </>
        )}
        {/* a thin line under the goal, so it reads as the header of the page and the cards start below it */}
        {!flat && <View style={{ height: 1, backgroundColor: c.line, marginTop: small ? 4 : 8 }} />}
      </View>
    </Pressy>
  );
}
