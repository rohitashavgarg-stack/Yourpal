import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Footprints, Flame, Lightbulb } from '@/lib/icons';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Card } from '@/design-system/primitives/Card';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { useOverlay } from '@/components/Overlay';
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

// ---------- Quick tip ----------
// The last thing on Today: one idea a day, a tip, a recipe or a workout to try. Plain text on the page with a thin line above it: no card, no fill, no button.
export function QuickTipCard() {
  const { c } = useTheme();
  const on = personalStore.use().quickTip;
  if (!on) return null;
  const t = tipOfDay(new Date().getDate());
  return (
    <View style={{ gap: 8, paddingHorizontal: 6, paddingTop: 18, borderTopWidth: 1, borderTopColor: c.line }}>
      <Row style={{ gap: 8 }}>
        <Lightbulb size={16} color={c.cSleep} />
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, letterSpacing: 0.8, color: c.cSleep }}>{TIP_LABEL[t.kind]}</Txt>
      </Row>
      <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2Plus, lineHeight: 30, letterSpacing: -0.5 }}>{t.title}</Txt>
      <Txt muted style={{ fontSize: fontSizes.base, lineHeight: 23 }}>{t.body}</Txt>
    </View>
  );
}

// ---------- Connect Health: the sheet ----------
// Tapping Connect Health in Trackers opens this: connect the health app to bring in steps and active energy.
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
      <View style={{ gap: 4 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.display, fontSize: fontSizes.xl2Plus, lineHeight: 30, letterSpacing: -0.4 }}>{`Connect ${HEALTH_NAME}`}</Txt>
        <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 20 }}>Bring your steps and energy into YourPal. They sync on their own.</Txt>
      </View>
      {row(<IconBadge size={40} radius={radii.sm} bg={c.goodSoft}><Footprints size={19} color={c.good} /></IconBadge>, 'Steps', 'Counted on Today')}
      {row(<IconBadge size={40} radius={radii.sm} bg={c.warnSoft}><Flame size={19} color={c.warn} /></IconBadge>, 'Active energy', 'Fills your Burn today')}
      <Button kind="primary" label={`Connect ${HEALTH_NAME}`} onPress={() => closeSheet(() => { set({ hc: true }); haptic.success(); toast(`${HEALTH_NAME} connected. Steps and energy sync automatically`); })} />
      <Pressy accessibilityRole="button" onPress={() => closeSheet()} scaleTo={0.96} style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 }}>
        <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, lineHeight: 21, color: c.muted }}>Not now</Txt>
      </Pressy>
    </View>
  );
}
