import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { ChevronRight, ClipboardCheck, Flame } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useScenarios, useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { cardShadow, SubPage } from '@/features/progress/parts';
import { GoalCard2 } from '@/features/goalv2/GoalCard2';
import { daysBetween, EXTEND_DAYS, fmtDay, fmtVal, Goal2, goalV2Store, useGoalV2 } from '@/features/goalv2/model';
import { useEarlySigns, useGoalV2Rows } from '@/features/goalv2/signs';
import { TODAY } from '@/features/progress/trends';
import { useStreak } from '@/features/streak/useStreak';

type Past = { name: string; when: string; result: string };
const HISTORY: Past[] = [
  { name: 'Squat 60 kg', when: 'Mar to Jun 2026', result: 'Reached' },
  { name: 'Lose 4 kg', when: 'Oct 2025 to Jan 2026', result: 'Reached · 4.0 kg' },
];

function Card({ children, gap = 10, style }: { children: React.ReactNode; gap?: number; style?: any }) {
  const { c, isDark } = useTheme();
  return <View style={[{ backgroundColor: c.surface, borderRadius: 24, padding: 18, gap }, cardShadow(isDark), style]}>{children}</View>;
}
const Label = ({ children }: { children: string }) => {
  const { c } = useTheme();
  return <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.3, color: c.muted }}>{children}</Txt>;
};

// Start, now and target side by side.
function ThreeUp({ g }: { g: Goal2 }) {
  const { c } = useTheme();
  const cols: [string, string, boolean][] = [['Start', fmtVal(g, g.startValue), false], ['Now', fmtVal(g, g.currentValue), true], ['Target', fmtVal(g, g.targetValue), false]];
  return (
    <Card>
      <Label>START → NOW → TARGET</Label>
      <Row style={{ justifyContent: 'space-between' }}>
        {cols.map(([l, v, now]) => (
          <View key={l} style={{ flex: 1, alignItems: l === 'Start' ? 'flex-start' : l === 'Target' ? 'flex-end' : 'center', gap: 2 }}>
            <Txt style={{ fontFamily: font.displayBold, fontSize: 28, lineHeight: 36, letterSpacing: -0.6, color: now ? c.accentText : c.ink }}>{v}<Txt style={{ fontFamily: font.display, fontSize: 14, lineHeight: 20, color: c.muted }}>{` ${g.unit}`}</Txt></Txt>
            <Txt v="caption">{l}</Txt>
          </View>
        ))}
      </Row>
    </Card>
  );
}

// Expected pace (dotted) against the member's own line.
function PaceChart({ g }: { g: Goal2 }) {
  const { c } = useTheme();
  const W = 300, H = 120, pad = 10;
  const total = Math.max(1, daysBetween(g.startDate, g.endDate!));
  const el = Math.max(0, daysBetween(g.startDate, TODAY));
  const tx = pad + (Math.min(1, el / total)) * (W - pad * 2);
  const yOf = (p: number) => H - pad - p * (H - pad * 2);
  const expected = g.expected ?? 0;
  const mid = (pad + tx) / 2;
  return (
    <Card>
      <Label>PACE</Label>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Line x1={pad} y1={yOf(0)} x2={W - pad} y2={yOf(1)} stroke={c.muted} strokeWidth={2} strokeDasharray="4 5" strokeLinecap="round" />
        <Path d={`M ${pad} ${yOf(0)} Q ${mid} ${yOf(g.pct * 0.55)} ${tx} ${yOf(g.pct)}`} stroke={c.accent} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <Line x1={tx} y1={pad} x2={tx} y2={H - pad} stroke={c.line} strokeWidth={1.5} />
        <Circle cx={tx} cy={yOf(g.pct)} r={5.5} fill={c.accent} stroke={c.surface} strokeWidth={2.5} />
      </Svg>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="caption">{fmtDay(g.startDate)}</Txt>
        <Txt v="caption">Today</Txt>
        <Txt v="caption">{fmtDay(g.endDate!)}</Txt>
      </Row>
      <Txt style={{ fontSize: 14, lineHeight: 20 }}>{`Expected by today: ${Math.round(expected * 100)}% · you are at ${Math.round(g.pct * 100)}%`}</Txt>
    </Card>
  );
}

