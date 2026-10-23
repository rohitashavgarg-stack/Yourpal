// Colour tokens. The two palettes below are the ones that were in src/theme/tokens.ts, unchanged.
// Raw palette: `light` and `dark` (use through useTheme(): `const { c } = useTheme()`).
// `fixed`: colours that are the same in both modes (white and black, the brand blue, the dark card, the live mint, the shadow colour).
//   Use these where the value must not change with the theme, for example text on a coloured or dark card.
// `semantic`: roles built on top of the palette (success, warning, danger, info, progress, muted), each with a foreground and a background.

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

// Colours that do not change between light and dark. Every value here is either the same in both palettes (accentInk, live, hero*, dark)
// or is a literal that was repeated across the code base (white, black, shadow: see docs/design-system-audit.md section 3.1).
export const fixed = {
  white: '#FFFFFF',      // text on colour and on dark cards; equals palette.accentInk
  black: '#000000',
  blue: '#2F6BEA',       // the brand blue; equals light.accent and heroFrom
  dark: '#0B0E14',       // the dark card; equals palette.dark
  live: '#7CF0C8',       // mint for live states; equals palette.live
  shadow: '#101828',     // shadow colour used by card and header shadows
  lineOnWhite: '#C9D1DD', // the 1 px line of buttons on the white clip stage (workout)
} as const;
export type FixedColor = keyof typeof fixed;

// Colours on the dark Today cards (budget, goal strip, workout), the same in both themes because those cards are always dark.
export const onDark = {
  card: '#1A1D22',       // the charcoal of the Daily budget card
  text: '#F3F4F6',       // main text on a dark card
  soft: '#C9CDD6',       // labels on a dark card
  muted: '#9AA0AD',      // quiet text on a dark card
  mint: '#2EE6A8',       // eat bar and good news on a dark card
  burn: '#FF9A4D',       // burn bar
  amber: '#F2B35B',      // missed workout, warnings on a dark card
  lilac: '#B9A8FF',      // rest day accents
  bottleInk: '#1B2440',  // the water bottle outline on a light tile
  bottleFill: '#D9D9D9', // the water bottle body on the blue tile
  waterTop: '#8CBBFF',   // the water in the bottle, top
  waterDeep: '#3D6BFF',  // the water in the bottle, bottom
  capShade: '#999999',   // the bottle cap gradient start
  capLine: '#9294A8',    // the line on the bottle cap
  capRidge: '#EAE6E6',   // the ridges on the bottle cap
  ripple: '#7FB4FF',     // the ripple when water reaches the target
  heart: '#FF6B7A',      // the heart icon on the Connect tile
  ember: '#F0692C',      // streak days done, the flame on the goal page
  gold: '#F5B301',       // the premium (personal training) crown badge
  flame: '#FF8A3D',      // the streak flame and its bars on the welcome screen
  stageInk: '#F4F4F6',   // the current segment of the workout progress bar on a dark stage
} as const;

// Gradients of the dark cards: from the top left to the bottom right.
export const gradients = {
  workoutPlanned: [fixed.dark, '#0E1B45', '#13327A'],
  workoutRest: [fixed.dark, fixed.shadow, '#1A1636'],
  workoutDone: [fixed.dark, '#0D2A22', '#124A3A'],
  workoutLive: ['#06231B', '#0B3A2C', '#0F5A42'],
  workoutMissed: ['#17140F', '#17140F', '#1B1710'],
  water: ['#070B2B', '#1C2BC0'],
} as const;

// Semantic roles. They point at palette values, so they follow the theme. fg = text or icon, bg = soft background.
export function semantic(p: Palette) {
  return {
    success: { fg: p.good, bg: p.goodSoft },
    warning: { fg: p.warn, bg: p.warnSoft },
    danger: { fg: p.danger, bg: p.tHeart },    // the soft heart tint is the only soft red in the palette
    info: { fg: p.accentText, bg: p.accentSoft },
    progress: { fg: p.live, bg: p.tNutri },     // mint is the colour of progress and live states
    muted: { fg: p.muted, bg: p.surface2 },
  } as const;
}
export type Semantic = ReturnType<typeof semantic>;
export const lightSemantic = semantic(light);
export const darkSemantic = semantic(dark);
