import { createStore } from '@/features/progress/store';

// Weekly streak: a week is "kept" when the member finishes their planned sessions (4 a week).
export const WEEK_TARGET = 4;

export type StreakMode = 'Active' | 'Broken' | 'New member';

// Screen-level mock state (a real backend would supply this).
export const streakStore = createStore(() => ({
  mode: 'Active' as StreakMode,
  earlier: 1, // sessions already done this week, before today
}));

// Last 11 finished weeks, oldest first, for each mode. Streak = run of kept weeks ending last week.
export const HISTORY: Record<StreakMode, boolean[]> = {
  Active: [true, true, true, false, true, true, true, true, true, true, true],
  Broken: [true, true, true, true, true, true, false, true, true, true, false],
  'New member': [],
};

export type BadgeIcon = 'dumbbell' | 'flame' | 'trophy' | 'award' | 'medal' | 'scale' | 'target' | 'droplets' | 'footprints' | 'clipboard';
export type Badge = { id: string; title: string; earned?: string; hint: string; have?: number; need?: number; icon: BadgeIcon };

// Small starter set: consistency, strength, body goal, habits.
export const BADGES: Badge[] = [
  { id: 'first', title: 'First workout', earned: '14 Oct 2025', hint: 'Finish your first workout', icon: 'dumbbell' },
  { id: 'w4', title: '4-week streak', earned: '11 Aug', hint: 'Keep 4 weeks in a row', icon: 'flame' },
  { id: 'w12', title: '12-week streak', hint: 'Keep 12 weeks in a row', have: 7, need: 12, icon: 'flame' },
  { id: 'pr1', title: 'First PR', earned: '19 Aug', hint: 'Lift more than ever before', icon: 'trophy' },
  { id: 'pr5', title: '5 PRs', hint: 'Set 5 personal records', have: 3, need: 5, icon: 'medal' },
  { id: 'kg1', title: 'First kg', earned: '9 Sep', hint: 'Move 1 kg toward your goal', icon: 'scale' },
  { id: 'half', title: 'Halfway there', hint: 'Reach half of your goal', have: 2.1, need: 3, icon: 'target' },
  { id: 'water', title: 'Water week', hint: 'Hit your water goal 7 days running', have: 4, need: 7, icon: 'droplets' },
  { id: 'steps', title: 'Steps streak', earned: '16 Sep', hint: 'Hit your step goal 5 days running', icon: 'footprints' },
  { id: 'assess', title: 'Assessed', earned: '2 Sep', hint: 'Complete your first assessment', icon: 'clipboard' },
];
