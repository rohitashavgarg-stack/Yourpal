import { useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { useDomain } from '@/lib/domain';
import { useOverlay } from '@/components/Overlay';

// A paused membership (ended, features paused) makes the app view-only: the member can still see every earlier log and number,
// but nothing new can be logged until the gym renews the plan. Every place that logs something goes through useLogGate.
export function useLogsPaused() {
  const { d } = useDomain();
  return d.hasGym && d.membership === 'Grace over';
}

export const PAUSED_MSG = 'Logging is paused. Renew at Wulf Fitness reception to log again.';

// Wrap a logging action: when logging is paused it says so (one short toast) and does nothing; otherwise it runs as usual.
export function useLogGate() {
  const paused = useLogsPaused();
  const { toast } = useOverlay();
  const gate = useCallback(<A extends unknown[]>(fn: (...a: A) => void) => (...a: A) => {
    if (paused) { toast(PAUSED_MSG); return; }
    fn(...a);
  }, [paused, toast]);
  // for actions that return a value: if (blocked()) return <unchanged value>;
  const blocked = useCallback(() => { if (paused) toast(PAUSED_MSG); return paused; }, [paused, toast]);
  return { paused, gate, blocked };
}

// For the log pages that other buttons can open directly (log weight, log height, log food): while logging is paused they say so and go back.
export function useLeaveIfPaused() {
  const paused = useLogsPaused();
  const { toast } = useOverlay();
  useEffect(() => {
    if (paused) { toast(PAUSED_MSG); if (router.canGoBack()) router.back(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return paused;
}
