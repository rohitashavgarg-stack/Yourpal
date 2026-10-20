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

// The top of Today is two lines. The small one greets the member by name ("Good job, Rohitashav"); the big one is the fact ("3 week streak").
// The name is only ever in the small line. The day of the month rotates the wording so it is not the same on every open.

const slotOf = (c: TodayCtx): 'live' | 'soon' | 'done' | 'rest' | 'morning' | 'afternoon' | 'evening' =>
  c.paused ? (c.min < 12 * 60 ? 'morning' : c.min < 17 * 60 ? 'afternoon' : 'evening')
  : c.workout === 'live' ? 'live'
  : c.workout === 'done' ? 'done'
  : c.workout === 'rest' ? 'rest'
  : c.workout === 'todo' && c.min < c.planned && c.planned - c.min <= 120 ? 'soon'
  : c.min < 12 * 60 ? 'morning' : c.min < 17 * 60 ? 'afternoon' : 'evening';

const SMALL: Record<string, string[]> = {
  live: ['Keep going, {n}', 'Strong set, {n}'],
  soon: ['Almost time, {n}', 'Get ready, {n}'],
  done: ['Good job, {n}', 'Well done, {n}'],
  rest: ['Easy day, {n}', 'Rest up, {n}'],
  morning: ['Good morning, {n}', 'Morning, {n}', 'Hey {n}'],
  afternoon: ['Good afternoon, {n}', 'Hey {n}', 'Afternoon, {n}'],
  evening: ['Good evening, {n}', 'Evening, {n}', 'Hey {n}'],
};

// The small greeting line, with the name. Without a first name the name is dropped.
export function greetSmall(c: TodayCtx, first: string): string {
  const slot = slotOf(c);
  const list = SMALL[slot];
  const line = list[(c.day + slot.length) % list.length];
  return first ? line.replace('{n}', first) : line.replace(/,? ?\{n\}/, '').trim() || 'Hey';
}

// The big line: what is going on, as a plain fact. No name here.
export function greetBig(c: TodayCtx): string {
  if (c.paused) return 'Your history is all here';
  if (c.workout === 'live') return 'Workout in progress';
  if (c.workout === 'done') {
    if (c.weeks > 0) return `${c.weeks} week streak`;
    return `${c.weekDone} of ${c.target} workouts this week`;
  }
  if (c.workout === 'rest') return 'Rest day';
  if (c.workout === 'todo' && c.min < c.planned) return `Leg day is at ${c.clock(c.planned)}`;
  if (c.nextMeal) return `${c.nextMeal} is next`;
  return `${c.weekDone} of ${c.target} workouts this week`;
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
