// Radius tokens.
// `radius` is the object that was in src/theme/tokens.ts. Kept as it was (components/ui.tsx reads radius.lg).
export const radius = { sm: 14, md: 20, lg: 28, pill: 999 };

// Radius scale, 7 steps (6 sizes and the pill). The sizes are values that are used a lot (counts from docs/design-system-audit.md section 3.4):
// 4, 12 (18 uses), 18 (44), 22 (63), 24 (37, the radius of the goal and compact cards), 28 (38), and 999 for a full pill.
// Values 1 to 2 px from a step snap to it in the codemod; 20 sits between 18 and 22 and 15 sits between 12 and 18, so those go to docs/tokens-review.md.
export const radii = { xs: 4, sm: 12, md: 18, lg: 22, card: 24, xl: 28, pill: 999, tile: 14, block: 20, sheet: 30 } as const;
// Fully round ends for something h px high (or a circle h px wide).
export const round = (h: number) => h / 2;
export type RadiusStep = keyof typeof radii;
