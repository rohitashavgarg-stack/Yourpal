import React from 'react';
import Svg, { Path } from 'react-native-svg';

// A drawn signature: one SVG path, scaled to the width it is given. w and h are the size of the pad it was drawn on.
export function Signature({ d, w, h, color }: { d: string; w: number; h: number; color: string }) {
  return (
    <Svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ aspectRatio: w / h }}>
      <Path d={d} stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}
