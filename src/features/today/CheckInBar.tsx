import React from 'react';
import { useStartWorkout } from '@/features/workout/StartSheet';
import { View } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, MapPin, LocateOff } from '@/lib/icons';
import { Pressy, Txt } from '@/components/ui';
import { Glow, PillBtn } from '@/components/bits';
import { useNavHidden } from '@/components/FloatingTabBar';
import { useOverlay } from '@/components/Overlay';
import { fmtT } from '@/lib/data';
import { useDomain, workoutState } from '@/lib/domain';
import { useLogsPaused } from '@/lib/logGate';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { mmss, useNow } from '@/lib/useNow';
import { ciTime } from './WeekCard';
import { useCheckIn } from '@/features/checkin/useCheckIn';
import { elapsedMin, limitOf } from '@/features/checkin/logic';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { FadeIn } from '@/design-system/primitives/FadeIn';

export type CiMode = 'none' | 'here' | 'near' | 'in' | 'out' | 'off';
export function useCiMode(): CiMode {
  const { d } = useDomain();
  if (d.session || !d.hasGym) return 'none';
  if (d.ciOut) return 'out';
  if (d.ciStart != null || ciTime(d) != null) return 'in';
  return d.ci === 'At the gym' ? 'here' : d.ci === 'Near (25 m)' ? 'near' : d.ci === 'Location off' ? 'off' : 'none';
}

// Floats above the tab bar and follows it down when the nav hides on scroll.
function Floating({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const hidden = useNavHidden();
  const navBottom = Math.max(insets.bottom - 6, 14);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: (hidden?.value ?? 0) * 74 }] }));
  return (
    <FadeIn style={[{ position: 'absolute', left: 16, right: 16, bottom: navBottom + 74, zIndex: 4 }, a]}>
      {children}
    </FadeIn>
  );
}

const BAR = { height: 52, borderRadius: radii.xl, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 12, paddingRight: 6, shadowColor: fixed.shadow, shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 3 } as const;

function MiniWorkout() {
  const { d } = useDomain();
  const now = useNow(true, 500);
  const s = d.session!;
  const resting = s.rest && s.rest.endAt > now;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Leg day in progress, resume" onPress={() => router.push('/workout')} scaleTo={0.98} style={[BAR, { backgroundColor: fixed.dark }]}>
      <Glow />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, color: fixed.white }}>Leg day · in progress</Txt>
        <Txt style={{ fontFamily: font.mono, fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.7)' }}>{resting ? `Rest ${mmss((s.rest!.endAt - now) / 1000)}` : mmss((now - s.startAt) / 1000).padStart(5, '0')}</Txt>
      </View>
      <View style={{ height: 40, borderRadius: 20, paddingHorizontal: 16, backgroundColor: fixed.white, justifyContent: 'center' }}><Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, color: fixed.dark }}>Resume</Txt></View>
    </Pressy>
  );
}

export function CheckInBar() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  const startWorkout = useStartWorkout();
  const A = useCheckIn();
  const mode = useCiMode();
  const paused = useLogsPaused();
  const now = useNow(mode === 'in', 15000);
  if (d.session) return <Floating><MiniWorkout /></Floating>;
  const st = workoutState(d);
  // the workout is done for today: no nudge to check in; a member who is checked in still sees the timer and Check out
  if (mode === 'none' || paused || (st === 'done' && mode !== 'in')) return null;
  const at = ciTime(d);
  let bg: string = c.surface, fg: string = c.ink, icBg: string = c.surface2, title = '', sub = '', btn = '', act: (() => void) | null = null, border = true;
  let icon = <MapPin size={17} color={fg} />;
  let chip = '';
  let progress: number | null = null;
  let open: (() => void) | null = () => router.push('/checkin');
  let pillTone: 'ink' | 'white' | 'soft' = 'ink';
  if (mode === 'here' || mode === 'near') {
    const here = mode === 'here';
    if (here) icBg = c.accentSoft;
    title = here ? 'You made it to Wulf Fitness' : 'Almost at Wulf Fitness';
    sub = here ? 'You are inside the check-in area' : 'You are 25 m away. Check-in opens at 20 m.';
    btn = here ? 'Check in' : 'Map';
    pillTone = here ? 'ink' : 'soft';
    act = () => router.push('/checkin');
  } else if (mode === 'in') {
    icBg = c.goodSoft; pillTone = 'soft';
    const mins = Math.max(0, Math.floor(elapsedMin(d, now)));
    title = 'You are checked in';
    chip = `${mins} min`;
    progress = Math.min(1, mins / limitOf(d));
    sub = `Since ${fmtT(at!).full}. ${st === 'todo' ? 'Leg day is next.' : st === 'done' ? 'Workout done.' : 'Rest day.'}`;
    if (st === 'todo') { btn = 'Start workout'; act = () => startWorkout(); }
    else { btn = 'Check out'; act = A.checkOut; }
    icon = <Check size={16} strokeWidth={2.6} color={c.good} />;
  } else if (mode === 'out') {
    bg = c.surface; icBg = c.goodSoft;
    const o = d.ciOut!;
    title = `You checked out at ${fmtT(o.at).full}`;
    sub = `${o.mins} minutes at the gym.${o.auto === 'time' ? ' Checked out automatically.' : o.auto === 'left' ? ' You left the gym.' : ''}`;
    icon = <Check size={17} strokeWidth={2.6} color={c.good} />;
  } else {
    title = 'Location is off'; sub = 'Turn it on to check in, or ask the front desk to mark you.'; btn = 'Turn on'; open = null;
    act = () => { set({ ci: 'At the gym' }); haptic.success(); toast('Location on. We only check it while the app is open'); };
    icon = <LocateOff size={17} color={fg} />;
  }
  const label = `${title}${chip ? ` ${chip}` : ""}. ${sub}`;
  return (
    <Floating>
      <View accessibilityRole="summary" style={[BAR, { backgroundColor: bg }, border && { borderWidth: 1, borderColor: c.line }]}>
        <Pressy accessibilityRole={open ? 'button' : undefined} accessibilityLabel={label} disabled={!open} onPress={open ?? undefined} scaleTo={0.98} haptics={false} style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 }}>
          <IconBadge size={32} radius={radii.md} bg={icBg}>{icon}</IconBadge>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Txt numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: fontSizes.md, color: fg, flexShrink: 1 }}>{title}</Txt>
              {!!chip && (
                <View style={{ height: 20, paddingHorizontal: 8, borderRadius: radii.sm, backgroundColor: c.goodSoft, justifyContent: 'center' }}>
                  <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xs2, lineHeight: 15, color: c.good }}>{chip}</Txt>
                </View>
              )}
            </View>
            <Txt numberOfLines={1} style={{ fontSize: fontSizes.xs, color: fg, opacity: 0.72 }}>{sub}</Txt>
          </View>
        </Pressy>
        {btn && act ? <PillBtn h={36} label={btn} tone={pillTone} onPress={act} style={{ paddingHorizontal: 14 }} /> : null}
        {progress != null && (
          <View pointerEvents="none" style={{ position: 'absolute', left: 18, right: 18, bottom: 0, height: 3, borderRadius: radii.xs, backgroundColor: c.goodSoft, overflow: 'hidden' }}>
            <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: c.good }} />
          </View>
        )}
      </View>
    </Floating>
  );
}
