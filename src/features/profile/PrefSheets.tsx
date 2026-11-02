import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { fontSizes } from '@/design-system/tokens';

export const GENDERS = ['Male', 'Female', 'Other'];
export const DIETS = ['Veg', 'Eggetarian', 'Non-veg', 'Jain', 'Vegan'];
export const TRAIN_DAYS = [2, 3, 4, 5, 6];

// Gender is read-only in My details. "Change" opens this sheet, and Save writes it.
export function GenderSheet() {
  const { state, setProfile } = useStore();
  const { closeSheet, toast } = useOverlay();
  const [g, setG] = useState(state.profile.gender);
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: fontSizes.xl2, lineHeight: 29 }}>Gender</Txt>
      <Row style={{ gap: 6 }}>
        {GENDERS.map((x) => <Pill key={x} label={x} on={g === x} onPress={() => { setG(x); haptic.tick(); }} style={{ flex: 1 }} />)}
      </Row>
      <Button label="Save" onPress={() => { setProfile({ gender: g }); haptic.success(); closeSheet(() => toast('Saved. Coach Vikram sees the update')); }} />
    </View>
  );
}
