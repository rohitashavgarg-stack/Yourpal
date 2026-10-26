// Typography tokens.
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

// The weight each family name stands for (React Native picks the file from the family name, so this is documentation and for web fallbacks).
export const fontWeights = { light: '300', regular: '400', medium: '500', semibold: '600', bold: '700' } as const;

// Font size scale, 10 steps. Each step is one of the most used sizes in the code (counts from docs/design-system-audit.md section 3.3):
// 11 (34 uses), 12 (100), 13 (163), 14 (148), 15 (50), 17 (28), 20 (19), 22 (24), 26 (20), 30 (14).
// The Txt variants (display 34, title 28, headline 17, body 15, label 13, caption 12, number 30) keep their own sizes in components/ui.tsx.
export const fontSizes = { xs2: 11, xs: 12, sm: 13, md: 14, base: 15, lg: 17, xl: 20, xl2: 22, xl3: 26, xl4: 30, xsPlus: 12.5, smPlus: 13.5, basePlus: 16, xl2Plus: 24, xl3Plus: 28, xl5: 34, xl6: 42 } as const;
export type FontSizeStep = keyof typeof fontSizes;

// Line height for each size, about 1.3 times the size (the rule in docs/PHASE2_HANDOFF.md: 12 to 18, 13 to 19, 15 to 23, 17 to 25).
// Geist crops at the top when the line height is tight.
export const lineHeights = { xs2: 15, xs: 18, sm: 19, md: 20, base: 23, lg: 25, xl: 28, xl2: 29, xl3: 34, xl4: 39 } as const;
