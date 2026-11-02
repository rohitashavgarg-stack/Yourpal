import React from 'react';
import { View } from 'react-native';
import { Button, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { ListCard, SubPage } from '@/features/shell/parts';
import { fontSizes } from '@/design-system/tokens';
import { DaysSheet, DietSheet, InjurySheet } from '@/features/profile/PrefSheets';

// Training days, diet and injuries. Read-only here; Change opens a small sheet.
export default function Preferences() {
  const { c } = useTheme();
  const { state } = useStore();
  const { openSheet } = useOverlay();
  const p = state.profile;
  const rows = [
    { l: 'Days you can train', v: p.days ? String(p.days) : 'Not set', sheet: <DaysSheet /> },
    { l: 'Diet type', v: p.diet || 'Not set', sheet: <DietSheet /> },
    { l: 'Injuries or pain', v: p.injury === 'Yes' ? 'Yes' : 'None', note: p.injury === 'Yes' ? p.injuryNote : '', sheet: <InjurySheet /> },
  ];
  return (
    <SubPage title="Preferences" fallback="/profile">
      <ListCard>
        {rows.map((r, i) => (
          <View key={r.l} style={{ minHeight: 60, paddingLeft: 16, paddingRight: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: i === rows.length - 1 ? 0 : 1, borderBottomColor: c.line }}>
            <View style={{ flex: 1, paddingVertical: 8 }}>
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{r.l}</Txt>
              <Txt style={{ fontFamily: font.semibold }} numberOfLines={1}>{r.v}</Txt>
              {!!r.note && <Txt muted style={{ fontSize: fontSizes.md }} numberOfLines={2}>{r.note}</Txt>}
            </View>
            <Button small kind="secondary" label="Change" accessibilityLabel={`Change ${r.l}`} onPress={() => openSheet(r.sheet, { label: r.l })} />
          </View>
        ))}
      </ListCard>
    </SubPage>
  );
}
