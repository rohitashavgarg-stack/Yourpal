import { createStore } from '@/lib/createStore';

// The personal Today features can each be switched on and off from the demo side panel ("Personalise"), so every one can be shown with and without it.
export const personalStore = createStore(() => ({
  dayCount: true,    // "Day 12 of 90" in the greeting
  healthSheet: true, // Connect Health opens a bottom sheet first
  profileStep: true, // one small profile question in the updates stack
  quickTip: true,    // a tip, recipe or workout idea at the bottom of Today
}));
export type PersonalKey = keyof ReturnType<typeof personalStore.get>;
export const PERSONAL_LABELS: [PersonalKey, string][] = [
  ['dayCount', 'Day count'],
  ['healthSheet', 'Health sheet'],
  ['profileStep', 'Profile step'],
  ['quickTip', 'Quick tip'],
];

// A demo goal length for the greeting until a goal carries its own: day 12 of 90.
export const GOAL_DAY = 12;
export const GOAL_DAYS = 90;

// The bottom of Today: one idea a day (by the date, the same all day). A tip, a recipe or a workout to try. Plain, no emoji, no hype.
// `list` is the second block of the detail sheet (ingredients, exercises, or what to try); `steps` is the third (method, how to do it, or why it works).
export type Tip = { kind: 'tip' | 'recipe' | 'workout'; title: string; body: string; facts?: string; list: string[]; steps: string[] };
export const TIPS: Tip[] = [
  { kind: 'tip', title: 'Water before coffee', body: 'A glass of water first thing helps your morning energy more than the coffee does.',
    list: ['A glass of water, about 250 ml, within 15 minutes of waking', 'Your coffee after it, not instead of it'],
    steps: ['You wake up a little dry after the night, and that alone can feel like tiredness.', 'Water first means the coffee is a pick-me-up, not a fix for thirst.', 'Keep a glass by your bed so the first step is already done.'] },
  { kind: 'recipe', title: 'Veg poha, 250 kcal', body: 'Poha with peas, carrot and peanuts. Add a boiled egg or a katori of curd to bring the protein up.', facts: '250 kcal, 8 g protein, 15 minutes',
    list: ['1 cup thick poha, rinsed', '2 tbsp peas and 1 small carrot, chopped', '1 tbsp peanuts', 'Mustard seeds, curry leaves, turmeric, 1 tsp oil', 'Lemon and coriander to finish'],
    steps: ['Rinse the poha and let it rest for 5 minutes.', 'Heat the oil, crackle the mustard seeds, then add curry leaves, peanuts, peas and carrot.', 'Add turmeric and salt, then the poha. Stir gently for 2 minutes.', 'Finish with lemon and coriander. Add a boiled egg or a katori of curd for more protein.'] },
  { kind: 'workout', title: 'Desk reset, 10 minutes', body: 'Hip circles, cat and cow, bodyweight squats and a doorway chest stretch. Good on a rest day.', facts: '10 minutes, no equipment',
    list: ['Hip circles, 10 each way', 'Cat and cow, 10 slow rounds', 'Bodyweight squats, 2 sets of 12', 'Doorway chest stretch, 30 seconds each side'],
    steps: ['Move slowly and stay in a range that feels easy.', 'Breathe out as you go down into the squat.', 'Do it once through. A second round is optional.'] },
  { kind: 'tip', title: 'Protein with every meal', body: 'Aim for a palm of protein at each meal. It keeps you full and helps your muscles recover.',
    list: ['Breakfast: eggs, curd or paneer', 'Lunch and dinner: dal, chicken, fish, tofu or soya', 'Snacks: sprouts, roasted chana or a glass of milk'],
    steps: ['A palm-sized portion is a simple guide, no weighing needed.', 'Spreading protein across the day works better than one big serving at night.', 'Coach Vikram sets your daily target. You can see it on your Diet plan.'] },
  { kind: 'recipe', title: 'Paneer bhurji, 260 kcal', body: 'Paneer, onion and tomato in a little oil. 16 g of protein in a katori. Pair it with two rotis.', facts: '260 kcal, 16 g protein, 15 minutes',
    list: ['100 g paneer, crumbled', '1 onion and 1 tomato, chopped', '1 tsp oil, cumin, turmeric, red chilli', 'Coriander to finish'],
    steps: ['Heat the oil, add cumin, then the onion until soft.', 'Add the tomato and spices and cook for 3 minutes.', 'Add the paneer, stir for 2 minutes and finish with coriander.', 'Eat it with two rotis.'] },
  { kind: 'workout', title: 'Core finisher, 8 minutes', body: 'Three rounds of a plank, dead bugs and a side plank. Add it after any workout.', facts: '8 minutes, no equipment',
    list: ['Plank, 30 seconds', 'Dead bugs, 10 each side', 'Side plank, 20 seconds each side'],
    steps: ['Do the three moves back to back, then rest 30 seconds.', 'Repeat for 3 rounds.', 'Keep your lower back flat on the dead bugs. Stop a round early if your form slips.'] },
  { kind: 'tip', title: 'Sleep sets your goal pace', body: 'Seven hours of sleep does more for fat loss than another cardio session.',
    list: ['Aim for 7 hours in bed with the lights out', 'Same wake-up time, even on weekends', 'Screens away 30 minutes before bed'],
    steps: ['Short sleep raises hunger and makes workouts feel harder.', 'A steady wake-up time matters more than a perfect bedtime.', 'If you have a watch connected, your sleep shows on Today.'] },
  { kind: 'recipe', title: 'Sprouts chaat, 150 kcal', body: 'Moong sprouts, onion, tomato and lemon. 9 g of protein and ready in five minutes.', facts: '150 kcal, 9 g protein, 5 minutes',
    list: ['1 cup moong sprouts', '1 small onion and 1 tomato, chopped', 'Lemon juice, chaat masala, salt', 'Coriander and a green chilli, optional'],
    steps: ['Steam the sprouts for 3 minutes if you like them softer.', 'Mix with the onion, tomato and spices.', 'Squeeze lemon over it and serve at once.'] },
  { kind: 'workout', title: 'Walk and mobility, 15 minutes', body: 'A brisk ten minute walk, then five minutes of hip and shoulder mobility.', facts: '15 minutes, no equipment',
    list: ['Brisk walk, 10 minutes', 'Hip openers, 1 minute each side', 'Shoulder circles, 10 each way', 'Thoracic twists, 8 each side'],
    steps: ['Walk fast enough that you can talk but not sing.', 'Do the mobility moves slowly, with no pain.', 'Good on a rest day or before a leg day.'] },
];
export const tipOfDay = (day: number) => TIPS[day % TIPS.length];
export const TIP_LABEL: Record<Tip['kind'], string> = { tip: 'QUICK TIP', recipe: 'RECIPE FOR TODAY', workout: 'A WORKOUT TO TRY' };
// The button on the card, and the headings of the two blocks in the sheet.
export const TIP_BUTTON: Record<Tip['kind'], string> = { tip: 'Read more', recipe: 'See recipe', workout: 'See workout' };
export const TIP_HEADS: Record<Tip['kind'], [string, string]> = { tip: ['What to do', 'Why it helps'], recipe: ['Ingredients', 'Method'], workout: ['Moves', 'How to do it'] };

