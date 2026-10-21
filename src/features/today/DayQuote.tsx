import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Txt } from '@/components/ui';
import { quoteOfDay } from '@/lib/microcopy';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// The last thing on Today: one thought for the day, set like a small poster. A soft charcoal to blue card, a big faint quote mark behind the text,
// the first part of the line quiet and the last words bright (the same treatment as the greeting).
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
    <View accessible accessibilityLabel={`Thought for today: ${text}`} style={{ borderRadius: 26, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? '#2B3140' : c.line }}>
      <LinearGradient colors={isDark ? ['#1B1E25', '#182338'] : [c.surface, c.accentSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 24, paddingTop: 22, paddingBottom: 24, gap: 14 }}>
        <Txt pointerEvents="none" style={{ position: 'absolute', top: -6, left: 10, fontFamily: font.displayBold, fontSize: 150, lineHeight: 170, color: isDark ? '#FFFFFF' : c.accent, opacity: isDark ? 0.07 : 0.08 }}>{'“'}</Txt>
        <Txt style={{ fontSize: 12, lineHeight: 17, letterSpacing: 0.4, color: isDark ? '#8FB2FF' : c.accentText, fontFamily: font.medium }}>Thought for today</Txt>
        <Txt style={{ fontFamily: font.display, fontSize: 26, lineHeight: 34, letterSpacing: -0.6, color: quiet }}>
          {lead + ' '}<Txt style={{ fontFamily: font.display, fontSize: 26, lineHeight: 34, letterSpacing: -0.6, color: ink }}>{key}</Txt>
        </Txt>
        <View style={{ width: 28, height: 2, borderRadius: 1, backgroundColor: isDark ? '#4C82F7' : c.accent }} />
      </LinearGradient>
    </View>
  );
}
