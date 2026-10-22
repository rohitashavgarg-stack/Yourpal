# MetaRow

`src/design-system/primitives/MetaRow.tsx`. Facts about something in one quiet line: a small icon and a few words each, with a thin vertical line between them. It replaces rows of outline chips (which look like buttons).

```tsx
<MetaRow color={c.muted} dividerColor={c.line} items={[
  { icon: <Clock size={14} color={c.muted} />, text: '8:00 pm' },
  { icon: <Flame size={14} color={c.muted} />, text: '650 kcal planned' },
  { icon: <Beef size={14} color={c.muted} />, text: '33 g protein' },
]} />
```

| Prop | What it does |
|---|---|
| `items` | `{ icon, text }[]`; the caller draws the icon (14 px) in the same colour |
| `color` | text colour |
| `dividerColor` | the 1 px line between items (14 px high, 8 px each side) |

Text is 12 px with an 18 px line. Used on the workout card (`7 exercises`, `~50 min`, white at 65% on the dark card) and the meals card (time, kcal, protein).
