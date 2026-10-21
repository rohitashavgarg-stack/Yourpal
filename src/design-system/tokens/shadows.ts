import { fixed } from './colors';

// Shadow and elevation tokens, taken from the two recipes that were written inline:
//  card: the white card shadow in light mode (features/progress/parts.tsx cardShadow; dark mode has no shadow)
//  lift: the soft lift under header buttons (components/GymHeader.tsx)
// Both are React Native style objects, so they spread into a style: [{ ... }, shadows.card]
export const shadows = {
  none: {},
  card: { shadowColor: fixed.shadow, shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  lift: { shadowColor: fixed.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
} as const;

// Dark mode draws no card shadow.
export const cardShadowFor = (isDark: boolean) => (isDark ? shadows.none : shadows.card);
