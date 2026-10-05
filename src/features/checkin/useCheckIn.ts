import { useMemo } from 'react';
import { nowMin, useDomain } from '@/lib/domain';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { newSession } from '@/features/workout/session';
import { checkOutPatch, ciPatch, keepGoingPatch, LIMIT_MIN, undoCheckOutPatch, WARN_BEFORE } from './logic';

// Everything that changes check-in state goes through here (bar, map screen, prompt sheet, edge-case panel).
export function useCheckIn() {
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  return useMemo(() => ({
    checkIn() {
      set({ ciAt: nowMin(d), ciStart: Date.now(), ciOut: null, ciExtend: 0, ciHold: null });
    },
    // Manual check-out: one tap, no confirm, Undo in the toast. Records the real duration.
    checkOut() {
      const now = Date.now();
      const patch = checkOutPatch(d, now);
      set(patch);
      haptic.success();
      toast(`Checked out · ${patch.ciOut!.mins} min at the gym`, { undo: () => set((s) => undoCheckOutPatch(s, Date.now())) });
    },
    keepGoing() {
      set((s) => keepGoingPatch(s, Date.now()));
      haptic.light();
      toast('Keep going · 30 more minutes');
    },
    // ----- edge-case panel -----
    pickCi(v: Parameters<typeof ciPatch>[1]) { set((s) => ciPatch(s, v, Date.now())); },
    simAutoFired() { set((s) => ({ ...ciPatch(s, 'Checked in', Date.now()), ciStart: Date.now() - (LIMIT_MIN + 1) * 60000, session: null })); },
    simPrompt() { set((s) => ({ ...ciPatch(s, 'Checked in', Date.now()), ciStart: Date.now() - (LIMIT_MIN - WARN_BEFORE + 0.3) * 60000, session: null })); },
    simWorkoutAtLimit() {
      set((s) => ({ ...ciPatch(s, 'Checked in', Date.now()), ciStart: Date.now() - (LIMIT_MIN + 1) * 60000, session: s.session ?? newSession(s.mode, s.quick) }));
    },
  }), [d, set, toast]);
}

export function useCheckInPanel() {
  const A = useCheckIn();
  const { d } = useDomain();
  const inGym = d.ciStart != null && !d.ciOut;
  return [
    { label: 'Auto check-out fired (91 min)', run: A.simAutoFired },
    { label: '80-minute prompt', run: A.simPrompt },
    { label: 'Keep going (+30 min)', run: () => (inGym ? A.keepGoing() : A.simPrompt()) },
    { label: 'Manual check-out', run: () => (inGym ? A.checkOut() : A.pickCi('Checked in')) },
    { label: 'Workout still running at 90 min', run: A.simWorkoutAtLimit },
  ];
}
