import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { ChevronRight, Flame, Lock } from '@/lib/icons';
import { useLook } from '@/features/progress/look';
import { fade } from '@/theme/motion';
import { TabScreen } from '@/components/TabScreen';
import { GymHeader } from '@/components/GymHeader';
import { Pressy, Row, Txt } from '@/components/ui';
import { Skeleton } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fmt1 } from '@/lib/useNow';
import { CardKey, goalTitle, NEW_EMPTY, ORDER } from '@/features/progress/data';
import { MetricKey, trend } from '@/features/progress/trends';
import { MiniBars, RangeBar, RangeBarSlim } from '@/features/progress/TrendUI';
import { CardTitle, CornerGlow, GrowBar, PCard, Spark } from '@/features/progress/parts';
import { progressStore } from '@/features/progress/store';
import { AFTER_PHOTO, BEFORE_PHOTO } from '@/features/progress/photoAssets';
import { FLAME } from '@/features/streak/StreakChip';
import { useStreak } from '@/features/streak/useStreak';
import { showProgressLoading, useProgressScenarios } from '@/features/progress/scenarios';
import { GoalCard2 } from '@/features/goalv2/GoalCard2';
import { goalV2Store, progressLine, statusLine, useGoalV2 } from '@/features/goalv2/model';
import { useEarlySigns } from '@/features/goalv2/signs';

let firstLoad = true;

function GoalHero() {
  const { d } = useDomain();
  const ps = progressStore.use();
  const isNew = ps.data === 'New member';
  const g = d.goal;
  const g2 = useGoalV2();
  const earlyLive = useEarlySigns();
  // same numbers as the Today card (one goal model), whatever kind of goal it is
  const pct = isNew ? 0 : Math.round((g2.status === 'reached' && g2.kind !== 'consistency' ? 1 : g2.pct) * 100);
  const line = isNew ? 'Starting point saved · Week 1' : `${progressLine(g2)} · ${statusLine(g2)}`;
  const early = isNew ? 'Early signs show up after your first week' : earlyLive;
  return (
    <Pressy accessibilityRole="link" accessibilityLabel="Your goal. Open goal details" scaleTo={0.98} onPress={() => router.push('/goal-detail')}>
    <LinearGradient colors={['#2F6BEA', '#3E8FEA', '#5CC2E6']} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ borderRadius: 28, padding: 20, gap: 10, overflow: 'hidden' }}>
      <Svg width={240} height={240} viewBox="0 0 240 240" style={{ position: 'absolute', right: -80, top: -90, opacity: 0.15 }}>
        <Circle cx={120} cy={120} r={110} fill="none" stroke="#fff" strokeWidth={16} /><Circle cx={120} cy={120} r={70} fill="none" stroke="#fff" strokeWidth={10} />
      </Svg>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Goal</Txt>
        <Pressy accessibilityRole="button" accessibilityLabel="Edit goal" onPress={() => router.push('/progress/goal')} hitSlop={4}
          style={{ height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 13, color: '#fff' }}>Edit</Txt>
        </Pressy>
      </Row>
      <Txt style={{ fontFamily: font.display, fontSize: 34, lineHeight: 44, letterSpacing: -0.6, color: '#fff' }}>{g2.name}{g.by && g.by !== '—' && g.by !== 'No date' ? ` by ${g.by}` : ''}</Txt>
      <GrowBar pct={pct} color="#fff" h={8} track="rgba(255,255,255,0.22)" />
      <Txt style={{ fontSize: 14, color: '#fff' }}>{line}</Txt>
      <Txt style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{early}</Txt>
    </LinearGradient>
    </Pressy>
  );
}

function Big({ big, unit }: { big: string; unit?: string }) {
  const { c } = useTheme();
  return (
    <Txt style={{ fontFamily: font.display, fontSize: 32, lineHeight: 40, letterSpacing: -0.6 }}>
      {big}{unit ? <Txt style={{ fontFamily: font.display, fontSize: 18, color: c.muted }}>{unit}</Txt> : null}
    </Txt>
  );
}

