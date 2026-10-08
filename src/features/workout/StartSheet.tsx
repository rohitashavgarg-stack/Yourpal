import { router } from 'expo-router';
import { useDomain } from '@/lib/domain';
import { haptic } from '@/lib/haptics';
import { newSession } from './session';

// One workout, one tap: Start goes straight into the workout. (No sheet, no Full / Quick / Low energy versions.)
export function useStartWorkout() {
  const { set } = useDomain();
  return () => {
    haptic.medium();
    set({ session: newSession() });
    router.push('/workout');
  };
}
