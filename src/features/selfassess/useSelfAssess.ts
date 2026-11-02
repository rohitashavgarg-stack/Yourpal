import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useDomain } from '@/lib/domain';
import { COACH_SAMPLE, SelfEntry } from '@/features/selfassess/data';

export const NUDGE_DAYS = 30; // a gentle reminder once a month
export const LATER_DAYS = 3;  // "Maybe later" asks again in three days
const DAY = 86400000;

/** All assessments (the member's own and the coach's), newest first, and whether the monthly nudge is due. */
export function useSelfAssess() {
  const { state, setProfile } = useStore();
  const { d } = useDomain();
  const sa = state.profile.selfAssess;
  const [now] = useState(() => Date.now()); // the time this screen opened
  const entries = useMemo(() => [...(sa?.entries ?? []), COACH_SAMPLE].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)), [sa?.entries]);
  const lastAt = Date.parse(entries[0].at);
  const snoozed = !!sa?.snoozeUntil && Date.parse(sa.snoozeUntil) > now;
  const due = d.hasGym && !snoozed && (now - lastAt) / DAY >= NUDGE_DAYS;
  return {
    entries, due,
    save: (e: SelfEntry) => setProfile({ selfAssess: { entries: [e, ...(sa?.entries ?? [])] } }),
    later: () => setProfile({ selfAssess: { entries: sa?.entries ?? [], snoozeUntil: new Date(Date.now() + LATER_DAYS * DAY).toISOString() } }),
  };
}
