import React from 'react';
import { View } from 'react-native';
import { Txt } from '@/components/ui';
import { quoteOfDay } from '@/lib/microcopy';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Glow } from './GoalTickCard';

// The last thing on Today: one thought for the day, straight on the page. No card: a big faint quote mark, the line in two tones
// (the first part quiet, the last words bright, like the greeting) and a soft blue glow behind it.
export function DayQuote() {
  const { c, isDark } = useTheme();
  const day = new Date();
  const text = quoteOfDay(day.getFullYear() * 400 + day.getMonth() * 31 + day.getDate());
  const words = text.split(' ');
  const cut = Math.max(1, words.length - Math.max(2, Math.round(words.length * 0.4)));
  const lead = words.slice(0, cut).join(' ');
  const key = words.slice(cut).join(' ');
  const ink = isDark ? '#F3F4F6' : c.ink;
  const quiet = isDark ? 'rgba(243,244,246,0.58)' : c.muted;
  return (
    <View accessible accessibilityLabel={`Thought for today: ${text}`} style={{ paddingHorizontal: 8, paddingTop: 36, paddingBottom: 40, gap: 14 }}>
      <Glow color="#2F6BEA" a={isDark ? 0.4 : 0.14} side="left" />
      <Txt pointerEvents="none" style={{ position: 'absolute', top: 6, left: 4, fontFamily: font.displayBold, fontSize: 150, lineHeight: 170, color: isDark ? '#FFFFFF' : c.accent, opacity: isDark ? 0.08 : 0.09 }}>{'“'}</Txt>
      <Txt style={{ fontSize: 12, lineHeight: 17, letterSpacing: 0.4, color: isDark ? '#8FB2FF' : c.accentText, fontFamily: font.medium }}>Thought for today</Txt>
      <Txt style={{ fontFamily: font.display, fontSize: 26, lineHeight: 34, letterSpacing: -0.6, color: quiet }}>
        {lead + ' '}<Txt style={{ fontFamily: font.display, fontSize: 26, lineHeight: 34, letterSpacing: -0.6, color: ink }}>{key}</Txt>
      </Txt>
    </View>
  );
}
