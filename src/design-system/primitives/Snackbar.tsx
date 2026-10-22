import React, { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font, fontSizes, fixed, radii, spring } from '@/design-system/tokens';

export type SnackbarProps = {
  msg: string;
  /** Shows an Undo button that runs this and dismisses the snackbar. */
  undo?: () => void;
  onGone: () => void;
  /** true while a sheet is open: the snackbar moves to the top so it does not sit behind the sheet. */
  raised: boolean;
  /** Bottom offset in px while screen chrome (check-in bar, rest panel) is showing. 0 means the default 104. */
  lift: number;
};

/** The toast at the foot of the screen. It shows for 3.6 s. Show one with `useOverlay().toast(msg, { undo })`. */
export function Snackbar({ msg, undo, onGone, raised, lift }: SnackbarProps) {
  const { c } = useTheme();
  const y = useSharedValue(40);
  const o = useSharedValue(0);
  useEffect(() => {
    y.value = withSpring(0, spring.bouncy);
    o.value = withTiming(1, { duration: 200 });
    const t = setTimeout(() => {
      o.value = withTiming(0, { duration: 250 });
      y.value = withTiming(30, { duration: 250 }, (d) => { if (d) scheduleOnRN(onGone); });
    }, 3600);
    return () => clearTimeout(t);
  }, []);
  const a = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateY: y.value }] }));
  return (
    <Animated.View accessibilityLiveRegion="polite" accessibilityRole="alert" pointerEvents="box-none"
      style={[{ position: 'absolute', left: 16, right: 16, ...(raised ? { top: 58 } : { bottom: lift || 104 }), zIndex: 200, elevation: 200, minHeight: 52, borderRadius: radii.md, backgroundColor: c.ink, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 6, gap: 8, shadowColor: fixed.black, shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }, a]}>
      <Text style={{ flex: 1, fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 18, color: c.bg, paddingVertical: 12 }}>{msg}</Text>
      {undo && (
        <Pressable accessibilityRole="button" accessibilityLabel="Undo" hitSlop={{ top: 2, bottom: 2 }} onPress={() => { haptic.light(); undo(); onGone(); }} style={{ height: 40, paddingHorizontal: 14, borderRadius: radii.sm, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center' }}>
          <Text style={{ fontFamily: font.bold, fontSize: fontSizes.md, lineHeight: 18, color: c.bg }}>Undo</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
