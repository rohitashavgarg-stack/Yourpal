# TrendsButton

`src/design-system/primitives/TrendsButton.tsx`

## Purpose

The one glass pill (44 px high, 22 px corner) that opens the trend page of a tracker: water and weight. It always says "Trends".

```tsx
<TrendsButton label="Weight trends" onPress={() => router.push('/progress/metric')} />
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | string | required | Accessibility label: "Water trends" |
| `onPress` | () => void | required | Open the trend page |

## States

Rest and pressed (scale 0.92). Glass or tint by platform, see `Glass`.

## Do and don't

- Do use it for opening a trend page, not for other actions: actions are `Button`.

## Accessibility

- Role `button`, the label you pass. 44 px high.

## Copy rules

- The visible word is always "Trends".

Moved here from `components/TrendsButton.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
