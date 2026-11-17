import { useStore } from '@/lib/store';
import { gymStore } from '@/features/gym/state';

// A personal training session with the coach. Sample data; the real list comes from the gym.
// awaiting: the coach marked it done and the member has to confirm it. upcoming: still to come. skipped: the coach marked it skipped.
export type SessionStatus = 'upcoming' | 'awaiting' | 'confirmed' | 'flagged' | 'skipped';
export type Session = {
  id: string; pack?: string; /** the PT pack this session belongs to */ day: string; long: string; time: string; focus: string; status: SessionStatus;
  rating?: number; remarks?: string; note?: string; exercises: { n: string; d: string }[];
};

const LEGS = [{ n: 'Back squat', d: '4 sets of 8 at 60 kg' }, { n: 'Leg press', d: '3 sets of 12 at 120 kg' }, { n: 'Romanian deadlift', d: '3 sets of 10 at 40 kg' }, { n: 'Calf raise', d: '3 sets of 15' }];
const PUSH = [{ n: 'Bench press', d: '4 sets of 8 at 40 kg' }, { n: 'Shoulder press', d: '3 sets of 10 at 20 kg' }, { n: 'Triceps pushdown', d: '3 sets of 12' }];
const PULL = [{ n: 'Lat pulldown', d: '4 sets of 10 at 45 kg' }, { n: 'Seated row', d: '3 sets of 12 at 40 kg' }, { n: 'Biceps curl', d: '3 sets of 12 at 10 kg' }];

// st: a session that is not simply confirmed (to come, skipped). The rest are confirmed.
const BASE: (Omit<Session, 'status' | 'rating'> & { st?: SessionStatus })[] = [
  { id: 's28', pack: 'pt2', st: 'upcoming', day: 'Thu 2', long: 'Thursday 2 Oct', time: '6 to 7 pm', focus: 'Pull day', exercises: [] },
  { id: 's30', pack: 'pt1', day: 'Tue 30', long: 'Tuesday 30 Sep', time: '6 to 7 pm', focus: 'Pull day', exercises: [] },
  { id: 's25', pack: 'pt2', day: 'Thu 25', long: 'Thursday 25 Sep', time: '6 to 7 pm', focus: 'Push day', exercises: [] },
  { id: 's23', pack: 'pt1', day: 'Tue 23', long: 'Tuesday 23 Sep', time: '6 to 7 pm', focus: 'Legs', note: 'Good depth on the squats. Add 5 kg next week if it stays this smooth.', exercises: LEGS },
  { id: 's22', pack: 'pt1', day: 'Mon 22', long: 'Monday 22 Sep', time: '7 to 8 am', focus: 'Push day', note: 'Strong bench today. Keep your elbows tucked on the way down.', exercises: PUSH },
  { id: 's16', pack: 'pt1', day: 'Tue 16', long: 'Tuesday 16 Sep', time: '6 to 7 pm', focus: 'Pull day', note: 'Slow the lowering phase on the pulldown.', exercises: PULL },
  { id: 's14', pack: 'pt2', day: 'Sun 14', long: 'Sunday 14 Sep', time: '6 to 7 pm', focus: 'Legs', note: 'Solid session. Add a set to the leg press next time.', exercises: [] },
  { id: 's11', pack: 'pt1', day: 'Thu 11', long: 'Thursday 11 Sep', time: '6 to 7 pm', focus: 'Legs', note: 'First week back. Keep the weights light.', exercises: LEGS },
  { id: 's08', pack: 'pt2', day: 'Mon 8', long: 'Monday 8 Sep', time: '6 to 7 pm', focus: 'Push day', note: 'Good first session. We will build from here.', exercises: [] },
  { id: 's05', pack: 'pt1', day: 'Fri 5', long: 'Friday 5 Sep', time: '6 to 7 pm', focus: 'Pull day', note: 'Good first session of the pack. Keep the pulls controlled.', exercises: [] },
  { id: 'p01', pack: 'pt5', day: 'Fri 29', long: 'Friday 29 Aug', time: '6 to 7 pm', focus: 'Legs', exercises: [] },
  { id: 'p02', pack: 'pt5', day: 'Fri 22', long: 'Friday 22 Aug', time: '6 to 7 pm', focus: 'Push day', exercises: [] },
  { id: 'p03', pack: 'pt5', day: 'Fri 15', long: 'Friday 15 Aug', time: '6 to 7 pm', focus: 'Pull day', exercises: [] },
  { id: 'p04', pack: 'pt5', day: 'Fri 8', long: 'Friday 8 Aug', time: '6 to 7 pm', focus: 'Legs', exercises: [] },
  { id: 'p05', pack: 'pt5', day: 'Fri 1', long: 'Friday 1 Aug', time: '6 to 7 pm', focus: 'Push day', exercises: [] },
  { id: 'p06', pack: 'pt5', day: 'Fri 25', long: 'Friday 25 Jul', time: '6 to 7 pm', focus: 'Pull day', exercises: [] },
  { id: 'p07', pack: 'pt5', day: 'Fri 18', long: 'Friday 18 Jul', time: '6 to 7 pm', focus: 'Legs', exercises: [] },
  { id: 'p08', pack: 'pt5', day: 'Fri 11', long: 'Friday 11 Jul', time: '6 to 7 pm', focus: 'Push day', exercises: [] },
  { id: 'p09', pack: 'pt5', day: 'Fri 4', long: 'Friday 4 Jul', time: '6 to 7 pm', focus: 'Pull day', exercises: [] },
  { id: 'p10', pack: 'pt5', day: 'Fri 27', long: 'Friday 27 Jun', time: '6 to 7 pm', focus: 'Legs', exercises: [] },
  { id: 'p11', pack: 'pt6', day: 'Fri 20', long: 'Friday 20 Jun', time: '6 to 7 pm', focus: 'Legs', exercises: [] },
  { id: 'p12', pack: 'pt6', day: 'Fri 13', long: 'Friday 13 Jun', time: '6 to 7 pm', focus: 'Push day', exercises: [] },
];

