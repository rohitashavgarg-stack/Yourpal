import React from 'react';
import { PersonAvatar } from '@/components/Brand';
import { View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Bell, Check, ClipboardCheck } from '@/lib/icons';
import { TODAY } from '@/features/progress/trends';
import { Button, Card, Pill, Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { cardShadow, ListCard, SubPage } from '@/features/progress/parts';
import { ASSESS } from '@/features/gym/data';
import { gymStore, useGymScenarios } from '@/features/gym/state';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { FadeIn } from '@/design-system/primitives/FadeIn';

export default function GymAssessments() {
  const { c, isDark } = useTheme();
  const { d } = useDomain();
  const { state } = useStore();
  const { toast } = useOverlay();
  const g = gymStore.use();
  const isPT = state.sc.member === 'PT member';
  const mode = d.assess;
  const none = mode === 'None yet', only = mode === 'Only first', due = mode === 'Due now';
  const showStart = only || g.asView === 1;
  useGymScenarios('Gym · Assessments', only || none ? [] : [
    { label: 'Viewing', options: ['Assessment 2 · 30 Sep', 'Assessment 1 · 2 Sep'], value: g.asView === 0 ? 'Assessment 2 · 30 Sep' : 'Assessment 1 · 2 Sep', onPick: (v) => gymStore.set({ asView: v.startsWith('Assessment 2') ? 0 : 1 }) },
  ], [], [g.asView, g.asRemind]);

  const dot = { nutri: c.cNutri, act: c.cAct, heart: c.cHeart };
  const hist = only ? [{ t: 'Assessment 1', s: 'Tue 2 Sep · Coach Vikram · 7 tests', v: 1 }]
    : [{ t: 'Assessment 2', s: 'Tue 30 Sep · Coach Vikram · 6 of 7 improved', v: 0 }, { t: 'Assessment 1', s: 'Tue 2 Sep · Coach Vikram · 7 tests', v: 1 }];
  // The next assessment: its name, the date in a chip, and one line (how many days away, or what to do).
  const nextDate = only ? new Date(2026, 8, 30) : new Date(2026, 9, 28);
  const inDays = Math.round((nextDate.getTime() - TODAY.getTime()) / 86400000);
  const nextTitle = none ? 'First assessment' : only ? 'Assessment 2' : 'Assessment 3';
  const nextChip = none ? 'Date to be confirmed' : due ? 'Due this week' : only ? 'Tue 30 Sep' : 'Tue 28 Oct';
  const nextSub = none ? 'Coach Vikram will confirm the day and time' : due ? 'Book at the front desk' : `In ${inDays} days`;
  const remind = () => { const on = !g.asRemind; gymStore.set({ asRemind: on }); toast(on ? 'We will remind you the day before' : 'Reminder off'); };

  return (
    <SubPage title="Assessments" fallback="/gym">
      {none ? (
        <FadeIn style={{ gap: 12 }}>
          <Card style={{ paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center', gap: 10 }}>
            <IconBadge size={64} radius={radii.lg} bg={c.tNutri}><ClipboardCheck size={30} strokeWidth={1.8} color={c.cNutri} /></IconBadge>
            <Txt style={{ fontFamily: font.display, fontSize: 24, lineHeight: 31 }}>No assessment yet</Txt>
            <Txt muted style={{ textAlign: 'center', fontSize: fontSizes.md }}>Coach Vikram will confirm the day and time. Body, strength and mobility tests take about 30 minutes. Your plan is built from it.</Txt>
          </Card>
          <ListCard rows={['Weight, waist and body fat', 'Leg press and bench press', 'Toe touch and resting heart rate'].map((l) => ({ l, muted: true }))} />
        </FadeIn>
      ) : (
        <>
          {due && (
            <FadeIn style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: c.warnSoft }}>
              <Txt style={{ fontSize: fontSizes.md, color: c.warn }}><Txt style={{ fontSize: fontSizes.md, color: c.warn, fontFamily: font.semibold }}>Assessment 3 is due this week. </Txt>Book a slot at the front desk or ask Coach Vikram in chat.</Txt>
            </FadeIn>
          )}
          <LinearGradient colors={[fixed.blue, '#3E8FEA', '#5CC2E6']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radii.xl, padding: 20, gap: 6, overflow: 'hidden' }}>
            <Svg width="100%" height="100%" viewBox="0 0 358 170" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', left: 0, top: 0 }}>
              <Circle cx={300} cy={20} r={120} fill={fixed.white} opacity={0.08} />
              <Path d="M0 140 C 90 110 180 170 260 130 S 340 120 400 140 V 900 H0z" fill={fixed.white} opacity={0.08} />
            </Svg>
            <Txt style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.85)' }}>{showStart ? 'Assessment 1 · 2 Sep' : 'Assessment 2 · 30 Sep vs Assessment 1'}</Txt>
            <Txt style={{ fontFamily: font.display, fontSize: 34, lineHeight: 44, color: fixed.white }}>{showStart ? '7 tests recorded' : '6 of 7 improved'}</Txt>
            <Txt style={{ fontSize: fontSizes.md, color: 'rgba(255,255,255,0.9)' }}>{showStart ? 'Your baseline. Every later assessment is compared with this.' : 'Biggest win: leg press +40 kg. Next focus: toe touch.'}</Txt>
          </LinearGradient>
          {!only && (
            <View accessibilityRole="radiogroup" accessibilityLabel="Which assessment" style={{ flexDirection: 'row', gap: 8 }}>
              {[{ l: 'Assessment 2 · 30 Sep', v: 0 as const }, { l: 'Assessment 1 · 2 Sep', v: 1 as const }].map((v) => <Pill key={v.v} label={v.l} on={g.asView === v.v} onPress={() => gymStore.set({ asView: v.v })} style={{ flex: 1 }} />)}
            </View>
          )}
          {ASSESS.map((grp) => (
            <FadeIn key={`${grp.g}-${showStart}`} style={[{ backgroundColor: c.surface, borderRadius: radii.xl, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 4 }, cardShadow(isDark)]}>
              <Row style={{ gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: radii.xs, backgroundColor: dot[grp.tone] }} /><Txt v="label">{grp.g}</Txt></Row>
              {grp.rows.map(([l, a, b, delta, good], i) => (
                <Row key={l} style={{ minHeight: 54, gap: 10, borderBottomWidth: i < grp.rows.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                  <Txt style={{ flex: 1, fontFamily: font.medium }}>{l}</Txt>
                  <Txt v="mono">{showStart ? a : `${a} → ${b}`}</Txt>
                  {!showStart && <Tag label={delta} bg={good ? c.goodSoft : c.surface2} fg={good ? c.good : c.muted} style={{ minWidth: 58, alignItems: 'center' }} />}
                </Row>
              ))}
            </FadeIn>
          ))}
          <Card style={{ paddingVertical: 16, paddingHorizontal: 18, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><PersonAvatar who="coach" size={26} /><Txt v="label">Coach Vikram’s note</Txt></View>
            <Txt>“{showStart ? 'Good base. Your toe touch is short, so we start light and work on flexibility first.' : 'Leg press is much stronger. Keep the evening walks. Toe touch has not moved, so I added two stretches to your cool-down.'}”</Txt>
          </Card>
          <Card padding={{ horizontal: 16, bottom: 4 }}>
            <Txt v="label" style={{ paddingTop: 14 }}>History</Txt>
            <ListCard style={{ paddingHorizontal: 0, shadowOpacity: 0, elevation: 0 }} rows={hist.map((h) => ({ l: h.t, sub: h.s, onPress: only ? undefined : () => gymStore.set({ asView: h.v as 0 | 1 }), right: (showStart ? 1 : 0) === h.v && !only ? <Tag label="Viewing" bg={c.accentSoft} fg={c.accentText} /> : undefined }))} />
          </Card>
        </>
      )}
      <Card style={{ padding: 18, gap: 12 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25, flexShrink: 1 }}>{nextTitle}</Txt>
          <Tag label={nextChip} bg={due ? c.warnSoft : c.surface2} fg={due ? c.warn : c.ink} />
        </Row>
        <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{nextSub}</Txt>
        <Button kind={g.asRemind ? 'secondary' : 'primary'} label={g.asRemind ? 'Reminder on' : 'Remind me'} icon={g.asRemind ? <Check size={18} color={c.ink} /> : <Bell size={18} color={c.bg} />} onPress={remind} />
      </Card>
      {!none && <Button kind="outline" label="See trends in Progress" onPress={() => router.navigate('/progress')} />}
      {!isPT && <Button kind="outline" label="Want a plan built on these? Try PT" onPress={() => router.push('/gym/pt')} />}
    </SubPage>
  );
}
