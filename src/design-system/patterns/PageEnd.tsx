import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Txt } from '@/components/ui';
import { YourPalLogo } from '@/design-system/primitives/YourPalLogo';
import { font, fontSizes } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

const ART = require('../../../assets/illustrations/today-end.webp');

/**
 * The end of a long page: one illustration, a big quiet line under it and the YourPal mark. Nothing to tap. It scrolls with the page and
 * sits below the last card, so the page ends with a picture and not with a card. First used at the bottom of Today.
 *
 *   line   the quiet line under the picture; \n starts a new line
 */
export function PageEnd({ line = 'Your pace.\nYour pal.' }: { line?: string }) {
  const { c } = useTheme();
  const [w, setW] = useState(0); // the picture is sized from the width it gets: an aspect ratio alone is stretched by the picture's own height on web
  return (
    <View style={{ paddingTop: 40, paddingBottom: 8, gap: 20 }}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
        {w > 0 && <Image source={ART} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" resizeMode="contain" style={{ width: w, height: Math.round((w * 1199) / 1312) }} />}
      </View>
      <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl6, lineHeight: 50, letterSpacing: -1.6, color: c.muted, opacity: 0.55, paddingHorizontal: 8 }}>{line}</Txt>
      <View style={{ paddingHorizontal: 8 }}><YourPalLogo height={26} color={c.muted} /></View>
    </View>
  );
}
