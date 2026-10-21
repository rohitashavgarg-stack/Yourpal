import React from 'react';
import Animated from 'react-native-reanimated';
import { fade } from '@/design-system/tokens';

type Props = Omit<React.ComponentProps<typeof Animated.View>, 'entering'> & {
  /** Stagger index: the fade starts i x step ms after mount. Use this for lists of cards on a screen. */
  i?: number;
  /** Milliseconds per stagger index. Default 40 (Today uses 50). */
  step?: number;
  /** Delay in ms. Wins over `i` when both are given. */
  delay?: number;
};

/**
 * The one fade-in wrapper. Screen and card entering is a plain 180 ms fade (see `fade` in the motion tokens):
 * no springs, bounce or overshoot. It is an Animated.View, so any View prop (style, pointerEvents, ...) and
 * `exiting` / `layout` pass straight through.
 *
 *   <FadeIn i={2}>...</FadeIn>            staggered by index
 *   <FadeIn delay={120} style={...}>      explicit delay
 */
export function FadeIn({ i, step = 40, delay, children, ...rest }: Props) {
  return <Animated.View entering={fade(delay ?? (i ?? 0) * step)} {...rest}>{children}</Animated.View>;
}
