import React from 'react';
import { router } from 'expo-router';
import { Button, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useDomain } from '@/lib/domain';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { resetShell } from './state';

// Confirm before logging out: clears this phone's session and goes back to login.
export function LogoutSheet() {
  const { reset } = useStore();
  const { reset: resetDomain } = useDomain();
  const { closeSheet } = useOverlay();
  const out = () => closeSheet(() => {
    haptic.medium();
    if (router.canDismiss()) router.dismissAll();
    reset(); resetDomain(); resetShell();
    router.replace('/login');
  });
  return (
    <>
      <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.5 }}>Log out of YourPal?</Txt>
      <Txt muted>Your plans and history stay with your programmes. Log in again with your phone number any time.</Txt>
      <Button label="Log out" onPress={out} />
      <Button kind="secondary" label="Stay logged in" onPress={() => closeSheet()} />
    </>
  );
}
