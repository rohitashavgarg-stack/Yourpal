import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, MapPin, LocateOff } from '@/lib/icons';
import { Pressy, Txt } from '@/components/ui';
import { Glow, PillBtn } from '@/components/bits';
import { useNavHidden } from '@/components/FloatingTabBar';
import { useOverlay } from '@/components/Overlay';
import { fmtT } from '@/lib/data';
import { useDomain, workoutState } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { mmss, useNow } from '@/lib/useNow';
import { ciTime } from './WeekCard';
import { useCheckIn } from '@/features/checkin/useCheckIn';
import { elapsedMin } from '@/features/checkin/logic';

export type CiMode = 'none' | 'here' | 'near' | 'in' | 'out' | 'off';
export function useCiMode(): CiMode {
  const { d } = useDomain();
  if (d.session) return 'none';
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
    <Animated.View entering={fade()} style={[{ position: 'absolute', left: 16, right: 16, bottom: navBottom + 74, zIndex: 4 }, a]}>
      {children}
    </Animated.View>
  );
}

const BAR = { height: 52, borderRadius: 26, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 12, paddingRight: 6, shadowColor: '#101828', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 3 } as const;

function MiniWorkout() {
  const { d } = useDomain();
  const now = useNow(true, 500);
  const s = d.session!;
  const resting = s.rest && s.rest.endAt > now;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Leg day in progress, resume" onPress={() => router.push('/workout')} scaleTo={0.98} style={[BAR, { backgroundColor: '#0B0E14' }]}>
      <Glow />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 14, color: '#fff' }}>Leg day · in progress</Txt>
        <Txt style={{ fontFamily: font.mono, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{resting ? `Rest ${mmss((s.rest!.endAt - now) / 1000)}` : mmss((now - s.startAt) / 1000).padStart(5, '0')}</Txt>
      </View>
      <View style={{ height: 40, borderRadius: 20, paddingHorizontal: 16, backgroundColor: '#fff', justifyContent: 'center' }}><Txt style={{ fontFamily: font.semibold, fontSize: 13, color: '#0B0E14' }}>Resume</Txt></View>
    </Pressy>
  );
}

export function CheckInBar() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  const A = useCheckIn();
  const mode = useCiMode();
  const now = useNow(mode === 'in', 15000);
  if (d.session) return <Floating><MiniWorkout /></Floating>;
  if (mode === 'none') return null;
  const st = workoutState(d);
  const at = ciTime(d);
  let bg: string = c.surface, fg: string = c.ink, icBg: string = c.surface2, title = '', sub = '', btn = '', act: (() => void) | null = null, border = true;
  let icon = <MapPin size={17} color={fg} />;
  let open: (() => void) | null = () => router.push('/checkin');
  let pillTone: 'ink' | 'white' | 'soft' = 'ink';
  if (mode === 'here' || mode === 'near') {
    const here = mode === 'here';
    if (here) icBg = c.accentSoft;
    title = here ? "You're at Wulf Fitness" : "Almost at Wulf Fitness";
    sub = here ? 'Inside the 20 m check-in area' : '25 m away · check-in opens within 20 m';
    btn = here ? 'Check in' : 'Map';
    pillTone = here ? 'ink' : 'soft';
    act = () => router.push('/checkin');
  } else if (mode === 'in') {
    icBg = c.goodSoft; pillTone = 'soft';
    const mins = Math.max(0, Math.floor(elapsedMin(d, now)));
    title = `Checked in ${mins} min`;
    sub = `Since ${fmtT(at!).full} · ${st === 'todo' ? 'Leg day is next' : st === 'done' ? 'Workout done' : 'Rest day'}`;
    btn = 'Check out';
    act = A.checkOut;
    icon = <Check size={16} strokeWidth={2.6} color={c.good} />;
  } else if (mode === 'out') {
    bg = c.surface; icBg = c.goodSoft;
    const o = d.ciOut!;
    title = `Checked out ${fmtT(o.at).full}`;
    sub = `${o.mins} min at the gym${o.auto === 'time' ? ' · automatic' : o.auto === 'left' ? ' · you left the gym' : ''}`;
    icon = <Check size={17} strokeWidth={2.6} color={c.good} />;
  } else {
    title = 'Location is off'; sub = 'Turn it on to check in · front desk can also mark you'; btn = 'Turn on'; open = null;
    act = () => { set({ ci: 'At the gym' }); haptic.success(); toast('Location on · we only check it while the app is open'); };
    icon = <LocateOff size={17} color={fg} />;
  }
  const label = `${title}. ${sub}`;
  return (
    <Floating>
      <View accessibilityRole="summary" style={[BAR, { backgroundColor: bg }, border && { borderWidth: 1, borderColor: c.line }]}>
        <Pressy accessibilityRole={open ? 'button' : undefined} accessibilityLabel={label} disabled={!open} onPress={open ?? undefined} scaleTo={0.98} haptics={false} style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: icBg, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 14, color: fg }}>{title}</Txt>
            <Txt numberOfLines={1} style={{ fontSize: 12, color: fg, opacity: 0.72 }}>{sub}</Txt>
          </View>
        </Pressy>
        {btn && act ? <PillBtn h={36} label={btn} tone={pillTone} onPress={act} style={{ paddingHorizontal: 14 }} /> : null}
      </View>
    </Floating>
  );
}
