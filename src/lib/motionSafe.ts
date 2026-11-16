import { Platform } from 'react-native';
import { useReducedMotion, withSpring, withTiming } from 'react-native-reanimated';

/**
 * Reduce Motion, as the app uses it. On a phone it follows the system setting. On the web (the prototype the designer reviews in a browser, where the setting is
 * often on without anyone choosing it) the animations always play, so the pages, sheets and cards can be judged.
 */
export const useReduce = () => useReducedMotion() && Platform.OS !== 'web';

/**
 * A spring that respects Reduce Motion: with the setting on, the value jumps to where it was going and nothing moves.
 * Use it in place of withSpring, with the flag from `useReduce()`.
 */
export const springTo = (to: number, config: Parameters<typeof withSpring>[1], reduce: boolean) => {
  'worklet';
  return reduce ? withTiming(to, { duration: 0 }) : withSpring(to, config);
};
