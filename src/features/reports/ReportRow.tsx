import React from 'react';
import { View } from 'react-native';
import { Download, FileText } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { ReportSheet } from '@/features/reports/ReportSheet';

// On the Progress tab: opens the report sheet.
export function ReportRow() {
  const { c } = useTheme();
  const { openSheet } = useOverlay();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel="Progress report. Download as PDF" onPress={() => openSheet(<ReportSheet />, { label: 'Progress report' })} scaleTo={0.985}
      style={{ minHeight: 64, borderRadius: radii.lg, backgroundColor: c.surface, paddingHorizontal: 16 }}>
      <Row style={{ flex: 1, gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><FileText size={18} color={c.accentText} /></View>
        <Txt style={{ flex: 1, fontFamily: font.semibold, fontSize: fontSizes.base }}>Progress report</Txt>
        <Download size={20} color={c.muted} />
      </Row>
    </Pressy>
  );
}
