import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useStore } from '@/lib/store';
import { mealsFor, NOWS, TimeOfDay, useDomain } from '@/lib/domain';
import { STEPS_DESIGNS, StepsDesign, stepsStore } from '@/features/today/StepsCards';
import { goalV2Store } from '@/features/goalv2/model';
import { WEEK_TARGET } from '@/features/streak/data';
import { font } from '@/theme/tokens';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { SlidersHorizontal } from '@/lib/icons';

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

// A three-stop slider for the time of day (Morning, Afternoon, Evening). Tap or drag along the track.
const TIME_STOPS: { t: TimeOfDay; label: string }[] = [
  { t: 'Morning', label: 'Morning' }, { t: 'Afternoon', label: 'Afternoon' }, { t: 'Evening', label: 'Evening' },
];
function TimeSlider({ value, onPick }: { value: TimeOfDay; onPick: (t: TimeOfDay) => void }) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, TIME_STOPS.findIndex((x) => x.t === value));
  const from = (x: number) => { if (w <= 0) return; const i = Math.max(0, Math.min(2, Math.round((x / w) * 2))); if (TIME_STOPS[i].t !== value) onPick(TIME_STOPS[i].t); };
  const clock = (t: TimeOfDay) => { const m = NOWS[t]; const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`; };
  return (
    <View style={{ gap: 8 }}>
      <View accessibilityRole="adjustable" accessibilityLabel={`Time of day, ${value}`} accessibilityValue={{ text: value }}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => from(e.nativeEvent.locationX)} onResponderMove={(e) => from(e.nativeEvent.locationX)}
        style={{ height: 32, justifyContent: 'center' }}>
        <View pointerEvents="none" style={{ height: 4, borderRadius: 2, backgroundColor: '#DCE1E8' }}>
          <View style={{ width: `${idx * 50}%`, height: 4, borderRadius: 2, backgroundColor: '#12151C' }} />
        </View>
        {[0, 1, 2].map((i) => <View key={i} pointerEvents="none" style={{ position: 'absolute', left: `${i * 50}%`, marginLeft: -3, top: 14, width: 6, height: 6, borderRadius: 3, backgroundColor: i <= idx ? '#12151C' : '#C3CAD5' }} />)}
        <View pointerEvents="none" style={{ position: 'absolute', left: `${idx * 50}%`, marginLeft: -11, top: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2, borderColor: '#12151C', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {TIME_STOPS.map((x, i) => <Text key={x.t} style={{ fontFamily: i === idx ? font.semibold : font.regular, fontSize: 11.5, lineHeight: 15, color: i === idx ? '#12151C' : '#5C6370' }}>{x.label}</Text>)}
      </View>
      <Text style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: '#12151C' }}>{clock(value)}</Text>
    </View>
  );
}

// Kept deliberately small: goal type, member type, light / dark, steps tracker design and the time of day.
function PanelBody() {
  const { state, setSc } = useStore();
  const { isDark } = useTheme();
  const { d, set } = useDomain();
  const steps = stepsStore.use();
  const type = d.goal.type;
  const GOAL_TARGET: Record<string, number> = { 'Weight loss': 6, 'Muscle gain': 3, 'Lean body': 3, Strength: 80, Flexibility: 0, Agility: 0, 'General fitness': WEEK_TARGET, 'Not sure yet': 0 };
  const pickGoal = (v: string) => {
    set({ goal: { type: v, target: GOAL_TARGET[v] ?? 0, by: v === 'General fitness' || v === 'Not sure yet' ? '—' : d.goal.by && d.goal.by !== '—' ? d.goal.by : '30 Nov' } });
    goalV2Store.set({ extendDays: 0, lowerBy: 0, finished: false, kept: false });
  };
  const pickTime = (t: TimeOfDay) => set({ time: t, meals: mealsFor(t), openMeal: null, ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null });
  const rows = [
    { label: 'Goal type', options: ['Weight loss', 'Muscle gain', 'Lean body', 'Strength', 'Flexibility', 'Agility', 'General fitness', 'Not sure yet'], value: type, onPick: pickGoal },
    // What the member sees at the top of Today: a normal day, the updates card (plan changes, messages), or the welcome-back card after a break.
    { label: 'Today shows', options: ['Regular', 'With updates', 'Comeback'], value: d.todayVariant, onPick: (v: string) => set({ todayVariant: v as any, dismissed: {} }) },
    { label: 'Member type', options: ['Regular', 'PT member'], value: state.sc.member, onPick: (v: string) => setSc({ member: v as any }) },
    { label: 'Theme', options: ['Light', 'Dark'], value: isDark ? 'Dark' : 'Light', onPick: (v: string) => setSc({ theme: v as any }) },
    { label: 'Steps tracker design', options: STEPS_DESIGNS as string[], value: steps.design, onPick: (v: string) => stepsStore.set({ design: v as StepsDesign }) },
  ];
  return (
    <View style={{ gap: 14 }}>
      <Text style={{ fontFamily: font.bold, fontSize: 16, lineHeight: 21, color: '#12151C' }}>Edge cases</Text>
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
      <View style={{ gap: 6 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: '#5C6370' }}>Time of day</Text>
        <TimeSlider value={d.time} onPick={pickTime} />
      </View>
    </View>
  );
}

function SidePanel({ height }: { height: number }) {
  return (
    <View style={{ width: 320, maxHeight: height, flexGrow: 0, flexShrink: 0 }}>
    <ScrollView accessibilityLabel="Edge cases and scenarios" style={{ backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: '#E1E6EC' }} contentContainerStyle={{ padding: 16 }}>
      <PanelBody />
    </ScrollView>
    </View>
  );
}

// Opens the same edge-case controls as a sheet. Used by the slim edge tab and by Profile → Demo controls, so they work in Expo Go too.
export function useOpenEdgeCases() {
  const { openSheet } = useOverlay();
  return () => openSheet(<View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 12 }}><PanelBody /></View>, { label: 'Edge cases' });
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
