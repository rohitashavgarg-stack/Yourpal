/* eslint-disable react-hooks/immutability, react-hooks/refs -- reanimated shared values and refs are mutated from gesture / animation callbacks */
import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { SCREEN_IN, SCREEN_OUT } from '@/theme/motion';
import { takeOrigin } from '@/theme/zoomOrigin';
import { Stack, router, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Geist_300Light, Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold } from '@expo-google-fonts/geist';
import { GeistMono_500Medium, GeistMono_600SemiBold } from '@expo-google-fonts/geist-mono';
import { Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { ScenarioRegistryProvider, StoreProvider } from '@/lib/store';
import { DomainProvider } from '@/lib/domain';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { OverlayProvider } from '@/components/Overlay';
import { EdgeTab, WebFrame, useIsWideWeb } from '@/web/WebFrame';
import { CheckInEngine } from '@/features/checkin/CheckInEngine';

// Screens with an X (close) open from the bottom and close back down. Screens with a back arrow come in from the right and leave to the right.
// On the phone the native stack does this (see the Stack.Screen options below). The web stack has no transitions, so this wrapper adds them there.
const FROM_BOTTOM = ['log-weight', 'log-height', 'food', 'checkin', 'workout', 'plans/log', 'plans/ask', 'plans/create', 'plans/edit', 'exercise-search', 'profile/join'];
const NO_TRANSITION = ['index', 'welcome', '(tabs)', 'onboarding'];
// Screens that open with a soft zoom and a blur that clears (the reference video): from the card that was tapped, if any (see theme/zoomOrigin).
const ZOOM = ['goal-detail', 'coach', 'notifications'];
// Web only: the stack drops a popped screen at once, so the slide-out is played first, then the real back runs.
// True for a moment after a back: a screen that mounts then is being revealed, not pushed, so it must not slide in.
let popping = false;
// Screens that play their own slide (web: all of them; phone: only the X screens, which are drawn over the page underneath).
type Closer = { name: string; focused: () => boolean; el?: HTMLElement | null; close: (done: () => void) => void };
const closers: Closer[] = [];
if (!(router as any).__slideBack) {
  const rb = router.back.bind(router);
  const realBack = () => { popping = true; setTimeout(() => { popping = false; }, 600); rb(); };
  (router as any).__slideBack = true;
  (router as any).back = () => {
    // the screen that is on top and has its own slide plays it, then the real back runs
    const top = [...closers].reverse().find((c) => c.focused());
    if (top && router.canGoBack()) top.close(realBack); else realBack();
  };
}
// Web only: icons are inline SVGs, which are not positioned, so any glass / blur layer (position: absolute) drawn earlier in the same button paints over them.
// Making every icon positioned puts it back above the glass layer, wherever one is used.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('yp-icons-above-glass')) {
  const st = document.createElement('style');
  st.id = 'yp-icons-above-glass';
  st.textContent = 'svg.lucide{position:relative}';
  document.head.appendChild(st);
}
function Transition({ name, children }: { name: string; children: React.ReactNode }) {
  if (NO_TRANSITION.includes(name)) return <>{children}</>;
  if (ZOOM.includes(name)) return <Zoom name={name}>{children}</Zoom>;
  const bottom = FROM_BOTTOM.includes(name);
  if (Platform.OS !== 'web' && !bottom) return <>{children}</>; // phone: back screens use the native push
  return <Slide name={name} bottom={bottom}>{children}</Slide>;
}

