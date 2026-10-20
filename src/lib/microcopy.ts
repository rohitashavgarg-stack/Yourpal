// Every line the app says to the member that is not a label lives here, so the voice can be read and changed in one place.
// Voice: a coach who noticed something. Fact first, then the smallest next step. No emoji, no exclamation marks, no guilt, no fake cheer.
// Some lines are in Hinglish (an English line and a Hinglish one are alternated by day), the way people actually talk at an Indian gym.

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
  lang?: 'mixed' | 'en' | 'hi';                   // mixed alternates English and Hinglish by day
};

export const greetWord = (min: number) => (min < 12 * 60 ? 'Good morning' : min < 17 * 60 ? 'Good afternoon' : 'Good evening');

// Two variants per moment: English first, Hinglish second. The day picks one, so a line does not change on every render.
const pick = (day: number, key: number, en: string, hi: string, lang: TodayCtx['lang'] = 'mixed') => (lang === 'en' ? en : lang === 'hi' ? hi : (day + key) % 2 === 0 ? en : hi);

// One short sentence under the greeting. First rule that fits wins.
export function todayLine(c: TodayCtx): string {
  if (c.paused) return 'Your history is all here.';
  if (c.workout === 'live') return pick(c.day, 1, 'Workout in progress. The rest timer is running.', 'Workout chal raha hai. Rest timer on hai.', c.lang);
  if (c.workout === 'done') {
    if (c.weeks > 0) return pick(c.day, 2, `Leg day is done. ${c.weeks} week streak, keep it going.`, `Leg day ho gaya. ${c.weeks} hafte ki streak, banaye rakho.`, c.lang);
    return pick(c.day, 2, `Leg day is done. ${c.weekDone} of ${c.target} workouts this week.`, `Leg day ho gaya. Is hafte ${c.weekDone} of ${c.target} workouts.`, c.lang);
  }
  if (c.workout === 'rest') return pick(c.day, 3, 'Rest day. Recovery counts toward your week.', 'Aaj rest day hai. Recovery bhi plan ka hissa hai.', c.lang);
  if (c.workout === 'todo') {
    const t = c.clock(c.planned);
    if (c.min < c.planned) {
      const near = c.planned - c.min <= 180;
      if (near) return pick(c.day, 4, `Leg day is at ${t}. Warm-up takes about 5 minutes.`, `Leg day ${t} par hai. Pehle warm-up kar lena.`, c.lang);
      return pick(c.day, 4, `Leg day is at ${t}. A light meal two hours before helps.`, `Leg day ${t} par hai. Do ghante pehle halka khana kha lo.`, c.lang);
    }
  }
  if (c.nextMeal) return pick(c.day, 5, `${c.nextMeal} is next. Log it when you eat.`, `${c.nextMeal} next hai. Khaate hi log kar lena.`, c.lang);
  if (c.weeks > 0) return pick(c.day, 6, `${c.weeks} week streak. ${c.weekDone} of ${c.target} workouts this week.`, `${c.weeks} hafte ki streak. Is hafte ${c.weekDone} of ${c.target} workouts.`, c.lang);
  return pick(c.day, 6, `${c.weekDone} of ${c.target} workouts this week.`, `Is hafte ${c.weekDone} of ${c.target} workouts ho chuke hain.`, c.lang);
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
