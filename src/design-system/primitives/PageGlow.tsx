import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { fixed } from '@/design-system/tokens';

/**
 * A very faint blue light in the top left corner of the screen. It is mounted once, over the whole app, so every page has it. It takes no taps and fades to
 * nothing (a round fade, never a band with an edge). Keep it faint: it is a mood, not a shape.
 */
export function PageGlow() {
  const { isDark } = useTheme();
  const peak = isDark ? '0.15' : '0.07';
  const mid = isDark ? '0.05' : '0.025';
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: 0, left: 0, width: '90%', height: 380 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="pageGlowBlue" cx="0%" cy="0%" r="100%">
            <Stop offset="0" stopColor={fixed.blue} stopOpacity={peak} />
            <Stop offset="0.55" stopColor={fixed.blue} stopOpacity={mid} />
            <Stop offset="1" stopColor={fixed.blue} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pageGlowBlue)" />
      </Svg>
    </View>
  );
}
