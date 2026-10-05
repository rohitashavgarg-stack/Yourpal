import { router } from 'expo-router';
import { createStore } from '@/features/progress/store';

// Coach-only screen state. The conversation itself lives in the shared domain (`chat`).
export const coachStore = createStore(() => ({
  away: false,   // Coach Vikram is away: replies are slower
  unread: true,  // a reply you haven't opened yet
}));

// Open the chat, optionally about something specific (an exercise, a meal, a plan day).
// `ctx` becomes the little "from Squat" tag on the message; `draft` pre-fills the box.
export function askCoach(ctx?: string, draft?: string) {
  router.push({ pathname: '/gym/chat', params: { ...(ctx ? { ctx } : {}), ...(draft ? { draft } : {}) } });
}

export const TOPICS: { l: string; ctx: string; draft: string }[] = [
  { l: 'Check my form', ctx: 'Form check', draft: 'Can you check my form on ' },
  { l: 'Pain or injury', ctx: 'Pain', draft: 'I have some pain in my ' },
  { l: 'Swap a meal', ctx: 'Diet', draft: 'Can I swap ' },
  { l: 'Change my schedule', ctx: 'Schedule', draft: 'Can we move my training to ' },
  { l: 'Stuck on a weight', ctx: 'Plateau', draft: "My lifts haven't moved on " },
];

export const WEEKLY = {
  when: 'Week of 22 Sep',
  note: "Good consistency, Jyotsana. Keep squats at 60 kg until the last rep looks as clean as the first, and add a 20-minute walk on rest days.",
  focus: ['Squat depth', 'Protein 90 g', 'Sleep 7 h'],
};

export const NOTES: { when: string; ctx: string; t: string }[] = [
  { when: 'Wed 24 Sep', ctx: 'Plan update', t: "Romanian deadlift added and farmer's carry removed. Your hamstrings need the extra work." },
  { when: 'Mon 22 Sep', ctx: 'Leg day', t: 'Nice depth on the squats. Film one set and send it if anything feels off.' },
  { when: 'Sat 20 Sep', ctx: 'Weekly review', t: 'Three workouts out of three. Add 2.5 kg to the leg press next time.' },
];
