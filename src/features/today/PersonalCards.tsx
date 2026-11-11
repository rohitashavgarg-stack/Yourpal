import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, ChefHat, Dumbbell, Footprints, Flame, Zap } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Card } from '@/design-system/primitives/Card';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { useOverlay } from '@/components/Overlay';
import { MEALS, TODAY_IDX } from '@/lib/data';
import { LinearGradient } from 'expo-linear-gradient';
import { mealLog, totals, useDomain, workoutState } from '@/lib/domain';
import { useLogsPaused } from '@/lib/logGate';
import { haptic } from '@/lib/haptics';
import { HEALTH_NAME } from '@/lib/health';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { dayPlan, usePlans } from '@/features/plans/store';
import { nextMeal } from './meals';
import { TIP_LABEL, personalStore, tipOfDay } from './personalise';

// ---------- Day done ----------
// The main card at the end of the day, once the workout and every meal are logged: what was done and a look at tomorrow.
export function useDayDone() {
  const { d } = useDomain();
  const on = personalStore.use().dayDone;
  const paused = useLogsPaused();
  if (!on || paused) return false;
  return workoutState(d) === 'done' && nextMeal(d) === null;
}

export function DayDoneCard() {
  const { c } = useTheme();
  const { d } = useDomain();
  const { p } = usePlans();
  const logged = MEALS.filter((m) => !mealLog(d, m.id).skip).length;
  const kcal = Math.round(totals(d).k);
  const tomorrow = dayPlan(d, { ...p, week: 0 }, TODAY_IDX + 1);
  const stat = (v: string, l: string) => (
    <View style={{ flex: 1, gap: 2 }}>
      <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2Plus, lineHeight: 30, letterSpacing: -0.4 }}>{v}</Txt>
      <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{l}</Txt>
    </View>
  );
  return (
    <Card variant="tight" style={{ gap: 14 }}>
      <Row style={{ gap: 12 }}>
        <IconBadge size={44} radius={radii.md} bg={c.goodSoft}><Check size={22} strokeWidth={2.4} color={c.good} /></IconBadge>
        <View style={{ flex: 1 }}>
          <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25 }}>Day done</Txt>
          <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>Everything for today is logged</Txt>
        </View>
      </Row>
      <Row style={{ alignItems: 'flex-start' }}>
        {stat('1', 'Workout')}
        {stat(`${logged} of ${MEALS.length}`, 'Meals')}
        {stat(kcal.toLocaleString('en-IN'), 'kcal')}
      </Row>
      <View style={{ height: 1, backgroundColor: c.line }} />
      <Row style={{ justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Tomorrow</Txt>
          <Txt style={{ fontFamily: font.medium }}>{tomorrow ? `${tomorrow.name}${tomorrow.time ? `, ${tomorrow.time}` : ''}` : 'Rest day'}</Txt>
        </View>
      </Row>
      <Button kind="primary" label="See tomorrow" onPress={() => router.navigate({ pathname: '/plans', params: { day: String(TODAY_IDX + 1) } })} />
    </Card>
  );
}

// ---------- Quick tip ----------
// The last thing on Today: one idea a day, a tip, a recipe or a workout to try. A tinted card (a colour for each kind) with a big soft icon behind the words. Text only, no button.
export function QuickTipCard() {
  const { c } = useTheme();
  const on = personalStore.use().quickTip;
  if (!on) return null;
  const t = tipOfDay(new Date().getDate());
  const Icon = t.kind === 'recipe' ? ChefHat : t.kind === 'workout' ? Dumbbell : Zap;
  const tone = t.kind === 'recipe' ? { bg: c.tNutri, fg: c.cNutri } : t.kind === 'workout' ? { bg: c.tAct, fg: c.cAct } : { bg: c.tSleep, fg: c.cSleep };
  return (
    <Card variant="tight" clip style={{ gap: 8, paddingVertical: 20 }}>
      <LinearGradient pointerEvents="none" colors={[tone.bg, c.cardLift]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View pointerEvents="none" style={{ position: 'absolute', right: -14, bottom: -18, opacity: 0.14 }}><Icon size={132} strokeWidth={1.4} color={tone.fg} /></View>
      <Row style={{ gap: 8 }}>
        <Icon size={16} color={tone.fg} />
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, letterSpacing: 0.8, color: tone.fg }}>{TIP_LABEL[t.kind]}</Txt>
      </Row>
      <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2Plus, lineHeight: 30, letterSpacing: -0.5, maxWidth: '88%' }}>{t.title}</Txt>
      <Txt muted style={{ fontSize: fontSizes.base, lineHeight: 23, maxWidth: '88%' }}>{t.body}</Txt>
    </Card>
  );
}

// ---------- Connect Health: the sheet ----------
// Tapping Connect Health in Trackers opens this first: what is read, that it is read only, then Continue or Not now.
export function HealthConsentSheet() {
  const { c } = useTheme();
  const { set } = useDomain();
  const { closeSheet, toast } = useOverlay();
  const row = (icon: React.ReactNode, title: string, sub: string) => (
    <Row style={{ gap: 12 }}>
      {icon}
      <View style={{ flex: 1 }}>
        <Txt style={{ fontFamily: font.medium }}>{title}</Txt>
        <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{sub}</Txt>
      </View>
    </Row>
  );
  return (
    <View style={{ gap: 16, paddingBottom: 8 }}>
      <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl2Plus, lineHeight: 30, letterSpacing: -0.4 }}>Bring in your steps and energy</Txt>
      {row(<IconBadge size={40} radius={radii.sm} bg={c.goodSoft}><Footprints size={19} color={c.good} /></IconBadge>, 'Steps', 'Counted on Today')}
      {row(<IconBadge size={40} radius={radii.sm} bg={c.warnSoft}><Flame size={19} color={c.warn} /></IconBadge>, 'Active energy', 'Fills your Burn today')}
      <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{`Read only from ${HEALTH_NAME}. You can disconnect any time in Profile.`}</Txt>
      <Button kind="primary" label="Continue" onPress={() => closeSheet(() => { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected. Steps and energy sync automatically`); })} />
      <Pressy accessibilityRole="button" onPress={() => closeSheet()} scaleTo={0.96} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 }}>
        <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 21, color: c.muted }}>Not now</Txt>
      </Pressy>
    </View>
  );
}
