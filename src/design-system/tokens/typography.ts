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
