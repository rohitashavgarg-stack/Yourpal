import { FadeIn, FadeOut } from 'react-native-reanimated';

// Screen and card entering / exiting: a plain short fade. No springs, bounce or overshoot.
// (Custom easings on layout animations are not supported on web, so these stay linear.)
export const fade = (delay = 0) => FadeIn.duration(180).delay(delay);
export const fadeOut = () => FadeOut.duration(150);
