import { router } from 'expo-router';
import { useDomain } from '@/lib/domain';
import { haptic } from '@/lib/haptics';
import { newSession } from './session';

// One workout, one tap: Start goes straight into the workout. (No sheet, no Full / Quick / Low energy versions.)
export function useStartWorkout() {
  const { set } = useDomain();
  return () => {
    haptic.medium();
    // open the page first; the session is set right after, so the Today card does not flip to its live state before the page shows
    router.push('/workout');
    setTimeout(() => set({ session: newSession() }), 60);
  };
}
