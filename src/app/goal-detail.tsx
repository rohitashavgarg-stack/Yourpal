import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { CalendarClock, Check, ChevronRight, ClipboardCheck, Dumbbell, Flag, Flame, Scale, UtensilsCrossed } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useScenarios, useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { cardShadow, SubPage } from '@/features/progress/parts';
import { GoalTickCard } from '@/features/today/GoalTickCard';
import { daysBetween, EXTEND_DAYS, fmtDay, fmtVal, Goal2, goalV2Store, useGoalV2 } from '@/features/goalv2/model';
import { useDrivers, useGoalV2Rows } from '@/features/goalv2/signs';
import { TODAY } from '@/features/progress/trends';
import { useStreak } from '@/features/streak/useStreak';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { Card } from '@/design-system/primitives/Card';

type Past = { name: string; when: string; result: string; amount?: string };
const HISTORY: Past[] = [
  { name: 'Squat 60 kg', when: 'Mar to Jun 2026', result: 'Reached' },
  { name: 'Lose 4 kg', when: 'Oct 2025 to Jan 2026', result: 'Reached', amount: '4.0 kg' },
];

const Label = ({ children }: { children: string }) => {
  const { c } = useTheme();
  return <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 19, color: c.muted }}>{children}</Txt>;
};
// A section heading above its cards (sentence case, like the rest of the app), with room above it so the page reads in groups.
function Section({ title }: { title: string }) {
  return (
    <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25, letterSpacing: -0.3, paddingHorizontal: 4, marginTop: 14, marginBottom: -2 }}>{title}</Txt>
  );
}

// The two numbers a member opens this page for: how much is left, and how long they have.
function LeftTiles({ g }: { g: Goal2 }) {
  const { c } = useTheme();
  const reached = g.status === 'reached';
  const toGo = Math.abs(g.targetValue - g.currentValue);
  const total = Math.abs(g.targetValue - g.startValue);
  const days = g.daysLeft ?? 0;
  const span = Math.max(1, daysBetween(g.startDate, g.endDate!));
  const day = Math.min(span, Math.max(0, daysBetween(g.startDate, TODAY)) + 1);
  const tiles: { label: string; big: string; unit: string; sub: string }[] = [
    { label: 'To go', big: reached ? 'Done' : fmtVal(g, toGo), unit: reached ? '' : ` ${g.unit}`, sub: reached ? 'Target reached' : `of ${fmtVal(g, total)} ${g.unit}` },
    { label: 'Time left', big: reached ? 'Done' : days <= 0 ? 'Today' : String(days), unit: reached || days <= 0 ? '' : days === 1 ? ' day' : ' days', sub: `Day ${day} of ${span}` },
  ];
  return (
    <Row style={{ gap: 12, alignItems: 'stretch' }}>
      {tiles.map((t) => (
        <Card variant="compact" key={t.label} gap={4} style={{ flex: 1, padding: 16 }}>
          <Label>{t.label}</Label>
          <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl4, lineHeight: 42, letterSpacing: -1, color: c.ink }}>{t.big}<Txt style={{ fontFamily: font.regular, fontSize: fontSizes.base, lineHeight: 22, letterSpacing: 0, color: c.muted }}>{t.unit}</Txt></Txt>
          <Txt v="caption">{t.sub}</Txt>
        </Card>
      ))}
    </Row>
  );
}

