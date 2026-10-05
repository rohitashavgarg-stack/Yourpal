import React, { useEffect, useRef } from 'react';
import { Button, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { haptic } from '@/lib/haptics';
import { cancelStillTraining, scheduleStillTraining } from '@/lib/notify';
import { mmss, useNow } from '@/lib/useNow';
import { font } from '@/theme/tokens';
import { checkOutPatch, elapsedMin, HOLD_MIN, isIn, LIMIT_MIN, limitOf, undoCheckOutPatch, WARN_BEFORE } from './logic';
import { useCheckIn } from './useCheckIn';

// "Still training?" prompt at 80 min. Live countdown to the automatic check-out.
export function StillTrainingSheet() {
  const { d } = useDomain();
  const A = useCheckIn();
  const { closeSheet } = useOverlay();
  const active = isIn(d);
  const now = useNow(active, 1000);
  useEffect(() => { if (!active) closeSheet(); }, [active]);
  if (!active) return null;
  const end = d.ciHold ?? d.ciStart! + limitOf(d) * 60000;
  const left = Math.max(0, (end - now) / 1000);
  const running = !!d.session && elapsedMin(d, now) >= limitOf(d);
  return (
    <>
      <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1 }}>Still training?</Txt>
      <Txt muted>
        {running ? "Your workout is running, so we'll wait until it ends and check you out 10 min later." : `We'll check you out in ${left >= 60 ? `${Math.ceil(left / 60)} min` : mmss(left)}.`}
      </Txt>
      <Button kind="accent" label="Keep going" onPress={() => closeSheet(A.keepGoing)} />
      <Button kind="secondary" label="Check out" onPress={() => closeSheet(A.checkOut)} />
      <Txt v="caption">Keep going adds 30 minutes.</Txt>
    </>
  );
}

// Runs the 90-minute clock for the whole app (mounted once, inside the overlay host).
export function CheckInEngine() {
  const { d, set } = useDomain();
  const { openSheet, toast } = useOverlay();
  const active = isIn(d);
  const now = useNow(active, 1000);
  const limit = limitOf(d);
  const prompted = useRef<number | null>(null);
  const overdueWorkout = useRef(false);
  const lastLimit = useRef(0);
  const toasted = useRef<string>('');

  // Local notification at minute 80 (fires even if the app is in the background).
  useEffect(() => {
    if (!active) { cancelStillTraining(); return; }
    scheduleStillTraining(d.ciStart! + (limit - WARN_BEFORE) * 60000);
  }, [active, d.ciStart, limit]);

  useEffect(() => {
    if (!active) { prompted.current = null; overdueWorkout.current = false; lastLimit.current = 0; return; }
    if (lastLimit.current !== limit) { lastLimit.current = limit; overdueWorkout.current = false; }
    const el = elapsedMin(d, now);
    if (el >= limit - WARN_BEFORE && prompted.current !== limit) {
      prompted.current = limit;
      // Past the limit with no workout we check out right away, so there is nothing to ask.
      if (el < limit || d.session) {
        haptic.warn();
        openSheet(<StillTrainingSheet />, { label: 'Still training?' });
      }
    }
    if (el < limit) return;
    if (d.session) { overdueWorkout.current = true; if (d.ciHold != null) set({ ciHold: null }); return; }
    if (overdueWorkout.current) {
      // Workout ended (finished or skipped) after the limit: check out 10 minutes later.
      if (d.ciHold == null) set({ ciHold: now + HOLD_MIN * 60000 });
      else if (now >= d.ciHold) set(checkOutPatch(d, now, 'time'));
      return;
    }
    set(checkOutPatch(d, now, 'time'));
  }, [now, active, limit, d.session, d.ciHold]);

  // Automatic check-outs (time or leaving the gym) tell the user, with Undo.
  useEffect(() => {
    const o = d.ciOut;
    if (!o?.auto) return;
    const key = `${o.at}-${o.mins}-${o.auto}`;
    if (toasted.current === key) return;
    toasted.current = key;
    haptic.medium();
    toast(o.auto === 'left' ? `You left the gym · checked out after ${o.mins} min` : `Checked out automatically after ${o.mins} min`, {
      undo: () => set((s) => undoCheckOutPatch(s, Date.now())),
    });
  }, [d.ciOut]);

  return null;
}
