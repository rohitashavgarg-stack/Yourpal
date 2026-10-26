import React from 'react';
import { View } from 'react-native';
import { ChartNoAxesColumn } from '@/lib/icons';
import { Pressy, Txt } from '@/components/ui';
import { GlassBackdrop } from '@/components/Glass';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';

// Glass pill with a bar-chart icon and "Trends": opens the trend page of a tracker. Same button on the water and weight screens.
export function TrendsButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { c, isDark } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} scaleTo={0.92}
      style={{ height: 44, paddingHorizontal: 16, borderRadius: radii.lg, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <GlassBackdrop radius={22} tint={isDark ? 'rgba(255,255,255,0.10)' : 'rgba(11,14,20,0.05)'} />
      {/* in a View so on the web it is drawn above the glass layer (a bare svg is not positioned and ends up underneath) */}
      <View><ChartNoAxesColumn size={18} color={c.ink} /></View>
      <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20 }}>Trends</Txt>
    </Pressy>
  );
}
