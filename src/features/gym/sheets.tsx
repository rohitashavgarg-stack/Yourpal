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

const H = { fontFamily: font.semibold, fontSize: 22, lineHeight: 29, letterSpacing: -0.5 } as const;

// Sheet content reads its own hooks (it renders in the root overlay).
export function FlagSheet() {
  const { closeSheet, toast } = useOverlay();
  const [reason, setReason] = useState<string | null>(null);
  return (
    <>
      <Txt style={H}>This session didn’t happen?</Txt>
      <Txt muted>We’ll flag it to the gym admin to check. It won’t count toward your package and Coach Vikram isn’t messaged directly.</Txt>
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {FLAG_REASONS.map((l) => <Pill key={l} label={l} on={reason === l} onPress={() => setReason(l)} />)}
      </View>
      <Button label="Flag to gym admin" onPress={() => closeSheet(() => {
        gymStore.set({ sessionState: 'flagged' });
        haptic.medium();
        if (router.canGoBack()) router.back();
        toast('Flagged to the gym admin · not counted');
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
      <Txt v="caption" style={{ fontSize: 13 }}>Chat stays in the app · no phone numbers are shared</Txt>
      <ListCard style={{ paddingHorizontal: 0, shadowOpacity: 0, elevation: 0 }} rows={[
        { l: 'View profile', onPress: () => closeSheet(() => router.push('/coach')) },
        { l: 'Report', onPress: () => closeSheet(() => toast('Reported · the gym admin will review this chat')) },
        { l: 'Block', warn: true, onPress: () => closeSheet(() => { gymStore.set({ blocked: true }); haptic.medium(); }) },
      ]} />
    </>
  );
}
