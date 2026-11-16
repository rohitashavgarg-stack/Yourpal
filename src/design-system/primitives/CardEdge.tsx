import React, { useId, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

// A phone ignores the transparency in a gradient stop's colour (a stop of rgba white draws solid white). So the colour is split into a plain colour and a separate opacity.
function split(col: string): { color: string; opacity: number } {
  const m = col.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (m) return { color: `rgb(${m[1]},${m[2]},${m[3]})`, opacity: m[4] === undefined ? 1 : Number(m[4]) };
  const h = col.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})$/);
  if (h) return { color: '#' + h[1], opacity: parseInt(h[2], 16) / 255 };
  return { color: col, opacity: 1 };
}

/**
 * The thin gradient stroke of a card (a hairline: 0.75 px): bright at the top left, fading out to the bottom right. Put it as the last child of a card (the card needs no padding change).
 * It is drawn over the card, takes no taps, and follows the card's size. Pass the card's corner radius, and a `from` and `to` colour for a coloured stroke.
 */
export function CardEdge({ radius, from, to }: { radius: number; from?: string; to?: string }) {
  const { c } = useTheme();
  // each stroke needs its own gradient id, or one card's colours leak into every other card on the page
  const id = 'cardEdge' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const a = split(from ?? c.cardEdgeFrom);
  const b = split(to ?? c.cardEdgeTo);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  return (
    <View pointerEvents="none" onLayout={onLayout} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {box.w > 0 && (
        <Svg width={box.w} height={box.h}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={a.color} stopOpacity={a.opacity} />
              <Stop offset="1" stopColor={b.color} stopOpacity={b.opacity} />
            </LinearGradient>
          </Defs>
          <Rect x={0.375} y={0.375} width={box.w - 0.75} height={box.h - 0.75} rx={Math.max(0, radius - 0.375)} ry={Math.max(0, radius - 0.375)} fill="none" stroke={`url(#${id})`} strokeWidth={0.75} />
        </Svg>
      )}
    </View>
  );
}