/** Every session, newest first, with the live state of the one the coach just marked as done. */
export function useSessions(): Session[] {
  const { state } = useStore();
  const g = gymStore.use();
  const isPT = state.sc.member === 'PT member';
  const waiting = isPT && g.awaiting === 'Yes';
  return BASE.flatMap((b): Session[] => {
    if (b.st && b.id !== 's25') return [{ ...b, status: b.st }];
    if (b.id === 's30') return [{ ...b, status: 'upcoming' }];
    if (b.id === 's25') return [{ ...b, status: 'skipped', note: 'Skipped by Coach Vikram. He will share the next session time in chat.' }];
    if (b.id === 's23') return waiting ? [{ ...b, status: g.sessionState === 'awaiting' ? 'awaiting' : g.sessionState, rating: g.sessionState === 'confirmed' ? g.rating : undefined, remarks: g.sessionState === 'confirmed' && g.remarks ? g.remarks : undefined }] : [];
    // What the member wrote when confirming, and the coach's note beside it. Every confirmed session has both.
    const sample: Record<string, string> = { s22: 'Loved the bench work', s16: 'Pulldown felt heavy, want to go slower', s11: 'Good first week back', s14: 'Legs felt strong today', s08: 'Good start, a bit nervous on the bench', s05: 'Pulls felt smooth' };
    const spare = ['Felt good, no pain', 'Tough but worth it', 'Energy was low, still finished', 'Happy with my form'];
    const i = BASE.indexOf(b);
    return [{ ...b, status: 'confirmed', rating: b.id === 's22' ? 5 : b.id === 's16' ? 4 : 5, remarks: sample[b.id] ?? spare[i % spare.length], note: b.note ?? 'Well done. Keep the same pace next time.' }];
  });
}

export const useAwaitingSession = () => useSessions().find((s) => s.status === 'awaiting');
