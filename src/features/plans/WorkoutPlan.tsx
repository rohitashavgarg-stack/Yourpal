import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavHidden } from '@/components/FloatingTabBar';
import { router } from 'expo-router';
import { Check, ChevronRight, Clock, Play } from '@/lib/icons';
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
    <Card style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
      <Row style={{ gap: 6, paddingBottom: 4 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
        <Txt v="label">{title}</Txt>
      </Row>
      {rows.map((w) => (
        <Row key={w.n} style={{ justifyContent: 'space-between', gap: 10, minHeight: 36 }}>
          <Txt style={{ fontFamily: font.medium, flexShrink: 1 }}>{w.n}</Txt>
          <Txt v="caption">{w.s}</Txt>
        </Row>
      ))}
    </Card>
  );
}

export function WorkoutPlan() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();
  const { openSheet } = useOverlay();
  const startWorkout = useStartWorkout();
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
            <Button kind="accent" label="Start starter workout" onPress={() => startWorkout()} />
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
        <>
          <E i={1}>
            <Row style={{ alignItems: 'flex-end', gap: 10, paddingTop: 4, paddingHorizontal: 4 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt v="label">{DAYL[p.day]} {dateOf(p.day, p.week)}{isToday ? ' · Today' : ''}</Txt>
                <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: 34, letterSpacing: -1.4 }}>{plan.name}</Txt>
                <Row style={{ gap: 8 }}><PersonAvatar who={plan.created ? 'me' : 'coach'} size={22} /><Txt muted style={{ fontSize: 13, flexShrink: 1 }}>{plan.created ? 'Created by you' : 'by Coach Vikram'} · {plan.ex.length} exercises{plan.time && !plan.done ? ` · planned ${plan.time}` : ''}</Txt></Row>
              </View>
              {!!plan.done && <Tag label="Done" bg={c.goodSoft} fg={c.good} style={{ marginBottom: 8 }} />}
            </Row>
            {!!plan.done && <Txt v="caption" style={{ paddingHorizontal: 4, marginTop: 4 }}>{plan.done}</Txt>}
          </E>
          {!!plan.wu?.length && <E i={2}><ListCard dot={c.cAct} title={`Warm-up · ${plan.wu.length} moves · no weights`} rows={plan.wu} /></E>}
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
                      </View>
                      {!!tag && <Tag label={tag} bg={e.hl && !e.by ? c.accentSoft : c.surface2} fg={e.hl && !e.by ? c.accentText : c.muted} style={{ alignSelf: 'center' }} />}
                      <ChevronRight size={16} color={c.muted} />
                    </Pressy>
                  </Highlight>
                );
              })}
            </Card>
          </E>
          {!!plan.cd?.length && <E i={4}><ListCard dot={c.cNutri} title={`Cool-down · ${plan.cd.length} stretches · counts are a guide`} rows={plan.cd} /></E>}
          {rel > 0 && <Txt muted style={{ textAlign: 'center', fontSize: 13 }}>You can start this on {DAYL[p.day]}. Plans open on today by default.</Txt>}
          {!!plan.done && <Button kind="secondary" small label="View in workout history" onPress={() => router.push('/plans/history')} />}
          {rel < 0 && !plan.done && <Txt muted style={{ textAlign: 'center', fontSize: 13 }}>Not logged on {DAYL[p.day]}.</Txt>}
        </>
      ) : (
        <E i={1}>
          <Card style={{ paddingVertical: 28, paddingHorizontal: 22, alignItems: 'center', gap: 10 }}>
            <Moon />
            <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: 22 }}>Rest day</Txt>
            <Txt muted style={{ textAlign: 'center', maxWidth: 280 }}>Recovery is part of the plan. A walk or a stretch still counts toward your week.</Txt>
            <Button kind="secondary" small label={`Create a workout for ${DAYL[p.day]}`} onPress={() => startCreate(d)} style={{ marginTop: 6 }} />
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
