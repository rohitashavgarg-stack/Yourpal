import React, { useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
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

// Progressive blur: stacked blur layers that get shorter, so the blur is strongest at the edge and fades to nothing, with only a faint colour wash on top, so the content stays visible, just softly blurred (like the iOS App Library edge).
// Used behind a header so content blurs more the closer it gets to the top. Android has no real blur, so it gets the fade only.
export function ProgressiveBlur({ height, layers = 12, edge = 'top' }: { height: number; layers?: number; edge?: 'top' | 'bottom' }) {
  const { c, isDark } = useTheme();
  const top = edge === 'top';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, height, [top ? 'top' : 'bottom']: 0 }}>
      {Platform.OS !== 'android' && Array.from({ length: layers }, (_, i) => (
        <BlurView key={i} intensity={4} tint={isDark ? 'dark' : 'light'}
          style={{ position: 'absolute', left: 0, right: 0, height: height * Math.pow(1 - i / layers, 1.4), [top ? 'top' : 'bottom']: 0 } as any} />
      ))}
      <LinearGradient colors={top ? [c.bg + '59', c.bg + '00'] : [c.bg + '00', c.bg + '59']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
    </View>
  );
}

// True once a plain ScrollView has moved past a few pixels. Mount the blur from this (don't fade it): on iPhone a blur under a faded parent stops blurring.
export function useScrolled(threshold = 6) {
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(false);
  const onScroll = useCallback((e: any) => {
    const v = (e?.nativeEvent?.contentOffset?.y ?? 0) > threshold;
    if (v !== last.current) { last.current = v; setScrolled(v); }
  }, [threshold]);
  return { scrolled, onScroll };
}
