import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
// Web only: the stack drops a popped screen at once, so the slide-out is played first, then the real back runs.
const closers: { name: string; close: (done: () => void) => void }[] = [];
if (Platform.OS === 'web' && !(router as any).__slideBack) {
  const realBack = router.back.bind(router);
  (router as any).__slideBack = true;
  (router as any).back = () => {
    const top = closers[closers.length - 1];
    if (top && router.canGoBack()) top.close(realBack); else realBack();
  };
}
function WebTransition({ name, children }: { name: string; children: React.ReactNode }) {
  if (Platform.OS !== 'web' || NO_TRANSITION.includes(name)) return <>{children}</>;
  return <WebSlide name={name} bottom={FROM_BOTTOM.includes(name)}>{children}</WebSlide>;
}
function WebSlide({ name, bottom, children }: { name: string; bottom: boolean; children: React.ReactNode }) {
  // Driven by a shared value, not a reanimated "entering" layout animation: that one is a CSS animation on web and replays
  // every time the screen is shown again (when you go back to it), which made the screen underneath slide in.
  const off = useSharedValue(0);
  const busy = useRef(false);
  const dims = useRef({ w: 0, h: 0 });
  useEffect(() => {
    const entry = {
      name,
      close: (done: () => void) => {
        if (busy.current) return;
        busy.current = true;
        off.value = withTiming(bottom ? dims.current.h : dims.current.w, { duration: 240, easing: Easing.out(Easing.cubic) }, (fin) => { if (fin) runOnJS(done)(); });
      },
    };
    closers.push(entry);
    return () => { const i = closers.indexOf(entry); if (i >= 0) closers.splice(i, 1); };
  }, [name, bottom, off]);
  const style = useAnimatedStyle(() => ({ transform: [bottom ? { translateY: off.value } : { translateX: off.value }] }));
  return (
    <Animated.View style={{ flex: 1 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        const first = dims.current.w === 0;
        dims.current = { w: width, h: height };
        if (first) {
          // eslint-disable-next-line react-hooks/immutability -- reanimated shared value
          off.value = bottom ? height : width;
          off.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
        }
      }}>
      <Animated.View style={[{ flex: 1 }, style]}>{children}</Animated.View>
    </Animated.View>
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
          <Stack screenLayout={({ route, children }: any) => <WebTransition name={route.name}>{children}</WebTransition>} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: 'slide_from_right', gestureEnabled: true, fullScreenGestureEnabled: true } as any}>
            {/* Root screens: nothing to swipe back to once you are in. */}
            {['(tabs)', 'onboarding'].map((n) => (
              <Stack.Screen key={n} name={n} options={{ gestureEnabled: false, fullScreenGestureEnabled: false } as any} />
            ))}
            {/* Going back by replace (login to welcome, onboarding to login) should look like a back move, not a push. */}
            <Stack.Screen name="login" options={{ animationTypeForReplace: 'pop' } as any} />
            {/* The first screen has nothing behind it, so no back swipe. */}
            <Stack.Screen name="welcome" options={{ animationTypeForReplace: 'pop', gestureEnabled: false, fullScreenGestureEnabled: false } as any} />
            {/* Close-button (X) screens open from the bottom. */}
            {FROM_BOTTOM.map((n) => (
              <Stack.Screen key={n} name={n} options={{ animation: 'slide_from_bottom', presentation: 'modal', gestureEnabled: true, fullScreenGestureEnabled: false } as any} />
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
