/* eslint-disable react-hooks/refs -- the panel passes its handlers (which use a ref for the note timer) straight to its buttons */
import React, { useEffect, useState , useRef} from 'react';
import { useShell } from '@/features/shell/state';
import { router } from 'expo-router';
import { workoutUiStore } from '@/features/workout/ui';
import { newSession } from '@/features/workout/session';
import { Dimensions, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useStore } from '@/lib/store';
import { bucketOf, mealsFor, useDomain } from '@/lib/domain';
import { STEPS_DESIGNS, StepsDesign, stepsStore } from '@/features/today/StepsCards';
import { goalV2Store } from '@/features/goalv2/model';
import { WEEK_TARGET } from '@/features/streak/data';
import { font } from '@/theme/tokens';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { createStore } from '@/lib/createStore';
import { usePathname } from 'expo-router';
import { ChartLine, Dumbbell, Flag, House, LogIn, MapPin, MessageCircle, Minus, Moon, Plus, SlidersHorizontal, Sun, Sunrise, Sunset, UserRound } from '@/lib/icons';
import { Actions, Choice, PanelCard, QuickTime, ScreenItem, P } from '@/web/ControlParts';
import { todayUiStore, TodayLayout } from '@/features/today/ui';
import { SITUATIONS, SITUATION_HINT, Situation, useSituation } from '@/lib/situations';

const PHONE_W = 390, PHONE_H = 844;
// Which version of the edge-case panel is showing: the first one (a long list) or the structured one (cards).
export const panelUiStore = createStore(() => ({ version: 'Classic' as 'Classic' | 'Structured' }));

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

