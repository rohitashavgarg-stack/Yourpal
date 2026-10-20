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

// The top of Today is one big line with the name in it, whatever the state: "It's your rest day, Rohitashav", "3 week streak, Rohitashav".
// The day of the month rotates the wording so it is not the same on every open. Without a first name the name is dropped.
export type Greeting = { big: string };

const pick = (day: number, key: number, list: string[]) => list[(day + key) % list.length];
const timeGreet = (c: TodayCtx) => (c.min < 12 * 60 ? ['Good morning, {n}', 'Morning, {n}', 'Hey {n}'] : c.min < 17 * 60 ? ['Good afternoon, {n}', 'Hey {n}', 'Afternoon, {n}'] : ['Good evening, {n}', 'Evening, {n}', 'Hey {n}']);
const withName = (line: string, first: string) => (first ? line.replace('{n}', first) : line.replace(/,? ?\{n\}/, '').trim() || 'Hey');

export function greeting(c: TodayCtx, first: string): Greeting {
  const n = (line: string) => ({ big: withName(line, first) });
  if (c.paused) return n(pick(c.day, 0, timeGreet(c)));                                                       // expired: just the greeting
  if (c.workout === 'live') return n(pick(c.day, 1, ['Keep going, {n}', 'Strong set, {n}']));
  if (c.workout === 'rest') return n(pick(c.day, 2, ["It's your rest day, {n}", 'Easy day today, {n}']));
  if (c.workout === 'done') {
    return c.weeks > 0 ? n(pick(c.day, 3, [`${c.weeks} week streak, {n}`, 'Good job, {n}', 'Workout done, {n}']))
      : n(pick(c.day, 3, ['Workout done, {n}', 'Good job, {n}']));
  }
  if (c.workout === 'todo' && c.min < c.planned) {
    return c.planned - c.min <= 120 ? n(pick(c.day, 4, ['Almost time, {n}', 'Get ready, {n}'])) : n(pick(c.day, 4, ['Leg day today, {n}', ...timeGreet(c)]));
  }
  if (c.nextMeal) return n(pick(c.day, 5, [`${c.nextMeal} is next, {n}`, ...timeGreet(c)]));
  return n(pick(c.day, 6, timeGreet(c)));
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
