import { withSpring, withTiming } from 'react-native-reanimated';

/**
 * A spring that respects Reduce Motion: with the system setting on, the value jumps to where it was going and nothing moves.
 * Use it in place of withSpring, with the flag from `useReducedMotion()`.
 */
export const springTo = (to: number, config: Parameters<typeof withSpring>[1], reduce: boolean) => {
  'worklet';
  return reduce ? withTiming(to, { duration: 0 }) : withSpring(to, config);
};
