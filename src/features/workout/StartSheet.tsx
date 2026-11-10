import { router } from 'expo-router';
import { haptic } from '@/lib/haptics';

// One workout, one tap: Start goes straight into the workout. (No sheet, no Full / Quick / Low energy versions.)
export function useStartWorkout() {
  return () => {
    haptic.medium();
    // The page opens with its own new session and shows the workout at once (no empty page first). It hands the session to the app a moment later,
    // when it already covers Today, so the Today card never flips to its live state in view.
    router.push({ pathname: '/workout', params: { start: '1' } });
  };
}
