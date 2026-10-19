import React from 'react';
import { useLogsPaused } from '@/lib/logGate';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavHidden } from '@/components/FloatingTabBar';
import { router } from 'expo-router';
import { Check, ChevronRight, Clock, Lock, Play } from '@/lib/icons';
import { fade } from '@/theme/motion';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { PersonAvatar } from '@/components/Brand';
import { Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { TODAY_IDX } from '@/lib/data';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { useStartWorkout } from '@/features/workout/StartSheet';
import { COACH_BANNER } from './content';
import { startCreate } from './openers';
import { ExTile, Highlight, Moon } from './parts';
import { DAYL, dateOf, dayPlan, exSub, relDay, usePlans } from './store';

const E = ({ i, children }: { i: number; children: React.ReactNode }) => <Animated.View entering={fade(i * 40)}>{children}</Animated.View>;

function ListCard({ dot, title, rows }: { dot: string; title: string; rows: { n: string; s: string }[] }) {
  return (
    <View style={{ gap: 8 }}>
      <Row style={{ gap: 6, paddingHorizontal: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
        <Txt v="label">{title}</Txt>
      </Row>
      <Card style={{ paddingVertical: 6, paddingHorizontal: 16 }}>
        {rows.map((w) => (
          <Row key={w.n} style={{ justifyContent: 'space-between', gap: 10, minHeight: 40 }}>
            <Txt style={{ fontFamily: font.medium, flexShrink: 1 }}>{w.n}</Txt>
            <Txt v="caption">{w.s}</Txt>
          </Row>
        ))}
      </Card>
    </View>
  );
}

// Expired membership: the plan stays on the page, behind a strong blur (it cannot be tapped), with a lock and the reason on top.
function LockedPlan({ day, locked, children }: { day: string; locked: boolean; children: React.ReactNode }) {
  const { c, isDark } = useTheme();
  if (!locked) return <>{children}</>;
  return (
    <View accessibilityLabel="This plan is locked" style={{ borderRadius: 24, overflow: 'hidden' }}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ gap: 12 }}>{children}</View>
      <BlurView intensity={isDark ? 70 : 80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'flex-start', gap: 10, paddingTop: 110, paddingHorizontal: 28 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}><Lock size={24} color={c.ink} /></View>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 22, lineHeight: 29 }}>This plan is locked</Txt>
        <Txt style={{ textAlign: 'center', maxWidth: 290, fontSize: 14, lineHeight: 20, color: c.ink }}>{`Renew at Wulf Fitness reception to see what Coach Vikram planned for ${day}. Workouts you logged stay here.`}</Txt>
      </View>
    </View>
  );
}

