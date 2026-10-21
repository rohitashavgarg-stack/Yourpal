// Spacing tokens.
// `space(n)` is the helper that was in src/theme/tokens.ts (n times 4). Kept as it was.
export const space = (n: number) => n * 4;

// Spacing scale on a 4 px grid. The steps are the on-grid values that are used most for gap and padding (4, 8, 12, 16, 20, 24)
// plus 32 and 40 for page and section rhythm. Off-grid values (6, 10, 14, 18, 22) are not in the scale; they are listed in docs/tokens-review.md.
export const spacing = { none: 0, xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 } as const;
export type SpacingStep = keyof typeof spacing;