function ProgressCard({ k }: { k: CardKey }) {
  const { c } = useTheme();
  const look = useLook(k);
  const tint = look.tint;
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  const ps = progressStore.use();
  const v2 = goalV2Store.use().version === 'Version 2';
  const st = useStreak();
  const isNew = ps.data === 'New member';
  const TK: Partial<Record<CardKey, MetricKey>> = { weight: 'weight', cons: 'cons', diet: 'diet', steps: 'steps', hr: 'hr', sleep: 'sleep', water: 'water' };
  const mk = TK[k];
  const t = mk ? trend(mk, ps.range, new Date(ps.anchor), { weight: d.weight, water: d.water }) : null;
  const nums = t ? t.vals.filter((v): v is number => v != null) : [];
  const assessNone = isNew || d.assess === 'None yet';

  const connect = k === 'steps' && !d.hc;
  let empty = isNew ? NEW_EMPTY[k] ?? '' : '';
  if (connect) empty = 'Read from Health Connect / Apple Health once you allow it.';

  const titles: Record<CardKey, string> = {
    weight: 'Weight', cons: 'Consistency', diet: 'Diet', lifts: 'Lifts & PRs', steps: 'Steps', meas: 'Measurements', assess: 'Assessments',
    photos: 'Photos · Private', water: 'Water', hr: 'Resting heart rate · Health Connect', sleep: 'Sleep · Health Connect',
  };
  const open = () => {
    if (connect) { set({ hc: true }); haptic.success(); toast('Health Connect connected · steps sync automatically'); return; }
    if (k === 'lifts') { progressStore.set({ lift: 'Leg press' }); router.push('/progress/lift'); }
    else if (k === 'assess') router.push('/progress/assess');
    else if (k === 'photos') router.push('/progress/photos');
    else router.push({ pathname: '/progress/metric', params: { k } });
  };

  let body: React.ReactNode = null;
  if (empty) body = <Txt muted style={{ fontSize: 14 }}>{empty}</Txt>;
  else {
    const withSpark = (big: string, unit: string, sub: string, vals: number[]) => (
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <View style={{ flexShrink: 1, gap: 2 }}><Big big={big} unit={unit} /><Txt v="caption" style={{ fontSize: 13 }}>{sub}</Txt></View>
        <Spark key={`${ps.range}-${ps.anchor}-${vals.join()}`} vals={vals.length > 1 ? vals : [vals[0] ?? 0, vals[0] ?? 0]} color={tint} />
      </Row>
    );
    const plain = (big: string, unit: string, sub: string) => (
      <View style={{ gap: 2 }}><Big big={big} unit={unit} /><Txt v="caption" style={{ fontSize: 13 }}>{sub}</Txt></View>
    );
    const withBars = (big: string, unit: string, sub: string) => (
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        <View style={{ flexShrink: 1, gap: 2 }}><Big big={big} unit={unit} /><Txt v="caption" style={{ fontSize: 13 }}>{sub}</Txt></View>
        <MiniBars key={`${ps.range}-${ps.anchor}`} vals={t!.vals} color={tint} w={112} />
      </Row>
    );
    const noData = t && !t.hasData;
    switch (k) {
      case 'weight': body = noData ? <Txt muted style={{ fontSize: 14 }}>{t!.empty}</Txt> : withSpark(t!.big, ' kg', t!.sub, nums); break;
      case 'lifts': body = withSpark('130', ' kg', 'Leg press · latest PR · 24 Sep', [110, 112, 115, 117.5, 120, 125, 130]); break;
      case 'hr': body = noData ? <Txt muted style={{ fontSize: 14 }}>{t!.empty}</Txt> : withSpark(t!.big, ' bpm', t!.sub, nums); break;
      case 'cons': body = noData ? <Txt muted style={{ fontSize: 14 }}>{t!.empty}</Txt> : v2
        ? (
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
            <View style={{ flexShrink: 1, gap: 2 }}>
              <Big big={`${st.weekDone} of ${st.target}`} unit=" this week" />
              <Txt v="caption" style={{ fontSize: 13 }}>{st.weekDone >= st.target ? 'Week complete' : `${st.left} to go this week`}</Txt>
            </View>
            <MiniBars key={`${ps.range}-${ps.anchor}`} vals={t!.vals} color={tint} w={112} />
          </Row>
        )
        : withBars(t!.big, Number(t!.big) === 1 ? ' workout' : ' workouts', t!.sub); break;
      case 'diet': body = noData ? <Txt muted style={{ fontSize: 14 }}>{t!.empty}</Txt> : <>{plain(t!.big, ' on plan', t!.sub)}<GrowBar pct={nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0} color={c.good} /></>; break;
      case 'sleep': body = noData ? <Txt muted style={{ fontSize: 14 }}>{t!.empty}</Txt> : withBars(t!.big, '', t!.sub); break;
      case 'steps': body = noData ? <Txt muted style={{ fontSize: 14 }}>{t!.empty}</Txt> : withBars(t!.big, ps.range === 'day' ? ' steps' : ' / day', t!.sub); break;
      case 'water': body = noData ? <Txt muted style={{ fontSize: 14 }}>{t!.empty}</Txt> : withBars(t!.big, ps.range === 'day' ? ' L' : ' L / day', t!.sub); break;
      case 'meas': body = (
        <Row style={{ gap: 8 }}>
          {[{ l: 'Waist', v: '89 cm', d: '↓3' }, { l: 'Chest', v: '98 cm', d: '—' }, { l: 'Arm', v: '32 cm', d: '↑0.5' }].map((t) => (
            <View key={t.l} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, backgroundColor: c.surface2 }}>
              <Txt v="caption">{t.l}</Txt>
              <Txt style={{ fontFamily: font.display, fontSize: 20, lineHeight: 26 }}>{t.v}</Txt>
              <Txt v="caption">{t.d}</Txt>
            </View>
          ))}
        </Row>
      ); break;
      case 'assess': body = assessNone
        ? plain('Not yet', '', 'First assessment Sat 10:00 am with Coach Vikram')
        : d.assess === 'Only first'
          ? plain('Starting point saved', '', 'Squat 40 kg · deep squat hold 30 s · next Tue 30 Sep')
          : plain('Squat +20 kg', '', `Latest 30 Sep vs start 2 Sep · hold 30 → 45 s · next ${d.assess === 'Due now' ? 'due this week' : 'this week'}`);
        break;
      case 'photos': body = (
        <>
          <Row style={{ gap: 8 }}>
            {['Sep 2', ps.photos[ps.photos.length - 1]?.d ?? 'Sep 30'].map((l, i) => (
              <View key={i} style={{ flex: 1, height: 130, borderRadius: 16, overflow: 'hidden', backgroundColor: c.surface2 }}>
                <Image source={i === 0 ? BEFORE_PHOTO : AFTER_PHOTO} resizeMode="cover" accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%' }} />
                <View style={{ position: 'absolute', left: 8, bottom: 8, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)' }}><Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 17, color: '#fff' }}>{l}</Txt></View>
              </View>
            ))}
          </Row>
          <Row style={{ gap: 6 }}><Lock size={12} color={c.muted} /><Txt v="caption" style={{ fontSize: 13 }}>Only you can see these</Txt></Row>
        </>
      ); break;
    }
  }
  return (
    <PCard onPress={open} label={connect ? 'Steps. Connect Health Connect' : `${titles[k]}, open details`} style={{ overflow: 'hidden' }}>
      <CornerGlow color={tint} />
      <CardTitle title={titles[k]} icon={<look.Icon size={17} color={tint} />} tint={tint} />
      {body}
      {connect && (
        <View style={{ alignSelf: 'flex-start', height: 40, paddingHorizontal: 18, borderRadius: 20, backgroundColor: c.surface2, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: 14 }}>Connect Health Connect</Txt>
        </View>
      )}
    </PCard>
  );
}

