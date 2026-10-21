import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { spring } from '@/design-system/tokens';
import { haptic } from '@/lib/haptics';

/** A pressable with the iOS press scale and a tap haptic. Every tappable thing in the app is one of these. */
const APressable = Animated.createAnimatedComponent(Pressable);
export function Pressy({ style, children, haptics = true, scaleTo = 0.97, onPress, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; haptics?: boolean; scaleTo?: number; children?: React.ReactNode }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { s.value = withSpring(scaleTo, spring.snappy); rest.onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withSpring(1, spring.bouncy); rest.onPressOut?.(e); }}
      onPress={(e) => { if (haptics) haptic.tap(); onPress?.(e); }}
      style={[style as any, a]}
    >
      {children}
    </APressable>
  );
}
