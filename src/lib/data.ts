// Mock content for the prototype backend. One source of truth for every screen.

export type FoodType = 'veg' | 'egg' | 'nv';
export type MealItem = { n: string; q: string; k: number; p: number; c: number; f: number; type: FoodType };
export type MealId = 'bf' | 'lu' | 'sn' | 'dn';
export type Meal = { id: MealId; n: string; t: number; items: MealItem[] };

export const KCAL_TARGET = 1800;
export const MACRO_TARGET = { p: 90, c: 230, f: 60 };

export const MEALS: Meal[] = [
  { id: 'bf', n: 'Breakfast', t: 480, items: [
    { n: 'Poha with peanuts', q: '1 plate', k: 310, p: 8, c: 52, f: 11, type: 'veg' },
    { n: 'Curd', q: '1 katori', k: 100, p: 6, c: 7, f: 5, type: 'veg' },
  ] },
  { id: 'lu', n: 'Lunch', t: 810, items: [
    { n: 'Roti', q: '2', k: 140, p: 4, c: 26, f: 1, type: 'veg' },
    { n: 'Dal tadka', q: '1 katori', k: 160, p: 9, c: 20, f: 4, type: 'veg' },
    { n: 'Mixed sabzi', q: '1 katori', k: 120, p: 3, c: 14, f: 6, type: 'veg' },
    { n: 'Curd', q: '1 katori', k: 100, p: 6, c: 7, f: 5, type: 'veg' },
  ] },
  { id: 'sn', n: 'Evening snack', t: 1020, items: [
    { n: 'Sprouts chaat', q: '1 bowl', k: 180, p: 10, c: 26, f: 2, type: 'veg' },
    { n: 'Almonds', q: '5', k: 35, p: 1, c: 1, f: 3, type: 'veg' },
    { n: 'Green tea', q: '1 cup', k: 5, p: 0, c: 1, f: 0, type: 'veg' },
  ] },
  { id: 'dn', n: 'Dinner', t: 1230, items: [
    { n: 'Paneer bhurji', q: '100 g', k: 290, p: 18, c: 8, f: 22, type: 'veg' },
    { n: 'Roti', q: '2', k: 140, p: 4, c: 26, f: 1, type: 'veg' },
    { n: 'Dal', q: '1 katori', k: 160, p: 9, c: 20, f: 4, type: 'veg' },
    { n: 'Salad', q: '1 bowl', k: 60, p: 2, c: 11, f: 0, type: 'veg' },
  ] },
];

// Per-diet swaps for the planned items (Plans → Diet uses these for "swap").
export const SWAPS: Record<string, { n: string; q: string; k: number; p: number; type: FoodType; coach?: boolean }[]> = {
  Roti: [{ n: 'Jowar roti', q: '2', k: 160, p: 5, type: 'veg', coach: true }, { n: 'Rice', q: '1 bowl', k: 150, p: 3, type: 'veg' }, { n: 'Plain paratha', q: '1', k: 180, p: 4, type: 'veg' }],
  'Dal tadka': [{ n: 'Rajma', q: '1 katori', k: 160, p: 9, type: 'veg', coach: true }, { n: 'Chana', q: '1 katori', k: 155, p: 8, type: 'veg' }, { n: 'Boiled eggs', q: '2', k: 150, p: 12, type: 'egg' }],
  Dal: [{ n: 'Rajma', q: '1 katori', k: 160, p: 9, type: 'veg', coach: true }, { n: 'Chana', q: '1 katori', k: 155, p: 8, type: 'veg' }],
  'Paneer bhurji': [{ n: 'Soya chunks', q: '40 g', k: 150, p: 14, type: 'veg', coach: true }, { n: 'Egg bhurji', q: '3 eggs', k: 210, p: 18, type: 'egg' }, { n: 'Chicken curry', q: '100 g', k: 190, p: 18, type: 'nv' }],
  any: [{ n: 'Curd', q: '200 g', k: 120, p: 7, type: 'veg' }, { n: 'Fruit', q: '1', k: 80, p: 1, type: 'veg' }, { n: 'Sprouts', q: '1 bowl', k: 120, p: 8, type: 'veg' }],
};

