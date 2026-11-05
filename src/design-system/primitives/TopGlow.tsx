import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * A soft round glow from the top of an inner page, in the colour of what the page is about (green for assessments, blue for muscles, purple for photos).
 * Pass it as the backdrop of SubPage. `from="bottom"` draws the same glow rising from the bottom of the screen. It fades out completely: a round fade, never a band with a hard edge.
 */
export function TopGlow({ color, from = 'top' }: { color: string; from?: 'top' | 'bottom' }) {
  const id = 'topGlow' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, height: 380, ...(from === 'top' ? { top: 0 } : { bottom: 0 }) }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={id} cx="50%" cy={from === 'top' ? '0%' : '100%'} r="80%">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="0.5" stopColor={color} stopOpacity="0.1" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
