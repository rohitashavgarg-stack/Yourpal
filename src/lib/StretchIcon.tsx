import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * A person stretching to the side, drawn in the same outline style as the other icons (24 px grid, round ends). The icon set has no figure like it.
 * Used for Warm-up. Takes the same props as the other icons: size, color, strokeWidth.
 */
export default function StretchIcon({ size = 24, color = 'currentColor', strokeWidth = 1.7 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={7.2} cy={9.4} r={2.2} />
      <Path d="M12.4 10.6c.9-3.2.4-5.5-1.7-6.6L7.2 2.6" />
      <Path d="M12.4 10.6l3.2 5" />
      <Path d="M8.6 12.1c-1.3 1-1.3 2.6.1 3.6" />
      <Path d="M9.7 15.9l5.9-.3" />
      <Path d="M10.6 16.1l-2.4 5.9M15.3 15.7l1.9 6.3" />
    </Svg>
  );
}
