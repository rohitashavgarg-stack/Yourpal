import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '@/theme/ThemeProvider';

// Real iOS 26 "liquid glass" where the phone supports it; the existing blur + tint everywhere else (older iOS, Android, web).
// Use it only for chrome that floats over scrolling content (the tab bar). Content cards stay solid.
let native = false;
try { native = Platform.OS === 'ios' && isLiquidGlassAvailable(); } catch { native = false; }

export const hasLiquidGlass = native;

export function GlassBackdrop({ radius, tint }: { radius: number; tint?: string }) {
  const { c, isDark } = useTheme();
  if (native) {
    return <GlassView glassEffectStyle="regular" tintColor={tint} colorScheme={isDark ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} pointerEvents="none" />;
  }
  return (
    <>
      <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', inset: 0 } as any} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tint ?? c.navBg }} />
    </>
  );
}
