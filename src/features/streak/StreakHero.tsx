import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { fade } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { cardShadow, CornerGlow } from '@/features/progress/parts';
import { useStreak } from './useStreak';
import { FLAME } from './StreakChip';

const MILESTONES = [4, 8, 12]; // weeks; matches the streak badges
const F = 54; // flame size
const BAR = 24; // bar height

function Milestone({ n, reached, left }: { n: number; reached: boolean; left: number }) {
  const { isDark } = useTheme();
  const off = isDark ? '#48526A' : '#C9D0DD';
  const offLine = isDark ? '#7A86A0' : '#98A2B6';
  return (
    <View style={{ position: 'absolute', left, top: 3, width: F, height: F, alignItems: 'center', justifyContent: 'center' }}>
      <Flame size={F} color={reached ? '#F0692C' : offLine} fill={reached ? '#F0692C' : off} strokeWidth={1.5} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingTop: 10 }}>
        <Txt style={{ fontFamily: font.bold, fontSize: 16, lineHeight: 20, color: reached ? '#fff' : isDark ? '#E3E8F3' : '#4A5468' }}>{n}</Txt>
      </View>
    </View>
  );
}

// Big streak card: the number, one plain sentence, and a track with a flame at each milestone.
export function StreakHero() {
  const { c, isDark } = useTheme();
  const st = useStreak();
  const [w, setW] = useState(0);
  const pct = Math.min(1, st.weeks / MILESTONES[MILESTONES.length - 1]);
  const line = st.kept
    ? 'Week complete. Your streak is safe.'
    : st.fresh
      ? "You've taken the first step. Finish 4 sessions this week."
      : st.weeks === 0
        ? `Start again: finish ${st.target} sessions this week.`
        : `${st.left} more ${st.left === 1 ? 'session' : 'sessions'} this week to keep it going.`;
  const track0 = isDark ? '#2B3342' : '#DDE2EB';
  const next = MILESTONES.find((m) => st.weeks < m);

  return (
    <Animated.View entering={fade()} style={[{ backgroundColor: c.surface, borderRadius: 28, padding: 20, gap: 8, overflow: 'hidden' }, cardShadow(isDark)]}>
      <CornerGlow color={FLAME} size={300} />
      <Row style={{ alignItems: 'baseline', gap: 10 }}>
        <Txt style={{ fontFamily: font.displayBold, fontSize: 44, lineHeight: 56, letterSpacing: -1.2, color: FLAME }}>{st.weeks}</Txt>
        <Txt style={{ fontFamily: font.semibold, fontSize: 26, lineHeight: 34, letterSpacing: -0.6 }}>Week streak</Txt>
      </Row>
      <Txt muted style={{ fontSize: 15, lineHeight: 22 }}>{line}</Txt>

      {/* The bar runs the full width of the card; each flame is centred on its week and kept inside the edges. */}
      <View onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ height: F, marginTop: 8 }}>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, borderRadius: BAR / 2, backgroundColor: track0, overflow: 'hidden' }}>
          <LinearGradient colors={['#FFB347', '#F0692C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.max(pct * 100, st.weeks > 0 ? 6 : 0)}%`, height: '100%', borderRadius: BAR / 2 }} />
        </View>
        {w > 0 && MILESTONES.map((m) => (
          <Milestone key={m} n={m} reached={st.weeks >= m} left={Math.min(Math.max((m / MILESTONES[MILESTONES.length - 1]) * w - F / 2, 0), w - F)} />
        ))}
      </View>
      <Txt v="caption">{next ? `${next - st.weeks} ${next - st.weeks === 1 ? 'week' : 'weeks'} to your ${next}-week badge` : 'All streak badges earned'}</Txt>

      <View style={{ height: 1, backgroundColor: c.line, marginVertical: 6 }} />
      <Row style={{ gap: 8 }}>
        {Array.from({ length: st.target }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 14, borderRadius: 7, backgroundColor: i < st.weekDone ? FLAME : track0 }} />
        ))}
      </Row>
      <Txt v="caption">This week · {st.weekDone} of {st.target} sessions</Txt>
    </Animated.View>
  );
}