export type CatalogItem = { n: string; k: number; p: number; type?: FoodType };
export const CATALOG: CatalogItem[] = [
  { n: 'Curd, 1 katori', k: 100, p: 6 }, { n: 'Masala chai, 1 cup', k: 90, p: 3 }, { n: 'Roti, 1', k: 70, p: 2 }, { n: 'Banana, 1', k: 105, p: 1 },
  { n: 'Dal tadka, 1 katori', k: 160, p: 9 }, { n: 'Poha, 1 plate', k: 250, p: 5 }, { n: 'Idli, 2 pieces', k: 150, p: 4 }, { n: 'Masala dosa, 1', k: 350, p: 6 },
  { n: 'Rajma chawal, 1 plate', k: 420, p: 14 }, { n: 'Paneer bhurji, 100 g', k: 260, p: 16 }, { n: 'Sprouts chaat, 1 bowl', k: 150, p: 9 }, { n: 'Veg sandwich, 1', k: 230, p: 7 },
  { n: 'Samosa, 1', k: 260, p: 4 }, { n: 'Milk, 1 cup', k: 150, p: 8 }, { n: 'Boiled eggs, 2', k: 150, p: 12, type: 'egg' }, { n: 'Oats, 1 bowl', k: 150, p: 5 },
  { n: 'Chicken biryani, 1 plate', k: 500, p: 22, type: 'nv' },
];

// Parses "2 roti, 1 cup milk, 100 g paneer" into items with estimates.
const DB: [string, number, number, boolean?][] = [['roti', 70, 2], ['chapati', 70, 2], ['paratha', 180, 4], ['rice', 200, 4], ['dal', 160, 9], ['milk', 150, 8], ['curd', 100, 6], ['dahi', 100, 6], ['egg', 75, 6], ['banana', 105, 1], ['apple', 95, 0], ['poha', 250, 5], ['idli', 75, 2], ['dosa', 350, 6], ['paneer', 260, 16, true], ['chicken', 240, 27, true], ['sabzi', 120, 3], ['salad', 60, 2], ['chai', 90, 3], ['tea', 90, 3], ['coffee', 80, 3], ['bread', 80, 3], ['sandwich', 230, 7], ['samosa', 260, 4], ['biryani', 500, 20], ['oats', 150, 5], ['sprouts', 150, 9], ['pav bhaji', 400, 10], ['rajma', 160, 9], ['almond', 7, 0.3], ['peanut', 6, 0.3], ['whey', 120, 24]];
const NUM: Record<string, number> = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, half: 0.5, '½': 0.5 };
export type Parsed = { n: string; k: number; p: number; est: boolean };
export function parseFood(txt: string): Parsed[] {
  return (txt || '').split(/,|\band\b|\n/).map((c) => c.trim()).filter(Boolean).map((c) => {
    let low = c.toLowerCase(); let q = 1; let unit = '';
    const m = low.match(/^(\d+(?:\.\d+)?|½|half|an?|one|two|three|four)\s*/);
    if (m) { q = NUM[m[1]] ?? parseFloat(m[1]); low = low.slice(m[0].length); }
    const u = low.match(/^(cups?|katoris?|bowls?|plates?|glass(?:es)?|slices?|pieces?|pcs|g|gm|grams?)\b\s*(of\s+)?/);
    if (u) { unit = u[1]; low = low.slice(u[0].length); }
    const f = DB.find((d) => low.includes(d[0]));
    const grams = /^(g|gm|grams?)$/.test(unit);
    let mult = grams ? q / 100 : q;
    if (f && grams && !f[3]) mult = (q / 100) * 1.4;
    const k = f ? Math.round(f[1] * mult) : Math.round(200 * (grams ? q / 150 : q));
    const p = f ? Math.round(f[2] * mult) : Math.round(6 * (grams ? q / 150 : q));
    return { n: c.charAt(0).toUpperCase() + c.slice(1), k, p, est: !f };
  });
}
export const SCAN_RESULT: Parsed[] = [{ n: 'Rajma chawal, 1 plate', k: 420, p: 14, est: true }, { n: 'Roti, 1', k: 70, p: 2, est: true }];

