# Decisions for the designer

Hand-built elements that are close to a library component but not the same, so they were left alone. Each row gives both sets of values. Say which way to go (change the element to the library look, or add a variant to the library) and it can be done in one pass.

## Buttons: near-matches left as they are

The four repeated button patterns (44 px, 32 px, 48 px and 72 px high). No element matches a `Button` preset exactly, so none was replaced. "Library" is the nearest preset. Library kinds: primary (ink fill), accent, secondary (c.surface2 fill), ghost, outline (1 px c.line), white, glass.

| Where | Hand-built | Nearest library | Differs by |
|---|---|---|---|
| `app/(tabs)/plans.tsx:51` | 32 high, radius radii.md, side padding 12, fill c.accentSoft | none at 32 px (presets are 56, 50, 44, 40, 36) | height; fill c.accentSoft; radius radii.md |
| `features/plans/DietPlan.tsx:279` | 44 high, radius radii.lg, border 1 c.chipLine dashed | small: 44 high, radius radii.lg, side padding 20, text 13/18 | dashed border (no preset) |
| `app/coach.tsx:81` | 44 high, radius radii.lg, side padding 16, border 1 c.chipLine | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 16 vs 20; border 1 c.chipLine (only outline has one: 1 px c.line) |
| `app/gym/chat.tsx:117` | 32 high, radius radii.md, fill c.accentSoft | none at 32 px (presets are 56, 50, 44, 40, 36) | height; fill c.accentSoft; radius radii.md |
| `app/gym/chat.tsx:153` | 44 high, radius radii.lg, side padding 16, border 1 c.chipLine | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 16 vs 20; border 1 c.chipLine (only outline has one: 1 px c.line) |
| `app/onboarding.tsx:303` | 72 high, radius radii.lg, side padding 16, fill c.surface, border on ? 2 : 1 on ? c.ink : c.line | none at 72 px (presets are 56, 50, 44, 40, 36) | height; border on ? 2 : 1 on ? c.ink : c.line (only outline has one: 1 px c.line); fill c.surface; selectable or sized by its row (not a plain Button) |
| `app/onboarding.tsx:329` | 72 high, radius radii.lg, side padding 18, fill c.surface, border on ? 2 : 1 on ? c.ink : c.line | none at 72 px (presets are 56, 50, 44, 40, 36) | height; border on ? 2 : 1 on ? c.ink : c.line (only outline has one: 1 px c.line); fill c.surface; selectable or sized by its row (not a plain Button) |
| `app/onboarding.tsx:357` | 72 high, radius radii.lg, fill on ? c.ink : c.surface, border on ? 0 : 1 c.line | none at 72 px (presets are 56, 50, 44, 40, 36) | height; border on ? 0 : 1 c.line (only outline has one: 1 px c.line); fill on ? c.ink : c.surface; selectable or sized by its row (not a plain Button) |
| `app/plans/create.tsx:85` | 48 high, radius radii.card, border 1 c.chipLine dashed | none at 48 px (presets are 56, 50, 44, 40, 36) | height; dashed border (no preset); radius radii.card |
| `app/plans/edit.tsx:149` | 48 high, radius radii.card, border 1 c.chipLine dashed | none at 48 px (presets are 56, 50, 44, 40, 36) | height; dashed border (no preset); radius radii.card |
| `app/plans/log.tsx:204` | 44 high, radius radii.lg, fill wType === t ? c.ink : 'transparent', border 1 wType === t ? c.ink : c.surface3 | small: 44 high, radius radii.lg, side padding 20, text 13/18 | border 1 wType === t ? c.ink : c.surface3 (only outline has one: 1 px c.line); fill wType === t ? c.ink : 'transparent'; selectable or sized by its row (not a plain Button) |
| `app/profile/index.tsx:80` | 44 high, radius radii.lg, side padding 18, fill c.surface | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 18 vs 20; fill c.surface |
| `app/workout.tsx:227` | 48 high, radius radii.card, border 1 c.chipLine dashed | none at 48 px (presets are 56, 50, 44, 40, 36) | height; dashed border (no preset); radius radii.card |
| `features/workout/NewWorkoutUI.tsx:65` | 44 high, radius radii.lg, side padding 18, fill fixed.white, border 1 '#C9D1DD' | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 18 vs 20; border 1 '#C9D1DD' (only outline has one: 1 px c.line); fill fixed.white |
| `features/workout/NewWorkoutUI.tsx:98` | 32 high, radius radii.md, side padding 12, fill fixed.white, border 1 '#C9D1DD' | none at 32 px (presets are 56, 50, 44, 40, 36) | height; border 1 '#C9D1DD' (only outline has one: 1 px c.line); fill fixed.white; radius radii.md |
| `components/bits.tsx:130` | 44 high, radius radii.lg, side padding 16, fill on ? c.ink : 'transparent' | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 16 vs 20; fill on ? c.ink : 'transparent'; selectable or sized by its row (not a plain Button) |
| `features/trackers/Widgets.tsx:46` | 44 high, radius radii.lg, side padding 12, fill 'rgba(255 | small: 44 high, radius radii.lg, side padding 20, text 13/18 | side padding 12 vs 20; fill 'rgba(255; selectable or sized by its row (not a plain Button) |
| `features/progress/TrendUI.tsx:50` | 32 high, radius radii.md, side padding 14, fill c.accentSoft | none at 32 px (presets are 56, 50, 44, 40, 36) | height; fill c.accentSoft; radius radii.md |
| `features/progress/TrendUI.tsx:79` | 32 high, radius radii.md, fill on ? c.ink : 'transparent' | none at 32 px (presets are 56, 50, 44, 40, 36) | height; fill on ? c.ink : 'transparent'; radius radii.md; selectable or sized by its row (not a plain Button) |
