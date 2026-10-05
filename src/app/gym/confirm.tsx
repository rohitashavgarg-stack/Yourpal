import React, { useEffect, useRef, useState } from 'react';
import { PersonAvatar } from '@/components/Brand';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { fade, fadeOut } from '@/theme/motion';
import { Button, Field, Pressy, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { Hint, ListCard, SubPage, useShake } from '@/features/progress/parts';
import { PT_TOTAL, STAR_WORDS } from '@/features/gym/data';
import { FlagSheet } from '@/features/gym/sheets';
import { gymStore, useGymScenarios } from '@/features/gym/state';

const STAR = 'M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z';
const APath = Animated.createAnimatedComponent(Path);

function StarBtn({ n, on, bump, onPress }: { n: number; on: boolean; bump: number; onPress: () => void }) {
  const { c, isDark } = useTheme();
  const s = useSharedValue(1);
  // Small timed pulse on the stars up to the one picked (no overshoot spring).
  useEffect(() => { if (bump && on) s.value = withDelay((n - 1) * 60, withSequence(withTiming(1.18, { duration: 140 }), withTiming(1, { duration: 180 }))); }, [bump]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const star = isDark ? '#F2B35B' : '#E08A0B';
  return (
    <Pressy accessibilityRole="radio" accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`} accessibilityState={{ selected: on }} onPress={onPress} scaleTo={0.9}
      style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={a}><Svg width={40} height={40} viewBox="0 0 24 24"><Path d={STAR} fill={on ? star : c.surface3} /></Svg></Animated.View>
    </Pressy>
  );
}

function DoneTick() {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withDelay(100, withTiming(1, { duration: 450, easing: Easing.bezier(0.65, 0, 0.35, 1) })); }, []);
  const ap = useAnimatedProps(() => ({ strokeDashoffset: 24 * (1 - p.value) }));
  return <Svg width={24} height={24} viewBox="0 0 24 24"><APath d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#06150E" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" animatedProps={ap} /></Svg>;
}

export default function ConfirmSession() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { toast, openSheet } = useOverlay();
  const [rating, setRating] = useState(0);
  const [bump, setBump] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [err, setErr] = useState(false);
  const [done, setDone] = useState(false);
  const shake = useShake();
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  useGymScenarios('Gym · Confirm session', [
    { label: 'Rating', options: ['None', '3 stars', '5 stars'], value: rating === 0 ? 'None' : rating === 5 ? '5 stars' : rating === 3 ? '3 stars' : `${rating} stars`, onPick: (v) => { setRating(v === 'None' ? 0 : Number(v[0])); setErr(false); } },
  ], [{ label: 'Try confirming without a rating', run: () => { setRating(0); setErr(true); shake.run(); } }], [rating]);

  const pick = (n: number) => { setRating(n); setBump((b) => b + 1); setErr(false); haptic.tap(); };
  const confirm = () => {
    if (done) return;
    if (!rating) { setErr(true); shake.run(); haptic.error(); return; }
    setDone(true); haptic.success();
    const left = Math.max(0, d.ptLeft - 1);
    t.current = setTimeout(() => {
      gymStore.set({ sessionState: 'confirmed', rating });
      set({ ptLeft: left });
      if (router.canGoBack()) router.back(); else router.replace('/gym/attendance');
      toast(`Session confirmed · ${left} of ${PT_TOTAL} left in your package`);
    }, 900);
  };

  return (
    <SubPage title="Confirm session" fallback="/gym/attendance">
      <View style={{ padding: 18, borderRadius: 26, backgroundColor: c.accentSoft, gap: 4 }}>
        <Txt style={{ fontFamily: font.display, fontSize: 25, lineHeight: 33 }}>Tue 23 Sep · 6:00–7:00 pm</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <PersonAvatar who="coach" size={26} />
          <Txt style={{ flex: 1, fontSize: 14, color: c.accentText }}>Coach Vikram marked this session as completed</Txt>
        </View>
      </View>
      <Txt style={{ fontFamily: font.semibold, fontSize: 17, paddingHorizontal: 4 }}>How was it?</Txt>
      <View accessibilityRole="radiogroup" accessibilityLabel="Rate the session, 1 to 5 stars" style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => <StarBtn key={n} n={n} on={rating >= n} bump={bump} onPress={() => pick(n)} />)}
      </View>
      <Txt muted accessibilityLiveRegion="polite" style={{ textAlign: 'center', fontSize: 14 }}>{STAR_WORDS[rating]}</Txt>
      <Txt v="label" style={{ paddingHorizontal: 6 }}>Remarks (optional)</Txt>
      <View style={{ marginTop: -6 }}><Field value={remarks} onChangeText={setRemarks} placeholder="Worked on squat depth" accessibilityLabel="Remarks, optional" /></View>
      {err && (
        <Animated.View entering={fade()} exiting={fadeOut()} style={shake.style}>
          <Txt accessibilityRole="alert" style={{ color: c.warn, fontSize: 14, paddingHorizontal: 6 }}>Pick a rating to confirm.</Txt>
        </Animated.View>
      )}
      {done ? (
        <Animated.View entering={fade()} accessible accessibilityLabel="Session confirmed" style={{ alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: c.good, alignItems: 'center', justifyContent: 'center' }}>
          <DoneTick />
        </Animated.View>
      ) : (
        <Button label="Confirm session" onPress={confirm} />
      )}
      <ListCard rows={[{ l: "This didn't happen", onPress: () => openSheet(<FlagSheet />, { label: 'Flag session' }) }]} />
      <Hint style={{ fontSize: 12 }}>Your rating and remarks go only to the gym admin, never to Coach Vikram or other members.</Hint>
    </SubPage>
  );
}
