import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useScenarioRegistry, useStore } from '@/lib/store';
import { font } from '@/theme/tokens';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { SlidersHorizontal } from '@/lib/icons';
import { NAV_STYLES, navStore, NavStyle } from '@/components/navStyle';

const PHONE_W = 390, PHONE_H = 844;

export function useIsWideWeb() {
  const w = useWindow();
  return Platform.OS === 'web' && w.width >= 900;
}

function useWindow() {
  const [d, setD] = useState(Dimensions.get('window'));
  useEffect(() => {
    const s = Dimensions.addEventListener('change', ({ window }) => setD(window));
    return () => s.remove();
  }, []);
  return d;
}

// On a wide web screen the app sits in an iPhone frame and the edge-case panel
// lives OUTSIDE the phone. On phones (or narrow web) the app is full-bleed and
// the panel opens from a slim tab on the right edge.
// Web preview only: phones don't show scrollbars, so hide them here (scrolling still works).
function useHideScrollbars() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const el = document.createElement('style');
    el.textContent = '* { scrollbar-width: none; -ms-overflow-style: none; } *::-webkit-scrollbar { display: none; width: 0; height: 0; }';
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, []);
}

export function WebFrame({ children }: { children: React.ReactNode }) {
  useHideScrollbars();
  const win = useWindow();
  const wide = Platform.OS === 'web' && win.width >= 900;
  if (!wide) return <View style={{ flex: 1 }}>{children}</View>;
  const scale = Math.min(1, (win.height - 48) / (PHONE_H + 24));
  return (
    <View style={{ flex: 1, backgroundColor: '#E6EAF0', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 28, paddingTop: 24 }}>
      <View style={{ width: (PHONE_W + 24) * scale, height: (PHONE_H + 24) * scale }}>
        <View style={{ width: PHONE_W + 24, height: PHONE_H + 24, transform: [{ scale }], transformOrigin: 'top left' as any, borderRadius: 56, backgroundColor: '#15181E', padding: 12, shadowColor: '#101828', shadowOpacity: 0.25, shadowRadius: 40, shadowOffset: { width: 0, height: 24 } }}>
          <View style={{ width: PHONE_W, height: PHONE_H, borderRadius: 44, overflow: 'hidden' }}>
            <SafeAreaInsetsContext.Provider value={{ top: 47, bottom: 30, left: 0, right: 0 }}>
              {children}
              <StatusBarMock />
            </SafeAreaInsetsContext.Provider>
          </View>
        </View>
      </View>
      <SidePanel height={(PHONE_H + 24) * scale} />
    </View>
  );
}

function StatusBarMock() {
  const { c } = useTheme();
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, paddingTop: 6 }}>
      <Text style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 20, color: c.ink }}>9:41</Text>
      <View style={{ position: 'absolute', left: 140, top: 11, width: 110, height: 32, borderRadius: 16, backgroundColor: '#000' }} />
      <Text style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: c.ink }}>5G  100%</Text>
    </View>
  );
}

function PanelBody() {
  const { current } = useScenarioRegistry();
  const { state, setSc, reset } = useStore();
  const nav = navStore.use();
  const global = [
    { label: 'Navigation style', options: NAV_STYLES as string[], value: nav.style, onPick: (v: string) => navStore.set({ style: v as NavStyle }) },
    { label: 'Theme', options: ['System', 'Light', 'Dark'], value: state.sc.theme, onPick: (v: string) => setSc({ theme: v as any }) },
    { label: 'Member type', options: ['Regular', 'PT member'], value: state.sc.member, onPick: (v: string) => setSc({ member: v as any }) },
  ];
  const rows = [...(current?.rows ?? []), ...global];
  const jumps: [string, () => void][] = [
    ['Welcome', () => router.replace('/welcome')],
    ['Log in', () => router.replace('/login')],
    ['Onboarding', () => router.replace('/onboarding')],
    ['Today', () => router.replace('/(tabs)')],
  ];
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: font.bold, fontSize: 16, lineHeight: 21, color: '#12151C' }}>Edge cases</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 13, lineHeight: 17, color: '#5C6370' }}>{current?.title ?? 'App'}</Text>
      </View>
      {rows.map((r) => (
        <View key={r.label} style={{ gap: 6 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: '#5C6370' }}>{r.label}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {r.options.map((o) => {
              const on = o === r.value;
              return (
                <Pressable key={o} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => r.onPick(o)}
                  style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: on ? '#12151C' : '#CBD2DC', backgroundColor: on ? '#12151C' : '#fff', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: font.medium, fontSize: 12.5, lineHeight: 16, color: on ? '#fff' : '#12151C' }}>{o}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: '#E1E6EC', paddingTop: 12 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: '#5C6370' }}>Jump to</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {jumps.map(([l, go]) => (
            <Pressable key={l} onPress={go} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#CBD2DC', backgroundColor: '#fff', justifyContent: 'center' }}>
              <Text style={{ fontFamily: font.medium, fontSize: 12.5, lineHeight: 16, color: '#12151C' }}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {(current?.actions ?? []).map((a) => (
        <Pressable key={a.label} onPress={a.run} style={{ height: 38, borderRadius: 19, backgroundColor: '#EEF1F5', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 17, color: '#12151C' }}>{a.label}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => { reset(); router.replace('/login'); }} style={{ height: 38, borderRadius: 19, backgroundColor: '#EEF1F5', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 17, color: '#12151C' }}>Reset the whole app</Text>
      </Pressable>
    </View>
  );
}

function SidePanel({ height }: { height: number }) {
  return (
    <View style={{ width: 320, maxHeight: height, flexGrow: 0, flexShrink: 0 }}>
    <ScrollView accessibilityLabel="Edge cases and scenarios" style={{ backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: '#E1E6EC' }} contentContainerStyle={{ padding: 16 }}>
      <PanelBody />
      <Text style={{ marginTop: 16, fontFamily: font.regular, fontSize: 12, lineHeight: 16, color: '#5C6370' }}>YourPal member app · React Native (Expo) · web build. On a phone this panel opens from the tab on the right edge.</Text>
    </ScrollView>
    </View>
  );
}

// Slim tab on the right edge (phones / narrow web) — opens the same panel as a sheet.
export function EdgeTab() {
  const { openSheet } = useOverlay();
  const { c } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Scenarios and edge cases" onPress={() => openSheet(<View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 12 }}><PanelBody /></View>, { label: 'Edge cases' })}
      style={{ position: 'absolute', right: 0, top: '46%', width: 22, height: 52, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
      <SlidersHorizontal size={13} color="#fff" />
    </Pressable>
  );
}
