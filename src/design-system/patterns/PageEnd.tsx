import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Line, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Txt } from '@/components/ui';
import { YourPalLogo } from '@/design-system/primitives/YourPalLogo';
import { fixed, font, fontSizes } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

const ART = require('../../../assets/illustrations/today-end.webp');
const RATIO = 1199 / 1312;   // the picture's height over its width
const LINE = 50;             // line height of the big words
const SIDE = 16;             // the page's side padding: the section runs edge to edge, past it

/**
 * The end of a long page, edge to edge: a soft blue glow, the illustration large and cropped at the left edge, a big quiet line sitting on
 * the foot of the picture, a dashed line and the YourPal mark. Nothing to tap. It scrolls with the page and sits below the last card, so the
 * page ends with a picture and not with a card. First used at the bottom of Today.
 *
 *   line   the quiet line; \n starts a new line. The first line is the quieter one.
 */
export function PageEnd({ line = 'Your pace.\nYour pal.' }: { line?: string }) {
  const { c } = useTheme();
  const [w, setW] = useState(0); // sized from the width it gets: an aspect ratio alone is stretched by the picture's own height on web
  const imgW = Math.round(w * 1.08);
  const imgH = Math.round(imgW * RATIO);
  const h = Math.round(imgH * 1.12); // a little room above the figure for the glow
  const lines = line.split('\n');
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ marginHorizontal: -SIDE, marginTop: 4, overflow: 'hidden' }}>
      <View style={{ width: '100%', height: w > 0 ? h : 0 }}>
        {w > 0 && (
          <>
            <Svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
              <Defs>
                <RadialGradient id="pageEndGlow" cx="60%" cy="44%" r="56%">
                  <Stop offset="0" stopColor={fixed.blue} stopOpacity={0.95} />
                  <Stop offset="0.5" stopColor={fixed.blue} stopOpacity={0.3} />
                  <Stop offset="1" stopColor={fixed.blue} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect x={0} y={0} width={w} height={h} fill="url(#pageEndGlow)" />
            </Svg>
            <Image source={ART} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" resizeMode="contain"
              style={{ position: 'absolute', left: -Math.round(w * 0.27), top: h - imgH, width: imgW, height: imgH }} />
            <LinearGradient pointerEvents="none" colors={[c.bg, `${c.bg}00`]} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '30%' }} />
            <LinearGradient pointerEvents="none" colors={[`${c.bg}00`, c.bg]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '42%' }} />
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: c.bg }} />
          </>
        )}
      </View>
      <View style={{ paddingHorizontal: SIDE + 4, marginTop: -14, gap: 18 }}>
        {/* the words fade in from the top: soft grey words under a gradient of the page colour that is solid at the top and clear at the bottom, across both lines */}
        <View style={{ height: lines.length * LINE }}>
          {lines.map((l, i) => <Txt key={i} style={{ fontFamily: font.semibold, fontSize: fontSizes.xl6, lineHeight: LINE, letterSpacing: -1.6, color: `${c.ink}B3` }}>{l}</Txt>)}
          <LinearGradient pointerEvents="none" colors={[c.bg, `${c.bg}00`]} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        </View>
        <Svg width="100%" height={2}><Line x1="0" y1="1" x2="100%" y2="1" stroke={c.muted} strokeOpacity={0.4} strokeWidth={1} strokeDasharray="3 3" /></Svg>
        <YourPalLogo height={26} color={c.muted} />
      </View>
      <View style={{ height: 8 }} />
    </View>
  );
}
