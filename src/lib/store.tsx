import { useFocusEffect } from 'expo-router';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// ---------- App state (mock backend lives on the device) ----------
export type Scenarios = {
  member: 'Regular' | 'PT member';
  number: 'In CRM' | 'Not found';
  otp: 'Correct' | 'Wrong';
  autoRead: 'Off' | 'On';
  assess: 'Scheduled' | 'Not scheduled';
  net: 'Online' | 'Offline';
  theme: 'System' | 'Light' | 'Dark';
};

export type Profile = {
  name: string;
  photo?: string; // your own picture (uri); falls back to the default when empty
  goal: string;
  goalTarget: number;
  goal2: string;
  exp: string;
  days: number;
  time: string;
  age: string; // derived from dob
  dob: string; // YYYY-MM-DD, or empty
  gender?: string; // Male, Female, Other, or empty
  heightCm: string;
  weightKg: string;
  targetKg: string;
  skipBody: boolean;
  diet: string;
  eat: string;
  injury: 'No' | 'Yes';
  injuryNote: string;
  photosPrivate: boolean;
  notifications: 'unset' | 'on' | 'off';
};

export type AppState = {
  phone: string;
  loggedIn: boolean;
  onboarded: boolean;
  onboardingStep: string;
  profile: Profile;
  sc: Scenarios;
};

export const defaultProfile: Profile = {
  name: 'Jyotsana Rankawat',
  goal: '',
  goalTarget: 6,
  goal2: 'None',
  exp: '',
  days: 4,
  time: 'Evening',
  age: '',
  dob: '',
  heightCm: '',
  weightKg: '',
  targetKg: '',
  skipBody: false,
  diet: 'Veg',
  eat: 'Home food',
  injury: 'No',
  injuryNote: '',
  photosPrivate: true,
  notifications: 'unset',
};

export const defaultState: AppState = {
  phone: '',
  loggedIn: false,
  onboarded: false,
  onboardingStep: 'welcome',
  profile: defaultProfile,
  sc: { member: 'Regular', number: 'In CRM', otp: 'Correct', autoRead: 'Off', assess: 'Scheduled', net: 'Online', theme: 'Dark' },
};

type Ctx = {
  state: AppState;
  set: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void;
  setProfile: (patch: Partial<Profile>) => void;
  setSc: (patch: Partial<Scenarios>) => void;
  reset: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

const KEY = 'yourpal-state-v1';
function load(): AppState {
  if (typeof location !== 'undefined' && /[?&]signedin=1/.test(location.search)) return { ...defaultState, loggedIn: true, onboarded: true, sc: { ...defaultState.sc, member: 'PT member' } }; // TEMP-SHOT
  try {
    const raw = (globalThis as any).localStorage?.getItem(KEY);
    if (raw) { const o = JSON.parse(raw); if (o?.sc?.theme === 'System') o.sc.theme = 'Dark'; if (o?.profile?.name === 'Ankit' || o?.profile?.name === 'Rohitashav Garg') o.profile.name = 'Jyotsana Rankawat'; return { ...defaultState, ...o }; }
  } catch {}
  return defaultState;
}
function save(s: AppState) {
  try {
    (globalThis as any).localStorage?.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const set = useCallback<Ctx['set']>((patch) => {
    setState((s) => {
      const n = { ...s, ...(typeof patch === 'function' ? patch(s) : patch) };
      save(n);
      return n;
    });
  }, []);
  const setProfile = useCallback((p: Partial<Profile>) => set((s) => ({ profile: { ...s.profile, ...p } })), [set]);
  const setSc = useCallback((p: Partial<Scenarios>) => set((s) => ({ sc: { ...s.sc, ...p } })), [set]);
  const reset = useCallback(() => { save(defaultState); setState(defaultState); }, []);
  const value = useMemo(() => ({ state, set, setProfile, setSc, reset }), [state, set, setProfile, setSc, reset]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore outside StoreProvider');
  return c;
}

// ---------- Edge-case registry ----------
// Screens register the scenario rows that matter to them; the web side panel
// (outside the phone) and the native dev sheet both render the same list.
export type ScenarioRow = { label: string; options: string[]; value: string; onPick: (v: string) => void };
export type ScenarioAction = { label: string; run: () => void };
export type ScenarioSet = { title: string; rows: ScenarioRow[]; actions?: ScenarioAction[] };

type RegCtx = { current: ScenarioSet | null; register: (s: ScenarioSet | null) => void; unregister: (s: ScenarioSet) => void };
const RegistryCtx = createContext<RegCtx>({ current: null, register: () => {}, unregister: () => {} });

export function ScenarioRegistryProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<ScenarioSet | null>(null);
  const register = useCallback((s: ScenarioSet | null) => setCurrent(s), []);
  // A screen leaving must not wipe the set of the screen that is already back on top.
  const unregister = useCallback((s: ScenarioSet) => setCurrent((cur) => (cur === s ? null : cur)), []);
  const value = useMemo(() => ({ current, register, unregister }), [current, register, unregister]);
  return <RegistryCtx.Provider value={value}>{children}</RegistryCtx.Provider>;
}

export function useScenarioRegistry() {
  return useContext(RegistryCtx);
}

// Call from a screen with the rows it wants exposed. Re-registers when deps change.
export function useScenarios(set: ScenarioSet, deps: any[]) {
  const { register, unregister } = useContext(RegistryCtx);
  const ref = useRef(set);
  ref.current = set;
  const mine = useRef<ScenarioSet | null>(null);
  // Registers when the screen is focused (also when a pushed page closes and this one is back on top).
  useFocusEffect(React.useCallback(() => {
    mine.current = ref.current;
    register(ref.current);
  }, deps)); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => () => { if (mine.current) unregister(mine.current); }, [unregister]);
}
