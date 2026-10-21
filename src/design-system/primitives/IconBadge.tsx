import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

export type IconBadgeProps = {
  /** Width and height in px. */
  size: number;
  /** Fill colour. Leave out for a badge with only a border. */
  bg?: string;
  /** Corner radius in px. Default is a circle (half the size). Use a `radii` token for a rounded square. */
  radius?: number;
  /** An icon, a letter or a small drawing, centred. */
  children?: React.ReactNode;
  /** Line colour and width, for the outlined badges. */
  borderColor?: string;
  borderWidth?: number;
  accessibilityLabel?: string;
  /** Merged last: position, margin, overflow. */
  style?: StyleProp<ViewStyle>;
};

/** A square or round tile with one icon centred in it: the tinted icon tiles in lists, headers and cards. */
export function IconBadge({ size, bg, radius, children, borderColor, borderWidth, accessibilityLabel, style }: IconBadgeProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={[{ width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', ...(borderWidth ? { borderWidth, borderColor } : null) }, style]}>
      {children}
    </View>
  );
}
