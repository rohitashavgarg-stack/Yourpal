import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/design-system/tokens';

/**
 * Thin progress bars.
 *
 * ProgressBar: a track with a fill. The fill is `percent` (0 to 100) wide, or follows `fillStyle` when it is animated (a reanimated style
 * with a width). Heights are 3, 4, 6 or 8 px; corners are always `radii.xs`.
 *
 * ProgressSegments: a row of equal segments, one per step (an exercise, a story, a day), each with its own colour. The caller says which
 * segment is done, current or still to come by the colour it gives it.
 */
export type BarHeight = 3 | 4 | 6 | 8;
export type BarTrack = 'surface2' | 'surface3';

export type ProgressBarProps = Omit<ViewProps, 'style'> & {
  height?: BarHeight;
  /** The empty part. surface2 on a card, surface3 on a surface2 panel. */
  track?: BarTrack;
  /** The fill colour. */
  color: string;
  /** How much is filled, 0 to 100. Leave out when `fillStyle` animates the width. */
  percent?: number;
  /** An animated style for the fill (width). */
  fillStyle?: React.ComponentProps<typeof Animated.View>['style'];
  /** Layout only: flex, width, margins. */
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({ height = 6, track = 'surface2', color, percent, fillStyle, style, accessibilityValue, ...rest }: ProgressBarProps) {
  const { c } = useTheme();
  return (
    <View accessibilityRole={accessibilityValue ? 'progressbar' : undefined} accessibilityValue={accessibilityValue} {...rest}
      style={[{ height, borderRadius: radii.xs, backgroundColor: c[track], overflow: 'hidden' }, style]}>
      <Animated.View style={[{ height: '100%', borderRadius: radii.xs, backgroundColor: color, ...(percent !== undefined ? { width: `${percent}%` as `${number}%` } : null) }, fillStyle]} />
    </View>
  );
}

export type Segment = { color: string; /** Spoken label of this segment, for example "Logged". */ label?: string };
export type ProgressSegmentsProps = Omit<ViewProps, 'style'> & {
  segments: Segment[];
  height?: BarHeight;
  /** Space between segments: 3 or 4 px. */
  gap?: 3 | 4;
  /** Layout only: flex, width, margins, position. */
  style?: StyleProp<ViewStyle>;
};

export function ProgressSegments({ segments, height = 4, gap = 4, style, ...rest }: ProgressSegmentsProps) {
  return (
    <View {...rest} style={[{ flexDirection: 'row', gap }, style]}>
      {segments.map((s, i) => <View key={i} accessibilityLabel={s.label} style={{ flex: 1, height, borderRadius: radii.xs, backgroundColor: s.color }} />)}
    </View>
  );
}
