import React, { useState } from 'react';
import { PersonAvatar } from '@/components/Brand';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Pill, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { ListCard } from '@/features/progress/parts';
import { FLAG_REASONS } from './data';
import { gymStore } from './state';
import { fontSizes } from '@/design-system/tokens';

const H = { fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.5 } as const;

// Sheet content reads its own hooks (it renders in the root overlay).
export function FlagSheet() {
  const { closeSheet, toast } = useOverlay();
  const [reason, setReason] = useState<string | null>(null);
  return (
    <>
      <Txt style={H}>Reject this session?</Txt>
      <Txt muted>It won’t count toward your package. Coach Vikram will see that you rejected it.</Txt>
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {FLAG_REASONS.map((l) => <Pill key={l} label={l} on={reason === l} onPress={() => setReason(l)} />)}
      </View>
      <Button label="Reject session" onPress={() => closeSheet(() => {
        gymStore.set({ sessionState: 'rejected' });
        haptic.medium();
        if (router.canGoBack()) router.back();
        toast('Session rejected. Not counted in your package');
      })} />
      <Button kind="secondary" label="Cancel" onPress={() => closeSheet()} />
    </>
  );
}

export function ChatOptionsSheet() {
  const { closeSheet, toast } = useOverlay();
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><PersonAvatar who="coach" size={44} /><Txt style={H}>Coach Vikram</Txt></View>
      <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Chat stays in the app · no phone numbers are shared</Txt>
      <ListCard style={{ paddingHorizontal: 0, shadowOpacity: 0, elevation: 0 }} rows={[
        { l: 'View profile', onPress: () => closeSheet(() => router.push('/coach')) },
        { l: 'Report', onPress: () => closeSheet(() => toast('Reported. The gym admin will review this chat')) },
        { l: 'Block', warn: true, onPress: () => closeSheet(() => { gymStore.set({ blocked: true }); haptic.medium(); }) },
      ]} />
    </>
  );
}
