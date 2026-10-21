import React from 'react';
import { View } from 'react-native';
import { Txt } from '@/components/ui';
import { quoteOfDay } from '@/lib/microcopy';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// The last thing on Today: one quote for the day, no box.
export function DayQuote() {
  const { c } = useTheme();
  const day = new Date();
  const text = quoteOfDay(day.getFullYear() * 400 + day.getMonth() * 31 + day.getDate());
  return (
    <View accessible accessibilityLabel={`Quote of the day: ${text}`} style={{ alignItems: 'center', paddingHorizontal: 28, paddingTop: 16, paddingBottom: 8 }}>
      <Txt style={{ fontFamily: font.display, fontSize: 40, lineHeight: 44, color: c.muted, opacity: 0.5 }}>{'\u201C'}</Txt>
      <Txt style={{ fontFamily: font.display, fontSize: 20, lineHeight: 28, letterSpacing: -0.3, textAlign: 'center', color: c.ink }}>{text}</Txt>
    </View>
  );
}
