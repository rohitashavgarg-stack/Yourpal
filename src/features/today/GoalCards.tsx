import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check, ChevronRight, Scale } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { Ring } from '@/components/bits';
import { useDomain } from '@/lib/domain';
import { font } from '@/theme/tokens';
import { createStore } from '@/features/progress/store';
import { WEEKLY } from '@/features/coach/coach';
import { GoalCard } from './TopCards';

// Goal card designs to compare. Pick one in the Today edge-case panel.
export type GoalDesign = 'Current' | 'A · Journey bar' | 'B · Ring + context' | 'C · Goal + focus';
export type GoalPace = 'On track' | 'Ahead' | 'Behind' | 'No weigh-in' | 'Goal reached';
export const DESIGNS: GoalDesign[] = ['Current', 'A · Journey bar', 'B · Ring + context', 'C · Goal + focus'];
export const PACES: GoalPace[] = ['On track', 'Ahead', 'Behind', 'No weigh-in', 'Goal reached'];
export const goalStore = createStore(() => ({ design: 'Current' as GoalDesign, pace: 'On track' as GoalPace }));

const START = 74.5;
const NOW: Record<GoalPace, number> = { 'On track': 72.4, Ahead: 71.6, Behind: 73.4, 'No weigh-in': 72.4, 'Goal reached': 68.5 };
const CHIP: Record<GoalPace, { label: string; bg: string; fg: string }> = {
  'On track': { label: 'On track · 0.5 kg/week', bg: '#FFFFFF', fg: '#1B3FB8' },
  Ahead: { label: 'Ahead · 0.7 kg/week', bg: '#FFFFFF', fg: '#0B7A54' },
  Behind: { label: 'A little behind · one good week catches up', bg: '#FFE7B8', fg: '#7A4700' },
  'No weigh-in': { label: 'No weigh-in for 9 days', bg: '#FFE7B8', fg: '#7A4700' },
  'Goal reached': { label: 'Goal reached', bg: '#FFFFFF', fg: '#0B7A54' },
};

export function useGoalData() {
  const { d } = useDomain();
  const { pace } = goalStore.use();
  const goal = Math.round((START - d.goal.target) * 10) / 10;
  const now = NOW[pace];
  const pct = Math.max(0, Math.min(1, (START - now) / (START - goal)));
  return { pace, start: START, now, goal, pct, toGo: Math.max(0, Math.round((now - goal) * 10) / 10), by: d.goal.by, chip: CHIP[pace], canShow: d.goal.type === 'Weight loss' };
}

const kg = (n: number) => `${n.toFixed(1)}`;

function Shell({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Pressy accessibilityRole="link" accessibilityLabel={label} scaleTo={0.98} onPress={() => router.navigate('/progress')}>
      <LinearGradient colors={['#2F6BEA', '#3B86EA', '#4FB0E6']} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 28, padding: 18, overflow: 'hidden', gap: 14 }}>
        <Svg width={220} height={220} viewBox="0 0 220 220" style={{ position: 'absolute', right: -80, top: -90, opacity: 0.16 }}>
          <Circle cx={110} cy={110} r={100} fill="#fff" />
        </Svg>
        {children}
      </LinearGradient>
    </Pressy>
  );
}

function Top({ by }: { by: string }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Txt style={{ fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.85)' }}>Your goal · by {by}</Txt>
      <ChevronRight size={18} color="#fff" />
    </Row>
  );
}

function Chip({ g }: { g: ReturnType<typeof useGoalData> }) {
  if (g.pace === 'No weigh-in') {
    return (
      <Pressy accessibilityRole="button" accessibilityLabel="Log your weight" onPress={() => router.push('/log-weight')} scaleTo={0.95}
        style={{ alignSelf: 'flex-start', height: 38, paddingHorizontal: 14, borderRadius: 19, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Scale size={16} color="#1B3FB8" />
        <Txt style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: '#1B3FB8' }}>Log your weight</Txt>
      </Pressy>
    );
  }
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: g.chip.bg, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 4 }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 18, color: g.chip.fg }}>{g.chip.label}</Txt>
    </View>
  );
}

const headline = (g: ReturnType<typeof useGoalData>) => (g.pace === 'Goal reached' ? 'Goal reached' : `${kg(g.toGo)} kg to go`);

