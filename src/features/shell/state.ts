import { useSyncExternalStore } from 'react';

// Shell-level state (programmes, notification list, account settings).
// Lives in a tiny module store so the switcher sheet (rendered in the root overlay)
// and every Profile sub-page read the same values without touching the root layout.

export type Programme = { id: string; name: string; short: string; kind: string; logo: string; color: string; clinic: boolean; unread: number };
export type Notif = { id: string; p: string; t: string; s: string; when: string; unread: boolean; to?: '/plans' | '/progress' | '/gym' };

export const NOTIFS: Notif[] = [
  { id: 'n1', p: 'gold', t: 'Coach Vikram updated your plan', s: 'Leg day: lunges added', when: '2h', unread: true, to: '/plans' },
  { id: 'n2', p: 'gold', t: 'Coach Vikram replied', s: '“Keep your back straight…”', when: '5h', unread: true, to: '/gym' },
  { id: 'n3', p: 'gold', t: 'Reassessment due this week', s: 'Book with the front desk', when: '1d', unread: false, to: '/progress' },
  { id: 'n4', p: 'gold', t: 'Membership expires in 12 days', s: 'Renew at the front desk', when: '1d', unread: false, to: '/gym' },
  { id: 'n5', p: 'mehta', t: 'Dr. Mehta · Evening routine', s: 'Tapping switches programme', when: '2d', unread: true },
];

export type ShellState = {
  progs: Programme[];
  cur: string;
  last: string;
  sc: { progs: 'Three' | 'Only one'; notifs: 'Some' | 'None' };
  priv: Record<'gold_summary' | 'mehta_photos' | 'mehta_routine', boolean>;
  notif: Record<'plan' | 'msgs' | 'remind' | 'water' | 'member', boolean>;
  trk: Record<'water' | 'weight' | 'steps', boolean>;
  unitsW: 'kg' | 'lb';
  unitsL: 'cm' | 'in';
  detail: 'Simple' | 'Detailed';
  expPhotos: boolean;
  deleting: boolean;
  pendingJoin: { name: string; color: string; logo: string } | null;
};

const fresh = (): ShellState => ({
  progs: [
    { id: 'gold', name: "Wulf Fitness · Vaishali Nagar", short: "Wulf Fitness", kind: 'Gym', logo: 'W', color: '#B5541A', clinic: false, unread: 0 },
    { id: 'fit', name: 'FitZone', short: 'FitZone', kind: 'Gym', logo: 'F', color: '#128A62', clinic: false, unread: 0 },
    { id: 'mehta', name: 'Dr. Mehta Skin Clinic', short: 'Dr. Mehta Skin', kind: 'Clinic', logo: 'M', color: '#B8532B', clinic: true, unread: 1 },
  ],
  cur: 'gold', last: 'mehta',
  sc: { progs: 'Three', notifs: 'Some' },
  priv: { gold_summary: true, mehta_photos: false, mehta_routine: true },
  notif: { plan: true, msgs: true, remind: false, water: false, member: true },
  trk: { water: true, weight: true, steps: true },
  unitsW: 'kg', unitsL: 'cm', detail: 'Detailed',
  expPhotos: false, deleting: false, pendingJoin: null,
});

let state: ShellState = fresh();
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export function setShell(p: Partial<ShellState> | ((s: ShellState) => Partial<ShellState>)) {
  state = { ...state, ...(typeof p === 'function' ? p(state) : p) };
  emit();
}
export function resetShell() { state = fresh(); emit(); }

const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const snap = () => state;

export function useShell() {
  const s = useSyncExternalStore(subscribe, snap, snap);
  const progs = s.sc.progs === 'Only one' ? s.progs.slice(0, 1) : s.progs;
  const current = s.progs.find((p) => p.id === s.cur) ?? s.progs[0];
  return { s, progs, multi: progs.length > 1, current, set: setShell };
}

// Switch like switching accounts. Returns the programme's display name for the toast.
export function switchProgramme(id: string): string | null {
  if (id === state.cur) return null;
  const p = state.progs.find((x) => x.id === id);
  if (!p) return null;
  setShell((s) => ({ cur: id, last: s.cur, progs: s.progs.map((x) => (x.id === id ? { ...x, unread: 0 } : x)) }));
  return p.name.split(' · ')[0];
}

export function joinProgramme(j: { name: string; color: string; logo: string }) {
  const id = 'new' + Date.now();
  setShell((s) => ({
    progs: [...s.progs, { id, name: j.name, short: j.name, kind: 'Studio', logo: j.logo, color: j.color, clinic: false, unread: 0 }],
    sc: { ...s.sc, progs: 'Three' }, pendingJoin: null,
  }));
  return switchProgramme(id);
}

// Invite codes used by the prototype.
export type JoinResult = { ok: true; name: string; color: string; logo: string } | { ok: false; err: string };
export function checkCode(raw: string): JoinResult {
  const code = raw.trim().toUpperCase();
  if (code === 'GLD-4821') return { ok: false, err: "You're already in Wulf Fitness. Switch to it from the programme name." };
  if (code === 'OLD-0001') return { ok: false, err: 'This invite has expired. Ask for a new one.' };
  if (code === 'YOGA-2024') return { ok: true, name: 'Shanti Yoga Studio', color: '#7B4FD6', logo: 'S' };
  return { ok: false, err: "That code didn't work. Check it with your gym or clinic." };
}
