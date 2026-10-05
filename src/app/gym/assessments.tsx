import React from 'react';
import { PersonAvatar } from '@/components/Brand';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { ClipboardCheck } from '@/lib/icons';
import { fade } from '@/theme/motion';
import { Button, Card, Pill, Row, Txt } from '@/components/ui';
import { PillBtn, Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { cardShadow, ListCard, SubPage } from '@/features/progress/parts';
import { ASSESS } from '@/features/gym/data';
import { gymStore, useGymScenarios } from '@/features/gym/state';

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
    { label: 'Viewing', options: ['Latest · 30 Sep', 'Starting · 2 Sep'], value: g.asView === 0 ? 'Latest · 30 Sep' : 'Starting · 2 Sep', onPick: (v) => gymStore.set({ asView: v.startsWith('Latest') ? 0 : 1 }) },
  ], [], [g.asView, g.asRemind]);

  const dot = { nutri: c.cNutri, act: c.cAct, heart: c.cHeart };
  const hist = only ? [{ t: 'Starting assessment', s: 'Tue 2 Sep · Coach Vikram · 8 tests', v: 1 }]
    : [{ t: 'Reassessment 1', s: 'Tue 30 Sep · Coach Vikram · 7 of 8 improved', v: 0 }, { t: 'Starting assessment', s: 'Tue 2 Sep · Coach Vikram · 8 tests', v: 1 }];
  const nextTitle = none ? 'First assessment · Sat 10:00 am' : due ? 'Reassessment 2 · due this week' : only ? 'Reassessment 1 · Tue 30 Sep' : 'Next reassessment · Tue 28 Oct';
  const nextSub = none ? 'Coach Vikram · wear training clothes, come 2 h after a meal' : due ? 'Coach Vikram · book at the front desk' : 'Coach Vikram · every 4 weeks · front desk books it';
  const remind = () => { const on = !g.asRemind; gymStore.set({ asRemind: on }); toast(on ? 'We will remind you the day before' : 'Reminder off'); };

  return (
    <SubPage title="Assessments" fallback="/gym">
      {none ? (
        <Animated.View entering={fade()} style={{ gap: 12 }}>
          <Card style={{ paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center', gap: 10 }}>
            <View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: c.tNutri, alignItems: 'center', justifyContent: 'center' }}><ClipboardCheck size={30} strokeWidth={1.8} color={c.cNutri} /></View>
            <Txt style={{ fontFamily: font.display, fontSize: 24, lineHeight: 31 }}>No assessment yet</Txt>
            <Txt muted style={{ textAlign: 'center', fontSize: 14 }}>Your first one is Sat 10:00 am with Coach Vikram. Body, strength and mobility tests take about 30 minutes. Your plan is built from it.</Txt>
          </Card>
          <ListCard rows={['Weight, waist and body fat', 'Squat, push-ups, deep squat hold', 'Sit-and-reach and resting heart rate'].map((l) => ({ l, muted: true }))} />
        </Animated.View>
      ) : (
        <>
          {due && (
            <Animated.View entering={fade()} style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: c.warnSoft }}>
              <Txt style={{ fontSize: 14, color: c.warn }}><Txt style={{ fontSize: 14, color: c.warn, fontFamily: font.semibold }}>Reassessment due this week. </Txt>Book a slot at the front desk or ask Coach Vikram in chat.</Txt>
            </Animated.View>
          )}
          <LinearGradient colors={['#2F6BEA', '#3E8FEA', '#5CC2E6']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 28, padding: 20, gap: 6, overflow: 'hidden' }}>
            <Svg width="100%" height="100%" viewBox="0 0 358 170" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', left: 0, top: 0 }}>
              <Circle cx={300} cy={20} r={120} fill="#FFFFFF" opacity={0.08} />
              <Path d="M0 140 C 90 110 180 170 260 130 S 340 120 400 140 V 900 H0z" fill="#FFFFFF" opacity={0.08} />
            </Svg>
            <Txt style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{showStart ? 'Starting assessment · 2 Sep' : 'Reassessment 1 · 30 Sep vs start'}</Txt>
            <Txt style={{ fontFamily: font.display, fontSize: 34, lineHeight: 44, color: '#fff' }}>{showStart ? '8 tests recorded' : '7 of 8 improved'}</Txt>
            <Txt style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{showStart ? 'Your baseline. Every reassessment is compared with this.' : 'Biggest win: squat +20 kg. Next focus: hip mobility.'}</Txt>
          </LinearGradient>
          {!only && (
            <View accessibilityRole="radiogroup" accessibilityLabel="Which assessment" style={{ flexDirection: 'row', gap: 8 }}>
              {[{ l: 'Latest · 30 Sep', v: 0 as const }, { l: 'Starting · 2 Sep', v: 1 as const }].map((v) => <Pill key={v.v} label={v.l} on={g.asView === v.v} onPress={() => gymStore.set({ asView: v.v })} style={{ flex: 1 }} />)}
            </View>
          )}
          {ASSESS.map((grp) => (
            <Animated.View key={`${grp.g}-${showStart}`} entering={fade()} style={[{ backgroundColor: c.surface, borderRadius: 28, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 4 }, cardShadow(isDark)]}>
              <Row style={{ gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot[grp.tone] }} /><Txt v="label">{grp.g}</Txt></Row>
              {grp.rows.map(([l, a, b, delta, good], i) => (
                <Row key={l} style={{ minHeight: 54, gap: 10, borderBottomWidth: i < grp.rows.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                  <Txt style={{ flex: 1, fontFamily: font.medium }}>{l}</Txt>
                  <Txt v="mono">{showStart ? a : `${a} → ${b}`}</Txt>
                  {!showStart && <Tag label={delta} bg={good ? c.goodSoft : c.surface2} fg={good ? c.good : c.muted} style={{ minWidth: 58, alignItems: 'center' }} />}
                </Row>
              ))}
            </Animated.View>
          ))}
          <Card style={{ paddingVertical: 16, paddingHorizontal: 18, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><PersonAvatar who="coach" size={26} /><Txt v="label">Coach Vikram’s note</Txt></View>
            <Txt>“{showStart ? 'Good base. Squat depth is shallow, so we start light and work on mobility first.' : 'Squat depth is much better. Keep the evening walks. Sit-and-reach has not moved, so I added two stretches to your cool-down.'}”</Txt>
          </Card>
          <View style={[{ backgroundColor: c.surface, borderRadius: 28, paddingHorizontal: 16, paddingBottom: 4 }, cardShadow(isDark)]}>
            <Txt v="label" style={{ paddingTop: 14 }}>History</Txt>
            <ListCard style={{ paddingHorizontal: 0, shadowOpacity: 0, elevation: 0 }} rows={hist.map((h) => ({ l: h.t, sub: h.s, onPress: only ? undefined : () => gymStore.set({ asView: h.v as 0 | 1 }), right: (showStart ? 1 : 0) === h.v && !only ? <Tag label="Viewing" bg={c.accentSoft} fg={c.accentText} /> : undefined }))} />
          </View>
        </>
      )}
      <Card style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold }}>{nextTitle}</Txt>
          <Txt v="caption" style={{ fontSize: 13 }}>{nextSub}</Txt>
        </View>
        <PillBtn label={g.asRemind ? 'Reminder on' : 'Remind me'} tone={g.asRemind ? 'ink' : 'soft'} h={40} onPress={remind} />
      </Card>
      {!none && <Button kind="outline" label="See trends in Progress" onPress={() => router.navigate('/progress')} />}
      {!isPT && <Button kind="outline" label="Want a plan built on these? Try PT" onPress={() => router.push('/gym/pt')} />}
    </SubPage>
  );
}
