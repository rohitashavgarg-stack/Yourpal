import React, { useEffect } from 'react';
import Animated, { Easing, useAnimatedProps, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

// ---------- Soft ring (steps etc.) ----------
const ACircle = Animated.createAnimatedComponent(Circle);
export function Ring({ size, r, stroke, pct, color, track, delay = 200 }: { size: number; r: number; stroke: number; pct: number; color: string; track: string; delay?: number }) {
  const C = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => { p.value = withSequence(withTiming(0, { duration: delay }), withTiming(pct, { duration: 1300, easing: Easing.out(Easing.cubic) })); }, [pct]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - p.value) }));
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <ACircle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${C}`} animatedProps={props} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </Svg>
  );
}