// ---------- Food details (macros, micros, ingredients, recipe) ----------
export type FoodInfo = { d: string; c: number; f: number; fi: number; mic: [string, string, number][]; ing: [string, string, number][]; st: string[]; t: string; tip: string };
export const FOOD_DB: Record<string, FoodInfo> = {
  'Poha with peanuts': { d: 'Flattened rice tempered with mustard seeds, curry leaves and peanuts. Light, quick energy for the morning.', c: 52, f: 11, fi: 3, mic: [['Fibre', '3 g', 11], ['Iron', '5.2 mg', 29], ['Vitamin C', '9 mg', 10], ['Calcium', '40 mg', 4], ['Sodium', '380 mg', 17], ['Potassium', '310 mg', 7]], ing: [['Poha (flattened rice)', '1 cup', 180], ['Peanuts', '1 tbsp', 55], ['Onion', '½', 20], ['Oil', '1 tsp', 40], ['Curry leaves, mustard, turmeric', 'to taste', 5], ['Lemon', '½', 10]], st: ['Rinse the poha in a strainer and let it soften for 2 minutes.', 'Heat oil, crackle mustard seeds and curry leaves, then roast the peanuts.', 'Add onion and turmeric, cook for 2 minutes.', 'Stir in the poha and salt, cover for 2 minutes. Finish with lemon.'], t: '15 min · serves 1', tip: 'Add peas or a boiled egg on the side for more protein.' },
  'Curd': { d: 'Plain homemade curd. Good protein and probiotics, cools the stomach.', c: 7, f: 5, fi: 0, mic: [['Calcium', '180 mg', 14], ['Vitamin B12', '0.6 µg', 25], ['Phosphorus', '140 mg', 11], ['Potassium', '230 mg', 5], ['Sodium', '60 mg', 3], ['Fibre', '0 g', 0]], ing: [['Toned milk curd', '1 katori (150 g)', 100]], st: ['Serve chilled. Add roasted jeera powder and a pinch of salt if you like.'], t: '1 min', tip: 'Choose curd over raita with boondi to keep it light.' },
  'Roti': { d: 'Whole wheat flatbread. Fibre-rich and a steady source of energy.', c: 26, f: 1, fi: 4, mic: [['Fibre', '4 g', 14], ['Iron', '1.8 mg', 10], ['Magnesium', '44 mg', 11], ['Vitamin B1', '0.2 mg', 17], ['Sodium', '120 mg', 5], ['Potassium', '140 mg', 3]], ing: [['Whole wheat atta', '60 g', 205], ['Water', 'as needed', 0], ['Ghee (optional)', '½ tsp', 20]], st: ['Knead the atta with water into a soft dough and rest 15 minutes.', 'Roll into thin circles.', 'Cook on a hot tawa, flip, and puff on the flame.'], t: '20 min · makes 2', tip: 'Skip the ghee on weekdays; it saves about 40 kcal a day.' },
  'Dal tadka': { d: 'Yellow lentils tempered with cumin, garlic and chilli. Your main plant protein at lunch.', c: 20, f: 4, fi: 5, mic: [['Fibre', '5 g', 18], ['Iron', '2.6 mg', 14], ['Folate', '120 µg', 30], ['Potassium', '360 mg', 8], ['Magnesium', '40 mg', 10], ['Sodium', '420 mg', 18]], ing: [['Toor + moong dal', '40 g dry', 140], ['Tomato, onion', '½ each', 20], ['Ghee / oil', '1 tsp', 40], ['Cumin, garlic, chilli', 'to taste', 5]], st: ['Pressure cook the dal with turmeric for 3 whistles.', 'Cook onion and tomato until soft, add the dal.', 'Temper cumin and garlic in hot ghee and pour over.'], t: '25 min · serves 2', tip: 'A thicker dal fills you up more for the same calories.' },
  'Mixed sabzi': { d: 'Seasonal vegetables cooked with light spices. Fibre and micronutrients with few calories.', c: 14, f: 6, fi: 4, mic: [['Fibre', '4 g', 14], ['Vitamin A', '320 µg', 36], ['Vitamin C', '28 mg', 31], ['Potassium', '380 mg', 8], ['Iron', '1.4 mg', 8], ['Sodium', '300 mg', 13]], ing: [['Mixed vegetables', '150 g', 70], ['Oil', '1 tsp', 40], ['Spices', 'to taste', 10]], st: ['Chop the vegetables into even pieces.', 'Cook with oil, cumin and spices on medium heat, covered, until tender.'], t: '20 min · serves 2', tip: 'Fill half your plate with sabzi before adding roti.' },
  'Sprouts chaat': { d: 'Moong sprouts with onion, tomato, lemon and chaat masala. High protein, high fibre snack.', c: 26, f: 2, fi: 6, mic: [['Fibre', '6 g', 21], ['Folate', '150 µg', 38], ['Vitamin C', '16 mg', 18], ['Iron', '1.9 mg', 11], ['Potassium', '330 mg', 7], ['Sodium', '260 mg', 11]], ing: [['Moong sprouts', '1 cup', 120], ['Onion, tomato, cucumber', '¼ cup', 25], ['Lemon, chaat masala', 'to taste', 5], ['Coriander', 'a handful', 0]], st: ['Steam the sprouts for 5 minutes (optional).', 'Mix with the chopped vegetables.', 'Season with lemon, salt and chaat masala.'], t: '10 min · serves 1', tip: 'Great 60–90 minutes before your workout.' },
  'Almonds': { d: 'A small handful of raw almonds. Healthy fats and vitamin E.', c: 1, f: 3, fi: 1, mic: [['Vitamin E', '1.8 mg', 12], ['Magnesium', '19 mg', 5], ['Fibre', '0.8 g', 3], ['Calcium', '17 mg', 1], ['Iron', '0.2 mg', 1], ['Sodium', '0 mg', 0]], ing: [['Raw almonds', '5 pieces', 35]], st: ['Soak overnight for easier digestion, or eat as they are.'], t: '—', tip: 'Five is the right number. Almonds add up fast.' },
  'Green tea': { d: 'Unsweetened green tea. Almost no calories, keeps you hydrated.', c: 1, f: 0, fi: 0, mic: [['Potassium', '20 mg', 0], ['Sodium', '2 mg', 0], ['Fibre', '0 g', 0]], ing: [['Green tea', '1 bag', 2], ['Hot water', '1 cup', 0]], st: ['Steep in water just off the boil for 2–3 minutes.'], t: '3 min', tip: 'Skip sugar and honey to keep it near zero.' },
  'Paneer bhurji': { d: 'Crumbled paneer cooked with onion, tomato and spices. Your biggest protein source at dinner.', c: 8, f: 22, fi: 1, mic: [['Calcium', '420 mg', 32], ['Vitamin B12', '0.8 µg', 33], ['Phosphorus', '300 mg', 24], ['Sodium', '380 mg', 17], ['Potassium', '180 mg', 4], ['Fibre', '1 g', 4]], ing: [['Paneer', '100 g', 260], ['Onion, tomato, capsicum', '½ cup', 30], ['Oil', '½ tsp', 20], ['Spices', 'to taste', 5]], st: ['Cook onion and capsicum in oil until soft.', 'Add tomato and spices, cook 3 minutes.', 'Crumble in the paneer and toss for 2 minutes.'], t: '15 min · serves 1', tip: 'Low-fat paneer saves about 80 kcal with the same protein.' },
  'Dal': { d: 'Home-style yellow dal. Plant protein and fibre for dinner.', c: 20, f: 4, fi: 5, mic: [['Fibre', '5 g', 18], ['Iron', '2.6 mg', 14], ['Folate', '120 µg', 30], ['Potassium', '360 mg', 8], ['Magnesium', '40 mg', 10], ['Sodium', '400 mg', 17]], ing: [['Toor dal', '40 g dry', 140], ['Tomato', '½', 10], ['Ghee / oil', '1 tsp', 40]], st: ['Pressure cook the dal with turmeric and salt.', 'Temper with cumin and pour over.'], t: '25 min · serves 2', tip: 'Pair with salad first; it slows down how fast you eat.' },
  'Salad': { d: 'Cucumber, carrot, tomato and onion with lemon. Crunch and fibre for almost no calories.', c: 11, f: 0, fi: 3, mic: [['Vitamin A', '400 µg', 44], ['Vitamin C', '20 mg', 22], ['Fibre', '3 g', 11], ['Potassium', '350 mg', 7], ['Sodium', '40 mg', 2], ['Iron', '0.6 mg', 3]], ing: [['Cucumber, carrot, tomato, onion', '1 bowl', 55], ['Lemon, salt, pepper', 'to taste', 5]], st: ['Chop everything, toss with lemon, salt and pepper just before eating.'], t: '5 min', tip: 'Eat this first at dinner.' }
};