const hourLabel = (m: number) => { const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
// Hourly slider on a day-colour track: drag or tap anywhere. The whole app follows the time.
function TimeSlider({ minutes, onPick }: { minutes: number; onPick: (min: number) => void }) {
  const [w, setW] = useState(0);
  const hour = Math.max(0, Math.min(23, Math.floor(minutes / 60)));
  const from = (x: number) => { if (w <= 0) return; const h = Math.max(0, Math.min(23, Math.round((x / w) * 23))); if (h !== hour) onPick(h * 60); };
  const pct = Math.min(100, (minutes / 1380) * 100);
  return (
    <View style={{ gap: 6 }}>
      <View accessibilityRole="adjustable" accessibilityLabel={`Time of day, ${hourLabel(minutes)}`} accessibilityValue={{ text: hourLabel(minutes) }}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => from(e.nativeEvent.locationX)} onResponderMove={(e) => from(e.nativeEvent.locationX)}
        style={{ height: 30, justifyContent: 'center' }}>
        <View pointerEvents="none" style={{ height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <LinearGradient colors={['#3B3F9E', '#F6B58B', '#BFD9F4', '#6C7BD6', '#3B3F9E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 8 }} />
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', left: `${pct}%`, marginLeft: -11, top: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2, borderColor: P.ink, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {['12a', '6a', '12p', '6p', '12a'].map((l, i) => <Text key={l + i} style={{ fontFamily: font.regular, fontSize: 11, lineHeight: 15, color: P.muted }}>{l}</Text>)}
      </View>
    </View>
  );
}

// The first version of the panel keeps its own slider.
const classicHour = (m: number) => { const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`; };
// Hourly slider: 0 to 23, drag or tap anywhere on the track. The whole app follows the hour.
function ClassicTimeSlider({ minutes, onPick }: { minutes: number; onPick: (min: number) => void }) {
  const [w, setW] = useState(0);
  const hour = Math.max(0, Math.min(23, Math.floor(minutes / 60)));
  const from = (x: number) => { if (w <= 0) return; const h = Math.max(0, Math.min(23, Math.round((x / w) * 23))); if (h !== hour) onPick(h * 60); };
  const pct = (hour / 23) * 100;
  return (
    <View style={{ gap: 8 }}>
      <View accessibilityRole="adjustable" accessibilityLabel={`Time of day, ${classicHour(minutes)}`} accessibilityValue={{ text: classicHour(minutes) }}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => from(e.nativeEvent.locationX)} onResponderMove={(e) => from(e.nativeEvent.locationX)}
        style={{ height: 32, justifyContent: 'center' }}>
        <View pointerEvents="none" style={{ height: 4, borderRadius: 2, backgroundColor: '#DCE1E8' }}>
          <View style={{ width: `${pct}%`, height: 4, borderRadius: 2, backgroundColor: '#12151C' }} />
        </View>
        {[0, 6, 12, 18, 23].map((h) => <View key={h} pointerEvents="none" style={{ position: 'absolute', left: `${(h / 23) * 100}%`, marginLeft: -3, top: 14, width: 6, height: 6, borderRadius: 3, backgroundColor: h <= hour ? '#12151C' : '#C3CAD5' }} />)}
        <View pointerEvents="none" style={{ position: 'absolute', left: `${pct}%`, marginLeft: -11, top: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 2, borderColor: '#12151C', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {['12 am', '6 am', '12 pm', '6 pm', '11 pm'].map((l) => <Text key={l} style={{ fontFamily: font.regular, fontSize: 11, lineHeight: 15, color: '#5C6370' }}>{l}</Text>)}
      </View>
      <Text style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 19, color: '#12151C' }}>{classicHour(minutes)}</Text>
    </View>
  );
}

// Kept deliberately small: goal type, member type, light / dark, steps tracker design and the time of day.
// onDone: called after a Redo so the sheet version can close itself and show a toast.
function PanelBody({ onDone }: { onDone?: (msg: string) => void } = {}) {
  const [note, setNote] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const said = (msg: string) => { setNote(msg); clearTimeout(timer.current); timer.current = setTimeout(() => setNote(''), 3500); onDone?.(msg); };
  const { state, setSc, set: setApp, setProfile } = useStore();
  const shell = useShell();
  const { isDark } = useTheme();
  const { d, set } = useDomain();
  const steps = stepsStore.use();
  const wk = workoutUiStore.use();
  const type = d.goal.type;
  const GOAL_TARGET: Record<string, number> = { 'Weight loss': 6, 'Muscle gain': 3, 'Lean body': 3, Strength: 80, Flexibility: 0, Agility: 0, 'General fitness': WEEK_TARGET, 'Not sure yet': 0 };
  const pickGoal = (v: string) => {
    set({ goal: { type: v, target: GOAL_TARGET[v] ?? 0, by: v === 'General fitness' || v === 'Not sure yet' ? '—' : d.goal.by && d.goal.by !== '—' ? d.goal.by : '30 Nov' } });
    goalV2Store.set({ extendDays: 0, lowerBy: 0, finished: false, kept: false });
  };
  // Move "now" to a minute of the day. Meals and the check-in reset only when the part of the day changes.
  const pickMinute = (m: number) => {
    const t = bucketOf(m);
    set(t !== d.time ? { min: m, time: t, meals: mealsFor(t), openMeal: null, ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null } : { min: m });
  };
  const sit = useSituation();
  const rows = [
    // One situation at a time: picking it sets everything it implies (and a fitting time of day).
    // Which Today layout: the current cards, or the new one (greeting, goal strip, one "For you" stack, Right now, trackers, plan).
    { label: 'Today layout', options: ['Current', 'New'], value: todayUiStore.use().layout, onPick: (v: string) => { todayUiStore.set({ layout: v as TodayLayout }); said(`Today layout: ${v}`); } },
    { label: 'Situation', options: SITUATIONS as string[], value: sit.current, onPick: (v: string) => { sit.pick(v as Situation); said(`Situation: ${v}`); } },
    { label: 'Goal type', options: ['Weight loss', 'Muscle gain', 'Lean body', 'Strength', 'Flexibility', 'Agility', 'General fitness', 'Not sure yet'], value: type, onPick: pickGoal },
    // What the member sees at the top of Today: a normal day, the updates card (plan changes, messages), or the welcome-back card after a break.
    { label: 'Today shows', options: ['Regular', 'With updates', 'Comeback'], value: d.todayVariant, onPick: (v: string) => sit.pick(v === 'Regular' ? 'Normal day' : (v as Situation)) },
    // When the member trains: Today's Right now card, the Workout card and This week follow it. Set in onboarding (Schedule).
    { label: 'Workout time', options: ['Early morning', 'Morning', 'Afternoon', 'Evening'], value: state.profile.time || 'Evening', onPick: (v: string) => setProfile({ time: v }) },
    // Payment: what Today shows above everything when the membership needs attention.
    { label: 'Membership', options: ['Active', 'Expiring', 'Grace', 'Grace over'], value: d.membership, onPick: (v: string) => set({ membership: v as any }) },
    // Comeback: how long the member has been away.
    { label: 'Days away (Comeback)', options: ['2 days', '4 days', '8 days', '15 days'], value: d.todayVariant === 'Comeback' ? `${d.awayDays} days` : '', onPick: (v: string) => { sit.pick('Comeback'); set({ awayDays: parseInt(v, 10) }); } },
    { label: 'Member type', options: ['Regular', 'PT member'], value: state.sc.member, onPick: (v: string) => setSc({ member: v as any }) },
    { label: 'Theme', options: ['Light', 'Dark'], value: isDark ? 'Dark' : 'Light', onPick: (v: string) => setSc({ theme: v as any }) },
    { label: 'Steps tracker design', options: STEPS_DESIGNS as string[], value: steps.design, onPick: (v: string) => stepsStore.set({ design: v as StepsDesign }) },
    // With a gym: Gym tab, check-in, coach, PT and the gym step in onboarding. Without: just the app.
    { label: 'Gym', options: ['Has a gym', 'No gym'], value: d.hasGym ? 'Has a gym' : 'No gym', onPick: (v: string) => { set({ hasGym: v === 'Has a gym' }); if (v !== 'Has a gym') router.replace('/(tabs)'); } },
    // A number that belongs to several programmes picks one after the code; one programme goes straight in.
    { label: 'Programme choice screen (login)', options: ['Shown', 'Hidden'], value: shell.s.sc.pick, onPick: (v: string) => shell.set((x) => ({ sc: { ...x.sc, pick: v as 'Shown' | 'Hidden' } })) },
    { label: 'Gym choice in onboarding', options: ['Shown', 'Hidden'], value: d.askGym ? 'Shown' : 'Hidden', onPick: (v: string) => set({ askGym: v === 'Shown' }) },
    // Undo one thing so it can be tried again.
    { label: 'Redo today', options: ['Workout', 'Meals', 'Steps', 'Check-in'], value: '', onPick: (v: string) => {
      if (v === 'Workout') { set({ wkScenario: 'Not started', wkDone: null, session: null }); said('Workout reset · ready to start again'); }
      else if (v === 'Meals') { set({ meals: mealsFor(d.time), openMeal: null }); said('Meals reset · back to the start of the day'); }
      else if (v === 'Steps') { stepsStore.set({ manual: [] }); said('Steps reset · manual steps removed'); }
      else { set({ ci: 'At the gym', ciAt: null, ciStart: null, ciOut: null, ciExtend: 0, ciHold: null }); said('Check-in reset · you can check in again'); }
    } },
    { label: 'Redo onboarding', options: ['Start over', 'Gym', 'Goal', 'Experience', 'Schedule', 'Age', 'Height', 'Weight', 'Basics', 'Health', 'Privacy'], value: '', onPick: (v: string) => {
      const at = ({ 'Start over': 'welcome', Gym: 'facility', Goal: 'goal', Experience: 'exp', Schedule: 'sched', Age: 'age', Height: 'height', Weight: 'weight', Basics: 'basics', Health: 'health', Privacy: 'consent' } as Record<string, string>)[v];
      if (v === 'Start over') setProfile({ goal: '', exp: '', injury: 'No', injuryNote: '', skipBody: false });
      setApp({ onboarded: false, onboardingStep: at });
      said(v === 'Start over' ? 'Restarting onboarding from the beginning' : `Onboarding reopened at ${v}`);
      router.replace('/onboarding');
    } },
    // The workout screen has two designs. New = full-screen clip with the sets in a bottom sheet.
    { label: 'Workout design', options: ['Current', 'New'], value: wk.design, onPick: (v: string) => { workoutUiStore.set({ design: v as 'Current' | 'New' }); said(`Workout design: ${v}`); } },
    { label: 'Open a workout', options: ['Start'], value: '', onPick: () => {
      set({ session: newSession() });
      said(wk.design === 'New' ? 'Started the workout with the 7 clip exercises' : 'Started Leg day');
      router.push('/workout');
    } },
    // Steps need Health. Heart rate, sleep and energy also need a watch or band, which a member may not have.
    { label: 'Health (steps)', options: ['Connected', 'Not connected'], value: d.hc ? 'Connected' : 'Not connected', onPick: (v: string) => set({ hc: v === 'Connected' }) },
    { label: 'Wearable (heart rate, sleep, energy)', options: ['Has a wearable', 'No wearable'], value: d.wearable ? 'Has a wearable' : 'No wearable', onPick: (v: string) => set({ wearable: v === 'Has a wearable' }) },
  ];
  const row = (label: string) => rows.find((r) => r.label === label)!;
  const seg = (label: string) => { const r = row(label); return <Choice key={label} label={r.label} options={r.options} value={r.value} onPick={r.onPick} />; };
  const act = (label: string) => { const r = row(label); return <Actions key={label} label={r.label} options={r.options} onPick={r.onPick} />; };
  const path = usePathname();
  const [open, setOpen] = useState(true);
  const hour = Math.floor(d.min / 60);
  const period = hour >= 21 || hour < 5 ? { label: 'Night', icon: Moon } : hour < 12 ? { label: 'Morning', icon: Sunrise } : hour < 17 ? { label: 'Afternoon', icon: Sun } : { label: 'Evening', icon: Sunset };
  const go = (to: string, name: string) => { router.navigate(to as any); said(`Opened ${name}`); };
  const SCREENS: { label: string; icon: any; to: string; match: (p: string) => boolean }[] = [
    { label: 'Dashboard', icon: House, to: '/(tabs)', match: (p) => p === '/' || p === '/index' || p === '/(tabs)' },
    { label: 'Plans', icon: Dumbbell, to: '/(tabs)/plans', match: (p) => p.startsWith('/plans') },
    { label: 'Progress', icon: ChartLine, to: '/(tabs)/progress', match: (p) => p.startsWith('/progress') },
    { label: 'Gym', icon: MapPin, to: '/(tabs)/gym', match: (p) => p.startsWith('/gym') },
    { label: 'Coach', icon: MessageCircle, to: '/coach', match: (p) => p.startsWith('/coach') },
    { label: 'Profile', icon: UserRound, to: '/profile', match: (p) => p.startsWith('/profile') },
    { label: 'Check-in', icon: Flag, to: '/checkin', match: (p) => p.startsWith('/checkin') },
    { label: 'Login', icon: LogIn, to: '/login', match: (p) => p.startsWith('/login') || p.startsWith('/welcome') },
  ];
  const structured = (
    <View style={{ gap: 12 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: P.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: P.accent, alignItems: 'center', justifyContent: 'center' }}><SlidersHorizontal size={20} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 16, lineHeight: 21, color: P.ink }}>Demo controls</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 12.5, lineHeight: 17, color: P.muted }}>Drive the prototype</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={open ? 'Collapse the controls' : 'Expand the controls'} onPress={() => setOpen((o) => !o)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: P.tint, alignItems: 'center', justifyContent: 'center' }}>
          {open ? <Minus size={18} color={P.muted} /> : <Plus size={18} color={P.muted} />}
        </Pressable>
      </View>
      {!!note && <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 20, backgroundColor: '#E6F6EE', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, shadowColor: '#101828', shadowOpacity: 0.15, shadowRadius: 8 }}><Text style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: '#0F8A5F' }}>✓ {note}</Text></View>}
      {open && (
        <>
          <PanelCard icon={period.icon} title={period.label}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: P.muted }}>Time of day</Text>
              <Text style={{ fontFamily: font.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6, color: P.ink }}>{hourLabel(d.min)}</Text>
            </View>
            <TimeSlider minutes={d.min} onPick={pickMinute} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <QuickTime icon={Sunrise} label="Breakfast" time="8:00 AM" onPress={() => pickMinute(480)} />
              <QuickTime icon={Sun} label="Lunch" time="1:30 PM" onPress={() => pickMinute(810)} />
              <QuickTime icon={Dumbbell} label="Workout" time="6:30 PM" onPress={() => pickMinute(1110)} />
              <QuickTime icon={Moon} label="Night" time="9:30 PM" onPress={() => pickMinute(1290)} />
            </View>
          </PanelCard>

          <PanelCard icon={House} title="Situation" pill={{ label: sit.current }}>
            {seg('Today layout')}
            {seg('Situation')}
            <Text style={{ fontFamily: font.regular, fontSize: 12, lineHeight: 17, color: P.muted }}>{SITUATION_HINT[sit.current]}</Text>
            {sit.current === 'Comeback' && seg('Days away (Comeback)')}
            {!!d.autoNote && <View style={{ backgroundColor: '#FFF4E0', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 }}><Text style={{ fontFamily: font.medium, fontSize: 12.5, lineHeight: 17, color: '#9A5A00' }}>{d.autoNote}</Text></View>}
            {act('Redo today')}
          </PanelCard>

          <PanelCard icon={UserRound} title="Member" pill={{ label: state.sc.member }}>
            {seg('Member type')}
            {seg('Workout time')}
            {seg('Membership')}
            {seg('Goal type')}
            {seg('Gym')}
            {seg('Health (steps)')}
            {seg('Wearable (heart rate, sleep, energy)')}
          </PanelCard>

          <PanelCard icon={Dumbbell} title="Workout">
            {seg('Workout design')}
            {act('Open a workout')}
          </PanelCard>

          <PanelCard icon={Sun} title="Look" pill={{ label: isDark ? 'Dark' : 'Light' }}>
            {seg('Theme')}
            {seg('Steps tracker design')}
          </PanelCard>

          <PanelCard icon={LogIn} title="Login and onboarding">
            {seg('Programme choice screen (login)')}
            {seg('Gym choice in onboarding')}
            {act('Redo onboarding')}
          </PanelCard>

          <PanelCard icon={Flag} title="Screen">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {SCREENS.map((sc) => <ScreenItem key={sc.label} icon={sc.icon} label={sc.label} on={sc.match(path)} onPress={() => go(sc.to, sc.label)} />)}
            </View>
          </PanelCard>
        </>
      )}
    </View>
  );
  const classic = (
    <View style={{ gap: 14 }}>
      <Text style={{ fontFamily: font.bold, fontSize: 16, lineHeight: 21, color: '#12151C' }}>Edge cases</Text>
      {!!note && <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 20, backgroundColor: '#E6F6EE', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, shadowColor: '#101828', shadowOpacity: 0.15, shadowRadius: 8 }}><Text style={{ fontFamily: font.medium, fontSize: 13, lineHeight: 18, color: '#0F8A5F' }}>✓ {note}</Text></View>}
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
        <ClassicTimeSlider minutes={d.min} onPick={pickMinute} />
      </View>
    </View>
  );
  const ver = panelUiStore.use().version;
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', padding: 3, borderRadius: 14, backgroundColor: P.tint, gap: 2 }}>
        {(['Classic', 'Structured'] as const).map((v) => (
          <Pressable key={v} accessibilityRole="tab" accessibilityState={{ selected: ver === v }} onPress={() => panelUiStore.set({ version: v })}
            style={[{ flex: 1, minHeight: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, ver === v && { backgroundColor: '#fff' }]}>
            <Text style={{ fontFamily: ver === v ? font.semibold : font.medium, fontSize: 12.5, lineHeight: 17, color: ver === v ? P.accent : P.muted }}>{v}</Text>
          </Pressable>
        ))}
      </View>
      {ver === 'Structured' ? structured : classic}
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
  const { openSheet, closeSheet, toast } = useOverlay();
  return () => openSheet(<View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 12 }}><PanelBody onDone={(m) => closeSheet(() => toast(m))} /></View>, { label: 'Edge cases' });
}

// Slim tab on the right edge (phones / narrow web) — opens the same panel as a sheet.
export function EdgeTab() {
  const { openSheet, closeSheet, toast } = useOverlay();
  const { c } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Scenarios and edge cases" onPress={() => openSheet(<View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 12 }}><PanelBody onDone={(m) => closeSheet(() => toast(m))} /></View>, { label: 'Edge cases' })}
      style={{ position: 'absolute', right: 0, top: '46%', width: 22, height: 52, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
      <SlidersHorizontal size={13} color="#fff" />
    </Pressable>
  );
}
