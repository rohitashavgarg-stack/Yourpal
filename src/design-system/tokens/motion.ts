import { FadeIn, FadeOut } from 'react-native-reanimated';

// Motion tokens.
// Spring presets (iOS-like). Moved from src/theme/tokens.ts unchanged.
export const spring = {
  snappy: { damping: 18, stiffness: 260, mass: 0.8 },
  soft: { damping: 22, stiffness: 180, mass: 1 },
  bouncy: { damping: 12, stiffness: 220, mass: 0.9 },
  nav: { damping: 32, stiffness: 300, mass: 1 }, // tab bar pill: near critically damped, no visible bounce
};

// Durations in ms. Screen and card entering and exiting is a plain short fade: no springs, bounce or overshoot.
export const duration = { fadeIn: 180, fadeOut: 150 } as const;

// Moved from src/theme/motion.ts unchanged.
// (Custom easings on layout animations are not supported on web, so these stay linear.)
export const fade = (delay = 0) => FadeIn.duration(duration.fadeIn).delay(delay);
export const fadeOut = () => FadeOut.duration(duration.fadeOut);
