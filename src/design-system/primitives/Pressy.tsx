/* eslint-disable react-hooks/immutability, react-hooks/refs -- reanimated shared values and refs are mutated from gesture / animation callbacks */
import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { haptic } from '@/lib/haptics';

/**
 * A pressable with the press scale and a tap haptic. Every tappable thing in the app is one of these. It shrinks from its centre (never less than 3 percent, so every
 * card visibly gives under the finger) with a short ease-out, and returns with a smooth ease-out: no spring, no bounce.
 */
const APressable = Animated.createAnimatedComponent(Pressable);
export function Pressy({ style, children, haptics = true, scaleTo = 0.97, onPress, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; haptics?: boolean; scaleTo?: number; children?: React.ReactNode }) {
  const s = useSharedValue(1);
  const reduce = useReducedMotion(); // Reduce Motion on: no press shrink, the haptic still tells you it registered
  const target = reduce ? 1 : Math.min(scaleTo, 0.97);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { s.value = withTiming(target, { duration: 110, easing: Easing.out(Easing.cubic) }); rest.onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }); rest.onPressOut?.(e); }}
      onPress={(e) => { if (haptics) haptic.tap(); onPress?.(e); }}
      style={[style as any, { transformOrigin: 'center' } as object, a]}
    >
      {children}
    </APressable>
  );
}
