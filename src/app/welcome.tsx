import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { useStore } from '@/lib/store';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Pressy, Txt } from '@/components/ui';
import { fade, fadeOut } from '@/theme/motion';
import { font } from '@/theme/tokens';

// One soft blue glow bleeding in from the top-right corner. Radial gradient, so it is blurred with no filter (works on web and native).
function Glow({ width, height }: { width: number; height: number }) {
  if (!width || !height) return null;
  const r = width * 1.25;
  return (
    <Svg pointerEvents="none" width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <RadialGradient id="g" cx={width} cy={0} r={r} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#2F6BEA" stopOpacity={0.9} />
          <Stop offset="0.4" stopColor="#2F6BEA" stopOpacity={0.35} />
          <Stop offset="1" stopColor="#2F6BEA" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#g)" />
    </Svg>
  );
}

const MOCK_BASE = { width: 252, height: 372, borderTopLeftRadius: 34, borderTopRightRadius: 34, backgroundColor: '#0D1119', borderWidth: 1.5, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.22)', padding: 12, gap: 8, overflow: 'hidden' } as const;
const TILE = { backgroundColor: '#161B26', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' } as const;
const DIM = 'rgba(255,255,255,0.6)';

// A tiny, static picture of the Today tab so people see what they get before signing in.
function TodayMock() {
  const R = 22, C = 2 * Math.PI * R;
  return (
    <View accessible accessibilityLabel="Preview of the Today screen: your goal, water and weight trackers, and today's workout" style={MOCK_BASE}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#2F6BEA' }} />
          <Txt style={{ fontSize: 11, lineHeight: 15, color: '#fff', fontFamily: font.semibold }}>Your gym</Txt>
        </View>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#2A3242' }} />
      </View>
      <Txt style={{ fontSize: 18, lineHeight: 24, letterSpacing: -0.5, color: '#fff', fontFamily: font.regular }}>{'Good evening,\nthere'}</Txt>
      <LinearGradient colors={['#3E7BF0', '#2F6BEA', '#1D46B5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Svg width={54} height={54} viewBox="0 0 54 54">
          <Circle cx={27} cy={27} r={R} stroke="rgba(255,255,255,0.28)" strokeWidth={5} fill="none" />
          <Circle cx={27} cy={27} r={R} stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={`${C * 0.35} ${C}`} transform="rotate(-90 27 27)" />
        </Svg>
        <View>
          <Txt style={{ fontSize: 10, lineHeight: 14, color: 'rgba(255,255,255,0.8)' }}>Your goal</Txt>
          <Txt style={{ fontSize: 20, lineHeight: 26, letterSpacing: -0.6, color: '#fff', fontFamily: font.semibold }}>Lose 6 kg</Txt>
        </View>
      </LinearGradient>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[TILE, { flex: 1 }]}>
          <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>Water</Txt>
          <Txt style={{ fontSize: 17, lineHeight: 23, color: '#fff', fontFamily: font.semibold }}>1,800 <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>ml</Txt></Txt>
        </View>
        <View style={[TILE, { flex: 1 }]}>
          <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>Weight</Txt>
          <Txt style={{ fontSize: 17, lineHeight: 23, color: '#fff', fontFamily: font.semibold }}>72.4 <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>kg</Txt></Txt>
        </View>
      </View>

      <View style={[TILE, { gap: 2, padding: 12 }]}>
        <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>Today's workout · Your coach</Txt>
        <Txt style={{ fontSize: 20, lineHeight: 26, letterSpacing: -0.6, color: '#fff', fontFamily: font.regular }}>Leg day</Txt>
        <View style={{ marginTop: 6, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontSize: 11, lineHeight: 15, color: '#000', fontFamily: font.semibold }}>Start workout</Txt>
        </View>
      </View>
    </View>
  );
}

// Today's workout, exercise by exercise.
function WorkoutMock() {
  const rows: [string, string, string, boolean][] = [['Squat', '4 × 8', '60 kg', true], ['Leg press', '3 × 12', '120 kg', true], ['Lunges', '3 × 10', '20 kg', false], ['Leg curl', '3 × 12', '35 kg', false], ['Plank', '3 × 45 s', '', false]];
  return (
    <View accessible accessibilityLabel="Preview of the workout screen: exercises with sets and weights" style={MOCK_BASE}>
      <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM, paddingTop: 4 }}>Planned by your coach</Txt>
      <Txt style={{ fontSize: 24, lineHeight: 31, letterSpacing: -0.6, color: '#fff', fontFamily: font.semibold }}>Leg day</Txt>
      {rows.map(([n, sets, w, done]) => (
        <View key={n} style={[TILE, { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 }]}>
          <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: done ? '#2F6BEA' : 'transparent', borderWidth: done ? 0 : 1.5, borderColor: 'rgba(255,255,255,0.3)' }} />
          <View style={{ flex: 1 }}>
            <Txt style={{ fontSize: 12, lineHeight: 17, color: '#fff', fontFamily: font.semibold }}>{n}</Txt>
            <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>{sets}{w ? ' · ' + w : ''}</Txt>
          </View>
        </View>
      ))}
    </View>
  );
}

