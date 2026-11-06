# TopGlow

`src/design-system/primitives/TopGlow.tsx`.

## Purpose

A soft round glow from the top of an inner page, in the colour of what the page is about: green on the assessment page, blue on Muscles trained, purple on Photos. Pass it as the `backdrop` of SubPage (a page with its own backdrop does not get the white corner glow).

```tsx
<SubPage title="Photos" backdrop={<TopGlow color={look.tint} />} ...>
```

## Props

| Prop | Type | What it does |
|---|---|---|
| `from` | top or bottom | top | Which edge of the screen the glow comes from |
| `color` | string | The glow colour. It is brightest at the very top edge (30%, centred) and fades down and fades to nothing |

## Do and don't

- Do use the colour the card on the Progress tab uses for the same topic.
- Don't put a card or container behind the main graphic on such a page: the glow is the backdrop.
- Don't use it twice on a page.

## Accessibility

- Decoration only; it takes no touches.
