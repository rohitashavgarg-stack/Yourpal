import React from 'react';
import type { ViewInstance } from 'react-native';
import { useLogsPaused } from '@/lib/logGate';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavHidden } from '@/components/FloatingTabBar';
import { router } from 'expo-router';
import { CalendarClock, Check, ChevronRight, Clock, Dumbbell, Lock, Play, Snowflake } from '@/lib/icons';
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
import { radii, fontSizes } from '@/design-system/tokens';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { ProgressSegments } from '@/design-system/primitives/ProgressBar';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { StatusDot } from '@/design-system/primitives/StatusDot';
import { ListCard } from '@/design-system/primitives/ListCard';
import StretchIcon from '@/lib/StretchIcon';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';


// Expired membership: the plan stays on the page, behind a strong blur (it cannot be tapped), with a lock and the reason on top.
function LockedPlan({ day, locked, children }: { day: string; locked: boolean; children: React.ReactNode }) {
  const { c, isDark } = useTheme();
  if (!locked) return <>{children}</>;
  // The blur runs to both screen edges and fades into the page at the top and bottom, so it never reads as a box.
  return (
    <View accessibilityLabel="This plan is locked" style={{ marginHorizontal: -16, overflow: 'hidden' }}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ gap: 12, paddingHorizontal: 16 }}>{children}</View>
      <BlurView intensity={isDark ? 60 : 70} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <LinearGradient pointerEvents="none" colors={[c.bg, c.bg + '00']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 70 }} />
      <LinearGradient pointerEvents="none" colors={[c.bg + '00', c.bg]} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'flex-start', gap: 10, paddingTop: 110, paddingHorizontal: 44 }}>
        <IconBadge size={56} radius={radii.xl} bg={c.surface2} borderWidth={1} borderColor={c.line}><Lock size={24} color={c.ink} /></IconBadge>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 29 }}>This plan is locked</Txt>
        <Txt style={{ textAlign: 'center', maxWidth: 290, fontSize: fontSizes.md, lineHeight: 20, color: c.ink }}>{`Renew at Wulf Fitness reception to see what Coach Vikram planned for ${day}. Workouts you logged stay here.`}</Txt>
      </View>
    </View>
  );
}

