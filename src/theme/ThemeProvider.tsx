import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, lightSemantic, darkSemantic, Palette, Semantic } from '@/design-system/tokens';
import { useStore } from '@/lib/store';

// c: the palette for the current mode. s: the semantic roles (success, warning, danger, info, progress, muted) for the same mode.
const ThemeCtx = createContext<{ c: Palette; s: Semantic; isDark: boolean }>({ c: light, s: lightSemantic, isDark: false });

// scheme: pins light or dark (Storybook's theme toggle); the app leaves it out and follows the Theme setting.
export function ThemeProvider({ children, scheme }: { children: React.ReactNode; scheme?: 'light' | 'dark' }) {
  const sys = useColorScheme();
  const { state } = useStore();
  const pref = state.sc.theme;
  const isDark = scheme ? scheme === 'dark' : pref === 'Dark' || (pref === 'System' && sys === 'dark');
  return <ThemeCtx.Provider value={{ c: isDark ? dark : light, s: isDark ? darkSemantic : lightSemantic, isDark }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
