import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';

// One overlay host for bottom sheets and toasts, rendered inside the phone.
type SheetOpts = { label?: string; glow?: string }; // glow: a soft radial colour bleeding in from the top-right corner
type ToastOpts = { undo?: () => void };
type Ctx = {
  setToastLift: (px: number) => void;
  openSheet: (content: React.ReactNode, opts?: SheetOpts) => void;
  closeSheet: (after?: () => void) => void;
  toast: (msg: string, opts?: ToastOpts) => void;
};
const OverlayCtx = createContext<Ctx>({ setToastLift: () => {}, openSheet: () => {}, closeSheet: () => {}, toast: () => {} });
export const useOverlay = () => useContext(OverlayCtx);

// Raise toasts above screen chrome (check-in bar, rest panel) while mounted.
export function useToastLift(px: number) {
  const { setToastLift } = useOverlay();
  useEffect(() => { setToastLift(px); }, [px, setToastLift]);
  useEffect(() => () => setToastLift(0), [setToastLift]);
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [sheet, setSheet] = useState<{ node: React.ReactNode; opts: SheetOpts; key: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<{ msg: string; undo?: () => void; key: number } | null>(null);
  const [lift, setToastLift] = useState(0);
  const closer = useRef<((after?: () => void) => void) | null>(null);

  const openSheet = useCallback((node: React.ReactNode, opts: SheetOpts = {}) => setSheet({ node, opts, key: Date.now() }), []);
  const closeSheet = useCallback((after?: () => void) => {
    if (closer.current) closer.current(after);
    else { setSheet(null); after?.(); }
  }, []);
  const toast = useCallback((msg: string, opts: ToastOpts = {}) => setToastMsg({ msg, undo: opts.undo, key: Date.now() }), []);
  const value = useMemo(() => ({ setToastLift, openSheet, closeSheet, toast }), [openSheet, closeSheet, toast]);

  return (
    <OverlayCtx.Provider value={value}>
      {children}
      {sheet && (
        <Sheet key={sheet.key} label={sheet.opts.label} glow={sheet.opts.glow} registerClose={(fn) => (closer.current = fn)} onClosed={() => { closer.current = null; setSheet(null); }}>
          {sheet.node}
        </Sheet>
      )}
      {toastMsg && <Toast key={toastMsg.key} msg={toastMsg.msg} undo={toastMsg.undo} onGone={() => setToastMsg(null)} raised={!!sheet} lift={lift} />}
    </OverlayCtx.Provider>
  );
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

function Sheet({ children, label, glow, onClosed, registerClose }: { children: React.ReactNode; label?: string; glow?: string; onClosed: () => void; registerClose: (fn: (after?: () => void) => void) => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();
  const winH = Dimensions.get('window').height;
  const [h, setH] = useState(700);
  const y = useSharedValue(900);
  const back = useSharedValue(0);
  const afterRef = useRef<(() => void) | undefined>(undefined);

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
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
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
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: c.line }} />
          </View>
        </GestureDetector>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8, gap: 12 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function Toast({ msg, undo, onGone, raised, lift }: { msg: string; undo?: () => void; onGone: () => void; raised: boolean; lift: number }) {
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
      style={[{ position: 'absolute', left: 16, right: 16, ...(raised ? { top: 58 } : { bottom: lift || 104 }), zIndex: 30, minHeight: 52, borderRadius: 18, backgroundColor: c.ink, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 6, gap: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }, a]}>
      <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 14, lineHeight: 18, color: c.bg, paddingVertical: 12 }}>{msg}</Text>
      {undo && (
        <Pressable accessibilityRole="button" onPress={() => { haptic.light(); undo(); onGone(); }} style={{ height: 40, paddingHorizontal: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center' }}>
          <Text style={{ fontFamily: font.bold, fontSize: 14, lineHeight: 18, color: c.bg }}>Undo</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
