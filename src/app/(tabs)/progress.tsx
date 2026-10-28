import React, { useEffect, useState } from 'react';
import { HEALTH_NAME } from '@/lib/health';
import { Image, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Flame, Lock } from '@/lib/icons';
import { useLook } from '@/features/progress/look';
import { TabScreen } from '@/components/TabScreen';
import { GymHeader } from '@/components/GymHeader';
import { Row, Txt } from '@/components/ui';
import { Skeleton } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { CardKey, NEW_EMPTY, ORDER } from '@/features/progress/data';
import { MetricKey, trend } from '@/features/progress/trends';
import { MiniBars, RangeBar, RangeBarSlim } from '@/features/progress/TrendUI';
import { CardTitle, CornerGlow, PCard, Spark } from '@/features/progress/parts';
import { progressStore } from '@/features/progress/store';
import { AFTER_PHOTO, BEFORE_PHOTO } from '@/features/progress/photoAssets';
import { FLAME } from '@/features/streak/StreakChip';
import { useStreak } from '@/features/streak/useStreak';
import { showProgressLoading, useProgressScenarios } from '@/features/progress/scenarios';
import { GoalCard2 } from '@/features/goalv2/GoalCard2';
import { GoalTickCard } from '@/features/today/GoalTickCard';
import { goalV2Store } from '@/features/goalv2/model';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { Callout } from '@/design-system/primitives/Callout';
import { ProgressSegments } from '@/design-system/primitives/ProgressBar';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { FadeIn } from '@/design-system/primitives/FadeIn';

let firstLoad = true;


