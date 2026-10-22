import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, spring } from '@/design-system/tokens';

export type SheetProps = {
  children: React.ReactNode;
  /** Spoken label of the sheet. */
  label?: string;
  /** A colour that bleeds in from the top right corner as a soft radial glow. */
  glow?: string;
  onClosed: () => void;
  /** The sheet hands its animated close function to this callback so the host can close it. */
  registerClose: (fn: (after?: () => void) => void) => void;
};

// What a sheet pins under its scrolling content (the main button), set from inside the content with <SheetFooter>.
const FooterCtx = createContext<((n: React.ReactNode) => void) | null>(null);

/** Keeps its children at the bottom of the sheet, outside the scroll, so the button stays in view on long lists. */
export function SheetFooter({ children }: { children: React.ReactNode }) {
  const setFooter = useContext(FooterCtx);
  useLayoutEffect(() => { setFooter?.(children); });
  useEffect(() => () => setFooter?.(null), [setFooter]);
  return setFooter ? null : <>{children}</>;
}

// How much of the screen the on-screen keyboard covers (0 on web and when it is hidden).
function useKeyboardHeight() {
  const [h, setH] = useState(0);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const ios = Platform.OS === 'ios';
    const show = Keyboard.addListener(ios ? 'keyboardWillChangeFrame' : 'keyboardDidShow', (e) => {
      const screen = Dimensions.get('screen').height;
      setH(Math.max(0, ios ? screen - e.endCoordinates.screenY : e.endCoordinates.height));
    });
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setH(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return h;
}

/** The bottom sheet: springs in, drags down to close, lifts above the keyboard. Open it with `useOverlay().openSheet`. */
export function Sheet({ children, label, glow, onClosed, registerClose }: SheetProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();
  const winH = Dimensions.get('window').height;
  const [h, setH] = useState(700);
  const y = useSharedValue(900);
  const back = useSharedValue(0);
  const afterRef = useRef<(() => void) | undefined>(undefined);
  const [footer, setFooter] = useState<React.ReactNode>(null);

  const finish = useCallback(() => { onClosed(); afterRef.current?.(); }, [onClosed]);
  const close = useCallback((after?: () => void) => {
    afterRef.current = after;
    back.value = withTiming(0, { duration: 220 });
    y.value = withTiming(h + 40, { duration: 260, easing: Easing.in(Easing.cubic) }, (done) => { if (done) scheduleOnRN(finish); });
  }, [h, finish]);
  useEffect(() => { registerClose(close); }, [close]);
  useEffect(() => {
    y.value = withSpring(0, spring.soft);
    back.value = withTiming(1, { duration: 260 });
  }, []);

  const pan = Gesture.Pan()
    .onUpdate((e) => { y.value = e.translationY > 0 ? e.translationY : e.translationY * 0.18; back.value = Math.max(0, 1 - Math.max(0, e.translationY) / 500); })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) { scheduleOnRN(close); }
      else { y.value = withSpring(0, spring.snappy); back.value = withTiming(1); }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const backStyle = useAnimatedStyle(() => ({ opacity: back.value }));

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100, elevation: 100 }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }, backStyle]}>
        <Pressable accessibilityLabel="Close sheet" style={StyleSheet.absoluteFill} onPress={() => close()} />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={label}
        onLayout={(e) => setH(e.nativeEvent.layout.height)}
        style={[{ position: 'absolute', left: 0, right: 0, bottom: kb, maxHeight: kb ? Math.max(260, winH - kb - insets.top - 12) : '88%', backgroundColor: c.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', paddingBottom: kb ? 12 : Math.max(insets.bottom, 16) }, sheetStyle]}
      >
        {glow ? (
          <Svg pointerEvents="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="sheetGlow" cx="100%" cy="0%" r="85%">
                <Stop offset="0" stopColor={glow} stopOpacity={0.55} />
                <Stop offset="0.5" stopColor={glow} stopOpacity={0.16} />
                <Stop offset="1" stopColor={glow} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#sheetGlow)" />
          </Svg>
        ) : null}
        <GestureDetector gesture={pan}>
          <View collapsable={false} style={{ height: 30, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 40, height: 5, borderRadius: radii.xs, backgroundColor: c.line }} />
          </View>
        </GestureDetector>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8, gap: 12 }} keyboardShouldPersistTaps="handled">
          <FooterCtx.Provider value={setFooter}>{children}</FooterCtx.Provider>
        </ScrollView>
        {footer ? <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>{footer}</View> : null}
      </Animated.View>
    </View>
  );
}
