import { useCallback } from 'react';
import { useStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { playTimerEnd } from '@/lib/timerSound';

/** The cue for when a workout timer ends: the buzzer and the vibration, each one unless the member turned it off in Notifications. */
export function useTimerEnd() {
  const { state } = useStore();
  const { sound, vibrate } = state.profile.timer ?? {};
  return useCallback(() => {
    if (vibrate !== false) haptic.success();
    if (sound !== false) playTimerEnd();
  }, [sound, vibrate]);
}
