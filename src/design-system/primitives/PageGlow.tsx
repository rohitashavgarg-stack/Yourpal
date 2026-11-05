import React, { useEffect, useSyncExternalStore } from 'react';
import { View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { fixed } from '@/design-system/tokens';

// How many mounted pages bring a glow of their own. While there is one, the shared white glow stays hidden.
let own = 0;
const subs = new Set<() => void>();
const bump = (d: number) => { own += d; subs.forEach((f) => f()); };
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

/** A page that draws its own glow (a backdrop, a coloured light) calls this, so the shared white glow does not sit on top of it. */
export function useOwnGlow(on: boolean = true) {
  useEffect(() => {
    if (!on) return;
    bump(1);
    return () => bump(-1);
  }, [on]);
}

/**
 * A very faint white light in the top left corner of the screen. It is mounted once, over the whole app, and shows on every page except those that already have a glow of their own
 * (they call useOwnGlow). It takes no taps and fades to nothing (a round fade, never a band with an edge). Keep it faint: it is a mood, not a shape.
 */
export function PageGlow() {
  const { isDark } = useTheme();
  const hasOwn = useSyncExternalStore(sub, () => own > 0, () => false);
  if (hasOwn) return null;
  const peak = isDark ? '0.10' : '0.5';
  const mid = isDark ? '0.035' : '0.2';
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: 0, left: 0, width: '90%', height: 380 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="pageGlowWhite" cx="0%" cy="0%" r="100%">
            <Stop offset="0" stopColor={fixed.white} stopOpacity={peak} />
            <Stop offset="0.55" stopColor={fixed.white} stopOpacity={mid} />
            <Stop offset="1" stopColor={fixed.white} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#pageGlowWhite)" />
      </Svg>
    </View>
  );
}
