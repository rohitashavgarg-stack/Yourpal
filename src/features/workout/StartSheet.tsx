import React from 'react';
import { router } from 'expo-router';
import { Button, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { newSession } from './session';

// One workout, one Start. (No Full / Quick / Low energy versions.)
export function StartWorkoutSheet({ onStarted }: { onStarted?: () => void }) {
  const { set } = useDomain();
  const { closeSheet } = useOverlay();
  const start = () => {
    haptic.medium();
    const s = newSession();
    closeSheet(() => { set({ session: s }); router.push('/workout'); onStarted?.(); });
  };
  return (
    <>
      <Txt style={{ fontFamily: font.semibold, fontSize: 26, lineHeight: 34, letterSpacing: -0.6 }}>Leg day</Txt>
      <Txt muted style={{ fontSize: 14, lineHeight: 21 }}>6 exercises · about 50 min · warm-up and cool-down included</Txt>
      <Button kind="accent" label="Start" onPress={start} />
    </>
  );
}
