# MuscleBody

`src/design-system/primitives/MuscleBody.tsx`. Storybook: Primitives / MuscleBody.

## Purpose

A plain dark front or back view of the body with muscle groups lit in the accent blue: chest, shoulders, arms, core, legs and back. Used at the top of the Muscles trained page (front and back side by side) and, in MuscleThumb, beside each muscle row. The figure is drawn by the `react-native-body-highlighter` package (MIT); this component only picks which parts to light and the colours.

```tsx
<MuscleBody side="front" lit={{ Chest: 0.75, Arms: 0.5, Legs: 1 }} width={130} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `side` | front or back | front | Which view to draw |
| `lit` | group to 0..1 | required | How far along each group is. Missing or 0 stays dark, under 1 is lit softer, 1 is full |
| `width` | number | 200 | Width in px; the height is twice that |

## States

| State | Look |
|---|---|
| not trained | dark grey (`surface3`) |
| part way | blue at half strength |
| done | full blue (`accent`) |

## Do and don't

- Do show front and back together when the whole body matters.
- Don't use red for a muscle that is behind: dark is enough.

## Accessibility

- The picture carries no text. Say the same facts beside it in words.