function StreakEntry() {
  const { c } = useTheme();
  const st = useStreak();
  return (
    <PCard onPress={() => router.push('/progress/streaks')} label={`Streaks and badges. ${st.weeks} week streak. Open`} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,138,61,0.16)', alignItems: 'center', justifyContent: 'center' }}>
        <Flame size={26} color={FLAME} fill={st.weeks > 0 ? FLAME : 'transparent'} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt style={{ fontFamily: font.semibold }}>Streaks & badges</Txt>
        <Txt v="caption">{st.weeks ? `${st.weeks}-week streak · ` : ''}{st.weekDone} of {st.target} this week · 5 of 10 badges</Txt>
      </View>
      <ChevronRight size={18} color={c.muted} />
    </PCard>
  );
}

export default function Progress() {
  const { c } = useTheme();
  const { d } = useDomain();
  const ps = progressStore.use();
  const insets = useSafeAreaInsets();
  const v2 = goalV2Store.use().version === 'Version 2';
  const [bar, setBar] = useState({ y: 0, h: 0 });
  useEffect(() => { if (firstLoad) { firstLoad = false; showProgressLoading(1000); } }, []);
  useProgressScenarios('Progress');

  const order = ORDER[d.goal.type] ?? ORDER['Weight loss'];
  let hidden: CardKey[] = ps.hidden === 'Water & steps' ? ['water', 'steps'] : [];
  if (!d.hc) hidden = [...hidden, 'hr', 'sleep'];
  const cards = order.filter((k) => !hidden.includes(k));

  return (
    <TabScreen title="Progress" header={<GymHeader />} compactTitle={false} pinned={v2 ? <RangeBarSlim /> : undefined} pinAfter={v2 && bar.h > 0 && !ps.loading ? bar.y + bar.h - (insets.top + 8 + 56) : undefined}
      refreshControl={<RefreshControl refreshing={ps.refreshing} tintColor={c.accentText} onRefresh={() => { progressStore.set({ refreshing: true }); showProgressLoading(900); }} />}>
      {v2 && !ps.loading && <Animated.View entering={fade()}><GoalCard2 size="expanded" /></Animated.View>}
      {v2 && ps.loading && <Skeleton h={190} />}
      <View onLayout={(e) => setBar({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}><RangeBar /></View>
      {ps.loading ? (
        <>
          <Skeleton h={168} /><Skeleton h={120} /><Skeleton h={120} /><Skeleton h={120} />
        </>
      ) : (
        <>
          {!v2 && <Animated.View entering={fade()}><GoalHero /></Animated.View>}
          {!v2 && <Animated.View entering={fade(40)}><StreakEntry /></Animated.View>}
          {cards.map((k, i) => (
            <Animated.View key={k} entering={fade(Math.min(i, 6) * 40)}><ProgressCard k={k} /></Animated.View>
          ))}
          <Txt v="caption" style={{ textAlign: 'center' }}>No “bad” colours here · changes are shown with arrows and plain words</Txt>
        </>
      )}
    </TabScreen>
  );
}
