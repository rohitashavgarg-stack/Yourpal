import React from 'react';
import { ScrollView, View } from 'react-native';
import { Check } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { COUNTRIES, Country } from '@/lib/countries';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';

// The country code list in a bottom sheet. Picking one closes the sheet.
export function CountrySheet({ value, onPick }: { value: Country; onPick: (c: Country) => void }) {
  const { c } = useTheme();
  const { closeSheet } = useOverlay();
  return (
    <View style={{ gap: 8 }}>
      <Txt accessibilityRole="header" v="title">Country code</Txt>
      <ScrollView style={{ maxHeight: 420 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {COUNTRIES.map((k, i) => {
          const on = k.name === value.name;
          return (
            <Pressy key={k.name} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${k.name}, ${k.code}`} onPress={() => closeSheet(() => onPick(k))} scaleTo={0.985}
              style={{ minHeight: 56, borderBottomWidth: i < COUNTRIES.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
              <Row style={{ minHeight: 56, gap: 12 }}>
                <Txt style={{ flex: 1, fontFamily: on ? font.semibold : font.regular }}>{k.name}</Txt>
                <Txt muted style={{ fontSize: fontSizes.md }}>{k.code}</Txt>
                <View style={{ width: 20 }}>{on && <Check size={18} color={c.accentText} />}</View>
              </Row>
            </Pressy>
          );
        })}
      </ScrollView>
    </View>
  );
}