// One chart answers "am I on track". The answer is the headline (green ahead, amber behind); the chart is the proof: dotted = the pace you
// would need, solid = you, the marker = today, the start and end dates under it.
function ProgressChart({ g }: { g: Goal2 }) {
  const { c } = useTheme();
  const W = 300, H = 150, pad = 12;
  const total = Math.max(1, daysBetween(g.startDate, g.endDate!));
  const el = Math.max(0, Math.min(total, daysBetween(g.startDate, TODAY)));
  const tx = pad + (el / total) * (W - pad * 2);
  const yOf = (p: number) => H - pad - p * (H - pad * 2);
  const mid = (pad + tx) / 2;
  const ex = g.expected ?? 0;
  const ahead = Math.round((g.pct - ex) * 100);
  const sentence = g.status === 'reached' ? 'You reached your target' : ahead > 3 ? `${ahead}% ahead of the pace you need` : ahead < -3 ? `${-ahead}% behind the pace you need` : 'Right on the pace you need';
  const tone = g.status === 'reached' || ahead > 3 ? c.good : ahead < -3 ? c.warn : c.ink;
  const left = Math.max(16, Math.min(84, (tx / W) * 100));
  const ends: [string, string][] = [['Started', fmtDay(g.startDate)], ['Ends', fmtDay(g.endDate!)]];
  return (
    <Card variant="compact" gap={12}>
      <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24, letterSpacing: -0.2, color: tone }}>{sentence}</Txt>
      <View style={{ height: H }}>
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <Line x1={pad} y1={yOf(1)} x2={W - pad} y2={yOf(1)} stroke={c.line} strokeWidth={1} />
          <Line x1={pad} y1={yOf(0)} x2={W - pad} y2={yOf(0)} stroke={c.line} strokeWidth={1} />
          <Line x1={pad} y1={yOf(0)} x2={W - pad} y2={yOf(1)} stroke={c.muted} strokeWidth={2} strokeDasharray="4 5" strokeLinecap="round" />
          <Path d={`M ${pad} ${yOf(0)} Q ${mid} ${yOf(g.pct * 0.55)} ${tx} ${yOf(g.pct)}`} stroke={c.accent} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <Line x1={tx} y1={yOf(g.pct)} x2={tx} y2={yOf(0)} stroke={c.line} strokeWidth={1.5} strokeDasharray="3 4" />
          <Circle cx={tx} cy={yOf(g.pct)} r={5.5} fill={c.accent} stroke={c.surface} strokeWidth={2.5} />
        </Svg>
        <View style={{ position: 'absolute', left: `${left}%`, top: Math.max(0, (yOf(g.pct) / H) * H - 38), width: 120, marginLeft: -60, alignItems: 'center' }}>
          <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: c.ink, justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 17, color: c.bg }}>Today</Txt>
          </View>
        </View>
      </View>
      <Row style={{ justifyContent: 'space-between' }}>
        {ends.map(([l, date], i) => (
          <View key={l} style={{ gap: 1, alignItems: i === 0 ? 'flex-start' : 'flex-end' }}>
            <Txt v="caption">{l}</Txt>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21 }}>{date}</Txt>
          </View>
        ))}
      </Row>
      <Row style={{ gap: 16, justifyContent: 'center' }}>
        <Row style={{ gap: 6 }}><View style={{ width: 16, height: 0, borderTopWidth: 2, borderStyle: 'dashed', borderColor: c.muted }} /><Txt v="caption">Pace you need</Txt></Row>
        <Row style={{ gap: 6 }}><View style={{ width: 16, height: 3, borderRadius: radii.xs, backgroundColor: c.accent }} /><Txt v="caption">You</Txt></Row>
      </Row>
    </Card>
  );
}

const DRIVER_ICON = { workouts: Dumbbell, diet: UtensilsCrossed, weight: Scale } as const;
const BODY_GOALS = ['weight', 'muscle', 'lean'];