// ---------- Workouts ----------
export type Mode = 'rw' | 'r' | 't' | 'tw'; // reps+weight, reps, time, time+weight
export type SetT = { r: number; k: number; t: number; w: boolean; st: 'todo' | 'done' | 'skipped'; dr?: number; dk?: number; dt?: number; note?: string };
export type Ex = { id: string; name: string; mode: Mode; step: number; last?: string; alts: { n: string; s: string }[]; cue: string; muscles: string; sets: SetT[]; swapped?: boolean };
export type ListItem = { id: string; n: string; sub: string; t?: number };

const S = (r: number, k: number, t = 0, w = false): SetT => ({ r, k, t, w, st: 'todo' });
export function legDay(): Ex[] {
  return [
    { id: 'sq', name: 'Squat', mode: 'rw', step: 2.5, last: 'Last time: 4 × 8 · 57.5 kg', muscles: 'Quads · glutes · core', cue: 'Feet shoulder-width, chest up, knees track over toes. Go to parallel.', alts: [{ n: 'Goblet squat', s: 'Coach-approved' }, { n: 'Leg press', s: 'Coach-approved' }, { n: 'Box squat', s: 'Easier on the knees' }], sets: [S(8, 60), S(8, 60), S(8, 60), S(8, 60)] },
    { id: 'lp', name: 'Leg press', mode: 'rw', step: 5, last: 'Last time: 3 × 12 · 110 kg', muscles: 'Quads · glutes', cue: "Lower back stays on the pad. Don't lock your knees at the top.", alts: [{ n: 'Hack squat', s: 'Same muscles' }], sets: [S(12, 120), S(12, 120), S(12, 120)] },
    { id: 'wl', name: 'Walking lunges', mode: 'r', step: 1, muscles: 'Quads · glutes · balance', cue: 'Long step, back knee just above the floor, stay tall.', alts: [{ n: 'Split squat', s: 'Stays in one place' }], sets: [S(10, 0), S(10, 0), S(10, 0)] },
    { id: 'lc', name: 'Leg curl', mode: 'rw', step: 2.5, last: 'Last time: 3 × 12 · 27.5 kg', muscles: 'Hamstrings', cue: 'Slow on the way down, 3 seconds.', alts: [{ n: 'Romanian deadlift', s: 'Coach-approved' }], sets: [S(12, 30), S(12, 30), S(12, 30)] },
    { id: 'fc', name: "Farmer's carry", mode: 'tw', step: 2.5, muscles: 'Grip · core · traps', cue: 'Shoulders down and back, short quick steps.', alts: [], sets: [S(0, 20, 40), S(0, 20, 40), S(0, 20, 40)] },
    { id: 'pk', name: 'Plank', mode: 't', step: 1, muscles: 'Core', cue: 'Straight line from head to heels. Squeeze glutes.', alts: [{ n: 'Dead bug', s: 'Easier on the lower back' }], sets: [S(0, 0, 45), S(0, 0, 45), S(0, 0, 45)] },
  ];
}
export const WARMUP: ListItem[] = [{ id: 'w1', n: 'Jumping jacks', sub: '20 reps' }, { id: 'w2', n: 'Bodyweight squats', sub: '20 reps' }, { id: 'w3', n: 'Leg swings', sub: '10 each side' }, { id: 'w4', n: 'Hip circles', sub: '30 s · no count needed', t: 30 }];
export const COOLDOWN: ListItem[] = [{ id: 'c1', n: 'Quad stretch', sub: '30 s each side', t: 30 }, { id: 'c2', n: 'Hamstring stretch', sub: '30 s', t: 30 }, { id: 'c3', n: 'Cat–cow', sub: 'About 10 slow rounds · no need to count' }, { id: 'c4', n: "Child's pose", sub: '45 s · breathe slowly', t: 45 }];

