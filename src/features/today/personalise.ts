import { createStore } from '@/lib/createStore';

// The personal Today features can each be switched on and off from the demo side panel ("Personalise"), so every one can be shown with and without it.
export const personalStore = createStore(() => ({
  dayCount: true,    // "Day 12 of 90" in the greeting
  healthSheet: true, // Connect Health opens a bottom sheet first
  proteinNote: true, // a quiet "protein is low" note at the bottom of the Meals card in the evening
  profileStep: true, // one small profile question in the updates stack
  quickTip: true,    // a tip, recipe or workout idea at the bottom of Today
}));
export type PersonalKey = keyof ReturnType<typeof personalStore.get>;
export const PERSONAL_LABELS: [PersonalKey, string][] = [
  ['dayCount', 'Day count'],
  ['healthSheet', 'Health sheet'],
  ['proteinNote', 'Protein note'],
  ['profileStep', 'Profile step'],
  ['quickTip', 'Quick tip'],
];

// A demo goal length for the greeting until a goal carries its own: day 12 of 90.
export const GOAL_DAY = 12;
export const GOAL_DAYS = 90;

// The protein note shows in the evening (6:00 to 8:30 pm) while the day's protein is under this share of the target.
export const PROTEIN_WINDOW = { from: 18 * 60, to: 20 * 60 + 30 };
export const PROTEIN_LOW_SHARE = 0.6;

// The bottom of Today: one idea a day (by the date, the same all day). A tip, a recipe or a workout to try. Plain, no emoji, no hype.
export type Tip = { kind: 'tip' | 'recipe' | 'workout'; title: string; body: string };
export const TIPS: Tip[] = [
  { kind: 'tip', title: 'Water before coffee', body: 'A glass of water first thing helps your morning energy more than the coffee does.' },
  { kind: 'recipe', title: 'Veg poha, 250 kcal', body: 'Poha with peas, carrot and peanuts. Add a boiled egg or a katori of curd to bring the protein up.' },
  { kind: 'workout', title: 'Desk reset, 10 minutes', body: 'Hip circles, cat and cow, bodyweight squats and a doorway chest stretch. Good on a rest day.' },
  { kind: 'tip', title: 'Protein with every meal', body: 'Aim for a palm of protein at each meal. It keeps you full and helps your muscles recover.' },
  { kind: 'recipe', title: 'Paneer bhurji, 260 kcal', body: 'Paneer, onion and tomato in a little oil. 16 g of protein in a katori. Pair it with two rotis.' },
  { kind: 'workout', title: 'Core finisher, 8 minutes', body: 'Three rounds of a plank, dead bugs and a side plank. Add it after any workout.' },
  { kind: 'tip', title: 'Sleep sets your goal pace', body: 'Seven hours of sleep does more for fat loss than another cardio session.' },
  { kind: 'recipe', title: 'Sprouts chaat, 150 kcal', body: 'Moong sprouts, onion, tomato and lemon. 9 g of protein and ready in five minutes.' },
  { kind: 'workout', title: 'Walk and mobility, 15 minutes', body: 'A brisk ten minute walk, then five minutes of hip and shoulder mobility.' },
];
export const tipOfDay = (day: number) => TIPS[day % TIPS.length];
export const TIP_LABEL: Record<Tip['kind'], string> = { tip: 'QUICK TIP', recipe: 'RECIPE FOR TODAY', workout: 'A WORKOUT TO TRY' };

