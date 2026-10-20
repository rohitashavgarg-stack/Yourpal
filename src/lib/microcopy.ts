// Every line the app says to the member that is not a label lives here, so the voice can be read and changed in one place.
// Voice: a coach who noticed something. Fact first. No emoji, no exclamation marks, no guilt, no fake cheer. English only.

export type TodayCtx = {
  min: number;                                   // minutes since midnight
  planned: number;                               // planned workout time, minutes
  workout: 'hidden' | 'rest' | 'done' | 'live' | 'todo';
  nextMeal: string | null;                       // the next meal still to log, or null when all are logged
  weeks: number;                                 // weekly streak
  weekDone: number;
  target: number;
  paused: boolean;                               // expired membership: view only
  day: number;                                   // day of month, rotates the variants
  clock: (min: number) => string;                // "6:30 pm"
};

// The top of Today is two lines in one quiet grey: a greeting with the name ("Hey! Rohitashav"), then a line whose key phrase is brighter
// ("It's your" in grey, "Leg day" in white). The name is only in the first line. The day of the month rotates the greeting wording.
export type Greeting = { top: string; lead: string; hl: string };

const pick = (day: number, key: number, list: string[]) => list[(day + key) % list.length];
// short, so the first line stays on one line at 32 px even with a long name
const timeGreet = (_c: TodayCtx) => ['Hey! {n}', 'Hello! {n}'];
const withName = (line: string, first: string) => (first ? line.replace('{n}', first) : line.replace(/! ?\{n\}/, '!').trim());

export function greeting(c: TodayCtx, first: string): Greeting {
  const g = (list: string[], key: number, lead: string, hl: string): Greeting => ({ top: withName(pick(c.day, key, list), first), lead, hl });
  if (c.paused) return g(timeGreet(c), 0, '', 'History is safe');
  if (c.workout === 'live') return g(['Keep going! {n}', 'Hey! {n}'], 1, 'Workout', 'in progress');
  if (c.workout === 'rest') return g(timeGreet(c), 2, "It's your", 'rest day');
  if (c.workout === 'done') return c.weeks > 0 ? g(['Good job! {n}', 'Well done! {n}'], 3, '', `${c.weeks} week streak`) : g(['Good job! {n}', 'Well done! {n}'], 3, 'Workout', 'done');
  if (c.workout === 'todo' && c.min < c.planned) return g(timeGreet(c), 4, "It's your", 'Leg day');
  if (c.nextMeal) return g(timeGreet(c), 5, 'Next up is', c.nextMeal);
  return g(timeGreet(c), 6, '', `${c.weekDone} of ${c.target} this week`);
}

// The demo panel previews every state of the greeting. Each one is a context that makes it return that moment's text.
export const GREETING_STATES = ['Auto', 'Workout live', 'Workout soon', 'Workout later today', 'Workout done with streak', 'Workout done, no streak', 'Rest day', 'Meal next', 'Week progress with streak', 'Week progress, no streak', 'Membership expired'] as const;
export type GreetingState = (typeof GREETING_STATES)[number];
export function forceCtx(c: TodayCtx, k: GreetingState): TodayCtx {
  const b = { ...c, paused: false, nextMeal: null as string | null };
  switch (k) {
    case 'Workout live': return { ...b, workout: 'live' };
    case 'Workout soon': return { ...b, workout: 'todo', min: c.planned - 90 };
    case 'Workout later today': return { ...b, workout: 'todo', min: c.planned - 360 };
    case 'Workout done with streak': return { ...b, workout: 'done', weeks: 3 };
    case 'Workout done, no streak': return { ...b, workout: 'done', weeks: 0, weekDone: 1 };
    case 'Rest day': return { ...b, workout: 'rest' };
    case 'Meal next': return { ...b, workout: 'hidden', nextMeal: 'Lunch' };
    case 'Week progress with streak': return { ...b, workout: 'hidden', weeks: 3, weekDone: 2 };
    case 'Week progress, no streak': return { ...b, workout: 'hidden', weeks: 0, weekDone: 2 };
    case 'Membership expired': return { ...b, paused: true };
    default: return c;
  }
}
