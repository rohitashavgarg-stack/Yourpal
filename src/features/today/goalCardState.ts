import { createStore } from '@/lib/createStore';
import { useDomain } from '@/lib/domain';
import { Goal2 } from '@/features/goalv2/model';
import { fixed } from '@/design-system/tokens';

// The states of the Today goal card. One component (GoalTickCard) draws all of them; this file decides which state and holds the look of each.
// Removed states: 'frozen' and 'paused'. A membership pause is shown only by the account banner, never on the goal.
export type GoalCardState = 'onTrack' | 'behind' | 'almost' | 'complete' | 'comeback' | 'backOn' | 'noGoal';

export const GOAL_STATE_OPTIONS: [string, GoalCardState][] = [
  ['On track', 'onTrack'], ['Behind', 'behind'], ['Almost there', 'almost'], ['Complete', 'complete'],
  ['Comeback', 'comeback'], ['Back on', 'backOn'], ['No goal', 'noGoal'],
];

export const STALE_WEIGH_DAYS = 10; // no weigh-in for this many days or more: the percentage gives way to "Needs a weigh-in"
export const SEGMENTS = 36;

// Demo panel only: pin a state (and show the sample numbers below), and say how long ago the last weigh-in was.
// The real state comes from the member's data (useGoalCardState).
export const goalCardStore = createStore(() => ({ force: 'auto' as 'auto' | GoalCardState, weighDays: 2 }));

export function useGoalCardState(g: Goal2): GoalCardState {
  const { d } = useDomain();
  const { force } = goalCardStore.use();
  if (force !== 'auto') return force;
  if (d.goal.type === 'Not sure yet') return 'noGoal';
  if (d.todayVariant === 'Comeback') return 'comeback';
  if (g.daysLeft != null && g.daysLeft <= 0) return 'complete';
  if (g.status === 'aBitBehind') return 'behind';
  if (g.status === 'endingSoon') return 'almost';
  return 'onTrack';
}

// Colours of the goal card, as given in the design spec. The card is a dark card in light and dark mode alike (like the workout card).
export const GC = {
  bg: '#1A1D22', border: '#3A3D48', emptyBg: fixed.dark, emptyBorder: '#2E3038', emptyTitle: '#8C8E97', emptySub: '#5E6069',
  title: '#F3F4F6', date: 'rgba(243,244,246,0.8)', rest: '#C3C7D0', unfilled: 'rgba(255,255,255,0.2)',
  mint: '#2EE6A8', amber: '#E8A33D', grey: '#5B5D66', pillWhite: fixed.white, pillInk: fixed.dark, outline: '#3A3B42',
};
const mint20 = 'rgba(46,230,168,0.2)', amber20 = 'rgba(232,163,61,0.2)';
type Pill = { label: string; bg: string; fg: string; border?: string };
const GREY_GLOW = { color: '#787E8C', a: 0.4 };

// pill: left out when the state has no pill (comeback)
export const LOOK: Record<Exclude<GoalCardState, 'noGoal'>, { glow: { color: string; a: number }; pill?: Pill; seg: string }> = {
  onTrack: { glow: { color: fixed.blue, a: 0.8 }, pill: { label: 'On track', bg: GC.pillWhite, fg: GC.pillInk }, seg: GC.mint },
  behind: { glow: { color: GC.amber, a: 0.6 }, pill: { label: 'Behind', bg: amber20, fg: GC.amber }, seg: GC.amber },
  almost: { glow: { color: GC.mint, a: 0.6 }, pill: { label: 'Almost there', bg: mint20, fg: GC.mint }, seg: GC.mint },
  complete: { glow: GREY_GLOW, pill: { label: 'Complete', bg: mint20, fg: GC.mint }, seg: GC.mint },
  comeback: { glow: { color: fixed.blue, a: 0.8 }, seg: GC.mint }, // blue and lit like on track, and no pill: a returning member is not stalled
  backOn: { glow: { color: GC.mint, a: 0.6 }, pill: { label: 'Back on', bg: mint20, fg: GC.mint }, seg: GC.mint },
};

// Sample numbers for the demo panel (kg goals only). A real member sees their own numbers.
export const DEMO: Record<GoalCardState, { lost: number; pct: number }> = {
  onTrack: { lost: 1.6, pct: 0.27 }, behind: { lost: 0.9, pct: 0.15 }, almost: { lost: 5.4, pct: 0.9 }, complete: { lost: 4.8, pct: 1 },
  comeback: { lost: 1.6, pct: 0.27 }, backOn: { lost: 1.6, pct: 0.27 }, noGoal: { lost: 0, pct: 0 },
};

// What sits after the title, and what is on the right of the bottom row. The percentage is the share of the goal's TIME that has passed, never the target hit.
// "Day 1 back" has no data behind it yet, so it is a fixed sample.
export const SUFFIX = (state: GoalCardState, by: string) => (state === 'complete' ? by.replace(/^by /, 'ended ') : by);
export const RIGHT_TEXT: Partial<Record<GoalCardState, string>> = { backOn: 'Day 1 back' };