export function WorkoutPlan({ startRef }: { startRef?: React.RefObject<ViewInstance | null> }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();
  const { openSheet } = useOverlay();
  const startWorkout = useStartWorkout();
  const paused = useLogsPaused();
  const canStart = useCanStart() && !paused;
  const doneParts = (plan: { done?: string } | undefined) => { const [span = '', rest = ''] = (plan?.done ?? '').replace(/^Done /, '').split(' · '); const m = rest.match(/(\d+)\s*PR/); return { span, prs: m ? Number(m[1]) : 0 }; };
  const plan = dayPlan(d, p, p.day);

  if (p.noPlan) {
    return (
      <>
        <FadeIn i={0}>
          <Card style={{ gap: 8, borderWidth: 1.5, borderColor: c.accent }}>
            <Tag label="Plan on the way" bg={c.accentSoft} fg={c.accentText} />
            <Txt v="headline">Coach Vikram is preparing your plan</Txt>
            <Txt muted style={{ fontSize: fontSizes.md }}>Usually ready after your assessment</Txt>
          </Card>
        </FadeIn>
        <FadeIn i={1}>
          <Card style={{ padding: 18, gap: 10 }}>
            <Txt v="label">Starter workout</Txt>
            <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2, letterSpacing: -0.4 }}>Full body basics</Txt>
            <Txt muted style={{ fontSize: fontSizes.md }}>35 min · works for any gym floor</Txt>
            {!paused && <Button kind="accent" label="Start starter workout" onPress={() => startWorkout()} />}
          </Card>
        </FadeIn>
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
        <FadeIn i={0}>
          <Pressy accessibilityRole="button" accessibilityLabel={`Coach Vikram updated your plan. ${COACH_BANNER}. See what changed`} onPress={openUpdated} scaleTo={0.98}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 18, borderRadius: radii.xl, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.accent }}>
            <StatusDot size={10} color={c.accent} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold }}>Coach Vikram updated your plan</Txt>
              <Txt muted style={{ fontSize: fontSizes.sm }}>{COACH_BANNER}</Txt>
            </View>
            <Txt style={{ fontFamily: font.semibold, color: c.accentText }}>See</Txt>
            <ChevronRight size={16} color={c.accentText} />
          </Pressy>
        </FadeIn>
      )}
      {d.planReq === 'requested' && (
        <FadeIn i={0}>
          <Card style={{ paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Clock size={20} color={c.muted} />
            <Txt style={{ flex: 1, fontSize: fontSizes.md }}><Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md }}>Requested</Txt> · Coach Vikram will update your plan</Txt>
          </Card>
        </FadeIn>
      )}
      {d.planReq === 'ready' && (
        <FadeIn i={0}>
          <Pressy accessibilityRole="button" accessibilityLabel="Your new plan is ready. View" onPress={openUpdated} scaleTo={0.98}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 18, borderRadius: radii.xl, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.good }}>
            <Check size={20} strokeWidth={2.4} color={c.good} />
            <Txt style={{ flex: 1, fontFamily: font.semibold }}>Your new plan is ready</Txt>
            <Txt style={{ fontFamily: font.semibold, color: c.accentText }}>View</Txt>
            <ChevronRight size={16} color={c.accentText} />
          </Pressy>
        </FadeIn>
      )}

      {plan ? (
        <LockedPlan day={DAYL[p.day]} locked={paused && !plan.done}>
          <FadeIn i={1}>
            <Row style={{ alignItems: 'flex-end', gap: 10, paddingTop: 4, paddingHorizontal: 4 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Row style={{ gap: 8 }}>
                  <Txt v="label">{DAYL[p.day]} {dateOf(p.day, p.week)}</Txt>
                  {isToday && <Tag label="Today" bg={c.surface2} fg={c.ink} />}
                  {!!plan.done && <Tag label="Logged" bg={c.goodSoft} fg={c.good} />}
                </Row>
                {/* the name with who made the plan beside it, small, with their photo; under it how many exercises, a thin divider and when it is planned */}
                <Row style={{ alignItems: 'flex-end', columnGap: 10, flexWrap: 'wrap' }}>
                  <Txt accessibilityRole="header" numberOfLines={1} style={{ flexShrink: 1, fontFamily: font.regular, fontSize: fontSizes.xl5Plus, lineHeight: 49, letterSpacing: -1.5 }}>{plan.name}</Txt>
                  <Row style={{ gap: 6, paddingBottom: 9 }}>
                    <Txt muted style={{ fontSize: fontSizes.xs, lineHeight: 16 }}>by</Txt>
                    <PersonAvatar who={plan.created ? 'me' : 'coach'} size={18} />
                    <Txt muted style={{ fontSize: fontSizes.xs, lineHeight: 16 }}>{plan.created ? 'you' : 'Coach Vikram'}</Txt>
                  </Row>
                </Row>
                <Row style={{ marginTop: 4, gap: 12 }}>
                  <Row style={{ gap: 6 }}><Dumbbell size={16} color={c.muted} /><Txt style={{ fontSize: fontSizes.sm, lineHeight: 19 }}><Txt style={{ fontFamily: font.bold, fontSize: fontSizes.sm, lineHeight: 19 }}>{plan.ex.length}</Txt> exercises</Txt></Row>
                  {!!plan.done && !!doneParts(plan).span && (
                    <>
                      <View accessibilityElementsHidden style={{ width: 1, height: 16, backgroundColor: c.line }} />
                      <View accessible accessibilityLabel={`Logged ${doneParts(plan).span}`}><Row style={{ gap: 6 }}><Check size={16} color={c.good} strokeWidth={2.6} /><Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.good }}>{doneParts(plan).span} logged</Txt></Row></View>
                    </>
                  )}
                  {!!plan.time && !plan.done && (
                    <>
                      <View accessibilityElementsHidden style={{ width: 1, height: 16, backgroundColor: c.line }} />
                      <View accessible accessibilityLabel={`Planned ${plan.time}`}><Row style={{ gap: 6 }}><CalendarClock size={16} color={c.muted} /><Txt style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{plan.time} planned</Txt></Row></View>
                    </>
                  )}
                </Row>
                {canStart && <InlineStart innerRef={startRef} />}
              </View>
            </Row>
            {!plan.done && rel < 0 && <Txt style={{ paddingHorizontal: 4, marginTop: 4, fontSize: fontSizes.sm, lineHeight: 19, color: c.warn }}>Not logged</Txt>}
          </FadeIn>
          {!!plan.done && (() => {
            const skipped = plan.ex.filter((e) => e.res === 'skip').length;
            const swapped = plan.ex.filter((e) => e.res === 'swap').length;
            const logged = plan.ex.length - skipped;
            return (
              <FadeIn i={2}>
                <Card style={{ padding: 14, gap: 12 }}>
                  <Row>
                    {[[String(logged), `of ${plan.ex.length}`, 'Logged'], [String(skipped), '', 'Not logged'], [String(swapped), '', 'Swapped'], ...(doneParts(plan).prs > 0 ? [[String(doneParts(plan).prs), '', doneParts(plan).prs === 1 ? 'PR' : 'PRs']] : [])].map(([n, of, l], k) => (
                      <View key={l} style={{ flex: 1, paddingLeft: k ? 12 : 0, borderLeftWidth: k ? 1 : 0, borderLeftColor: c.line }}>
                        <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.xl2, lineHeight: 29 }}>{n}{!!of && <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{` ${of}`}</Txt>}</Txt>
                        <Txt muted style={{ fontSize: fontSizes.xs, lineHeight: 17 }}>{l}</Txt>
                      </View>
                    ))}
                  </Row>
                  <ProgressSegments height={4} gap={3} segments={plan.ex.map((e) => ({ color: e.res === 'skip' ? c.surface3 : c.ink, label: e.res === 'skip' ? 'Not logged' : 'Logged' }))} />
                </Card>
              </FadeIn>
            );
          })()}
          {!!plan.wu?.length && <FadeIn i={2} style={{ gap: 14 }}><View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ marginTop: 4 }}><Svg width="100%" height={2}><Line x1="0" y1="1" x2="100%" y2="1" stroke={c.muted} strokeOpacity={0.5} strokeWidth={1} strokeDasharray="3 3" /></Svg></View><ListCard icon={<StretchIcon size={22} color={c.ink} />} title="Warm-up" rows={plan.wu} done={!!plan.done} /></FadeIn>}
          {/* a heading stays close to its own card (8 px); the sections are 24 px apart */}
          <FadeIn i={3} style={{ gap: 8 }}>
            <SectionLabel variant="section" icon={<Dumbbell size={20} color={c.ink} />}>Main workout</SectionLabel>
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
                        <Txt v="mono" muted style={{ fontSize: fontSizes.xs }}>{exSub(e)}</Txt>
                        {!!plan.done && e.res === 'swap' && <Txt muted style={{ fontSize: fontSizes.xs, lineHeight: 17 }}>{`Swapped from ${e.from}`}</Txt>}
                        {!!plan.done && e.res === 'skip' && <Txt style={{ fontSize: fontSizes.xs, lineHeight: 17, color: c.warn }}>Not logged</Txt>}
                      </View>
                      {!!tag && <Tag label={tag} bg={e.hl && !e.by ? c.accentSoft : c.surface2} fg={e.hl && !e.by ? c.accentText : c.muted} style={{ alignSelf: 'center' }} />}
                      {plan.done ? (e.res === 'skip'
                        ? <View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: radii.sm, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.muted }} />
                        : <View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: radii.sm, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}><Check size={14} color={c.bg} strokeWidth={3} /></View>)
                        : <ChevronRight size={16} color={c.muted} />}
                    </Pressy>
                  </Highlight>
                );
              })}
            </Card>
          </FadeIn>
          {!!plan.cd?.length && <FadeIn i={4}><ListCard icon={<Snowflake size={20} color={c.ink} />} title="Cool-down" rows={plan.cd} done={!!plan.done} /></FadeIn>}
          {rel > 0 && <Txt muted style={{ textAlign: 'center', fontSize: fontSizes.sm }}>You can start this on {DAYL[p.day]}. Plans open on today by default.</Txt>}
          {!!plan.done && <Button kind="secondary" small label="View in workout history" onPress={() => router.push('/plans/history')} />}
        </LockedPlan>
      ) : (
        <FadeIn i={1}>
          <Card style={{ paddingVertical: 28, paddingHorizontal: 22, alignItems: 'center', gap: 10 }}>
            <Moon />
            <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl2 }}>Rest day</Txt>
            <Txt muted style={{ textAlign: 'center', maxWidth: 280 }}>Recovery is part of the plan. A walk or a stretch still counts toward your week.</Txt>
            {!paused && <Button kind="secondary" small label={`Create a workout for ${DAYL[p.day]}`} onPress={() => startCreate(d)} style={{ marginTop: 6 }} />}
          </Card>
        </FadeIn>
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

