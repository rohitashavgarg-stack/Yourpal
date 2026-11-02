// Self assessment. The steps and their wording come from the app's assessment flow in Figma ("Assessment", 18 steps),
// keeping the ones a member can do alone. Left out: the client's gender (the profile has it), the body composition report upload
// and the treadmill test (they need the gym's machines). The coach can enter the same form from his own app.

export type NumKey = 'height' | 'weight' | 'chest' | 'waist' | 'hip' | 'arms' | 'legs' | 'calves' | 'sleep' | 'fat' | 'bench' | 'legpress' | 'breath' | 'sys' | 'dia' | 'pulse' | 'sugar';
export type SelfEntry = { id: string; at: string; by: 'member' | 'coach'; answers: Record<string, string>; tests: Partial<Record<NumKey, number>> };

// dir: which way is better (none: it is just a size, so there is no better or worse)
export const NUMS: Record<NumKey, { label: string; unit: string; dir: 'down' | 'up' | 'none'; dp: number }> = {
  height: { label: 'Height', unit: 'cm', dir: 'none', dp: 0 },
  weight: { label: 'Weight', unit: 'kg', dir: 'down', dp: 1 },
  chest: { label: 'Chest', unit: 'cm', dir: 'none', dp: 0 },
  waist: { label: 'Waist', unit: 'cm', dir: 'down', dp: 0 },
  hip: { label: 'Hip', unit: 'cm', dir: 'none', dp: 0 },
  arms: { label: 'Arms', unit: 'cm', dir: 'none', dp: 0 },
  legs: { label: 'Legs', unit: 'cm', dir: 'none', dp: 0 },
  calves: { label: 'Calves', unit: 'cm', dir: 'none', dp: 0 },
  fat: { label: 'Body fat', unit: '%', dir: 'down', dp: 0 },
  sleep: { label: 'Sleep', unit: 'h', dir: 'up', dp: 1 },
  bench: { label: 'Bench press', unit: 'kg', dir: 'up', dp: 0 },
  legpress: { label: 'Leg press', unit: 'kg', dir: 'up', dp: 0 },
  breath: { label: 'Breath-hold', unit: 's', dir: 'up', dp: 0 },
  sys: { label: 'Systolic', unit: 'mm/hg', dir: 'down', dp: 0 },
  dia: { label: 'Diastolic', unit: 'mm/hg', dir: 'down', dp: 0 },
  pulse: { label: 'Pulse rate', unit: 'bpm', dir: 'down', dp: 0 },
  sugar: { label: 'Blood sugar', unit: 'mg/dl', dir: 'down', dp: 0 },
};

type Opt = { v: string; sub?: string; icon?: string }; // icon: only for the big cards
// ruler: drag a ruler to set the number. start is where it opens; major is how many ticks between the labelled ones.
export type Step =
  | { id: string; kind: 'height'; title: string; sub?: string }
  | { id: string; kind: 'weight'; title: string; sub?: string }
  | { id: string; kind: 'body'; title: string; sub?: string }
  | { id: string; kind: 'ruler'; title: string; sub?: string; k: NumKey; min: number; max: number; step: number; dp: number; major: number; start: number; how?: string[]; side?: boolean }
  | { id: string; kind: 'sleep'; title: string; sub?: string }
  | { id: string; kind: 'fat'; title: string; sub?: string }
  | { id: string; kind: 'water'; title: string; sub?: string }
  | { id: string; kind: 'bp'; title: string; sub?: string }
  | { id: string; kind: 'stepper'; title: string; sub?: string; k: NumKey; start: number; step: number; min: number; max: number; jumps: number[]; how?: string[] }
  | { id: string; kind: 'timer'; title: string; sub?: string; k: NumKey; how?: string[] }
  | { id: string; kind: 'choice'; title: string; sub?: string; key: string; options: Opt[]; how?: string[]; cards?: boolean; variant?: 'freq' | 'water' | 'levels' | 'flex' }
  | { id: string; kind: 'injuries'; title: string; sub: string }
  | { id: string; kind: 'next'; title: string; sub: string };

// The six body sizes, on one screen, each with an icon.
export const BODY_SIZES: NumKey[] = ['chest', 'waist', 'hip', 'arms', 'legs', 'calves'];

export const INJURY_AREAS = ['Neck', 'Shoulder', 'Arm', 'Back', 'Hip', 'Leg', 'Knee', 'Ankle', 'Foot', 'Chest'];

const BENCH = ['Lie on the bench with feet flat and grip the bar evenly.', 'Lower the bar slowly to your chest.', 'Press the bar upward in a controlled motion.', 'Stop when you reach your max reps and re-rack the bar safely.'];
const LEG = ['Sit with your back supported and feet on the platform.', 'Push the platform upward until your legs are almost straight.', 'Lower the platform slowly with control.', 'Stop when you reach your max reps and lock the safety handle.'];
const BREATH = ['Sit relaxed and take a normal breath in and out.', 'Take a deep breath and start holding.', 'Stay still and maintain calm breathing control.', 'Stop the timer when you cannot hold your breath any longer.'];
const BP_SUB = 'Please check and enter your blood pressure for better understanding. Skip it if you have no monitor.';