// A: one thick journey bar from start to goal with a marker at where you are.
function JourneyBar({ g }: { g: ReturnType<typeof useGoalData> }) {
  const w = useSharedValue(0);
  useEffect(() => { w.value = withDelay(120, withTiming(g.pct, { duration: 1000, easing: Easing.out(Easing.cubic) })); }, [g.pct]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` as any }));
  return (
    <View style={{ height: 30, justifyContent: 'center', marginHorizontal: 9 }}>
      <View style={{ height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.25)' }}>
        <Animated.View style={[{ height: 14, borderRadius: 7, backgroundColor: '#fff' }, fill]}>
          <View style={{ position: 'absolute', right: -9, top: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 5, borderColor: '#2F6BEA' }} />
        </Animated.View>
      </View>
    </View>
  );
}

function DesignA({ g }: { g: ReturnType<typeof useGoalData> }) {
  return (
    <Shell label={`Your goal by ${g.by}. ${headline(g)}. Start ${g.start}, now ${g.now}, goal ${g.goal} kilograms. ${g.chip.label}. Open progress`}>
      <Top by={g.by} />
      <Txt style={{ fontFamily: font.display, fontSize: 38, lineHeight: 48, letterSpacing: -1, color: '#fff' }}>{headline(g)}</Txt>
      <View style={{ gap: 4 }}>
        <JourneyBar g={g} />
        <Row style={{ justifyContent: 'space-between' }}>
          {[['Start', g.start], ['Now', g.now], ['Goal', g.goal]].map(([l, v]) => (
            <View key={l as string} style={{ alignItems: l === 'Start' ? 'flex-start' : l === 'Goal' ? 'flex-end' : 'center' }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: '#fff' }}>{kg(v as number)} kg</Txt>
              <Txt style={{ fontSize: 11, lineHeight: 16, color: 'rgba(255,255,255,0.75)' }}>{l}</Txt>
            </View>
          ))}
        </Row>
      </View>
      <Chip g={g} />
    </Shell>
  );
}

// B: keep the ring, but it now says what is left, with start / now / goal beside it.
function DesignB({ g }: { g: ReturnType<typeof useGoalData> }) {
  return (
    <Shell label={`Your goal by ${g.by}. ${headline(g)}. Start ${g.start}, now ${g.now}, goal ${g.goal} kilograms. ${g.chip.label}. Open progress`}>
      <Top by={g.by} />
      <Row style={{ gap: 18 }}>
        <View style={{ width: 118, height: 118, alignItems: 'center', justifyContent: 'center' }}>
          <Ring size={118} r={50} stroke={11} pct={g.pct} color="#fff" track="rgba(255,255,255,0.25)" />
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Txt style={{ fontFamily: font.displayBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.8, color: '#fff' }}>{g.pace === 'Goal reached' ? '0' : kg(g.toGo)}</Txt>
            <Txt style={{ fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.8)' }}>kg left</Txt>
          </View>
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          {[['Start', g.start], ['Now', g.now], ['Goal', g.goal]].map(([l, v]) => (
            <Row key={l as string} style={{ justifyContent: 'space-between', borderBottomWidth: l === 'Goal' ? 0 : 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: l === 'Goal' ? 0 : 6 }}>
              <Txt style={{ fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.8)' }}>{l}</Txt>
              <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: '#fff' }}>{kg(v as number)} kg</Txt>
            </Row>
          ))}
        </View>
      </Row>
      <Chip g={g} />
    </Shell>
  );
}

// C: the goal, plus what Coach Vikram wants from you this week.
function DesignC({ g }: { g: ReturnType<typeof useGoalData> }) {
  return (
    <Shell label={`Your goal by ${g.by}. ${headline(g)}. ${g.chip.label}. This week: ${WEEKLY.focus.join(', ')}. Open progress`}>
      <Top by={g.by} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ fontFamily: font.display, fontSize: 32, lineHeight: 41, letterSpacing: -0.8, color: '#fff', flexShrink: 1 }}>{headline(g)}</Txt>
        <Txt style={{ fontFamily: font.semibold, fontSize: 18, lineHeight: 24, color: '#fff' }}>{Math.round(g.pct * 100)}%</Txt>
      </Row>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
        <View style={{ width: `${g.pct * 100}%`, height: '100%', borderRadius: 4, backgroundColor: '#fff' }} />
      </View>
      <Chip g={g} />
      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.22)' }} />
      <Txt style={{ fontSize: 12, lineHeight: 17, letterSpacing: 1, color: 'rgba(255,255,255,0.8)' }}>THIS WEEK FROM COACH VIKRAM</Txt>
      <View style={{ gap: 8 }}>
        {WEEKLY.focus.map((f, i) => (
          <Row key={f} style={{ gap: 10 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: i === 0 ? '#fff' : 'rgba(255,255,255,0.22)' }}>
              {i === 0 && <Check size={13} color="#1B3FB8" strokeWidth={3} />}
            </View>
            <Txt style={{ fontSize: 14, lineHeight: 20, color: '#fff' }}>{f}</Txt>
          </Row>
        ))}
      </View>
    </Shell>
  );
}

// The Today goal card: the current one, or whichever design is picked in the edge-case panel.
// Designs need start / now / goal weights, so other goal types keep the current card.
export function GoalSwitch() {
  const g = useGoalData();
  const { design } = goalStore.use();
  if (!g.canShow || design === 'Current') return <GoalCard />;
  if (design === 'A · Journey bar') return <DesignA g={g} />;
  if (design === 'B · Ring + context') return <DesignB g={g} />;
  return <DesignC g={g} />;
}