export function WorkoutPlan() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();
  const { openSheet } = useOverlay();
  const startWorkout = useStartWorkout();
  const paused = useLogsPaused();
  const plan = dayPlan(d, p, p.day);

  if (p.noPlan) {
    return (
      <>
        <E i={0}>
          <Card style={{ gap: 8, borderWidth: 1.5, borderColor: c.accent }}>
            <Tag label="Plan on the way" bg={c.accentSoft} fg={c.accentText} />
            <Txt v="headline">Coach Vikram is preparing your plan</Txt>
            <Txt muted style={{ fontSize: 14 }}>Usually ready after your assessment</Txt>
          </Card>
        </E>
        <E i={1}>
          <Card style={{ padding: 18, gap: 10 }}>
            <Txt v="label">Starter workout</Txt>
            <Txt style={{ fontFamily: font.display, fontSize: 22, letterSpacing: -0.4 }}>Full body basics</Txt>
            <Txt muted style={{ fontSize: 14 }}>35 min · works for any gym floor</Txt>
            {!paused && <Button kind="accent" label="Start starter workout" onPress={() => startWorkout()} />}
          </Card>
        </E>
      </>
    );
  }

  const rel = relDay(p);
  const showUpdated = d.coachUpdated && !p.applied && rel === 0;
  const isToday = rel === 0;
  const live = isToday && !!d.session;
  const openUpdated = () => router.push('/plans/updated');

  return (
    <>
      {showUpdated && (
        <E i={0}>
          <Pressy accessibilityRole="button" accessibilityLabel={`Coach Vikram updated your plan. ${COACH_BANNER}. See what changed`} onPress={openUpdated} scaleTo={0.98}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 28, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.accent }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.accent }} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold }}>Coach Vikram updated your plan</Txt>
              <Txt muted style={{ fontSize: 13 }}>{COACH_BANNER}</Txt>
            </View>
            <Txt style={{ fontFamily: font.semibold, color: c.accentText }}>See</Txt>
            <ChevronRight size={16} color={c.accentText} />
          </Pressy>
        </E>
      )}
      {d.planReq === 'requested' && (
        <E i={0}>
          <Card style={{ paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Clock size={20} color={c.muted} />
            <Txt style={{ flex: 1, fontSize: 14 }}><Txt style={{ fontFamily: font.semibold, fontSize: 14 }}>Requested</Txt> · Coach Vikram will update your plan</Txt>
          </Card>
        </E>
      )}
      {d.planReq === 'ready' && (
        <E i={0}>
          <Pressy accessibilityRole="button" accessibilityLabel="Your new plan is ready. View" onPress={openUpdated} scaleTo={0.98}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 28, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.good }}>
            <Check size={20} strokeWidth={2.4} color={c.good} />
            <Txt style={{ flex: 1, fontFamily: font.semibold }}>Your new plan is ready</Txt>
            <Txt style={{ fontFamily: font.semibold, color: c.accentText }}>View</Txt>
            <ChevronRight size={16} color={c.accentText} />
          </Pressy>
        </E>
      )}

      {plan ? (
        <LockedPlan day={DAYL[p.day]} locked={paused && !plan.done}>
          <E i={1}>
            <Row style={{ alignItems: 'flex-end', gap: 10, paddingTop: 4, paddingHorizontal: 4 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="label">{DAYL[p.day]} {dateOf(p.day, p.week)}{isToday ? ' · Today' : ''}</Txt>
                <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: 34, letterSpacing: -1.4 }}>{plan.name}</Txt>
                <Row style={{ gap: 8 }}><PersonAvatar who={plan.created ? 'me' : 'coach'} size={22} /><Txt muted style={{ fontSize: 13, flexShrink: 1 }}>{plan.created ? 'Created by you' : 'by Coach Vikram'} · {plan.ex.length} exercises{plan.time && !plan.done ? ` · planned ${plan.time}` : ''}</Txt></Row>
              </View>
              {!!plan.done && <View accessibilityLabel="Logged" style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Check size={16} color={c.bg} strokeWidth={3} /></View>}
            </Row>
            {!!plan.done && <Txt v="caption" style={{ paddingHorizontal: 4, marginTop: 4 }}>{`Logged ${plan.done.replace(/^Done /, '').split(' · ').join(', ')}`}</Txt>}
            {!plan.done && rel < 0 && <Txt style={{ paddingHorizontal: 4, marginTop: 4, fontSize: 13, lineHeight: 19, color: c.warn }}>Not logged</Txt>}
          </E>
          {!!plan.done && (() => {
            const skipped = plan.ex.filter((e) => e.res === 'skip').length;
            const swapped = plan.ex.filter((e) => e.res === 'swap').length;
            const logged = plan.ex.length - skipped;
            return (
              <E i={2}>
                <Card style={{ padding: 14, gap: 12 }}>
                  <Row>
                    {[[String(logged), `of ${plan.ex.length}`, 'Logged'], [String(skipped), '', 'Not logged'], [String(swapped), '', 'Swapped']].map(([n, of, l], k) => (
                      <View key={l} style={{ flex: 1, paddingLeft: k ? 12 : 0, borderLeftWidth: k ? 1 : 0, borderLeftColor: c.line }}>
                        <Txt style={{ fontFamily: font.medium, fontSize: 22, lineHeight: 29 }}>{n}{!!of && <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{` ${of}`}</Txt>}</Txt>
                        <Txt muted style={{ fontSize: 12, lineHeight: 17 }}>{l}</Txt>
                      </View>
                    ))}
                  </Row>
                  <Row style={{ gap: 3 }}>
                    {plan.ex.map((e) => <View key={e.id} accessibilityLabel={e.res === 'skip' ? 'Not logged' : 'Logged'} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: e.res === 'skip' ? c.surface3 : c.ink }} />)}
                  </Row>
                </Card>
              </E>
            );
          })()}
          {!!plan.wu?.length && <E i={2}><ListCard dot={c.cAct} title="Warm-up" rows={plan.wu} /></E>}
          <E i={3}><Txt v="label" style={{ paddingHorizontal: 6 }}>Main workout</Txt></E>
          <E i={3}>
            <Card style={{ paddingVertical: 6, paddingHorizontal: 14 }}>
              {plan.ex.map((e, i) => {
                const tag = e.by === 'you' ? 'Edited by you' : e.by === 'created' ? 'Created by you' : e.hl ? 'New from Coach' : '';
                return (
                  <Highlight key={e.id} on={!!e.hl} delay={i * 80}>
                    <Pressy accessibilityRole="button" accessibilityLabel={`${i + 1}. ${e.name}, ${exSub(e)}${tag ? `, ${tag}` : ''}. Open form video and tips`} scaleTo={0.985}
                      onPress={() => router.push({ pathname: '/plans/exercise', params: { name: e.name, sub: exSub(e) } })}
                      style={{ minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: i < plan.ex.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                      <ExTile name={e.name} num={String(i + 1)} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Txt style={{ fontFamily: font.medium }}>{e.name}</Txt>
                        <Txt v="mono" muted style={{ fontSize: 12 }}>{exSub(e)}</Txt>
                        {!!plan.done && e.res === 'swap' && <Txt muted style={{ fontSize: 12, lineHeight: 17 }}>{`Swapped from ${e.from}`}</Txt>}
                        {!!plan.done && e.res === 'skip' && <Txt style={{ fontSize: 12, lineHeight: 17, color: c.warn }}>Not logged</Txt>}
                      </View>
                      {!!tag && <Tag label={tag} bg={e.hl && !e.by ? c.accentSoft : c.surface2} fg={e.hl && !e.by ? c.accentText : c.muted} style={{ alignSelf: 'center' }} />}
                      {plan.done ? (e.res === 'skip'
                        ? <View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.muted }} />
                        : <View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}><Check size={14} color={c.bg} strokeWidth={3} /></View>)
                        : <ChevronRight size={16} color={c.muted} />}
                    </Pressy>
                  </Highlight>
                );
              })}
            </Card>
          </E>
          {!!plan.cd?.length && <E i={4}><ListCard dot={c.cNutri} title="Cool-down" rows={plan.cd} /></E>}
          {rel > 0 && <Txt muted style={{ textAlign: 'center', fontSize: 13 }}>You can start this on {DAYL[p.day]}. Plans open on today by default.</Txt>}
          {!!plan.done && <Button kind="secondary" small label="View in workout history" onPress={() => router.push('/plans/history')} />}
        </LockedPlan>
      ) : (
        <E i={1}>
          <Card style={{ paddingVertical: 28, paddingHorizontal: 22, alignItems: 'center', gap: 10 }}>
            <Moon />
            <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 22 }}>Rest day</Txt>
            <Txt muted style={{ textAlign: 'center', maxWidth: 280 }}>Recovery is part of the plan. A walk or a stretch still counts toward your week.</Txt>
            {!paused && <Button kind="secondary" small label={`Create a workout for ${DAYL[p.day]}`} onPress={() => startCreate(d)} style={{ marginTop: 6 }} />}
          </Card>
        </E>
      )}
    </>
  );
}

// Whether today's workout can be started from here (drives the pinned button and the scroll padding).
export function useCanStart() {
  const { d } = useDomain();
  const { p } = usePlans();
  if (p.noPlan || p.seg !== 'workout') return false;
  const plan = dayPlan(d, p, p.day);
  return !!plan && relDay(p) === 0 && !plan.done;
}

// Pinned above the floating tab bar; when the bar slides away on scroll, the button settles to the bottom edge.
export function StickyStart() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { openSheet } = useOverlay();
  const startWorkout = useStartWorkout();
  const insets = useSafeAreaInsets();
  const hidden = useNavHidden();
  const live = !!d.session;
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: (hidden?.value ?? 0) * 88 }] }));
  const bottom = Math.max(insets.bottom - 6, 14) + 84;
  return (
    <Animated.View entering={fade()} pointerEvents="box-none" style={[{ position: 'absolute', left: 16, right: 16, bottom }, lift]}>
      <Button kind="accent" label={live ? 'Resume workout' : 'Start workout'} icon={<Play size={18} color={c.accentInk} fill={c.accentInk} />}
        onPress={() => (live ? router.push('/workout') : startWorkout())} />
    </Animated.View>
  );
}
