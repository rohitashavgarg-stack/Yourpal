import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { Check, ChevronRight } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { Ring } from '@/components/bits';
import { font } from '@/theme/tokens';
import { fmtDay, Goal2, progressLine, statusLine, timeLeft, useGoalV2 } from './model';
import { useEarlySigns } from './signs';
import { useStreak } from '@/features/streak/useStreak';

// Same card on Today (compact) and Progress (expanded): ring on the left, then goal, numbers, status.
// One goal object feeds it, so the name, percent and unit can never differ between screens.
const STYLE = {
  normal: { colors: ['#2F6BEA', '#3E8FEA', '#5CC2E6'], chipFg: '#1B3FB8' },
  endingSoon: { colors: ['#3A35B5', '#5A54DD', '#8E80F5'], chipFg: '#2E2A9A' },
  reached: { colors: ['#0E7E58', '#1FA67C', '#5CCDA8'], chipFg: '#0B6A49' },
} as const;

export function ringCentre(g: Goal2): { big?: string; small?: string; check?: boolean } {
  if (g.status === 'reached' && g.kind !== 'consistency') return { check: true };
  if (g.kind === 'consistency') return { big: `${g.currentValue}/${g.weeklyTarget}`, small: 'this week' };
  return { big: `${Math.round(g.pct * 100)}`, small: '%' };
}

export function GoalRing({ g, size = 88, onDark = true }: { g: Goal2; size?: number; onDark?: boolean }) {
  const stroke = Math.round(size * 0.105);
  const r = (size - stroke) / 2 - 1;
  const c = ringCentre(g);
  const ink = onDark ? '#fff' : '#12151C';
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Ring size={size} r={r} stroke={stroke} pct={g.kind === 'consistency' ? g.pct : g.status === 'reached' ? 1 : g.pct} color={onDark ? '#fff' : '#2F6BEA'} track={onDark ? 'rgba(255,255,255,0.25)' : 'rgba(47,107,234,0.15)'} />
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        {c.check ? <Check size={size * 0.4} color={ink} strokeWidth={3} /> : (
          <Txt style={{ fontFamily: font.semibold, fontSize: g.kind === 'consistency' ? size * 0.27 : size * 0.3, lineHeight: size * 0.38, letterSpacing: -0.8, color: ink }}>
            {c.big}{g.kind !== 'consistency' ? <Txt style={{ fontFamily: font.semibold, fontSize: size * 0.17, lineHeight: size * 0.24, color: onDark ? 'rgba(255,255,255,0.7)' : '#5C6370' }}>{c.small}</Txt> : null}
          </Txt>
        )}
        {g.kind === 'consistency' && !c.check ? <Txt style={{ fontSize: 10, lineHeight: 14, color: onDark ? 'rgba(255,255,255,0.75)' : '#5C6370' }}>this week</Txt> : null}
      </View>
    </View>
  );
}

export function StatusChip({ g, fg }: { g: Goal2; fg: string }) {
  const left = timeLeft(g);
  const label = g.kind === 'consistency'
    ? (g.status === 'reached' ? 'Week complete' : `${g.weeklyTarget - g.currentValue} to go this week`)
    : left ? `${statusLine(g)} · ${left}` : statusLine(g);
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 4 }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 18, color: fg }}>{label}</Txt>
    </View>
  );
}

export function GoalCard2({ size }: { size: 'compact' | 'expanded' | 'hero' }) {
  const g = useGoalV2();
  const early = useEarlySigns();
  const streakLine = useStreakLine();
  const look = g.status === 'reached' && g.kind !== 'consistency' ? STYLE.reached : g.status === 'endingSoon' ? STYLE.endingSoon : STYLE.normal;
  const highlight = look !== STYLE.normal;
  const rs = size === 'hero' ? 84 : size === 'expanded' ? 76 : 68;
  const sub = g.kind === 'consistency' ? `${streakLine} · standing goal` : g.status === 'reached' ? `${g.name} · done` : progressLine(g);
  const Wrap: any = size === 'hero' ? View : Pressy;
  const wrapProps = size === 'hero' ? { accessible: true, accessibilityLabel: `Your goal: ${g.name}. ${sub}. ${statusLine(g)}` } : { accessibilityRole: 'link', scaleTo: 0.98, onPress: () => router.push('/goal-detail'), accessibilityLabel: `Your goal: ${g.name}. ${sub}. ${statusLine(g)}. Open goal` };
  return (
    <Wrap {...wrapProps}>
      <LinearGradient colors={look.colors as any} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ borderRadius: 28, padding: size === 'expanded' ? 20 : 18, gap: 14, overflow: 'hidden', borderWidth: highlight ? 1.5 : 0, borderColor: 'rgba(255,255,255,0.55)' }}>
        <Svg width={240} height={240} viewBox="0 0 240 240" style={{ position: 'absolute', right: -80, top: -90, opacity: highlight ? 0.22 : 0.15 }}>
          <Circle cx={120} cy={120} r={110} fill="none" stroke="#fff" strokeWidth={16} /><Circle cx={120} cy={120} r={70} fill="none" stroke="#fff" strokeWidth={10} />
        </Svg>
        <Row style={{ gap: 16, alignItems: 'center' }}>
          <GoalRing g={g} size={rs} />
          <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt style={{ fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.85)' }}>Your goal</Txt>
              {size !== 'hero' && <ChevronRight size={18} color="#fff" />}
            </Row>
            <Txt numberOfLines={2} style={{ fontFamily: font.display, fontSize: 26, lineHeight: 33, letterSpacing: -0.6, color: '#fff' }}>{g.name}</Txt>
            <Txt style={{ fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.88)' }}>{sub}</Txt>
            <StatusChip g={g} fg={look.chipFg} />
          </View>
        </Row>
        {size === 'hero' && (
          <>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.22)' }} />
            <Row style={{ justifyContent: 'space-between' }}>
              {[['Start', fmtDay(g.startDate)], ['End', g.endDate ? fmtDay(g.endDate) : 'No end date'], ['Status', statusLine(g)]].map(([l, v]) => (
                <View key={l} style={{ gap: 1 }}>
                  <Txt style={{ fontSize: 11, lineHeight: 16, color: 'rgba(255,255,255,0.75)' }}>{l}</Txt>
                  <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: '#fff' }}>{v}</Txt>
                </View>
              ))}
            </Row>
          </>
        )}
        {size === 'expanded' && (
          <>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.22)' }} />
            <Txt style={{ fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.9)' }}>{early}</Txt>
            <Txt style={{ fontSize: 12, lineHeight: 18, color: 'rgba(255,255,255,0.75)' }}>{`Since ${fmtDay(g.startDate)}${g.endDate ? ` · by ${fmtDay(g.endDate)}` : ' · no end date'}`}</Txt>
          </>
        )}
      </LinearGradient>
    </Wrap>
  );
}

function useStreakLine() {
  const st = useStreak();
  return st.weeks ? `${st.weeks}-week streak` : 'Start your streak';
}
