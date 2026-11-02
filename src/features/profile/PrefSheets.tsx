import React from 'react';
import { View } from 'react-native';
import { Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { fontSizes } from '@/design-system/tokens';

export const GENDERS = ['Male', 'Female', 'Other'];
export const DIETS = ['Veg', 'Eggetarian', 'Non-veg', 'Jain', 'Vegan'];
export const TRAIN_DAYS = [2, 3, 4, 5, 6];

// Gender is read-only in My details. "Change" opens this sheet; picking one saves it and closes the sheet.
export function GenderSheet() {
  const { state, setProfile } = useStore();
  const { closeSheet, toast } = useOverlay();
  const g = state.profile.gender;
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: fontSizes.xl2, lineHeight: 29 }}>Gender</Txt>
      <Row style={{ gap: 6 }}>
        {GENDERS.map((x) => <Pill key={x} label={x} on={g === x} style={{ flex: 1 }}
          onPress={() => { setProfile({ gender: x }); haptic.success(); closeSheet(() => toast('Gender updated')); }} />)}
      </Row>
    </View>
  );
}
