/* eslint-disable react-hooks/immutability -- reanimated shared values are written from the press handler */
import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { gradients, fixed, radii } from '@/design-system/tokens';
import { haptic } from '@/lib/haptics';
import { AiOrb } from './AiOrb';
import { GlassBackdrop } from './Glass';

// The AI box that sits beside the tab bar: a separate square of light glass with a soft violet, blue and teal tint and the composing orb.
// Tap: the box stretches slowly toward the tab bar and settles back (one slow spring, no splash) with one light haptic tap.
export const AI_BOX = 64;

export function AiOrbButton({ label, onPress }: { label: string; onPress?: () => void }) {
  const { isDark } = useTheme();
  const reduce = useReducedMotion();
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    // stretch to the left, keeping the right edge where it is
    transform: [{ translateX: -((s.value - 1) * AI_BOX) / 2 }, { scaleX: s.value }, { scaleY: 1 - (s.value - 1) * 0.35 }],
  }));
  const press = () => {
    haptic.light();
    if (!reduce) s.value = withSequence(withSpring(1.14, { damping: 22, stiffness: 70 }), withSpring(1, { damping: 20, stiffness: 60 }));
    onPress?.();
  };
  return (
    <Animated.View style={[{ width: AI_BOX, height: AI_BOX, borderRadius: radii.xl, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
      shadowColor: fixed.shadow, shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 }, style]}>
      <GlassBackdrop radius={radii.xl} frost={70} />
      <LinearGradient pointerEvents="none" colors={isDark ? gradients.aiGlass : gradients.aiGlassOnLight} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={press} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View pointerEvents="none"><AiOrb size={64} dark={isDark} /></View>
      </Pressable>
    </Animated.View>
  );
}