export const STEPS: Step[] = [
  { id: 'height', kind: 'height', title: 'Choose height' },
  { id: 'weight', kind: 'weight', title: 'Choose weight' },
  { id: 'body', kind: 'body', title: 'Body Measurements', sub: 'Track body metrics for accurate assessment' },
  { id: 'fat', kind: 'fat', title: 'Body fat %?', sub: 'Pick the range that looks most like you.' },
  { id: 'sleep', kind: 'sleep', title: 'Sleep duration', sub: 'To provide you with the best results, tell us how long you sleep at night.' },
  { id: 'activity', kind: 'choice', cards: true, title: 'Activity Level', key: 'activity', options: [{ v: 'Not active', icon: 'armchair' }, { v: 'Lightly active', icon: 'footprints' }, { v: 'Moderately active', icon: 'person' }, { v: 'Somewhat athletic', icon: 'activity' }, { v: 'Very athletic', icon: 'dumbbell' }] },
  { id: 'freq', kind: 'choice', variant: 'freq', title: 'Workout Frequency per week', key: 'freq', options: [{ v: '1', sub: 'Day per week' }, { v: '2', sub: 'Days per week' }, { v: '3', sub: 'Days per week' }, { v: '4', sub: 'Days per week' }, { v: '5', sub: 'Days per week' }, { v: "I don't workout" }] },
  { id: 'water', kind: 'water', title: 'How much water do you drink in a day?' },
  { id: 'level', kind: 'choice', variant: 'levels', title: 'Training Level', key: 'level', options: [{ v: 'Beginner', sub: 'New to fitness training' }, { v: 'Intermediate', sub: 'Workout regularly' }, { v: 'Advanced', sub: 'Seasoned athlete seeking new challenges' }] },
  { id: 'bench', kind: 'ruler', title: 'Bench Press Test', sub: 'The most weight you lifted.', k: 'bench', min: 0, max: 200, step: 2.5, dp: 1, major: 4, start: 40, how: BENCH },
  { id: 'legpress', kind: 'ruler', side: true, title: 'Leg Press Test', sub: 'The most weight you pressed.', k: 'legpress', min: 0, max: 400, step: 5, dp: 0, major: 4, start: 100, how: LEG },
  { id: 'flex', kind: 'choice', variant: 'flex', title: 'Flexibility Test', sub: 'Sit & Reach Flexibility Test helps to find the flexibility', key: 'flex', options: ['Poor', 'Moderate', 'Good', 'Very Good', 'Excellent'].map((v) => ({ v })), how: ['Sit with legs straight and feet against the box.', 'Start when you are ready.', 'Reach forward as far as you can and hold for 2 seconds.', 'Note how far you reached, then pick the closest picture.'] },
  { id: 'breath', kind: 'timer', title: 'Breath-Hold Test', sub: 'Check breath-hold endurance. Time how long you can hold your breath.', k: 'breath', how: BREATH },
  { id: 'injuries', kind: 'injuries', title: 'Injuries & Diseases', sub: 'Please mention any existing injuries for better assessment' },
  { id: 'bp', kind: 'bp', title: 'Blood Pressure', sub: BP_SUB },
  { id: 'sugar', kind: 'ruler', title: 'Blood Glucose', sub: 'Please check and enter your blood sugar for better understanding. Skip it if you have no meter.', k: 'sugar', min: 50, max: 300, step: 1, dp: 0, major: 10, start: 100 },
  { id: 'next', kind: 'next', title: 'Next assessment', sub: 'When would you like to take the next assessment?' },
];

// The assessment the coach did on 30 Sep, so there is something to compare a first self assessment with.
export const COACH_SAMPLE: SelfEntry = {
  id: 'coach-1', at: '2026-09-30T10:00:00.000Z', by: 'coach',
  answers: { activity: 'Moderately active', freq: '3', water: '1-2 l', level: 'Beginner', flex: 'Moderate', injuries: 'None' },
  tests: { weight: 72.4, chest: 98, waist: 89, hip: 99, arms: 31, legs: 56, calves: 36, sleep: 7, bench: 40, legpress: 120, breath: 35, sys: 124, dia: 82, pulse: 72 },
};

export const fmtAt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Each measurement the entry has, with the change since the other one and whether it is an improvement (sizes have no better or worse). */
export function compare(now: SelfEntry, prev: SelfEntry | undefined) {
  return (Object.keys(NUMS) as NumKey[]).flatMap((k) => {
    const a = now.tests[k];
    if (a == null) return [];
    const n = NUMS[k];
    const b = prev?.tests[k];
    if (b == null) return [{ k, n, now: a, prev: undefined as number | undefined, diff: 0, good: false }];
    const diff = Math.round((a - b) * 10 ** n.dp) / 10 ** n.dp;
    return [{ k, n, now: a, prev: b, diff, good: n.dir === 'down' ? diff < 0 : n.dir === 'up' ? diff > 0 : false }];
  });
}

export const habitLabel: Record<string, string> = { fat: 'Body fat', activity: 'Activity', freq: 'Workouts a week', water: 'Water', level: 'Level', flex: 'Flexibility', injuries: 'Injuries' };
