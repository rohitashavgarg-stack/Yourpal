/* eslint-disable react-hooks/immutability, react-hooks/refs -- reanimated shared values and refs are mutated from gesture / animation callbacks */
import React, { useEffect, useRef } from 'react';
import { CARD_PAGES } from '@/lib/cardGrow';
import { BackHandler, Dimensions, Platform, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReduce } from '@/lib/motionSafe';
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
import { PageGlow } from '@/design-system/primitives/PageGlow';
import { EdgeTab, WebFrame, useIsWideWeb } from '@/web/WebFrame';
import { CheckInEngine } from '@/features/checkin/CheckInEngine';
import { fixed } from '@/design-system/tokens';

// Screens with an X (close) open from the bottom and close back down. Screens with a back arrow come in from the right and leave to the right.
// On the phone the native stack does this (see the Stack.Screen options below). The web stack has no transitions, so this wrapper adds them there.
const FROM_BOTTOM = ['gym/payments', 'log-weight', 'log-height', 'food', 'food-library', 'checkin', 'workout', 'plans/log', 'plans/ask', 'plans/create', 'plans/edit', 'plans/entries', 'exercise-search', 'profile/join'];
const NO_TRANSITION = ['index', 'welcome', '(tabs)', 'onboarding'];
// Pages opened from inside a card page (one membership, one assessment...). They are normal pages: a back arrow, and they slide in from the right and leave to the right,
// whatever the screen under them is. They are drawn over it (a transparent presentation), so the page under a detail page never goes blank or looks like it is closing.
const DETAIL_PAGES = ['gym/membership-detail', 'gym/assessment', 'gym/sessions'];
// The pages a Progress card opens. They grow out of the card (and drag away) on their own, drawn over the page underneath, so the stack adds no slide and no background.
// Web only: the stack drops a popped screen at once, so the slide-out is played first, then the real back runs.
// True for a moment after a back: a screen that mounts then is being revealed, not pushed, so it must not slide in.
let popping = false;
// Screens that play their own slide (web: all of them; phone: only the X screens, which are drawn over the page underneath).
type Closer = { name: string; focused: () => boolean; el?: HTMLElement | null; close: (done: () => void) => void };
const closers: Closer[] = [];
// Play the screen's own slide-out before the real back runs. The router's methods only work once the first render has finished (before that they throw, and the
// router swaps them for the real ones when it starts), so this wraps `router.back` from an effect, never at load. It is safe to call again: it only wraps when the
// router has handed out a new `back`.
let ourBack: (() => void) | null = null;
function installSlideBack() {
  const cur = (router as any).back;
  if (cur === ourBack) return;
  const rb = cur.bind(router);
  const realBack = () => { popping = true; setTimeout(() => { popping = false; }, 600); rb(); };
  ourBack = () => {
    // the screen that is on top and has its own slide plays it, then the real back runs
    const top = [...closers].reverse().find((c) => c.focused());
    if (top && router.canGoBack()) top.close(realBack); else realBack();
  };
  (router as any).back = ourBack;
}
// Web only: icons are inline SVGs, which are not positioned, so any glass / blur layer (position: absolute) drawn earlier in the same button paints over them.
// Making every icon positioned puts it back above the glass layer, wherever one is used.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('yp-icons-above-glass')) {
  const st = document.createElement('style');
  st.id = 'yp-icons-above-glass';
  st.textContent = 'svg.lucide{position:relative}';
  document.head.appendChild(st);
}
// Web: no scroll bars anywhere (the pages still scroll). The phone does the same through showsVerticalScrollIndicator and showsHorizontalScrollIndicator on every ScrollView.
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('yp-no-scrollbars')) {
  const st = document.createElement('style');
  st.id = 'yp-no-scrollbars';
  st.textContent = '*{scrollbar-width:none;-ms-overflow-style:none}*::-webkit-scrollbar{display:none;width:0;height:0}';
  document.head.appendChild(st);
}
function Transition({ name, children }: { name: string; children: React.ReactNode }) {
  if (NO_TRANSITION.includes(name) || CARD_PAGES.includes(name)) return <>{children}</>;
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
// The phone's own push and pop curve: it starts fast and settles softly, in and out the same. (An ease-in on the way out starts slow and then rushes, which reads as a jerk.)
const PUSH = Easing.bezier(0.32, 0.72, 0, 1);
const IN0 = { duration: 340, easing: PUSH };
const OUT0 = { duration: 300, easing: PUSH };
const DIM = 0.45;
function Slide({ name, bottom, children }: { name: string; bottom: boolean; children: React.ReactNode }) {
  const { c } = useTheme();
  // The page slide is the app's navigation, so on the web (the prototype) it always plays. On a phone, Reduce Motion turns it into a plain appear and go.
  const reduce = useReduce();
  const IN = reduce ? { duration: 0 } : IN0;
  const OUT = reduce ? { duration: 0 } : OUT0;
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
    if (dims.current.w === 0 || dims.current.h === 0) {
      const rect = isWeb ? box.current?.getBoundingClientRect?.() : null;
      dims.current = { w: rect?.width || Dimensions.get('window').width, h: rect?.height || Dimensions.get('window').height };
    }
    off.value = withTiming(bottom ? dims.current.h : dims.current.w, OUT, (fin) => { if (fin) runOnJS(done)(); });
  };
  useEffect(() => {
    installSlideBack();
    const e: Closer = { name, focused: () => nav.isFocused(), close };
    entry.current = e;
    closers.push(e);
    return () => { const i = closers.indexOf(e); if (i >= 0) closers.splice(i, 1); under.current?.done(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, bottom]);
  // Android: the phone's own back button plays this page's slide too (down for a cross page, to the right for a back page), then goes back
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { if (!nav.isFocused() || !router.canGoBack()) return false; router.back(); return true; });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  // The first time the screen has a size: slide it in. The size comes from onLayout, and on the web also straight from the node when the screen mounts, because the
  // browser only reports a size through its resize observer once it has painted a frame (it can be late, or never in a background tab), and the slide must not wait for that.
  const laid = (width: number, height: number, target: any) => {
    box.current = target; // the DOM node on web
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
  };
  const root = useRef<any>(null);
  useEffect(() => {
    if (!isWeb || !root.current || dims.current.w > 0) return;
    const r = root.current.getBoundingClientRect?.();
    if (r && r.width > 0 && r.height > 0) laid(r.width, r.height, root.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View ref={root} style={{ flex: 1 }}
      onLayout={(e) => laid(e.nativeEvent.layout.width, e.nativeEvent.layout.height, (e.nativeEvent as any).target)}>
      {/* On the phone the X screens are drawn over the page underneath (transparent modal), so the dim is drawn here. */}
      {!isWeb && <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: fixed.black }, dim]} />}
      <GestureDetector gesture={pan}>
        {/* On the phone these screens are native modals, which sit above the app's own sheet and toast layer, so they carry their own. */}
        <Animated.View style={[{ flex: 1, backgroundColor: c.bg }, style]}>{isWeb ? children : <OverlayProvider>{children}</OverlayProvider>}</Animated.View>
      </GestureDetector>
    </View>
  );
}

