# FoodMark

`src/design-system/primitives/FoodMark.tsx`

## Purpose

The mark that says whether a food is veg, egg or non-veg: a square outline with a dot, or a triangle for non-veg. The three colours are tokens (`fixed.foodVeg`, `foodEgg`, `foodNonVeg`), the same in both themes.

```tsx
<FoodMark type="nv" size={16} />
foodTypeLabel('egg') // "Egg"
```

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `type` | `veg \| egg \| nv` | `veg` | Which mark |
| `size` | number | 14 | Width and height in px |

## States

| Type | Look |
|---|---|
| veg | green outline, green dot |
| egg | amber outline, amber dot |
| nv | brown outline, brown triangle |

`foodTypeLabel(type)` returns "Veg", "Egg" or "Non-veg".

## Do and don't

- Do show it next to every food name in a diet list.
- Don't use the colours for anything else.

## Accessibility

- The svg is labelled "Veg", "Egg" or "Non-veg".

## Copy rules

- Spelled "Non-veg" in labels.

Moved here from `components/bits.tsx` in round 4 (step 7). The old import path still works: it re-exports this file.