// Weight, streak and steps.
function ProgressMock() {
  const bars = [0.55, 0.8, 0.7, 0.95, 0.6, 0.85, 0.4];
  return (
    <View accessible accessibilityLabel="Preview of the progress screen: weight trend, weekly streak and steps" style={MOCK_BASE}>
      <Txt style={{ fontSize: 18, lineHeight: 24, letterSpacing: -0.5, color: '#fff', paddingTop: 4 }}>Progress</Txt>
      <View style={[TILE, { padding: 12, gap: 4 }]}>
        <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>Weight</Txt>
        <Txt style={{ fontSize: 22, lineHeight: 29, color: '#fff', fontFamily: font.semibold }}>72.4 <Txt style={{ fontSize: 11, lineHeight: 15, color: DIM }}>kg · 2.1 down</Txt></Txt>
        <Svg width="100%" height={44} viewBox="0 0 200 44" preserveAspectRatio="none"><Path d="M0 8 C30 10 50 18 80 22 S130 30 160 33 S190 36 200 38" stroke="#6FA0FF" strokeWidth={3} fill="none" strokeLinecap="round" /></Svg>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[TILE, { flex: 1 }]}>
          <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>Streak</Txt>
          <Txt style={{ fontSize: 17, lineHeight: 23, color: '#FF8A3D', fontFamily: font.semibold }}>7 weeks</Txt>
          <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>{[1, 1, 1, 0].map((o, i) => <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: o ? '#FF8A3D' : 'rgba(255,255,255,0.15)' }} />)}</View>
        </View>
        <View style={[TILE, { flex: 1 }]}>
          <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>Steps</Txt>
          <Txt style={{ fontSize: 17, lineHeight: 23, color: '#fff', fontFamily: font.semibold }}>6,436</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 18, marginTop: 4 }}>{bars.map((b, i) => <View key={i} style={{ flex: 1, height: 18 * b, borderRadius: 2, backgroundColor: '#8A9BFF' }} />)}</View>
        </View>
      </View>
      <View style={[TILE, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(15,138,95,0.25)' }} />
        <View>
          <Txt style={{ fontSize: 12, lineHeight: 17, color: '#fff', fontFamily: font.semibold }}>Diet 88% on plan</Txt>
          <Txt style={{ fontSize: 10, lineHeight: 14, color: DIM }}>This week</Txt>
        </View>
      </View>
    </View>
  );
}

const SLIDES = [
  { title: 'Your day,\nin one place', sub: 'Today shows your workout, meals and goal the moment you open the app.', Mock: TodayMock },
  { title: 'Follow the plan,\nset by set', sub: 'Your coach plans it. You log it in a few taps, with a rest timer built in.', Mock: WorkoutMock },
  { title: 'See it\nadd up', sub: 'Weight, streaks and steps turn into progress you can actually see.', Mock: ProgressMock },
];

const SLIDE_MS = 4500;

// Story-style indicator: finished slides are full, the current one fills over the time it stays on screen.
function Segment({ n, i, onPress, label }: { n: number; i: number; onPress: () => void; label: string }) {
  const p = useSharedValue(n < i ? 1 : 0);
  useEffect(() => {
    cancelAnimation(p);
    if (n < i) p.value = 1;
    else if (n > i) p.value = 0;
    else { p.value = 0; p.value = withTiming(1, { duration: SLIDE_MS, easing: Easing.linear }); }
  }, [i]);
  const fill = useAnimatedStyle(() => ({ width: `${p.value * 100}%` }));
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={{ top: 14, bottom: 14 }} scaleTo={0.97}
      style={{ width: 28, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)', overflow: 'hidden' }}>
      <Animated.View style={[{ height: '100%', borderRadius: 2, backgroundColor: '#fff' }, fill]} />
    </Pressy>
  );
}

// First screen for a signed-out member: black, one blue glow, a short tour of the app, and one button.
export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setI((n) => (n + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i]);
  if (state.loggedIn) return <Redirect href={state.onboarded ? '/(tabs)' : '/onboarding'} />;
  const { title, sub, Mock } = SLIDES[i];
  return (
    <View onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} style={{ flex: 1, backgroundColor: '#000' }}>
      <Glow width={box.w} height={box.h} />
      <View style={{ paddingTop: insets.top + 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#2F6BEA', alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: 26, lineHeight: 34, color: '#fff' }}>Y</Txt>
        </View>
        <Txt accessibilityRole="header" style={{ fontFamily: font.displayBold, fontSize: 32, lineHeight: 42, letterSpacing: -0.8, color: '#fff' }}>YourPal</Txt>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
        <Animated.View key={i} entering={fade()} exiting={fadeOut()}><Mock /></Animated.View>
        <LinearGradient pointerEvents="none" colors={['rgba(0,0,0,0)', '#000']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 }} />
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20, gap: 14 }}>
        <Animated.View key={'t' + i} entering={fade()} style={{ gap: 6, minHeight: 124 }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.9, color: '#fff' }}>{title}</Txt>
          <Txt style={{ fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.7)' }}>{sub}</Txt>
        </Animated.View>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {SLIDES.map((_, n) => <Segment key={n} n={n} i={i} onPress={() => setI(n)} label={`Show preview ${n + 1} of ${SLIDES.length}`} />)}
        </View>
        <Button kind="white" label="Let's begin" onPress={() => router.push('/login')} style={{ marginTop: 4 }} />
        <Txt style={{ fontSize: 12, lineHeight: 18, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Your gym adds your number at the front desk. Sign in with it to join.</Txt>
      </View>
    </View>
  );
}
