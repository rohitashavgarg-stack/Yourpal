import { createStore } from '@/features/progress/store';
import { useDomain } from '@/lib/domain';
import { useStore } from '@/lib/store';
import { goalV2Store } from '@/features/goalv2/model';
import { goalSummary } from '@/features/shell/goal';

// Coach Vikram creates the member's goals (two or three, each a different type). The member only chooses which one is primary.
// The primary goal is `d.goal`, so everything that follows the goal (Today, Progress, the goal page, plan hints) follows it.
// The other goals the coach created are kept here until one is made primary. Sample data; the real list comes from the coach.
export type CoachGoal = { id: string; type: string; target: number; by: string };
export const goalsStore = createStore(() => ({ others: [{ id: 'g2', type: 'Flexibility', target: 0, by: 'No date' }, { id: 'g3', type: 'Strength', target: 80, by: '15 Dec' }] as CoachGoal[] }), 'goals');

/** One line for a goal: "Strength, 80 kg bench press by 15 Dec". */
export const goalLine = (g: { type: string; target: number; by: string }) => goalSummary({ ...g, by: g.by === '—' ? 'No date' : g.by }).replace(' · ', ', ');

/** A goal in two parts: its type as the title and the rest ("Lose 6 kg by 30 Nov") as the detail line. */
export function goalParts(g: { type: string; target: number; by: string }) {
  const line = goalLine(g);
  const rest = line.length > g.type.length ? line.slice(g.type.length + 2) : '';
  return { title: g.type, detail: rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : '' };
}

/** The member's goals and the one action they have: make another goal primary. The old primary takes its place in the list. */
export function useCoachGoals() {
  const { d, set } = useDomain();
  const { setProfile } = useStore();
  const others = goalsStore.use().others;
  const primary: CoachGoal = { id: 'primary', type: d.goal.type, target: d.goal.target, by: d.goal.by };
  const makePrimary = (id: string) => {
    const g = others.find((x) => x.id === id);
    if (!g) return;
    goalsStore.set({ others: others.map((x) => (x.id === id ? { id, type: d.goal.type, target: d.goal.target, by: d.goal.by === '—' ? 'No date' : d.goal.by } : x)) });
    set({ goal: { type: g.type, target: g.target, by: g.by === 'No date' ? '—' : g.by } });
    goalV2Store.set({ extendDays: 0, lowerBy: 0, finished: false, kept: false });
    setProfile({ goal: g.type, goalTarget: g.target });
  };
  return { primary, others, makePrimary };
}