// What is moving the goal: one row per driver, an icon, a thin bar, and one number. No sentence to read.
function Drivers({ g }: { g: Goal2 }) {
  const { c } = useTheme();
  // on a body goal the weight row would only repeat the goal itself
  const rows = useDrivers().filter((r) => !(r.key === 'weight' && BODY_GOALS.includes(g.kind)));
  const col = { workouts: [c.tAct, c.cAct], diet: [c.tNutri, c.cNutri], weight: [c.accentSoft, c.accent] } as const;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`What is moving it: ${rows.map((r) => `${r.label} ${r.value}${r.unit}`).join(', ')}. Open progress`} onPress={() => router.navigate('/progress')} scaleTo={0.98}>
      <Card variant="compact" gap={14}>
        {rows.map((r) => {
          const I = DRIVER_ICON[r.key];
          return (
            <Row key={r.key} style={{ gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: col[r.key][0], alignItems: 'center', justifyContent: 'center' }}><I size={19} color={col[r.key][1]} /></View>
              <View style={{ flex: 1, gap: 6 }}>
                <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20 }}>{r.label}</Txt>
                <View style={{ height: 6, borderRadius: radii.xs, backgroundColor: c.surface3, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.max(4, r.pct * 100)}%`, height: 6, borderRadius: radii.xs, backgroundColor: col[r.key][1] }} />
                </View>
              </View>
              <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl2, lineHeight: 30, letterSpacing: -0.4, minWidth: 64, textAlign: 'right' }}>{r.value}<Txt style={{ fontFamily: font.regular, fontSize: fontSizes.sm, lineHeight: 19, color: c.muted, letterSpacing: 0 }}>{r.unit}</Txt></Txt>
            </Row>
          );
        })}
      </Card>
    </Pressy>
  );
}

function History({ extra }: { extra: Past[] }) {
  const { c } = useTheme();
  const all = [...extra, ...HISTORY];
  return (
    <Card variant="compact" gap={4}>
      {all.map((h, i) => (
        <View key={h.name + i} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.line, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: radii.md, backgroundColor: h.result === 'Reached' ? c.goodSoft : c.surface2, alignItems: 'center', justifyContent: 'center' }}>{h.result === 'Reached' ? <Check size={18} color={c.good} strokeWidth={2.6} /> : <Flag size={17} color={c.muted} />}</View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21 }}>{h.name}</Txt>
            <Txt v="caption">{h.when}</Txt>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 1 }}>
            {h.amount ? <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.lg, lineHeight: 24, letterSpacing: -0.3 }}>{h.amount}</Txt> : null}
            <Txt v="caption" style={h.amount ? undefined : { fontSize: fontSizes.sm }}>{h.result}</Txt>
          </View>
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
  const rows = useGoalV2Rows();
  const coach = state.sc.member === 'PT member' ? 'Coach Vikram' : 'your trainer';
  const ended = g.status === 'reached';
  const soon = g.status === 'endingSoon';
  const behind = g.status === 'aBitBehind';

  useScenarios({ title: 'Your goal (page)', rows }, [s.version, s.scenario, d.goal, state.sc.member]);

  const extend = () => { goalV2Store.set({ extendDays: s.extendDays + EXTEND_DAYS }); haptic.success(); toast(`Extended by 4 weeks. ${coach} is told.`); };
  const adjust = () => { goalV2Store.set({ lowerBy: s.lowerBy + 1 }); haptic.success(); toast(`Target lowered. ${coach} is told.`); };
  const finish = () => { goalV2Store.set({ finished: true }); haptic.success(); toast('Saved to your history'); };
  const keep = () => { goalV2Store.set({ kept: true }); haptic.success(); toast('Kept in your goal history'); };
  const next = () => { haptic.tap(); router.push('/goal'); };

  const achieved = g.kind === 'consistency' ? '' : `${g.kind === 'weight' ? 'Lost' : g.kind === 'muscle' ? 'Gained' : g.kind === 'lean' ? 'Lowered body fat by' : 'Reached'} ${g.kind === 'strength' || g.kind === 'flexibility' || g.kind === 'agility' ? `${fmtVal(g, g.currentValue)} ${g.unit}` : `${fmtVal(g, Math.abs(g.currentValue - g.startValue))} ${g.unit}`} in ${g.reachedWeeks} weeks`;
  const extra: Past[] = s.finished || s.kept ? [{ name: g.name, when: `${fmtDay(g.startDate)} to ${fmtDay(TODAY)}`, result: s.finished ? 'Finished' : 'Reached', amount: s.finished ? `${Math.round(g.pct * 100)}%` : undefined }] : [];

  return (
    <SubPage title="Your goal" fallback="/progress" right={
      <Pressy accessibilityRole="button" accessibilityLabel="Change goal" onPress={() => router.push('/goal')} style={{ height: 44, paddingHorizontal: 14, justifyContent: 'center' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20, color: c.accentText }}>Change</Txt>
      </Pressy>}>
      <GoalTickCard flat />

      {behind && !s.finished && (
        <Card variant="compact" gap={12}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25 }}>What would you like to do?</Txt>
          <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 21 }}>{`You are a little behind the pace. Moving the target date by 4 weeks gives you room, and ${coach} is told either way. Or keep going as you are.`}</Txt>
          <Button kind="primary" label="Move target date" onPress={extend} />
          <Button kind="secondary" label={`Adjust target to ${fmtVal(g, g.targetValue + (g.startValue - g.targetValue) * 0.2)} ${g.unit}`} onPress={adjust} />
        </Card>
      )}

      {soon && !s.finished && (
        <Card variant="compact" gap={12}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25 }}>What would you like to do?</Txt>
          <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 21 }}>{`Your goal ends ${g.daysLeft != null && g.daysLeft <= 1 ? 'tomorrow' : `in ${g.daysLeft} days`}. Any of these is fine, and ${coach} is told either way.`}</Txt>
          <Button kind="primary" label="Extend by 4 weeks" onPress={extend} />
          <Button kind="secondary" label={`Adjust target to ${fmtVal(g, g.targetValue + (g.startValue - g.targetValue) * 0.2)} ${g.unit}`} onPress={adjust} />
          <Button kind="outline" label="Finish with what I achieved" onPress={finish} />
        </Card>
      )}

      {ended && g.kind !== 'consistency' && (
        <Card variant="compact" gap={12}>
          <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl3, lineHeight: 34, letterSpacing: -0.5 }}>{achieved}</Txt>
          <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 21 }}>Your next goal starts from today’s values, so nothing is lost.</Txt>
          <Button kind="accent" label="Set my next goal" onPress={next} />
          <Button kind="secondary" label={s.kept ? 'Kept in history' : 'Keep this as history'} disabled={s.kept} onPress={keep} />
        </Card>
      )}

      {g.kind !== 'consistency' ? (
        <>
          <LeftTiles g={g} />
          <Section title="Pace" />
          <ProgressChart g={g} />
          <Section title="What is moving it" />
          <Drivers g={g} />
          {g.measuredBy === 'assessment' && <Section title="How it is measured" />}
          {g.measuredBy === 'assessment' && (
            <Pressy accessibilityRole="button" onPress={() => router.push('/progress/assess')} scaleTo={0.98}>
              <Card variant="compact" gap={12}>
                <Row style={{ gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><ClipboardCheck size={19} color={c.accentText} /></View>
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{`${g.noun[0].toUpperCase()}${g.noun.slice(1)} test`}</Txt>
                    <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{assessLine(d.assess).l}</Txt>
                  </View>
                  <ChevronRight size={18} color={c.muted} />
                </Row>
                <View style={{ alignSelf: 'flex-start', height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: d.assess === 'Due now' ? c.warnSoft : c.surface2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CalendarClock size={14} color={d.assess === 'Due now' ? c.warn : c.muted} />
                  <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 18, color: d.assess === 'Due now' ? c.warn : c.ink }}>{assessLine(d.assess).s}</Txt>
                </View>
              </Card>
            </Pressy>
          )}
        </>
      ) : (
        <>
          <Section title="This week" />
          <Card variant="compact">
            <Row style={{ justifyContent: 'space-between' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dl, i) => {
                const done = i < Math.min(st.weekDone, 3);
                const todayIdx = 2;
                return (
                  <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                    <Txt v="caption">{dl}</Txt>
                    <View style={{ width: 34, height: 34, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? '#F0692C' : c.surface2, borderWidth: i === todayIdx && !done ? 2 : 0, borderColor: '#F0692C' }}>
                      <Txt style={{ fontSize: fontSizes.xs, lineHeight: 17, color: done ? fixed.white : c.muted }}>{22 + i}</Txt>
                    </View>
                  </View>
                );
              })}
            </Row>
          </Card>
          <Section title="Last 8 weeks" />
          <Card variant="compact">
            <Row style={{ gap: 6, alignItems: 'flex-end', height: 70 }}>
              {[...st.past.slice(-7), null].map((k, i) => (
                <View key={i} style={{ flex: 1, height: k === null ? Math.max(10, (st.weekDone / g.weeklyTarget) * 70) : k ? 70 : 14, borderRadius: 8, backgroundColor: k === null ? '#F0692C' : k ? 'rgba(240,105,44,0.55)' : c.surface3 }} />
              ))}
            </Row>
          </Card>
          <Card variant="compact" gap={8}>
            <Row style={{ gap: 10 }}>
              <Flame size={20} color="#F0692C" fill="#F0692C" />
              <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{st.weeks ? `${st.weeks}-week streak` : 'No streak yet'}</Txt>
            </Row>
            <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 21 }}>A week counts when you reach your weekly target. Missing a week pauses the streak, it does not erase it.</Txt>
          </Card>
        </>
      )}

      <Section title="Past goals" />
      <History extra={extra} />
    </SubPage>
  );
}
