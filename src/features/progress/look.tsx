import React from 'react';
import { CalendarCheck, Camera, ClipboardCheck, Dumbbell, Footprints, GlassWater, Heart, Moon, Ruler, Scale, UtensilsCrossed } from '@/lib/icons';
import { useTheme } from '@/theme/ThemeProvider';
import type { CardKey } from './data';

// One icon and one colour per metric, shared by the Progress card and its trend screen. [light, dark]
const LOOK: Record<CardKey, { Icon: React.ComponentType<any>; col: [string, string] }> = {
  weight: { Icon: Scale, col: ['#2F6BEA', '#6FA0FF'] },
  cons: { Icon: CalendarCheck, col: ['#5E9E1A', '#A5D75C'] },
  diet: { Icon: UtensilsCrossed, col: ['#0F8A5F', '#5ED9AE'] },
  lifts: { Icon: Dumbbell, col: ['#C98A00', '#F2C14E'] },
  steps: { Icon: Footprints, col: ['#3346E8', '#8A9BFF'] },
  meas: { Icon: Ruler, col: ['#0E8FA0', '#5CD0E0'] },
  assess: { Icon: ClipboardCheck, col: ['#C2408A', '#FF8FC4'] },
  photos: { Icon: Camera, col: ['#8B4FE0', '#BE98FF'] },
  water: { Icon: GlassWater, col: ['#2371C9', '#8CC4FF'] },
  hr: { Icon: Heart, col: ['#D6404F', '#FF8A96'] },
  sleep: { Icon: Moon, col: ['#5B4BD1', '#B3A8FF'] },
};

export function useLook(k: CardKey) {
  const { isDark } = useTheme();
  const l = LOOK[k];
  return { Icon: l.Icon, tint: l.col[isDark ? 1 : 0] };
}