function History({ extra }: { extra: Past[] }) {
  const { c } = useTheme();
  const all = [...extra, ...HISTORY];
  return (
    <Card gap={4}>
      <Label>GOAL HISTORY</Label>
      {all.map((h, i) => (
        <View key={h.name + i} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>{h.name}</Txt>
            <Txt v="caption">{h.when}</Txt>
          </View>
          <Txt style={{ fontSize: 13, lineHeight: 19, color: c.muted }}>{h.result}</Txt>
        </View>
      ))}
      <Txt v="caption" style={{ paddingTop: 4 }}>Changing your goal never erases earlier work.</Txt>
    </Card>
  );
}

function assessLine(a: string) {
  return a === 'Two done' ? { l: 'Latest 30 Sep', s: 'Next one is due this week' } : a === 'Only first' ? { l: 'Starting point saved 2 Sep', s: 'Next: Tue 30 Sep' } : a === 'Due now' ? { l: 'Latest 30 Sep', s: 'Due now. Book with the front desk' } : { l: 'No assessment yet', s: 'First one Sat 10:00 am' };
}

export default function GoalDetail() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { state } = useStore();
  const { toast } = useOverlay();
  const g = useGoalV2();
  const s = goalV2Store.use();
  const st = useStreak();
  const early = useEarlySigns();
  const rows = useGoalV2Rows();
  const coach = state.sc.member === 'PT member' ? 'Coach Vikram' : 'your trainer';
  const ended = g.status === 'reached';
  const soon = g.status === 'endingSoon';

  useScenarios({ title: 'Your goal (page)', rows }, [s.version, s.scenario, d.goal, state.sc.member]);

  const extend = () => { goalV2Store.set({ extendDays: s.extendDays + EXTEND_DAYS }); haptic.success(); toast(`Extended by 4 weeks · ${coach} notified`); };
  const adjust = () => { goalV2Store.set({ lowerBy: s.lowerBy + 1 }); haptic.success(); toast(`Target lowered · ${coach} notified`); };
  const finish = () => { goalV2Store.set({ finished: true }); haptic.success(); toast('Saved to your history'); };
  const keep = () => { goalV2Store.set({ kept: true }); haptic.success(); toast('Kept in your goal history'); };
  const next = () => { haptic.tap(); router.push('/goal'); };

  const achieved = g.kind === 'consistency' ? '' : `${g.kind === 'weight' ? 'Lost' : g.kind === 'muscle' ? 'Gained' : g.kind === 'lean' ? 'Lowered body fat by' : 'Reached'} ${g.kind === 'strength' || g.kind === 'flexibility' || g.kind === 'agility' ? `${fmtVal(g, g.currentValue)} ${g.unit}` : `${fmtVal(g, Math.abs(g.currentValue - g.startValue))} ${g.unit}`} in ${g.reachedWeeks} weeks`;
  const extra: Past[] = s.finished || s.kept ? [{ name: g.name, when: `${fmtDay(g.startDate)} to ${fmtDay(TODAY)}`, result: s.finished ? `Finished · ${Math.round(g.pct * 100)}%` : 'Reached' }] : [];

  return (
    <SubPage title="Your goal" fallback="/progress" right={
      <Pressy accessibilityRole="button" accessibilityLabel="Edit goal" onPress={() => router.push('/goal')} style={{ height: 44, paddingHorizontal: 14, justifyContent: 'center' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: c.accentText }}>Edit</Txt>
      </Pressy>}>
      <GoalCard2 size="hero" />

      {soon && !s.finished && (
        <Card gap={12}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 18, lineHeight: 25 }}>What would you like to do?</Txt>
          <Txt muted style={{ fontSize: 14, lineHeight: 21 }}>{`Your goal ends ${g.daysLeft != null && g.daysLeft <= 1 ? 'tomorrow' : `in ${g.daysLeft} days`}. Any of these is fine, and ${coach} is told either way.`}</Txt>
          <Button kind="primary" label="Extend by 4 weeks" onPress={extend} />
          <Button kind="secondary" label={`Adjust target · suggest ${fmtVal(g, g.targetValue + (g.startValue - g.targetValue) * 0.2)} ${g.unit}`} onPress={adjust} />
          <Button kind="outline" label="Finish with what I achieved" onPress={finish} />
        </Card>
      )}

      {ended && g.kind !== 'consistency' && (
        <Card gap={12}>
          <Txt style={{ fontFamily: font.display, fontSize: 26, lineHeight: 34, letterSpacing: -0.5 }}>{achieved}</Txt>
          <Txt muted style={{ fontSize: 14, lineHeight: 21 }}>Your next goal starts from today’s values, so nothing is lost.</Txt>
          <Button kind="accent" label="Set my next goal" onPress={next} />
          <Button kind="secondary" label={s.kept ? 'Kept in history' : 'Keep this as history'} disabled={s.kept} onPress={keep} />
        </Card>
      )}

      {g.kind !== 'consistency' ? (
        <>
          <ThreeUp g={g} />
          <PaceChart g={g} />
          <Pressy accessibilityRole="button" onPress={() => router.navigate('/progress')} scaleTo={0.98}>
            <Card gap={6}>
              <Row style={{ justifyContent: 'space-between' }}><Label>WHAT IS MOVING IT</Label><ChevronRight size={16} color={c.muted} /></Row>
              <Txt style={{ fontSize: 14, lineHeight: 21 }}>{early.replace('Early signs: ', '')}</Txt>
            </Card>
          </Pressy>
          {g.measuredBy === 'assessment' && (
            <Pressy accessibilityRole="button" onPress={() => router.push('/progress/assess')} scaleTo={0.98}>
              <Card gap={6}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row style={{ gap: 8 }}><ClipboardCheck size={16} color={c.accentText} /><Label>MEASURED BY ASSESSMENT</Label></Row>
                  <ChevronRight size={16} color={c.muted} />
                </Row>
                <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21 }}>{`${g.noun[0].toUpperCase()}${g.noun.slice(1)} · ${assessLine(d.assess).l}`}</Txt>
                <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{assessLine(d.assess).s}</Txt>
              </Card>
            </Pressy>
          )}
        </>
      ) : (
        <>
          <Card>
            <Label>THIS WEEK</Label>
            <Row style={{ justifyContent: 'space-between' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dl, i) => {
                const done = i < Math.min(st.weekDone, 3);
                const todayIdx = 2;
                return (
                  <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                    <Txt v="caption">{dl}</Txt>
                    <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? '#F0692C' : c.surface2, borderWidth: i === todayIdx && !done ? 2 : 0, borderColor: '#F0692C' }}>
                      <Txt style={{ fontSize: 12, lineHeight: 17, color: done ? '#fff' : c.muted }}>{22 + i}</Txt>
                    </View>
                  </View>
                );
              })}
            </Row>
            <Txt style={{ fontSize: 14, lineHeight: 20 }}>{`${st.weekDone} of ${g.weeklyTarget} workouts this week`}</Txt>
          </Card>
          <Card>
            <Label>LAST 8 WEEKS</Label>
            <Row style={{ gap: 6, alignItems: 'flex-end', height: 70 }}>
              {[...st.past.slice(-7), null].map((k, i) => (
                <View key={i} style={{ flex: 1, height: k === null ? Math.max(10, (st.weekDone / g.weeklyTarget) * 70) : k ? 70 : 14, borderRadius: 8, backgroundColor: k === null ? '#F0692C' : k ? 'rgba(240,105,44,0.55)' : c.surface3 }} />
              ))}
            </Row>
          </Card>
          <Card gap={8}>
            <Row style={{ gap: 10 }}>
              <Flame size={20} color="#F0692C" fill="#F0692C" />
              <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{st.weeks ? `${st.weeks}-week streak` : 'No streak yet'}</Txt>
            </Row>
            <Txt muted style={{ fontSize: 14, lineHeight: 21 }}>A week counts when you reach your weekly target. Missing a week pauses the streak, it does not erase it.</Txt>
          </Card>
        </>
      )}

      <History extra={extra} />
      <Button kind="secondary" label="Change goal" onPress={() => router.push('/goal')} />
    </SubPage>
  );
}
