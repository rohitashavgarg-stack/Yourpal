import React from 'react';
import { useOverlay } from '@/components/Overlay';
import { BigTitle } from '@/features/plans/parts';
import { DownloadRow } from '@/features/reports/DownloadRow';
import { ReportSheet } from '@/features/reports/ReportSheet';

// The three dots next to the Progress heading. Picking the time comes first, so this card opens the report sheet.
export function ProgressMenuSheet() {
  const { closeSheet, openSheet } = useOverlay();
  return (
    <>
      <BigTitle>Progress</BigTitle>
      <DownloadRow title="Progress report" sub="Goal, attendance and measurements" onPress={() => closeSheet(() => openSheet(<ReportSheet />, { label: 'Progress report' }))} />
    </>
  );
}