// The stack hides every screen that is not on top, so during a slide on web the page underneath would be blank.
// Show it (static) with a dim over it, like the sheets, while this screen moves; then let the stack's own styling take over.
function screenOf(el: any): HTMLElement | null {
  let n = el as HTMLElement | null;
  while (n && n.parentElement) {
    if (n.parentElement.children.length > 1 && getComputedStyle(n).position === 'absolute') return n;
    n = n.parentElement;
  }
  return null;
}
function underlay(el: any) {
  const n = screenOf(el);
  if (!n) return null;
  // The screen mounted just before this one is the page underneath; fall back to any hidden sibling (the tabs).
  const mine = closers.findIndex((c) => c.el === n);
  const before = mine > 0 ? closers[mine - 1].el : null;
  const hidden = [...n.parentElement!.children].filter((c) => c !== n && getComputedStyle(c).display === 'none') as HTMLElement[];
  const prev = before && before.isConnected ? before : hidden[hidden.length - 1];
  if (!prev) return null;
  prev.style.display = 'flex';
  const scrim = document.createElement('div');
  scrim.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,0.45);pointer-events:none;opacity:0';
  n.parentElement!.insertBefore(scrim, n);
  return { prev, scrim, done: () => { scrim.remove(); } };
}
type Under = NonNullable<ReturnType<typeof underlay>>;
// Same feel as the bottom sheets: 260 ms, ease out in, ease in out. No spring.
const IN = { duration: 260, easing: Easing.out(Easing.cubic) };
const OUT = { duration: 260, easing: Easing.in(Easing.cubic) };
const DIM = 0.45;
function Slide({ name, bottom, children }: { name: string; bottom: boolean; children: React.ReactNode }) {
  const { c } = useTheme();
  const nav = useNavigation();
  const isWeb = Platform.OS === 'web';
  // Driven by shared values, not a reanimated "entering" layout animation: that one is a CSS animation on web and replays
  // every time the screen is shown again (when you go back to it), which made the screen underneath slide in.
  const off = useSharedValue(0);
  const p = useSharedValue(0); // 0 = closed, 1 = open: drives the dim over the page underneath
  const busy = useRef(false);
  const box = useRef<any>(null);
  const under = useRef<Under | null>(null);
  const dims = useRef({ w: 0, h: 0 });
  const setDim = (v: number) => { if (under.current) under.current.scrim.style.opacity = String(v); };
  useAnimatedReaction(() => p.value, (v) => { if (isWeb) runOnJS(setDim)(v); });
  const entry = useRef<Closer | null>(null);
  const close = (done: () => void) => {
    if (busy.current) return;
    busy.current = true;
    if (isWeb) under.current = underlay(box.current);
    p.value = withTiming(0, OUT);
    off.value = withTiming(bottom ? dims.current.h : dims.current.w, OUT, (fin) => { if (fin) runOnJS(done)(); });
  };
  useEffect(() => {
    const e: Closer = { name, focused: () => nav.isFocused(), close };
    entry.current = e;
    closers.push(e);
    return () => { const i = closers.indexOf(e); if (i >= 0) closers.splice(i, 1); under.current?.done(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, bottom]);
  const closeFromDrag = () => { const top = entry.current; if (top && router.canGoBack()) (router as any).back(); };
  // The workout screen is left out: its own sheet is dragged up and down, and it has its own minimise button.
  // Drag down from the top of an X screen to close it: it follows the finger and leaves with the same plain ease.
  const pan = Gesture.Pan()
    .enabled(bottom && name !== 'workout')
    .hitSlop({ top: 0, height: 130 })
    .activeOffsetY(10)
    .failOffsetX([-25, 25])
    .onUpdate((e) => { if (!busy.current) { off.value = Math.max(0, e.translationY); p.value = 1 - Math.min(1, off.value / Math.max(1, dims.current.h)); } })
    .onEnd((e) => {
      if (busy.current) return;
      if (e.translationY > 110 || e.velocityY > 900) runOnJS(closeFromDrag)();
      else { off.value = withTiming(0, IN); p.value = withTiming(1, IN); }
    });
  const style = useAnimatedStyle(() => ({ transform: [bottom ? { translateY: off.value } : { translateX: off.value }] }));
  const dim = useAnimatedStyle(() => ({ opacity: p.value * DIM }));
  const opened = () => { const u = under.current; if (u) { u.prev.style.display = ''; u.done(); under.current = null; } };
  return (
    <View style={{ flex: 1 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        box.current = (e.nativeEvent as any).target; // the DOM node on web
        const first = dims.current.w === 0;
        dims.current = { w: width, h: height };
        if (first && entry.current) entry.current.el = isWeb ? screenOf(box.current) : null;
        if (first && !popping) {
          /* eslint-disable react-hooks/immutability -- reanimated shared values */
          off.value = bottom ? height : width;
          if (isWeb) under.current = underlay(box.current);
          p.value = withTiming(1, IN);
          off.value = withTiming(0, IN, (fin) => { if (fin && isWeb) runOnJS(opened)(); });
          /* eslint-enable react-hooks/immutability */
        } else if (first) p.value = 1; // eslint-disable-line react-hooks/immutability
      }}>
      {/* On the phone the X screens are drawn over the page underneath (transparent modal), so the dim is drawn here. */}
      {!isWeb && <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#000' }, dim]} />}
      <GestureDetector gesture={pan}>
        {/* On the phone these screens are native modals, which sit above the app's own sheet and toast layer, so they carry their own. */}
        <Animated.View style={[{ flex: 1, backgroundColor: c.bg }, style]}>{isWeb ? children : <OverlayProvider>{children}</OverlayProvider>}</Animated.View>
      </GestureDetector>
    </View>
  );
}

/* eslint-disable react-hooks/immutability -- reanimated shared values are written from callbacks (re-disabled: the Slide block above turns the rule back on) */
// ---------- Zoom: open from the tapped card (or from the middle) with a blur that clears; close back into it ----------
const ZIN = { duration: SCREEN_IN, easing: Easing.out(Easing.cubic) };
const ZOUT = { duration: SCREEN_OUT, easing: Easing.in(Easing.cubic) };
function Zoom({ name, children }: { name: string; children: React.ReactNode }) {
  const { c, isDark } = useTheme();
  const nav = useNavigation();
  const isWeb = Platform.OS === 'web';
  const blur = Platform.OS !== 'android'; // animated blur is too heavy on Android: fade and zoom only there
  const p = useSharedValue(0); // 0 = closed (at the card), 1 = open
  const geo = useSharedValue({ tx: 0, ty: 0, s: 0.94 });
  const [origin] = React.useState(() => takeOrigin());
  const busy = useRef(false);
  const box = useRef<any>(null);
  const under = useRef<Under | null>(null);
  const entry = useRef<Closer | null>(null);
  const root = useRef<any>(null);
  const setDim = (v: number) => { if (under.current) under.current.scrim.style.opacity = String(v); };
  useAnimatedReaction(() => p.value, (v) => { if (isWeb) runOnJS(setDim)(v * DIM); });
  const close = (done: () => void) => {
    if (busy.current) return;
    busy.current = true;
    if (blur) setBlurOn(true);
    if (isWeb) under.current = underlay(box.current);
    let left = false;
    const leave = () => { if (!left) { left = true; done(); } };
    p.value = withTiming(0, ZOUT, (fin) => { if (fin) runOnJS(leave)(); });
    setTimeout(leave, SCREEN_OUT + 300); // same safety net on the way out
  };
  useEffect(() => {
    const e: Closer = { name, focused: () => nav.isFocused(), close };
    entry.current = e;
    closers.push(e);
    return () => { const i = closers.indexOf(e); if (i >= 0) closers.splice(i, 1); under.current?.done(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  const opened = () => { setBlurOn(false); const u = under.current; if (u) { u.prev.style.display = ''; u.done(); under.current = null; } };
  const start = (cx: number, cy: number, w: number, h: number) => {
    if (origin && w > 0) {
      const s = Math.max(0.3, Math.min(1, origin.w / w));
      geo.value = { tx: origin.x + origin.w / 2 - (cx + w / 2), ty: origin.y + origin.h / 2 - (cy + h / 2), s };
    }
    if (isWeb) under.current = underlay(box.current);
    p.value = withTiming(1, ZIN, (fin) => { if (fin) runOnJS(opened)(); });
    // safety net: if no frames ran (a hidden or throttled browser), never leave the page invisible
    setTimeout(() => { if (p.value < 1 && !busy.current) { p.value = 1; opened(); } }, SCREEN_IN + 300);
  };
  useEffect(() => {
    if (popping) { p.value = 1; setBlurOn(false); return; }
    const t = setTimeout(() => { // after the first paint, so the page has its size
      const n = root.current;
      box.current = n;
      if (n?.getBoundingClientRect) { const r = n.getBoundingClientRect(); start(r.left, r.top, r.width, r.height); }
      else if (n?.measureInWindow) n.measureInWindow((x: number, y: number, w: number, h: number) => start(x, y, w, h));
      else start(0, 0, 0, 0);
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const page = useAnimatedStyle(() => {
    const k = p.value, g = geo.value;
    return {
      opacity: Math.min(1, k * 2),
      borderRadius: 28 * (1 - k),
      transform: [{ translateX: g.tx * (1 - k) }, { translateY: g.ty * (1 - k) }, { scale: g.s + (1 - g.s) * k }],
    };
  });
  // a fixed blur that fades out as the page opens (animating the blur strength itself does not update on web); removed once open
  const blurFade = useAnimatedStyle(() => ({ opacity: 1 - p.value }));
  const [blurOn, setBlurOn] = React.useState(blur);
  const dim = useAnimatedStyle(() => ({ opacity: p.value * 0.3 }));
  return (
    <View ref={root} collapsable={false} style={{ flex: 1 }}>
      {!isWeb && <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#000' }, dim]} />}
      <Animated.View style={[{ flex: 1, backgroundColor: c.bg, overflow: 'hidden' }, page]}>
        {isWeb ? children : <OverlayProvider>{children}</OverlayProvider>}
        {blurOn && (
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }, blurFade]}>
            <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={{ flex: 1 }} />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

function Shell() {
  const { c, isDark } = useTheme();
  const wide = useIsWideWeb();
  return (
    <WebFrame>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <OverlayProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack screenLayout={({ route, children }: any) => <Transition name={route.name}>{children}</Transition>} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: 'slide_from_right', gestureEnabled: true, fullScreenGestureEnabled: true } as any}>
            {/* Root screens: nothing to swipe back to once you are in. */}
            {['(tabs)', 'onboarding'].map((n) => (
              <Stack.Screen key={n} name={n} options={{ gestureEnabled: false, fullScreenGestureEnabled: false } as any} />
            ))}
            {/* Going back by replace (login to welcome, onboarding to login) should look like a back move, not a push. */}
            <Stack.Screen name="login" options={{ animationTypeForReplace: 'pop' } as any} />
            {/* The first screen has nothing behind it, so no back swipe. */}
            <Stack.Screen name="welcome" options={{ animationTypeForReplace: 'pop', gestureEnabled: false, fullScreenGestureEnabled: false } as any} />
            {/* Close-button (X) screens open from the bottom. */}
            {/* Zoom screens are drawn over the page underneath too, and play their own open / close. */}
            {ZOOM.map((n) => (
              <Stack.Screen key={n} name={n} options={{ presentation: 'transparentModal', animation: 'none', gestureEnabled: false, fullScreenGestureEnabled: false } as any} />
            ))}
            {FROM_BOTTOM.map((n) => (
              <Stack.Screen key={n} name={n} options={{ presentation: 'transparentModal', animation: 'none', gestureEnabled: false, fullScreenGestureEnabled: false } as any} />
            ))}
          </Stack>
          <CheckInEngine />
          {!wide && <EdgeTab />}
        </OverlayProvider>
      </View>
    </WebFrame>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Geist_300Light, Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold,
    GeistMono_500Medium, GeistMono_600SemiBold, Outfit_600SemiBold, Outfit_700Bold,
  });
  if (!loaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <ThemeProvider>
            <ScenarioRegistryProvider>
              <DomainProvider>
                <Shell />
              </DomainProvider>
            </ScenarioRegistryProvider>
          </ThemeProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
