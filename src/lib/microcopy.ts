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

// Two wordings per moment; the day of the month picks one, so a line does not change on every render.
const pick = (day: number, key: number, a: string, b: string) => ((day + key) % 2 === 0 ? a : b);

// What sits under the greeting: one fact (line) and, when it helps, the smallest next step or one more number on its own quieter line (hint).
// Never two sentences joined in one line. First rule that fits wins.
export type TodayLine = { line: string; hint?: string };
export function todayLine(c: TodayCtx): TodayLine {
  if (c.paused) return { line: 'Your history is all here' };
  if (c.workout === 'live') return { line: 'Workout in progress', hint: pick(c.day, 1, 'The rest timer is running', 'Take your rest, then the next set') };
  if (c.workout === 'done') {
    const line = pick(c.day, 2, 'Leg day is done', 'Leg day is logged');
    return c.weeks > 0 ? { line, hint: `${c.weeks} week streak` } : { line, hint: `${c.weekDone} of ${c.target} workouts this week` };
  }
  if (c.workout === 'rest') return { line: 'Rest day', hint: pick(c.day, 3, 'Recovery counts toward your week', 'Sleep and water do the work today') };
  if (c.workout === 'todo' && c.min < c.planned) {
    const line = `Leg day is at ${c.clock(c.planned)}`;
    return c.planned - c.min <= 180
      ? { line, hint: pick(c.day, 4, 'Warm-up takes about 5 minutes', 'Start with the warm-up') }
      : { line, hint: pick(c.day, 4, 'A light meal two hours before helps', 'Eat something light before you go') };
  }
  if (c.nextMeal) return { line: `${c.nextMeal} is next`, hint: pick(c.day, 5, 'Log it when you eat', 'Log it as you eat it') };
  const week = `${c.weekDone} of ${c.target} workouts this week`;
  return c.weeks > 0 ? { line: week, hint: `${c.weeks} week streak` } : { line: week };
}

// The heading above the line. It follows what is happening (workout live, soon, done, rest day) and otherwise the time of day, and the day of the month
// rotates the wording, so it is not "Good afternoon, Name" on every open. {n} is the first name; without one the name is dropped.
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
  const slot = key ?? (c.min < 12 * 60 ? 'morning' : c.min < 17 * 60 ? 'afternoon' : 'evening');
  const list = HEAD[slot];
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
