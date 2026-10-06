// YourPal design tokens — mirrors the HTML prototype so both stay in sync.
export type Palette = typeof light;

export const light = {
  bg: '#F5F7FA',
  surface: '#FFFFFF',
  surface2: '#EEF1F5',
  surface3: '#E1E6EC',
  ink: '#12151C',
  muted: '#5C6370',
  line: '#E4E8EE',
  chipLine: '#D5DAE1',
  accent: '#2F6BEA',
  accentText: '#2358C9',
  accentInk: '#FFFFFF',
  accentSoft: '#E8F0FE',
  good: '#0F9D74',
  goodSoft: '#E2F6EF',
  warn: '#9A5B0B',
  warnSoft: '#FFF3E0',
  danger: '#C4372F',
  scrim: 'rgba(16,20,30,0.36)',
  navBg: 'rgba(255,255,255,0.92)',
  navLine: 'rgba(18,21,28,0.06)',
  tHeart: '#FFECEE', cHeart: '#D6404F',
  tSleep: '#EFECFF', cSleep: '#5B4BD1',
  tNutri: '#E5F6EE', cNutri: '#0F8A5F',
  tAct: '#FFF1E4', cAct: '#C4610E',
  tFat: '#FFF6D6', cFat: '#D9A400',
  tWater: '#E3F0FD', cWater: '#2371C9',
  live: '#7CF0C8',
  heroFrom: '#2F6BEA', heroMid: '#3E8FEA', heroTo: '#5CC2E6',
  dark: '#0B0E14',
  waterCard: '#E3F0FD', water: '#2F86E0', waterSoft: '#E6F2FD',
  mapBg: '#EEF1F4', mapBlock: '#E2E7ED', mapRoad: '#FFFFFF', mapPark: '#D7EEDD',
  sky: '#EAF3FF', moon: '#CFE6FF', moonRing: '#FFFFFF', tile: 'rgba(18,21,28,0.04)',
  glass: 'rgba(255,255,255,0.72)', glassLine: 'rgba(255,255,255,0.9)', sk: '#E9EDF2', skHi: '#F6F8FA',
};

export const dark: Palette = {
  bg: '#0E1116',
  surface: '#171B22',
  surface2: '#212631',
  surface3: '#2C323E',
  ink: '#EEF1F6',
  muted: '#9AA3B2',
  line: '#262C37',
  chipLine: 'rgba(255,255,255,0.18)',
  accent: '#4C82F7',
  accentText: '#8FB2FF',
  accentInk: '#FFFFFF',
  accentSoft: 'rgba(76,130,247,0.18)',
  good: '#3CCB9A',
  goodSoft: 'rgba(60,203,154,0.14)',
  warn: '#F2B35B',
  warnSoft: 'rgba(242,179,91,0.12)',
  danger: '#FF7A70',
  scrim: 'rgba(0,0,0,0.6)',
  navBg: 'rgba(26,30,38,0.9)',
  navLine: 'rgba(255,255,255,0.08)',
  tHeart: 'rgba(255,110,125,0.14)', cHeart: '#FF8A96',
  tSleep: 'rgba(140,125,255,0.16)', cSleep: '#B3A8FF',
  tNutri: 'rgba(60,203,154,0.14)', cNutri: '#5ED9AE',
  tAct: 'rgba(255,160,80,0.14)', cAct: '#FFB072',
  tFat: 'rgba(255,210,90,0.14)', cFat: '#FFD25A',
  tWater: 'rgba(90,168,245,0.16)', cWater: '#8CC4FF',
  live: '#7CF0C8',
  heroFrom: '#2F6BEA', heroMid: '#3E8FEA', heroTo: '#5CC2E6',
  dark: '#0B0E14',
  waterCard: '#CFE3FB', water: '#5AA8F5', waterSoft: '#16263A',
  mapBg: '#161B24', mapBlock: '#1E2430', mapRoad: '#2A3140', mapPark: '#1B3326',
  sky: '#0F1A2E', moon: '#1D3560', moonRing: '#2A4B85', tile: 'rgba(255,255,255,0.06)',
  glass: 'rgba(23,27,34,0.6)', glassLine: 'rgba(255,255,255,0.1)', sk: '#1A1F27', skHi: '#252B35',
};

export const radius = { sm: 14, md: 20, lg: 28, pill: 999 };
export const space = (n: number) => n * 4;

// Font families are registered in the root layout with these exact names.
export const font = {
  light: 'Geist_300Light',
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  display: 'Outfit_600SemiBold',
  displayBold: 'Outfit_700Bold',
  mono: 'GeistMono_500Medium',
  monoBold: 'GeistMono_600SemiBold',
};

// Motion: iOS-like springs.
export const spring = {
  snappy: { damping: 18, stiffness: 260, mass: 0.8 },
  soft: { damping: 22, stiffness: 180, mass: 1 },
  bouncy: { damping: 12, stiffness: 220, mass: 0.9 },
  nav: { damping: 32, stiffness: 300, mass: 1 }, // tab bar pill: near critically damped, no visible bounce
};
