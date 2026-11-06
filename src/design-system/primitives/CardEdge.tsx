import React, { useId, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The 1 px gradient stroke of a card: bright at the top left, fading out to the bottom right. Put it as the last child of a card (the card needs no padding change).
 * It is drawn over the card, takes no taps, and follows the card's size. Pass the card's corner radius, and a `from` and `to` colour for a coloured stroke.
 */
export function CardEdge({ radius, from, to }: { radius: number; from?: string; to?: string }) {
  const { c } = useTheme();
  // each stroke needs its own gradient id, or one card's colours leak into every other card on the page
  const id = 'cardEdge' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  return (
    <View pointerEvents="none" onLayout={onLayout} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {box.w > 0 && (
        <Svg width={box.w} height={box.h}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={from ?? c.cardEdgeFrom} />
              <Stop offset="1" stopColor={to ?? c.cardEdgeTo} />
            </LinearGradient>
          </Defs>
          <Rect x={0.5} y={0.5} width={box.w - 1} height={box.h - 1} rx={radius - 0.5} ry={radius - 0.5} fill="none" stroke={`url(#${id})`} strokeWidth={1} />
        </Svg>
      )}
    </View>
  );
}
