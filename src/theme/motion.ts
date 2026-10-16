import { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

// Motion (from the reference video the designer shared): calm and soft, never bouncy. No springs, bounce or overshoot on
// anything that enters or leaves. (Custom easings on layout animations are not supported on web, so these stay linear there.)

// A plain short fade, for small things that appear in place (a chip, a row inside a card).
export const fade = (delay = 0) => FadeIn.duration(180).delay(delay);
export const fadeOut = () => FadeOut.duration(150);

// Cards on a page settle in: fade in while rising 14 px, one after another (pass the index times ~60 ms as the delay).
export const rise = (delay = 0) => FadeInDown.duration(420).delay(delay).withInitialValues({ opacity: 0, transform: [{ translateY: 14 }] });

// Headlines write themselves in: word by word, each fading in and rising 8 px, ~45 ms apart.
export const wordIn = (i: number, base = 0) => FadeInDown.duration(380).delay(base + i * 45).withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] });

// A value that changes in place (a status, a label): the new one fades in rising 6 px.
export const swapIn = () => FadeInDown.duration(260).withInitialValues({ opacity: 0, transform: [{ translateY: 6 }] });

// Screen transitions (see Zoom in app/_layout): open 420 ms, close 340 ms, a smooth speed-up / slow-down curve, with a blur that clears as it opens.
export const SCREEN_IN = 420;
export const SCREEN_OUT = 340;
