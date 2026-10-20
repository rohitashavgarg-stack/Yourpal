// Every line the app says to the member that is not a label lives here, so the voice can be read and changed in one place.
// Voice: a coach who noticed something. Fact first, then the smallest next step. No emoji, no exclamation marks, no guilt, no fake cheer. English only.

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

// The greeting is one heading and nothing else. It follows what is happening (workout live, soon, done, rest day, the next meal) and otherwise the time
// of day, and the day of the month rotates the wording so it is not the same line on every open. {n} is the first name; without one the name is dropped.
const HEAD: Record<string, string[]> = {
  live: ['Keep going, {n}', 'Strong set, {n}'],
  soon: ['Almost time, {n}', 'Get ready, {n}'],
  done: ['Workout done, {n}', 'Well done, {n}'],
  rest: ['Rest day, {n}', 'Easy day, {n}'],
  morning: ['Good morning, {n}', 'Morning, {n}', 'Hey {n}'],
  afternoon: ['Good afternoon, {n}', 'Hey {n}', 'Afternoon, {n}'],
  evening: ['Good evening, {n}', 'Evening, {n}', 'Hey {n}'],
};
export function greetHeading(c: TodayCtx, first: string): string {
  const key = c.paused ? null
    : c.workout === 'live' ? 'live'
    : c.workout === 'done' ? 'done'
    : c.workout === 'rest' ? 'rest'
    : c.workout === 'todo' && c.min < c.planned && c.planned - c.min <= 120 ? 'soon'
    : null;
  const time = c.min < 12 * 60 ? 'morning' : c.min < 17 * 60 ? 'afternoon' : 'evening';
  const slot = key ?? time;
  let list = HEAD[slot];
  if (slot === 'done' && c.weeks > 0) list = [...list, `${c.weeks} week streak, {n}`];                  // the streak is one of the headings after a workout
  if (!key && !c.paused && c.nextMeal) list = [`${c.nextMeal} is next, {n}`, ...list];                  // at meal time, the meal can be the heading
  const line = list[(c.day + slot.length) % list.length];
  return first ? line.replace('{n}', first) : line.replace(/,? ?\{n\}/, '').trim() || 'Hey';
}

// The demo panel previews every state of the line. Each one is a context that makes todayLine return that moment's text.
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
