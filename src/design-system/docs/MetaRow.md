# MetaRow

`src/design-system/primitives/MetaRow.tsx`

## Purpose

Facts about something in one quiet line: a small icon and a few words each, with a thin vertical line between them. It replaces rows of outline chips (which look like buttons) and dot separators.

```tsx
<MetaRow color={c.muted} dividerColor={c.line} items={[
  { icon: <Clock size={14} color={c.muted} />, text: '8:00 pm' },
  { icon: <Flame size={14} color={c.muted} />, text: '650 kcal planned' },
  { icon: <Beef size={14} color={c.muted} />, text: '33 g protein' },
]} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | `{ icon, text }[]` | required | The facts; the caller draws the icon (14 px) in the same colour |
| `color` | string | required | Text colour |
| `dividerColor` | string | required | The 1 px line between items (14 px high, 8 px each side) |
| `style` | ViewStyle | none | Merged last |

## States

No states. Text is 12 px with an 18 px line; the row wraps with a 6 px row gap when it is too long. In use on the workout card (`7 exercises`, `~50 min`, white at 65% on the dark card) and the meals card (kcal, protein).

## Do and don't

- Do use it for two or three facts about one thing.
- Don't put an action in it. It is not pressable.
- Don't use " · " between facts anywhere: this is the replacement.
- Don't repeat a fact that is already on the card in larger type.

## Accessibility

- The row is one accessible element; its label is the texts joined with commas ("7 exercises, ~50 min").
- Icons are decorative.

## Copy rules

- Number first, then the unit or noun: "650 kcal planned", "33 g protein", "7 exercises".
- Each item is a few words. No full stops.