// Weekly plan (Mon=0 … Sun=6). Today is Wed (2).
export type PlanEx = { id: string; name: string; sets: number; reps: number; kg: number; mode: Mode; t?: number; by?: 'you' | 'coach' };
export type PlanDay = { name: string; time: string; wu: { n: string; s: string }[]; cd: { n: string; s: string }[]; ex: PlanEx[]; done?: string } | null;
export const TODAY_IDX = 2;
export const WEEK = [{ d: 'Mon', num: 22 }, { d: 'Tue', num: 23 }, { d: 'Wed', num: 24 }, { d: 'Thu', num: 25 }, { d: 'Fri', num: 26 }, { d: 'Sat', num: 27 }, { d: 'Sun', num: 28 }];
export function basePlans(): Record<number, PlanDay> {
  return {
    0: { name: 'Push', time: '6:30 pm', done: 'Done 6:40 – 7:25 pm · 2 PRs', wu: [{ n: 'Push-ups', s: '20 reps' }, { n: 'Jumping jacks', s: '20 reps' }, { n: 'Arm circles', s: '30 s' }], cd: [{ n: 'Chest stretch', s: '30 s each side' }, { n: 'Cat–cow', s: 'About 10 slow rounds' }, { n: "Child's pose", s: '45 s' }], ex: [{ id: 'bp', name: 'Bench press', sets: 4, reps: 8, kg: 55, mode: 'rw' }, { id: 'sp', name: 'Shoulder press', sets: 3, reps: 10, kg: 20, mode: 'rw' }, { id: 'ip', name: 'Incline DB press', sets: 3, reps: 10, kg: 18, mode: 'rw' }, { id: 'tp', name: 'Tricep pushdown', sets: 3, reps: 12, kg: 20, mode: 'rw' }] },
    1: null,
    2: { name: 'Leg day', time: '6:30 pm', wu: WARMUP.map((w) => ({ n: w.n, s: w.sub })), cd: COOLDOWN.map((w) => ({ n: w.n, s: w.sub })), ex: [{ id: 'sq', name: 'Squat', sets: 4, reps: 8, kg: 60, mode: 'rw' }, { id: 'lp', name: 'Leg press', sets: 3, reps: 12, kg: 120, mode: 'rw' }, { id: 'wl', name: 'Walking lunges', sets: 3, reps: 10, kg: 0, mode: 'r', by: 'you' }, { id: 'lc', name: 'Leg curl', sets: 3, reps: 12, kg: 30, mode: 'rw' }, { id: 'fc', name: "Farmer's carry", sets: 3, reps: 0, kg: 20, mode: 'tw', t: 40 }, { id: 'pk', name: 'Plank', sets: 3, reps: 0, kg: 0, mode: 't', t: 45 }] },
    3: { name: 'Pull', time: '6:30 pm', wu: [{ n: 'Band pull-aparts', s: '15 reps' }, { n: 'Jumping jacks', s: '20 reps' }, { n: 'Cat–cow', s: 'About 10 slow rounds' }], cd: [{ n: 'Lat stretch', s: '30 s each side' }, { n: "Child's pose", s: '45 s' }], ex: [{ id: 'dl', name: 'Deadlift', sets: 3, reps: 5, kg: 80, mode: 'rw' }, { id: 'lt', name: 'Lat pulldown', sets: 3, reps: 10, kg: 45, mode: 'rw' }, { id: 'sr', name: 'Seated row', sets: 3, reps: 12, kg: 40, mode: 'rw' }, { id: 'fp', name: 'Face pull', sets: 3, reps: 15, kg: 15, mode: 'rw' }, { id: 'bc', name: 'Bicep curl', sets: 3, reps: 12, kg: 10, mode: 'rw' }] },
    4: null,
    5: { name: 'Full body', time: '9:00 am', wu: [{ n: 'Jumping jacks', s: '30 reps' }, { n: 'Inchworms', s: '8 reps' }], cd: [{ n: 'Full body stretch', s: '3 min' }], ex: [{ id: 'gs', name: 'Goblet squat', sets: 3, reps: 12, kg: 16, mode: 'rw' }, { id: 'pu', name: 'Push-ups', sets: 3, reps: 12, kg: 0, mode: 'r' }, { id: 'rw', name: 'DB row', sets: 3, reps: 10, kg: 14, mode: 'rw' }, { id: 'pk2', name: 'Plank', sets: 3, reps: 0, kg: 0, mode: 't', t: 40 }] },
    6: null,
  };
}
export const LIBRARY = [
  { n: 'Bench press', g: 'Chest' }, { n: 'Incline DB press', g: 'Chest' }, { n: 'Push-ups', g: 'Chest' }, { n: 'Lat pulldown', g: 'Back' }, { n: 'Seated row', g: 'Back' }, { n: 'Deadlift', g: 'Back' },
  { n: 'Squat', g: 'Legs' }, { n: 'Leg press', g: 'Legs' }, { n: 'Leg curl', g: 'Legs' }, { n: 'Walking lunges', g: 'Legs' }, { n: 'Shoulder press', g: 'Shoulders' }, { n: 'Lateral raise', g: 'Shoulders' },
  { n: 'Bicep curl', g: 'Arms' }, { n: 'Tricep pushdown', g: 'Arms' }, { n: 'Plank', g: 'Core' }, { n: 'Dead bug', g: 'Core' },
];

