import React from 'react';
import { View } from 'react-native';
import { useOverlay } from '@/components/Overlay';
import { BigTitle, ListRow } from '@/features/plans/parts';
import { ReportSheet } from '@/features/reports/ReportSheet';

// The three dots next to the Progress heading.
export function ProgressMenuSheet() {
  const { closeSheet, openSheet } = useOverlay();
  return (
    <>
      <BigTitle>Progress</BigTitle>
      <View>
        <ListRow label="Download progress report" chevron={false} last onPress={() => closeSheet(() => openSheet(<ReportSheet />, { label: 'Progress report' }))} />
      </View>
    </>
  );
}
