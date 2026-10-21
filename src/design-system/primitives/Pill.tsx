import React, { useEffect } from 'react';
import { StyleProp, Text, ViewStyle } from 'react-native';
import { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { radii, fontSizes, font } from '@/design-system/tokens';
import { Pressy } from './Pressy';

export type PillProps = { label: string; on: boolean; onPress: () => void; style?: StyleProp<ViewStyle> };

/** A selectable pill for filters and options. `on` fills it with ink over 220 ms. */
export function Pill({ label, on, onPress, style }: PillProps) {
  const { c } = useTheme();
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => { p.value = withTiming(on ? 1 : 0, { duration: 220 }); }, [on]);
  const a = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ['rgba(0,0,0,0)', c.ink]),
    borderColor: interpolateColor(p.value, [0, 1], [c.surface3, c.ink]),
  }));
  return (
    <Pressy accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={onPress} style={[{ height: 44, paddingHorizontal: 16, borderRadius: radii.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, a as any, style]}>
      <Text style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 18, color: on ? c.bg : c.ink }}>{label}</Text>
    </Pressy>
  );
}