function AppShell() {
  const { c, isDark } = useTheme();
  useEffect(() => { installSlideBack(); }, []);
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
            {DETAIL_PAGES.map((n) => (
              <Stack.Screen key={n} name={n} options={{ presentation: 'transparentModal', animation: 'slide_from_right', contentStyle: { backgroundColor: 'transparent' }, gestureEnabled: true, fullScreenGestureEnabled: true } as any} />
            ))}
            {/* Pages opened from a Progress card sit over the page underneath, with no background of their own, so it shows while they are dragged away. */}
            {CARD_PAGES.map((n) => (
              <Stack.Screen key={n} name={n} options={{ presentation: 'transparentModal', animation: 'none', contentStyle: { backgroundColor: 'transparent' }, gestureEnabled: false, fullScreenGestureEnabled: false } as any} />
            ))}
            {/* Close-button (X) screens open from the bottom. */}
            {FROM_BOTTOM.map((n) => (
              <Stack.Screen key={n} name={n} options={{ presentation: 'transparentModal', animation: 'none', contentStyle: { backgroundColor: 'transparent' }, gestureEnabled: false, fullScreenGestureEnabled: false } as any} />
            ))}
          </Stack>
          {/* a very faint blue light in the top left corner, over every page and under sheets and toasts */}
          <PageGlow />
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
                <AppShell />
              </DomainProvider>
            </ScenarioRegistryProvider>
          </ThemeProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