// ---------- Progress / Gym mock ----------
export const WEIGHT_TREND = [74.5, 74.2, 74.0, 73.8, 73.6, 73.5, 73.1, 72.9, 72.8, 72.7, 72.6, 72.4];
export const LIFTS = [
  { n: 'Squat', pts: [40, 45, 47.5, 50, 52.5, 55, 57.5, 60], unit: 'kg', pr: '60 kg × 8 · Mon 22' },
  { n: 'Bench press', pts: [35, 37.5, 40, 42.5, 45, 47.5, 50, 55], unit: 'kg', pr: '55 kg × 8 · Mon 22' },
  { n: 'Deadlift', pts: [50, 55, 60, 65, 70, 72.5, 75, 80], unit: 'kg', pr: '80 kg × 5 · Thu 18' },
];
export const ASSESSMENTS = [
  { g: 'Body', rows: [['Weight', '74.5 kg', '72.4 kg', '−2.1 kg', 1], ['Waist', '92 cm', '89 cm', '−3 cm', 1], ['Body fat', '27%', '25.5%', '−1.5%', 1]] },
  { g: 'Strength', rows: [['Squat · 5 reps', '40 kg', '60 kg', '+20 kg', 1], ['Push-ups · 1 set', '12', '18', '+6', 1]] },
  { g: 'Mobility & fitness', rows: [['Deep squat hold', '30 s', '45 s', '+15 s', 1], ['Sit-and-reach', '−4 cm', '−4 cm', 'Same', 0], ['Resting heart rate', '78 bpm', '72 bpm', '−6 bpm', 1]] },
] as { g: string; rows: [string, string, string, string, number][] }[];

export function fmtT(min: number) {
  const h = Math.floor(min / 60) % 24, mm = min % 60, ap = h >= 12 ? 'pm' : 'am', h12 = h % 12 === 0 ? 12 : h % 12;
  const hm = `${h12}:${mm < 10 ? '0' : ''}${mm}`;
  return { hm, ap, full: `${hm} ${ap}` };
}
export function dur(d: number) { const h = Math.floor(d / 60), m = d % 60; return `${h ? h + ' h' : ''}${h && m ? ' ' : ''}${m ? m + ' min' : ''}` || '0 min'; }
