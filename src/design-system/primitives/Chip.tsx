import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, fixed } from '@/design-system/tokens';

export type ChipTone = 'default' | 'good' | 'warn' | 'live';
export type ChipProps = { label: string; icon?: React.ReactNode; tone?: ChipTone; onDark?: boolean; style?: StyleProp<ViewStyle> };

/** Outline chip: information, never an action. */
export function Chip({ label, icon, tone = 'default', onDark, style }: ChipProps) {
  const { c } = useTheme();
  const col = tone === 'good' ? c.good : tone === 'warn' ? c.warn : tone === 'live' ? c.live : onDark ? fixed.white : c.ink;
  const border = tone === 'default' ? (onDark ? 'rgba(255,255,255,0.28)' : c.chipLine) : col;
  return (
    <View style={[{ height: 28, paddingHorizontal: 11, borderRadius: 14, borderWidth: 1, borderColor: border, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }, style]}>
      {icon}
      <Text style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, color: col }}>{label}</Text>
    </View>
  );
}
