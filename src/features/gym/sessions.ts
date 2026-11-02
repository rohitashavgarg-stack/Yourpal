import { useStore } from '@/lib/store';
import { gymStore } from '@/features/gym/state';

// A personal training session with the coach. Sample data; the real list comes from the gym.
// awaiting: the coach marked it done and the member has to confirm it. upcoming: still to come.
export type SessionStatus = 'upcoming' | 'awaiting' | 'confirmed' | 'flagged';
export type Session = {
  id: string; day: string; long: string; time: string; focus: string; status: SessionStatus;
  rating?: number; remarks?: string; note?: string; exercises: { n: string; d: string }[];
};

const LEGS = [{ n: 'Back squat', d: '4 sets of 8 at 60 kg' }, { n: 'Leg press', d: '3 sets of 12 at 120 kg' }, { n: 'Romanian deadlift', d: '3 sets of 10 at 40 kg' }, { n: 'Calf raise', d: '3 sets of 15' }];
const PUSH = [{ n: 'Bench press', d: '4 sets of 8 at 40 kg' }, { n: 'Shoulder press', d: '3 sets of 10 at 20 kg' }, { n: 'Triceps pushdown', d: '3 sets of 12' }];
const PULL = [{ n: 'Lat pulldown', d: '4 sets of 10 at 45 kg' }, { n: 'Seated row', d: '3 sets of 12 at 40 kg' }, { n: 'Biceps curl', d: '3 sets of 12 at 10 kg' }];

const BASE: Omit<Session, 'status' | 'rating'>[] = [
  { id: 's30', day: 'Tue 30', long: 'Tuesday 30 Sep', time: '6 to 7 pm', focus: 'Pull day', exercises: [] },
  { id: 's25', day: 'Thu 25', long: 'Thursday 25 Sep', time: '6 to 7 pm', focus: 'Push day', exercises: [] },
  { id: 's23', day: 'Tue 23', long: 'Tuesday 23 Sep', time: '6 to 7 pm', focus: 'Legs', note: 'Good depth on the squats. Add 5 kg next week if it stays this smooth.', exercises: LEGS },
  { id: 's22', day: 'Mon 22', long: 'Monday 22 Sep', time: '7 to 8 am', focus: 'Push day', note: 'Strong bench today. Keep your elbows tucked on the way down.', exercises: PUSH },
  { id: 's16', day: 'Tue 16', long: 'Tuesday 16 Sep', time: '6 to 7 pm', focus: 'Pull day', note: 'Slow the lowering phase on the pulldown.', exercises: PULL },
  { id: 's11', day: 'Thu 11', long: 'Thursday 11 Sep', time: '6 to 7 pm', focus: 'Legs', note: 'First week back. Keep the weights light.', exercises: LEGS },
];

/** Every session, newest first, with the live state of the one the coach just marked as done. */
export function useSessions(): Session[] {
  const { state } = useStore();
  const g = gymStore.use();
  const isPT = state.sc.member === 'PT member';
  const waiting = isPT && g.awaiting === 'Yes';
  return BASE.flatMap((b): Session[] => {
    if (b.id === 's30' || b.id === 's25') return [{ ...b, status: 'upcoming' }];
    if (b.id === 's23') return waiting ? [{ ...b, status: g.sessionState === 'awaiting' ? 'awaiting' : g.sessionState, rating: g.sessionState === 'confirmed' ? g.rating : undefined, remarks: g.sessionState === 'confirmed' && g.remarks ? g.remarks : undefined }] : [];
    const sample: Record<string, string> = { s22: 'Loved the bench work', s16: 'Pulldown felt heavy, want to go slower', s11: 'Good first week back' };
    return [{ ...b, status: 'confirmed', rating: b.id === 's22' ? 5 : b.id === 's16' ? 4 : 5, remarks: sample[b.id] }];
  });
}

export const useAwaitingSession = () => useSessions().find((s) => s.status === 'awaiting');
