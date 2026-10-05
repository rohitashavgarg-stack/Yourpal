import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Flame } from '@/lib/icons';
import Svg, { Circle } from 'react-native-svg';
import { Pressy, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { useStreak } from './useStreak';

export const FLAME = '#FF8A3D';

// Small ring with the count inside. Reads as progress toward the week's sessions, never as carousel dots.
function WeekRing({ done, total }: { done: number; total: number }) {
  const { c } = useTheme();
  const S = 40, R = 16, C = 2 * Math.PI * R;
  return (
    <View style={{ width: S, height: S, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
        <Circle cx={S / 2} cy={S / 2} r={R} stroke={c.surface3} strokeWidth={4} fill="none" />
        <Circle cx={S / 2} cy={S / 2} r={R} stroke={FLAME} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={`${C * (done / total)} ${C}`} transform={`rotate(-90 ${S / 2} ${S / 2})`} />
      </Svg>
      <Txt style={{ position: 'absolute', fontFamily: font.semibold, fontSize: 11, lineHeight: 15 }}>{done}/{total}</Txt>
    </View>
  );
}

// One slim line on Today: your weekly streak and how this week is going. Taps through to streaks and badges.
export function StreakChip() {
  const { c } = useTheme();
  const st = useStreak();
  const title = st.fresh ? 'Start your streak' : st.weeks === 0 ? 'Start a new streak' : `${st.weeks}-week streak`;
  const sub = st.kept ? 'Week complete' : `${st.weekDone} of ${st.target} sessions this week`;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${title}. ${sub}. Open streaks and badges`} onPress={() => router.push('/progress/streaks')} scaleTo={0.98}
      style={{ minHeight: 60, borderRadius: 30, backgroundColor: c.surface, paddingLeft: 10, paddingRight: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,138,61,0.16)', alignItems: 'center', justifyContent: 'center' }}>
        <Flame size={22} color={FLAME} fill={st.weeks > 0 ? FLAME : 'transparent'} strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>{title}</Txt>
        <Txt v="caption" numberOfLines={1}>{sub}</Txt>
      </View>
      <WeekRing done={st.weekDone} total={st.target} />
    </Pressy>
  );
}
