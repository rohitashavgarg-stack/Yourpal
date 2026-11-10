/* eslint-disable react-hooks/immutability, react-hooks/refs -- reanimated shared values and refs are mutated from gesture / animation callbacks */
import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { springTo, useReduce } from '@/lib/motionSafe';
import { spring } from '@/design-system/tokens';
import { haptic } from '@/lib/haptics';

/**
 * A pressable with the press scale and a tap haptic. Every tappable thing in the app is one of these. It shrinks from its centre (never less than 3 percent, so every
 * card visibly gives under the finger) with a short ease-out, and returns with a smooth ease-out: no spring, no bounce.
 */
const APressable = Animated.createAnimatedComponent(Pressable);
const GROW = 1.14; // how far an icon button swells while it is held
export function Pressy({ style, children, haptics = true, scaleTo = 0.97, grow = false, onPress, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; haptics?: boolean; scaleTo?: number; /** An icon button: it swells under the finger and settles back with a soft overshoot (the glass buttons of iOS), instead of shrinking. */ grow?: boolean; children?: React.ReactNode }) {
  const s = useSharedValue(1);
  const reduce = useReduce(); // Reduce Motion on: no press shrink, the haptic still tells you it registered
  const target = reduce ? 1 : Math.min(scaleTo, 0.97);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { s.value = grow ? springTo(reduce ? 1 : GROW, spring.snappy, reduce) : withTiming(target, { duration: 110, easing: Easing.out(Easing.cubic) }); rest.onPressIn?.(e); }}
      onPressOut={(e) => { s.value = grow ? springTo(1, spring.bouncy, reduce) : withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }); rest.onPressOut?.(e); }}
      onPress={(e) => { if (haptics) haptic.tap(); onPress?.(e); }}
      style={[style as any, { transformOrigin: 'center' } as object, a]}
    >
      {children}
    </APressable>
  );
}
