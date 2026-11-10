import React, { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useReduce } from '@/lib/motionSafe';
import { fixed } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

// The designer's "Mask group": thin vertical lines, 2 px wide every 15 px, that fade out from the top centre. Drawn here as plain rectangles
// (react-native-svg masks are not needed: the radial gradient is the fill of each line).
function Stripes({ width }: { width: number }) {
  const lines = Math.ceil(width / 15);
  return (
    <Svg width={width} height={251} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Defs>
        <RadialGradient id="wsFade" cx={width / 2} cy={16} r={214} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#121212" stopOpacity={1} />
          <Stop offset="1" stopColor="#121212" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {Array.from({ length: lines }, (_, i) => <Rect key={i} x={5 + i * 15} y={0} width={2} height={251} fill="url(#wsFade)" fillOpacity={0.5} />)}
    </Svg>
  );
}

// A tiny star that fades in and out.
function Twinkle({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  const still = useReduce();
  const p = useSharedValue(0);
  useEffect(() => {
    if (still) { p.value = 0.5; return; }
    p.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }), withTiming(0.1, { duration: 1400, easing: Easing.inOut(Easing.sin) })), -1));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const st = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: 0.6 + p.value * 0.6 }] }));
  return <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color }, st]} />;
}

const STARS = [
  { x: 0.1, y: 0.2, s: 4, d: 0 }, { x: 0.86, y: 0.16, s: 5, d: 500 }, { x: 0.2, y: 0.48, s: 3, d: 900 }, { x: 0.92, y: 0.44, s: 3, d: 300 },
  { x: 0.06, y: 0.7, s: 4, d: 1300 }, { x: 0.8, y: 0.66, s: 4, d: 700 }, { x: 0.5, y: 0.07, s: 3, d: 1100 }, { x: 0.34, y: 0.3, s: 3, d: 1700 },
];

// The page behind the signed screen: a black page with a blue glow at the top (the bottom half stays black), the vertical lines at the top, and a few stars that twinkle.
export function WaiverBackdrop({ stars = true }: { /** The twinkling dots. Off on the workout finish page. */ stars?: boolean }) {
  const { c } = useTheme();
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: fixed.dark }}>
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <RadialGradient id="wsTop" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c.accent} stopOpacity={0.62} />
            <Stop offset="1" stopColor={c.accent} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="wsSide" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c.accent} stopOpacity={0.28} />
            <Stop offset="1" stopColor={c.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={width * 0.45} cy={-20} r={width * 0.95} fill="url(#wsTop)" />
        <Circle cx={width * 1.02} cy={height * 0.28} r={width * 0.5} fill="url(#wsSide)" />
      </Svg>
      <Stripes width={width} />
      {stars && STARS.map((s, i) => <Twinkle key={i} x={s.x * width} y={s.y * height} size={s.s} delay={s.d} color={fixed.white} />)}
    </View>
  );
}
