import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

// The only file that talks to expo-haptics. Every call is wrapped: the web build has no haptics,
// and a missing or failing motor must never break a screen.
const isWeb = Platform.OS === 'web';
const isAndroid = Platform.OS === 'android';

const safe = (fn: () => Promise<unknown> | void) => {
  try {
    const r = fn();
    if (r && typeof (r as Promise<unknown>).catch === 'function') (r as Promise<unknown>).catch(() => {});
  } catch {}
};
const web = (ms: number | number[]) => safe(() => (globalThis as any).navigator?.vibrate?.(ms));
// Android motors are often weak on selectionAsync, so the stronger cues add a short vibration.
const vib = (p: number | number[]) => { if (isAndroid) safe(() => Vibration.vibrate(p)); };

let lastTick = 0;
const MIN_GAP = 25; // ms: fast flicks must not stack ticks

export const haptic = {
  /** One step of a ruler or wheel: light selection tick, throttled to ~1 per 25 ms. */
  tick() {
    const now = Date.now();
    if (now - lastTick < MIN_GAP) return;
    lastTick = now;
    if (isWeb) return web(4);
    safe(() => Haptics.selectionAsync());
  },
  /** Every 5th / 10th mark: a slightly heavier tick (shares the throttle). */
  mark() {
    const now = Date.now();
    if (now - lastTick < MIN_GAP) return;
    lastTick = now;
    if (isWeb) return web(9);
    safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    vib(10);
  },
  success() {
    if (isWeb) return web([12, 40, 12]);
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    vib([0, 12, 40, 12]);
  },
  /** Invalid input or hitting a limit. */
  warn() {
    if (isWeb) return web([20, 40, 20]);
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
    vib([0, 20, 40, 20]);
  },

  // Existing vocabulary used across the app.
  tap() {
    if (isWeb) return web(6);
    safe(() => Haptics.selectionAsync());
  },
  light() {
    if (isWeb) return web(10);
    safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  },
  medium() {
    if (isWeb) return web(16);
    safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    vib(14);
  },
  error() {
    if (isWeb) return web([30, 50, 30]);
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
    vib([0, 30, 50, 30]);
  },
};