// The Start button in the page: under the coach pill. The page keeps its ref to know when it has scrolled out of view.
function InlineStart({ innerRef }: { innerRef?: React.RefObject<ViewInstance | null> }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const startWorkout = useStartWorkout();
  const live = !!d.session;
  return (
    <View ref={innerRef} collapsable={false} style={{ marginTop: 14 }}>
      <Button kind="accent" label={live ? 'Resume workout' : 'Start workout'} icon={<Play size={18} color={c.accentInk} fill={c.accentInk} />}
        onPress={() => (live ? router.push('/workout') : startWorkout())} />
    </View>
  );
}

// Floats above the tab bar once the Start button in the page has scrolled out of view; when the bar slides away on scroll, the button settles to the bottom edge.
export function StickyStart() {
  const { c } = useTheme();
  const { d } = useDomain();
  const startWorkout = useStartWorkout();
  const insets = useSafeAreaInsets();
  const hidden = useNavHidden();
  const live = !!d.session;
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: (hidden?.value ?? 0) * 88 }] }));
  const bottom = Math.max(insets.bottom - 6, 14) + 84;
  return (
    <FadeIn pointerEvents="box-none" style={[{ position: 'absolute', left: 16, right: 16, bottom }, lift]}>
      <Button kind="glassAccent" label={live ? 'Resume workout' : 'Start workout'} icon={<Play size={18} color={c.accentInk} fill={c.accentInk} />}
        onPress={() => (live ? router.push('/workout') : startWorkout())} />
    </FadeIn>
  );
}
