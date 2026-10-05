import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, Palette } from './tokens';
import { useStore } from '@/lib/store';

const ThemeCtx = createContext<{ c: Palette; isDark: boolean }>({ c: light, isDark: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme();
  const { state } = useStore();
  const pref = state.sc.theme;
  const isDark = pref === 'Dark' || (pref === 'System' && sys === 'dark');
  return <ThemeCtx.Provider value={{ c: isDark ? dark : light, isDark }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
