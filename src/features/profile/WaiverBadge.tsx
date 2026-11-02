import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

// Colours of this badge. It is an illustration (a glossy lavender ring around a navy disc), so they do not follow the theme.
const RING = ['#F4F2FF', '#BDB6FB', '#7F73E9'];
const NAVY = ['#2E3E94', '#18235F', '#0B1340'];
const GLOW = '#8E84F5';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK = 'M38 62 L54 78 L84 44';
const CHECK_LEN = 72;

// The "signed" badge: pops in with a spring, draws its tick, sends out two soft rings and keeps a slow glow behind it.
export function WaiverBadge({ size = 104 }: { size?: number }) {
  const still = useReducedMotion();
  const pop = useSharedValue(still ? 1 : 0.2);
  const draw = useSharedValue(still ? 1 : 0);
  const glow = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  useEffect(() => {
    if (still) { glow.value = 0.5; return; }
    pop.value = withSpring(1, { damping: 7, stiffness: 140, mass: 0.8 });
    draw.value = withDelay(260, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), withTiming(0.35, { duration: 1800, easing: Easing.inOut(Easing.sin) })), -1);
    ring1.value = withDelay(500, withRepeat(withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }), -1));
    ring2.value = withDelay(1800, withRepeat(withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }), -1));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const badge = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }], opacity: Math.min(1, pop.value * 1.6) }));
  const halo = useAnimatedStyle(() => ({ opacity: 0.25 + glow.value * 0.4, transform: [{ scale: 0.9 + glow.value * 0.2 }] }));
  const r1 = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - ring1.value), transform: [{ scale: 1 + ring1.value * 1.1 }] }));
  const r2 = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - ring2.value), transform: [{ scale: 1 + ring2.value * 1.1 }] }));
  const tick = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LEN * (1 - draw.value) }));

  const halo3 = size * 3;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', width: halo3, height: halo3 }, halo]}>
        <Svg width={halo3} height={halo3}>
          <Defs>
            <RadialGradient id="wbHalo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={GLOW} stopOpacity={0.55} />
              <Stop offset="1" stopColor={GLOW} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={halo3 / 2} cy={halo3 / 2} r={halo3 / 2} fill="url(#wbHalo)" />
        </Svg>
      </Animated.View>
      {[r1, r2].map((s, i) => (
        <Animated.View key={i} pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: RING[1] }, s]} />
      ))}
      <Animated.View style={badge}>
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Defs>
            <LinearGradient id="wbRing" x1="0.15" y1="0" x2="0.85" y2="1">
              <Stop offset="0" stopColor={RING[0]} />
              <Stop offset="0.5" stopColor={RING[1]} />
              <Stop offset="1" stopColor={RING[2]} />
            </LinearGradient>
            <LinearGradient id="wbRim" x1="0.8" y1="1" x2="0.2" y2="0">
              <Stop offset="0" stopColor="#6D62E0" />
              <Stop offset="1" stopColor="#E9E6FF" />
            </LinearGradient>
            <RadialGradient id="wbNavy" cx="50%" cy="38%" r="70%">
              <Stop offset="0" stopColor={NAVY[0]} />
              <Stop offset="0.65" stopColor={NAVY[1]} />
              <Stop offset="1" stopColor={NAVY[2]} />
            </RadialGradient>
            <LinearGradient id="wbTick" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" />
              <Stop offset="1" stopColor="#D8D3FF" />
            </LinearGradient>
            <LinearGradient id="wbGloss" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Circle cx={60} cy={60} r={58} fill="url(#wbRing)" />
          <Circle cx={60} cy={60} r={51} fill="url(#wbRim)" opacity={0.55} />
          <Circle cx={60} cy={60} r={44} fill="url(#wbNavy)" />
          <Circle cx={60} cy={60} r={44} fill="none" stroke="#070D30" strokeOpacity={0.55} strokeWidth={3} />
          <Path d="M17 44 A46 46 0 0 1 58 12" stroke="url(#wbGloss)" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Path d={CHECK} transform="translate(0 4)" stroke="#050A2A" strokeOpacity={0.4} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <AnimatedPath d={CHECK} stroke="url(#wbTick)" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={CHECK_LEN} animatedProps={tick} />
        </Svg>
      </Animated.View>
    </View>
  );
}
