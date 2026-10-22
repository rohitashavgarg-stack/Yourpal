import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/design-system/tokens';
import { Pressy } from './Pressy';

/**
 * One choice in a set: a programme, an experience level, days a week, a food type, a range, a tab. It holds whatever the caller puts in it
 * (text, a logo, a number) and draws the container and its selected state.
 *   look "fill"     selected: ink fill. Not selected: `offFill` (transparent by default) with an optional 1 px `offLine`.
 *                   When there is an `offLine`, the selected one keeps a 1 px ink line so nothing moves.
 *   look "outline"  surface fill. Selected: 2 px ink line. Not selected: 1 px `offLine` (the line colour by default).
 * The caller colours its own text from `selected` (the background colour on ink, the ink or muted colour otherwise).
 */
export type OptionLook = 'fill' | 'outline';
export type OptionProps = {
  selected: boolean;
  onPress: () => void;
  look?: OptionLook;
  /** radio (one of a set, the default) or tab (a segmented control). */
  role?: 'radio' | 'tab';
  /** Spoken label when the content is not plain text. */
  accessibilityLabel?: string;
  /** Fixed height, or `minHeight` for a row that grows with its content. */
  height?: number;
  minHeight?: number;
  minWidth?: number;
  /** Corner radius. Default `radii.lg`. */
  radius?: number;
  /** Side padding. Default 0 (the content is centred). */
  padX?: number;
  /** Space between the children. */
  gap?: number;
  /** Lay the children out in a row (logo and text, icon and label). Default true. */
  row?: boolean;
  /** fill look, not selected: the fill. Default transparent. */
  offFill?: string;
  /** Not selected: the 1 px line colour. fill look: none by default; outline look: the line colour by default. */
  offLine?: string;
  /** Press scale. Default 0.97. */
  scaleTo?: number;
  /** Layout only: flex, margins. */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function Option({ selected, onPress, look = 'fill', role = 'radio', accessibilityLabel, height, minHeight, minWidth, radius = radii.lg, padX = 0, gap, row = true, offFill, offLine, scaleTo, style, children }: OptionProps) {
  const { c } = useTheme();
  const box = look === 'outline'
    ? { backgroundColor: c.surface, borderWidth: selected ? 2 : 1, borderColor: selected ? c.ink : offLine ?? c.line }
    : { backgroundColor: selected ? c.ink : offFill ?? 'transparent', ...(offLine ? { borderWidth: 1, borderColor: selected ? c.ink : offLine } : null) };
  return (
    <Pressy accessibilityRole={role} accessibilityState={{ selected }} accessibilityLabel={accessibilityLabel} onPress={onPress} scaleTo={scaleTo}
      style={[{
        ...(height !== undefined ? { height } : null), ...(minHeight !== undefined ? { minHeight } : null), ...(minWidth !== undefined ? { minWidth } : null),
        borderRadius: radius, paddingHorizontal: padX, ...(gap !== undefined ? { gap } : null),
        flexDirection: row ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', ...box,
      }, style]}>
      {children}
    </Pressy>
  );
}
