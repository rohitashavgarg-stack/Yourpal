import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { fade } from '@/theme/motion';
import { Activity, CalendarDays, ChevronRight, Dumbbell, MessageCircle, UtensilsCrossed as UtensilCrossed, X } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain, totals, workoutState } from '@/lib/domain';
import { KCAL_TARGET } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { useLogsPaused } from '@/lib/logGate';
import { useGoalV2 } from '@/features/goalv2/model';
import { goalCardStore, STALE_WEIGH_DAYS, useGoalCardState } from './goalCardState';
import { useUpdates } from './TopCards';

export type Slot = 'workout' | 'meals' | 'coach' | 'trackers' | 'week';

// ---------- Top snackbar: one at a time, one action, can be dismissed ----------
// Priority: 8-week check-in due, weigh-in needed, goal behind. Never inside a card.
export function TopSnack() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { live } = useUpdates();
  const paused = useLogsPaused();
  const weighDays = goalCardStore.use().weighDays;
  const goalState = useGoalCardState(useGoalV2());
  const gone = (k: string) => !!d.dismissed['snack-' + k];
  let snack: { key: string; text: string; action: string; go: () => void } | null = null;
  if (live.some((u) => u.key === 'reassess') && !gone('checkin')) snack = { key: 'checkin', text: "Your 8-week check-in is due. See how far you've come.", action: 'Details', go: () => router.push('/progress/assess') };
  else if (!paused && weighDays >= STALE_WEIGH_DAYS && !gone('weigh')) snack = { key: 'weigh', text: `You haven't logged your weight in ${weighDays} days.`, action: 'Log weight', go: () => router.push('/log-weight') };
  else if (goalState === 'behind' && !gone('behind')) snack = { key: 'behind', text: "You're 0.9 kg into a 6 kg goal and behind pace. Coach Vikram suggests two extra sessions.", action: 'See plan', go: () => router.push('/goal-detail') };
  if (!snack) return null;
  const s = snack;
  return (
    <Animated.View entering={fade(0)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.line, paddingLeft: 16, paddingRight: 4, minHeight: 56, gap: 8 }}>
      <Txt style={{ flex: 1, fontSize: 14, lineHeight: 20, paddingVertical: 10 }}>{s.text}</Txt>
      <Pressy accessibilityRole="button" onPress={s.go} style={{ height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 19, color: c.bg }}>{s.action}</Txt>
      </Pressy>
      <Pressy accessibilityRole="button" accessibilityLabel="Dismiss" onPress={() => { haptic.light(); set((x) => ({ dismissed: { ...x.dismissed, ['snack-' + s.key]: true } })); }} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <X size={17} color={c.muted} />
      </Pressy>
    </Animated.View>
  );
}

// ---------- The one new component: a card collapsed to a single row that keeps its number or status ----------
export function CollapsedRow({ slot, onOpen, coachCount = 0 }: { slot: Slot; onOpen: () => void; coachCount?: number }) {
  const { c } = useTheme();
  const { d } = useDomain();
  const t = totals(d);
  const st = workoutState(d);
  const Icon = { workout: Dumbbell, meals: UtensilCrossed, coach: MessageCircle, trackers: Activity, week: CalendarDays }[slot];
  const title = { workout: 'Workout', meals: 'Meals', coach: 'Coach Vikram', trackers: 'Trackers', week: 'This week' }[slot];
  const status = slot === 'workout' ? (st === 'done' ? 'Done' : st === 'rest' ? 'Rest day' : st === 'live' ? 'In progress' : st === 'hidden' ? 'Easy session' : 'Planned 6:30 pm')
    : slot === 'meals' ? `${t.k.toLocaleString('en-IN')} of ${KCAL_TARGET.toLocaleString('en-IN')} kcal`
    : slot === 'coach' ? (coachCount ? `${coachCount} new` : 'All caught up')
    : slot === 'trackers' ? `${d.water} L water`
    : '3 of 5 workouts';
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${title}. ${status}. Open`} onPress={() => { haptic.light(); onOpen(); }} scaleTo={0.98}
      style={{ backgroundColor: c.surface, borderRadius: 22, minHeight: 64, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={c.ink} /></View>
        <Txt style={{ flex: 1, fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{title}</Txt>
        <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>{status}</Txt>
        <ChevronRight size={18} color={c.muted} />
      </Row>
    </Pressy>
  );
}

// ---------- Coach card, expanded: what the coach sent, or a quiet message button ----------
export function CoachEmpty() {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" onPress={() => router.push('/gym/chat')} scaleTo={0.98} style={{ backgroundColor: c.surface, borderRadius: 24, padding: 16 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={19} color={c.accentText} /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>Coach Vikram</Txt>
          <Txt muted style={{ fontSize: 14, lineHeight: 20 }}>No new notes. Tap to open the chat.</Txt>
        </View>
        <ChevronRight size={18} color={c.muted} />
      </Row>
    </Pressy>
  );
}
