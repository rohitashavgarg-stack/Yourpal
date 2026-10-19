import { createStore } from '@/lib/createStore';
import { useDomain } from '@/lib/domain';
import { Goal2, statusLine } from '@/features/goalv2/model';

// The states of the goal card on Today. One component (GoalTickCard) draws all of them; this file only decides which one and what it says.
// Each state sets the glow, the pill and the segment colour together, from the existing tokens (nothing is hard-coded per state).
//  accent = on its way (blue)   good = ahead or done (green)   warn = needs a look (amber, never red)   muted = the gym's doing, nothing to fix (grey)
export type GoalCardState = 'onTrack' | 'behind' | 'almost' | 'complete' | 'frozen' | 'paused' | 'comeback' | 'backOn' | 'noGoal';
export type GoalTone = 'accent' | 'good' | 'warn' | 'muted';

export const GOAL_STATE_OPTIONS: [string, GoalCardState][] = [
  ['On track', 'onTrack'], ['Behind', 'behind'], ['Almost there', 'almost'], ['Complete', 'complete'], ['Frozen', 'frozen'],
  ['Paused', 'paused'], ['Comeback', 'comeback'], ['Back on', 'backOn'], ['No goal', 'noGoal'],
];

export const STALE_WEIGH_DAYS = 10; // no weigh-in for this many days or more: the percentage gives way to "Needs a weigh-in"

// Demo panel only: pin a state, and say how long ago the last weigh-in was. The real state comes from the member's data (useGoalCardState).
export const goalCardStore = createStore(() => ({ force: 'auto' as 'auto' | GoalCardState, weighDays: 2 }));

export function useGoalCardState(g: Goal2): GoalCardState {
  const { d } = useDomain();
  const { force } = goalCardStore.use();
  if (force !== 'auto') return force;
  if (d.goal.type === 'Not sure yet') return 'noGoal';
  if (d.hold === 'Frozen') return 'frozen';
  if (d.hold === 'Paused') return 'paused';
  if (d.todayVariant === 'Comeback') return 'comeback';
  if (g.daysLeft != null && g.daysLeft <= 0) return 'complete';
  if (g.status === 'aBitBehind') return 'behind';
  if (g.status === 'endingSoon') return 'almost';
  return 'onTrack';
}

export const TONE: Record<GoalCardState, GoalTone> = {
  onTrack: 'accent', behind: 'warn', almost: 'good', complete: 'good', frozen: 'muted', paused: 'muted', comeback: 'accent', backOn: 'good', noGoal: 'muted',
};

// The pill always says the state in words, so colour is never the only signal.
export function pillText(state: GoalCardState, g: Goal2): string {
  switch (state) {
    case 'behind': return 'A bit behind';
    case 'almost': return 'Almost there';
    case 'complete': return 'Goal complete';
    case 'frozen': return 'Membership frozen';
    case 'paused': return 'Membership paused';
    case 'comeback': return 'Resumes today';
    case 'backOn': return 'Back on track';
    case 'noGoal': return 'No goal yet';
    default:
      if (g.kind === 'consistency') return g.currentValue >= g.weeklyTarget ? 'Week complete' : `${g.weeklyTarget - g.currentValue} to go`;
      return statusLine(g);
  }
}
