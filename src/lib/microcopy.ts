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

// One short sentence under the greeting. First rule that fits wins.
export function todayLine(c: TodayCtx): string {
  if (c.paused) return 'Your history is all here.';
  if (c.workout === 'live') return pick(c.day, 1, 'Workout in progress. The rest timer is running.', 'Workout in progress. Take your rest, then the next set.');
  if (c.workout === 'done') {
    if (c.weeks > 0) return pick(c.day, 2, `Leg day is done. ${c.weeks} week streak, keep it going.`, `Leg day is done. That keeps your ${c.weeks} week streak alive.`);
    return pick(c.day, 2, `Leg day is done. ${c.weekDone} of ${c.target} workouts this week.`, `Leg day is logged. ${c.weekDone} of ${c.target} workouts this week.`);
  }
  if (c.workout === 'rest') return pick(c.day, 3, 'Rest day. Recovery counts toward your week.', 'Rest day. Sleep and water do the work today.');
  if (c.workout === 'todo') {
    const t = c.clock(c.planned);
    if (c.min < c.planned) {
      const near = c.planned - c.min <= 180;
      if (near) return pick(c.day, 4, `Leg day is at ${t}. Warm-up takes about 5 minutes.`, `Leg day is at ${t}. Start with the warm-up.`);
      return pick(c.day, 4, `Leg day is at ${t}. A light meal two hours before helps.`, `Leg day is at ${t}. Eat something light before you go.`);
    }
  }
  if (c.nextMeal) return pick(c.day, 5, `${c.nextMeal} is next. Log it when you eat.`, `${c.nextMeal} is next. Log it as you eat it.`);
  if (c.weeks > 0) return pick(c.day, 6, `${c.weeks} week streak. ${c.weekDone} of ${c.target} workouts this week.`, `${c.weeks} week streak, ${c.weekDone} of ${c.target} workouts this week.`);
  return `${c.weekDone} of ${c.target} workouts this week.`;
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
