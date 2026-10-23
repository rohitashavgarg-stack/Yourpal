import React from 'react';
import Svg, { Path } from 'react-native-svg';

export function HeartIcon({ size = 14, color }: { size?: number; color: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.4 3.3 5 6.6 5c2 0 3.4 1 5.4 3 2-2 3.4-3 5.4-3 3.3 0 5.5 3.4 4.1 6.8C19.5 16.4 12 21 12 21z" fill={color} /></Svg>;
}
