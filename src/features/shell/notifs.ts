import { useStore } from '@/lib/store';
import { gymStore } from '@/features/gym/state';
import { NOTIFS } from './state';

// A PT session waiting for the member to confirm and rate it.
export function usePtPending() {
  const { state } = useStore();
  const g = gymStore.use();
  return state.sc.member === 'PT member' && g.awaiting === 'Yes' && g.sessionState === 'awaiting';
}

// The notification list for this member: the PT confirmation only shows while a session is waiting.
export function useVisibleNotifs() {
  const pending = usePtPending();
  return NOTIFS.filter((n) => !n.pt || pending);
}
