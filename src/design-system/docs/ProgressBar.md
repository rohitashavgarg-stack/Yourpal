# ProgressBar and ProgressSegments

`src/design-system/primitives/ProgressBar.tsx`. Storybook: Primitives / ProgressBar.

## Purpose

Thin progress bars. `ProgressBar` is a track with a fill: how much of a macro, a nutrient, a goal driver or an export is done. `ProgressSegments` is a row of equal segments, one per step: the exercises in a workout, the stories on the welcome screen, a week of sessions. They replaced ten hand-built bars. Pager dots, the ruler ticks, chart bars and the line at the bottom of the check-in bar are not progress bars and stay as they are.

## Props

ProgressBar

| Prop | Type | Default | What it does |
|---|---|---|---|
| `height` | `3 \| 4 \| 6 \| 8` | 6 | Height in px. Corners are always `radii.xs` |
| `track` | `'surface2' \| 'surface3'` | `surface2` | The empty part: surface2 on a card, surface3 on a surface2 panel |
| `color` | string | required | The fill colour |
| `percent` | number | none | How much is filled, 0 to 100 |
| `fillStyle` | animated style | none | An animated width for the fill (used where the bar fills over time) |
| `accessibilityValue` | `{ now, min, max }` | none | With it, the bar is announced as a progress bar |
| `style` | ViewStyle | none | Layout only: flex, width, margins |

ProgressSegments

| Prop | Type | Default | What it does |
|---|---|---|---|
| `segments` | `{ color, label? }[]` | required | One entry per segment; the colour says done, current or to come; `label` is spoken |
| `height` | `3 \| 4 \| 6 \| 8` | 4 | Height in px |
| `gap` | `3 \| 4` | 4 | Space between segments |
| `style` | ViewStyle | none | Layout only: position, margins, width |

## States

| State | Look |
|---|---|
| empty | `percent` 0: only the track |
| partly filled | `percent` between 0 and 100 |
| full | `percent` 100 |
| animating | `fillStyle` moves the width |
| on a soft panel | `track="surface3"` so the track still shows |
| segments | each segment its own colour: accent or ink when done, surface3 when still to come |

## Do and don't

- Do give the bar a number next to it ("62 of 90 g"); a bar alone is not a fact.
- Do use the green or accent colour for progress. Amber for "behind"; never red.
- Don't put an action on a bar. Don't use it as a divider.
- Don't invent a new height. Use 3, 4, 6 or 8.

## Accessibility

- Pass `accessibilityValue` when the bar stands for one number, so it is announced as a progress bar with its value.
- Give segments a `label` when they stand for things that can be read out ("Logged", "Not logged").
- A bar next to its number does not need to be announced twice: leave `accessibilityValue` out and let the text carry it.

## Copy rules

- The words next to a bar say the number first: "320 of 450 kcal", then the smallest next step. No guilt, no emoji, no dot separators.
