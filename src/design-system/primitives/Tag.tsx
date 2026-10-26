import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { font, fontSizes, radii } from '@/design-system/tokens';

// ---------- Small pill tag (filled) ----------
export function Tag({ label, bg, fg, style }: { label: string; bg: string; fg: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radii.pill, backgroundColor: bg }, style]}>
      <Text style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 16, color: fg }}>{label}</Text>
    </View>
  );
}
