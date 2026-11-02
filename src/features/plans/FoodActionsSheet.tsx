import React from 'react';
import { View } from 'react-native';
import { Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { BigTitle, ListRow } from './parts';

// The three-dot menu of one food on the Diet plan page: Replace, Delete, and (for a food that is logged) Mark as not consumed.
// Each choice closes the sheet first, then does its job. "Delete" on a food from the coach's plan removes it for today only.
export function FoodActionsSheet({ name, eaten, planned, onReplace, onDelete, onNotConsumed }: {
  name: string; eaten: boolean; planned: boolean; onReplace: () => void; onDelete: () => void; onNotConsumed: () => void;
}) {
  const { c } = useTheme();
  const { closeSheet } = useOverlay();
  const go = (fn: () => void) => () => closeSheet(fn);
  return (
    <>
      <BigTitle>{name}</BigTitle>
      <View>
        <ListRow label="Replace" chevron={false} onPress={go(onReplace)} />
        {eaten && <ListRow label="Mark as not consumed" chevron={false} onPress={go(onNotConsumed)} />}
        <ListRow label="Delete" chevron={false} tone={c.warn} last right={planned ? <Txt v="caption">Today only</Txt> : undefined} onPress={go(onDelete)} />
      </View>
    </>
  );
}
