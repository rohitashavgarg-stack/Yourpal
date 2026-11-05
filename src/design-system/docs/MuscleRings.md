# MuscleRings

`src/design-system/primitives/MuscleRings.tsx`. Storybook: Primitives / MuscleRings.

## Purpose

Concentric rings that show which muscle groups were trained and how close each is to its weekly target. Each group has one segment on all three rings, and its name is curved around the outside. Used on the Muscles trained card on Progress and on its page.

```tsx
<MuscleRings groups={[{ name: 'Chest', done: 9, target: 12 }, { name: 'Legs', done: 0, target: 10 }]} size={260} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `groups` | `{ name, done, target }[]` | required | One entry per muscle group, in order around the circle starting at the top. `done` and `target` are hard sets |
| `size` | number | 260 | Width and height in px |

## States

| State | Look |
|---|---|
| nothing done | the three segments of the group are grey (`surface3`) |
| a third of the target | the inner ring segment is blue (`accent`) |
| two thirds | inner and middle ring |
| the whole target | all three, out to the outer ring |

## Do and don't

- Do keep the gap between segments the same on every ring (28 px along the arc), so the inner ring does not look cramped.
- Do keep names short: they follow the curve of their segment.
- Don't use more than 8 groups: the names start to touch.
- Don't use red for a group that is behind: grey is enough.

## Accessibility

- The whole graphic reads as one label: "Muscles trained this week. Chest: 9 of 12 sets. ...". Put the same facts in text beside it.
