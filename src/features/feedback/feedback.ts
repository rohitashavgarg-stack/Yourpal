import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useDomain } from '@/lib/domain';

// When to ask a gym member for feedback. These are the rules; change the numbers here.
export const FIRST_ASK_DAYS = 7;   // first time: a week after they start
export const REPEAT_ASK_DAYS = 30; // after they answer: once a month
export const LATER_DAYS = 3;       // "Maybe later" asks again in three days

export const FEEDBACK_TAGS = ['Trainers', 'Equipment', 'Cleanliness', 'Classes', 'Timings', 'Staff'];
export const RATING_WORDS = ['', 'Poor', 'Could be better', 'Okay', 'Good', 'Great'];

const DAY = 86400000;

/** True when the Today card should ask for feedback now. Also starts the clock the first time a gym member opens the app. */
export function useFeedbackDue() {
  const { state, setProfile } = useStore();
  const { d } = useDomain();
  const fb = state.profile.feedback;
  const [now] = useState(() => Date.now()); // the time this screen opened
  useEffect(() => {
    if (d.hasGym && !fb?.since) setProfile({ feedback: { ...fb, since: new Date().toISOString() } });
  }, [d.hasGym, fb?.since]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d.hasGym || !fb?.since) return false;
  if (fb.snoozeUntil && Date.parse(fb.snoozeUntil) > now) return false;
  const base = Date.parse(fb.lastAt ?? fb.since);
  return (now - base) / DAY >= (fb.lastAt ? REPEAT_ASK_DAYS : FIRST_ASK_DAYS);
}
