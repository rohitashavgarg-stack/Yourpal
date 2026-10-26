import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { fixed } from '@/design-system/tokens';

// Phone stand-in for the composing orb: three dotted rings turning slowly at different speeds. The thinking-orbs package draws on a DOM
// canvas, which phones do not have; a Skia port of the real orb is the follow-up.
function Ring({ r, dots, secs, size, color, reverse, paused }: { r: number; dots: number; secs: number; size: number; color: string; reverse?: boolean; paused?: boolean }) {
  const a = useSharedValue(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (paused || reduce) { a.value = 0; return; }
    a.value = withRepeat(withTiming(reverse ? -360 : 360, { duration: secs * 1000, easing: Easing.linear }), -1, false);
  }, [paused, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${a.value}deg` }] }));
  const c = size / 2;
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {Array.from({ length: dots }, (_, i) => {
          const t = (i / dots) * Math.PI * 2;
          return <Circle key={i} cx={c + r * Math.cos(t)} cy={c + r * Math.sin(t)} r={1.4} fill={color} opacity={0.35 + 0.65 * ((Math.sin(t * 2) + 1) / 2)} />;
        })}
      </Svg>
    </Animated.View>
  );
}

export function AiOrb({ size = 64, dark, paused }: { size?: 20 | 64; dark: boolean; paused?: boolean }) {
  const color = dark ? fixed.white : fixed.dark;
  const k = size / 64;
  return (
    <View style={{ width: size, height: size }}>
      <Ring size={size} r={26 * k} dots={34} secs={14} color={color} paused={paused} />
      <Ring size={size} r={18 * k} dots={24} secs={9} color={color} reverse paused={paused} />
      <Ring size={size} r={10 * k} dots={14} secs={6} color={color} paused={paused} />
    </View>
  );
}