function Big({ big, unit }: { big: string; unit?: string }) {
  const { c } = useTheme();
  return (
    <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 40, letterSpacing: -0.6 }}>
      {big}{unit ? <Txt style={{ fontFamily: font.display, fontSize: fontSizes.lg, color: c.muted }}>{unit}</Txt> : null}
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

  const connect = k === 'steps' && !d.hc;
  let empty = isNew ? NEW_EMPTY[k] ?? '' : '';
  if (connect) empty = `Read from ${HEALTH_NAME} once you allow it.`;

  const titles: Record<CardKey, string> = {
    weight: 'Weight', cons: 'Consistency', diet: 'Diet', lifts: 'Lifts & PRs', steps: 'Steps', meas: 'Measurements',
    photos: 'Photos · Private', water: 'Water', hr: `Resting heart rate · ${HEALTH_NAME}`, sleep: `Sleep · ${HEALTH_NAME}`,
  };
  const open = () => {
    if (connect) { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected. Steps sync automatically`); return; }
    if (k === 'lifts') { progressStore.set({ lift: 'Leg press' }); router.push('/progress/lift'); }
    else if (k === 'photos') router.push('/progress/photos');
    else router.push({ pathname: '/progress/metric', params: { k } });
  };

  let body: React.ReactNode = null;
  if (empty) body = <Txt muted style={{ fontSize: fontSizes.md }}>{empty}</Txt>;
  else {
    // The number with what it measures beside it ("72.5 kg  Average"), the change underneath. `stack` is for a headline that is not a measure (assessments): two lines under it, the first one brighter.
    const left = (big: string, unit: string, sub: string, stack?: boolean) => {
      const [first, ...rest] = sub.split('\n');
      const detail = rest.join('\n');
      if (stack) return <View style={{ flexShrink: 1, gap: 4 }}><Big big={big} unit={unit} /><View style={{ gap: 2 }}><Txt style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{first}</Txt>{!!detail && <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{detail}</Txt>}</View></View>;
      return (
        <View style={{ flexShrink: 1, gap: 2 }}>
          <Row style={{ alignItems: 'baseline', columnGap: 8 }}><View style={{ flexShrink: 0 }}><Big big={big} unit={unit} /></View>{!!detail && <Txt v="caption" style={{ fontSize: fontSizes.sm, flexShrink: 1 }}>{first}</Txt>}</Row>
          <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{detail || first}</Txt>
        </View>
      );
    };
    const withSpark = (big: string, unit: string, sub: string, vals: number[]) => (
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        {left(big, unit, sub)}
        <Spark key={`${ps.range}-${ps.anchor}-${vals.join()}`} vals={vals.length > 1 ? vals : [vals[0] ?? 0, vals[0] ?? 0]} color={tint} />
      </Row>
    );
    const plain = (big: string, unit: string, sub: string, stack?: boolean) => left(big, unit, sub, stack);
    const withBars = (big: string, unit: string, sub: string) => (
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
        {left(big, unit, sub)}
        <MiniBars key={`${ps.range}-${ps.anchor}`} vals={t!.vals} color={tint} w={112} />
      </Row>
    );
    const noData = t && !t.hasData;
    switch (k) {
      case 'weight': body = noData ? <Txt muted style={{ fontSize: fontSizes.md }}>{t!.empty}</Txt> : withSpark(t!.big, ' kg', t!.sub, nums); break;
      case 'lifts': body = withSpark('130', ' kg', 'Leg press\nLatest PR on 24 Sep', [110, 112, 115, 117.5, 120, 125, 130]); break;
      case 'hr': body = noData ? <Txt muted style={{ fontSize: fontSizes.md }}>{t!.empty}</Txt> : withSpark(t!.big, ' bpm', t!.sub, nums); break;
      case 'cons': body = noData ? <Txt muted style={{ fontSize: fontSizes.md }}>{t!.empty}</Txt> : v2
        ? (
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
            <View style={{ flexShrink: 1, gap: 2 }}>
              <Big big={`${st.weekDone} of ${st.target}`} unit=" this week" />
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{st.weekDone >= st.target ? 'Week complete' : `${st.left} to go this week`}</Txt>
            </View>
            <MiniBars key={`${ps.range}-${ps.anchor}`} vals={t!.vals} color={tint} w={112} />
          </Row>
        )
        : withBars(t!.big, Number(t!.big) === 1 ? ' workout' : ' workouts', t!.sub); break;
      case 'diet': body = noData ? <Txt muted style={{ fontSize: fontSizes.md }}>{t!.empty}</Txt> : withBars(t!.big, ps.range === 'day' ? ' kcal' : ' kcal a day', t!.sub); break;
      case 'sleep': body = noData ? <Txt muted style={{ fontSize: fontSizes.md }}>{t!.empty}</Txt> : withBars(t!.big, '', t!.sub); break;
      case 'steps': body = noData ? <Txt muted style={{ fontSize: fontSizes.md }}>{t!.empty}</Txt> : withBars(t!.big, ps.range === 'day' ? ' steps' : ' / day', t!.sub); break;
      case 'water': body = noData ? <Txt muted style={{ fontSize: fontSizes.md }}>{t!.empty}</Txt> : withBars(t!.big, ps.range === 'day' ? ' L' : ' L / day', t!.sub); break;
      case 'meas': body = (
        <Row style={{ gap: 8 }}>
          {[{ l: 'Waist', v: '89 cm', d: '↓3' }, { l: 'Chest', v: '98 cm', d: '—' }, { l: 'Arm', v: '32 cm', d: '↑0.5' }].map((t) => (
            <Callout key={t.l} size="sm" style={{ flex: 1 }}>
              <Txt v="caption">{t.l}</Txt>
              <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl, lineHeight: 26 }}>{t.v}</Txt>
              <Txt v="caption">{t.d}</Txt>
            </Callout>
          ))}
        </Row>
      ); break;
      case 'photos': body = (
        <>
          <Row style={{ gap: 8 }}>
            {['Sep 2', ps.photos[ps.photos.length - 1]?.d ?? 'Sep 30'].map((l, i) => (
              <View key={i} style={{ flex: 1, height: 130, borderRadius: radii.md, overflow: 'hidden', backgroundColor: c.surface2 }}>
                <Image source={i === 0 ? BEFORE_PHOTO : AFTER_PHOTO} resizeMode="cover" accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%' }} />
                <View style={{ position: 'absolute', left: 8, bottom: 8, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radii.pill, backgroundColor: 'rgba(0,0,0,0.55)' }}><Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 17, color: fixed.white }}>{l}</Txt></View>
              </View>
            ))}
          </Row>
          <Row style={{ gap: 6 }}><Lock size={12} color={c.muted} /><Txt v="caption" style={{ fontSize: fontSizes.sm }}>Only you can see these</Txt></Row>
        </>
      ); break;
    }
  }
  return (
    <PCard onPress={open} label={connect ? `Steps. Connect ${HEALTH_NAME}` : `${titles[k]}, open details`} style={{ overflow: 'hidden' }}>
      <CornerGlow color={tint} />
      <CardTitle title={titles[k]} icon={<look.Icon size={17} color={tint} />} tint={tint} />
      {body}
      {connect && (
        <View style={{ alignSelf: 'flex-start', height: 40, paddingHorizontal: 18, borderRadius: 20, backgroundColor: c.surface2, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md }}>Connect {HEALTH_NAME}</Txt>
        </View>
      )}
    </PCard>
  );
}

function StreakEntry() {
  const { c } = useTheme();
  const st = useStreak();
  return (
    <PCard onPress={() => router.push('/progress/streaks')} label={`Streaks and badges. ${st.weeks} week streak. Open`} style={{ gap: 20 }}>
      <Row style={{ gap: 14 }}>
        <IconBadge size={48} radius={radii.card} bg="rgba(255,138,61,0.16)">
          <Flame size={26} color={FLAME} fill={st.weeks > 0 ? FLAME : 'transparent'} strokeWidth={2} />
        </IconBadge>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold }}>Streaks & badges</Txt>
          {st.weeks ? <Txt v="caption"><Txt v="caption" style={{ fontFamily: font.bold, color: FLAME }}>{st.weeks}</Txt>-week streak</Txt> : null}
        </View>
        <ChevronRight size={18} color={c.muted} />
      </Row>
      <Callout size="compact" gap={8}>
        <ProgressSegments height={6} gap={4} segments={Array.from({ length: st.target }, (_, i) => ({ color: i < st.weekDone ? FLAME : c.surface3, label: i < st.weekDone ? 'Session done' : 'Session to do' }))} />
        <Txt v="caption"><Txt v="caption" style={{ fontFamily: font.bold, color: c.ink }}>{st.weekDone}</Txt> of {st.target} sessions this week</Txt>
      </Callout>
    </PCard>
  );
}

export default function ProgressScreen() {
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
  if (!d.hc) hidden = [...hidden, 'steps'];
  if (!d.hc || !d.wearable) hidden = [...hidden, 'hr', 'sleep']; // health-store data: nothing is shown until Health is connected
  const cards = order.filter((k) => !hidden.includes(k));

  return (
    <TabScreen title="Progress" header={<GymHeader />} compactTitle={false} pinned={v2 ? <RangeBarSlim /> : undefined} pinAfter={v2 && bar.h > 0 && !ps.loading ? bar.y + bar.h - (insets.top + 8 + 56) : undefined}
      refreshControl={<RefreshControl refreshing={ps.refreshing} tintColor={c.accentText} onRefresh={() => { progressStore.set({ refreshing: true }); showProgressLoading(900); }} />}>
      {v2 && !ps.loading && <FadeIn><GoalCard2 size="expanded" /></FadeIn>}
      {v2 && ps.loading && <Skeleton h={190} />}
      <View onLayout={(e) => setBar({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}><RangeBar /></View>
      {!v2 && (ps.loading ? <Skeleton h={150} /> : <FadeIn><GoalTickCard /></FadeIn>)}
      {ps.loading ? (
        <>
          <Skeleton h={168} /><Skeleton h={120} /><Skeleton h={120} /><Skeleton h={120} />
        </>
      ) : (
        <>
          {!v2 && <FadeIn delay={40}><StreakEntry /></FadeIn>}
          {cards.map((k, i) => (
            <FadeIn key={k} delay={Math.min(i, 6) * 40}><ProgressCard k={k} /></FadeIn>
          ))}
        </>
      )}
    </TabScreen>
  );
}
