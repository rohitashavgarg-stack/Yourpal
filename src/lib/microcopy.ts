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
  noPlan?: boolean;                              // no workout or diet plan assigned: tracking only
  day: number;                                   // day of month, rotates the variants
  clock: (min: number) => string;                // "6:30 pm"
};

// The top of Today is two lines in one quiet grey: a greeting with the name ("Hey! Rohitashav"), then a line whose key phrase is brighter
// ("It's your" in grey, "Leg day" in white). The name is only in the first line. The day of the month rotates the greeting wording.
export type Greeting = { top: string; lead: string; hl: string };

const pick = (day: number, key: number, list: string[]) => list[(day + key) % list.length];
// the time of day first, then the shorter ones; the screen shrinks both lines a little when the first one is long
const timeGreet = (c: TodayCtx) => [c.min < 12 * 60 ? 'Good morning, {n}' : c.min < 17 * 60 ? 'Good afternoon, {n}' : 'Good evening, {n}', 'Hey! {n}', 'Hello! {n}'];
const withName = (line: string, first: string) => (first ? line.replace('{n}', first) : line.replace(/! ?\{n\}/, '!').trim());

export function greeting(c: TodayCtx, first: string): Greeting {
  const g = (list: string[], key: number, lead: string, hl: string): Greeting => ({ top: withName(pick(c.day, key, list), first), lead, hl });
  if (c.paused) return g(timeGreet(c), 0, '', 'History is safe');
  if (c.noPlan) return g(timeGreet(c), 7, 'Your plan is', 'on the way');
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

// A line to close the day on, at the bottom of Today. One a day, picked by the date, the same all day. Plain, no emoji, no hype.
export const QUOTES = [
  'Show up. The rest follows.',
  'Small sessions, done often, change a body.',
  'You do not have to feel ready. You only have to start.',
  'Strong is built one ordinary day at a time.',
  'Progress is quiet. Keep going anyway.',
  'Rest is part of the plan, not a break from it.',
  'The best workout is the one you actually do.',
  'Be a little better than your last session.',
  'Eat well, sleep well, lift well. Repeat.',
  'Consistency beats intensity, every month of the year.',
  'Your future self is watching what you do today.',
  'Discipline is just remembering what you want.',
];
export const quoteOfDay = (day: number) => QUOTES[day % QUOTES.length];

// ---------- Today: update cards, reminders and the small messages after an action ----------
// Same voice: a coach who noticed something. Fact first, then what to do about it, in a sentence a person would say. The name is used once per
// message at most, and only where it reads naturally.
const nm = (first: string) => (first ? ', ' + first : '');
export const updateCopy = {
  meal: (meal: string, first: string, planned: string, late: boolean) => {
    const m = meal.toLowerCase();
    return late
      ? { title: `Did you have your ${m}${nm(first)}?`, body: `It was planned for ${planned}. Log what you ate, or skip it if you missed it.` }
      : { title: `${meal} time${nm(first)}`, body: 'Log it when you sit down to eat, so your total for today stays right.' };
  },
  workout: (first: string, planned: string) => ({ title: `Did you train today${nm(first)}?`, body: `Leg day was planned for ${planned}. Log it if you went, or skip it.` }),
  water: (first: string, last: string | null) => ({
    title: `Have some water${nm(first)}`,
    body: last ? `Your last glass was at ${last}. Have one now to stay on track for today.` : 'You have not logged any water today. Start with one glass.',
  }),
  weight: (first: string, days: number) => ({ title: `Time to weigh in${nm(first)}`, body: `It has been ${days} days since your last weigh-in. A quick check keeps your goal on track.` }),
  steps: (first: string) => ({ title: `A short walk${nm(first)}?`, body: 'Your steps are behind today. Ten minutes outside gets you close.' }),
  pt: { title: 'Did your session happen?', body: 'Coach Vikram marked Tue 23 Sep, 6 to 7 pm as done. Confirm it, or it confirms itself on Fri 26 Sep.' },
  membership: { title: 'Your membership ends in 12 days', body: 'It expires on 6 Oct. Renew at Wulf Fitness reception to keep going.' },
  plan: { title: 'Coach Vikram updated your plan', body: 'Leg day has a few changes: lunges added, leg extension removed.' },
  reply: { title: 'Coach Vikram replied to you', body: '“Keep your back straight on rows.”' },
  reassess: (first: string) => ({ title: `Your reassessment is due${nm(first)}`, body: 'Book a slot at the front desk this week so Coach Vikram can update your plan.' }),
  memberSoon: { title: 'Your membership ends soon', body: 'It expires in 12 days. Renew at the front desk to keep your plan going.' },
  checkedIn: (first: string, at: string) => ({ title: `You checked in at ${at}`, body: `Log today's workout when you are done${nm(first)}.` }),
};
// The caption under a tracker tile or the text of a phone reminder: short, one line.
export const reminderText = {
  mealMissed: (meal: string) => `You have not logged ${meal.toLowerCase()} yet`,
  waterNone: 'No water yet today',
  waterSince: (last: string) => `Last glass was at ${last}`,
  weight: (days: number) => `It has been ${days} days since you weighed in`,
  steps: 'Steps are behind today',
};
// What the app says after an action.
export const toastCopy = {
  workoutLogged: "Logged. That is today's workout done.",
  workoutMoved: 'Moved to tomorrow. Coach Vikram is told.',
  workoutSkipped: 'Skipped. Your plan picks up tomorrow.',
  glassAdded: 'Added a glass, 250 ml',
  mealDone: (meal: string, kcal: number) => `${meal} logged, ${kcal} kcal in`,
  mealAsPlanned: (meal: string) => `${meal} logged as planned`,
  mealSkipped: (meal: string) => `${meal} skipped`,
  mealMarked: (meal: string) => `${meal} marked eaten`,
  removed: (what: string) => `Removed ${what}`,
};
