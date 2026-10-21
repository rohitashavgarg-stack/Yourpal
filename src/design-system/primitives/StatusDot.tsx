import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

export type StatusDotProps = {
  /** Diameter in px. */
  size: number;
  color: string;
  /** Merged last: margin, position. */
  style?: StyleProp<ViewStyle>;
};

/** A small solid dot: a status, a legend key, an unread mark, one cell of a grid. */
export function StatusDot({ size, color, style }: StatusDotProps) {
  return <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />;
}
