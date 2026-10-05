import { createStore } from '@/features/progress/store';
import { Domain, initialDomain, useDomain } from '@/lib/domain';
import { ScenarioAction, ScenarioRow, useScenarios, useStore } from '@/lib/store';

export type SessionState = 'awaiting' | 'confirmed' | 'flagged';

// Gym-only screen state (the domain already holds membership, assess, ptLeft, onBreak, chat, offline).
export const gymStore = createStore(() => ({
  awaiting: 'Yes' as 'Yes' | 'No',
  sessionState: 'awaiting' as SessionState,
  rating: 0,
  blocked: false,
  typing: false,
  breakFrom: 6,
  breakUntil: 12,
  breakReason: 'Travel',
  pausesUsed: 1,
  asRemind: false,
  asView: 0 as 0 | 1,
  attFilter: 0 as 0 | 1 | 2,
}));

// Break dates are in October (the prototype's calendar year).
export function dateLabel(n: number) {
  const d = new Date(2025, 9, n);
  return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]} ${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;
}

export const defaultChat = (): Domain['chat'] => initialDomain().chat;

// Mirrors "Scenarios · Gym" in the reference. Every Gym page registers it.
export function useGymScenarios(title: string, extraRows: ScenarioRow[] = [], extraActions: ScenarioAction[] = [], deps: any[] = []) {
  const g = gymStore.use();
  const { d, set } = useDomain();
  const { state, setSc } = useStore();
  useScenarios({
    title,
    rows: [
      ...extraRows,
      { label: 'Membership', options: ['Active', 'Expiring', 'Grace', 'Grace over'], value: d.membership, onPick: (v) => set({ membership: v as any }) },
      { label: 'PT session awaiting confirmation (PT only)', options: ['Yes', 'No'], value: g.awaiting, onPick: (v) => gymStore.set({ awaiting: v as any, sessionState: 'awaiting', rating: 0 }) },
      { label: 'Chat', options: ['Has messages', 'Empty'], value: d.chat.length ? 'Has messages' : 'Empty', onPick: (v) => { set({ chat: v === 'Empty' ? [] : defaultChat() }); gymStore.set({ blocked: false }); } },
      { label: 'Connection (chat sending)', options: ['Online', 'Offline'], value: d.offline ? 'Offline' : 'Online', onPick: (v) => set({ offline: v === 'Offline' }) },
      { label: 'Assessments', options: ['Two done', 'Only first', 'Due now', 'None yet'], value: d.assess, onPick: (v) => { set({ assess: v as any }); gymStore.set({ asView: 0 }); } },
      { label: 'Membership paused', options: ['No', 'Yes'], value: d.onBreak ? 'Yes' : 'No', onPick: (v) => set({ onBreak: v === 'Yes' }) },
    ],
    actions: [
      ...extraActions,
      { label: 'Reset Gym', run: () => { gymStore.reset(); set({ membership: 'Active', assess: 'Two done', ptLeft: 8, onBreak: false, chat: defaultChat(), offline: false }); } },
    ],
  }, [g.awaiting, g.sessionState, d.membership, d.chat.length, d.offline, d.assess, d.onBreak, state.sc.member, ...deps]);
}
