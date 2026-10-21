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
import { Sheet } from '@/design-system/primitives/Sheet';
import { Snackbar } from '@/design-system/primitives/Snackbar';

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
      {toastMsg && <Snackbar key={toastMsg.key} msg={toastMsg.msg} undo={toastMsg.undo} onGone={() => setToastMsg(null)} raised={!!sheet} lift={lift} />}
    </OverlayCtx.Provider>
  );
}
