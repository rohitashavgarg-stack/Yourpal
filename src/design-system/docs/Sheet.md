# Sheet and SheetFooter

`src/design-system/primitives/Sheet.tsx`

Storybook: Primitives / Sheet

## Purpose

The bottom sheet. It lived inside `components/Overlay.tsx`. You do not render `Sheet` yourself: call `useOverlay().openSheet(content, { label, glow })` and `closeSheet(after?)`. There is one sheet in the app; the "...Sheet" components are the content that goes inside it.

`SheetFooter` pins a sheet's main button under the scroll, so it stays in view on a long list (for example the Log button in the "Ate something else" sheet, `features/today/QuickLogSheet.tsx`).

```tsx
openSheet(<LogMealsSheet mealId="bf" />, { label: 'Log breakfast' });

// inside the sheet content
<SheetFooter><Button label="Log" disabled={!items.length} onPress={log} /></SheetFooter>
```

## Props: Sheet

| Prop | Type | Default | What it does |
|---|---|---|---|
| `children` | node | required | The content, in a scroll with 20 px side padding and a 12 px gap |
| `label` | string | none | Spoken label of the sheet |
| `glow` | string | none | A colour that bleeds in from the top right corner as a soft radial glow |
| `onClosed` | () => void | required | Wiring used by `OverlayProvider` |
| `registerClose` | (fn) => void | required | The sheet hands its animated close function to the host |

## Props: SheetFooter

| Prop | Type | Default | What it does |
|---|---|---|---|
| `children` | node | required | What to pin under the scroll, usually one Button |

Inside a sheet it renders nothing in place and hands its children to the sheet, which draws them below the scroll (20 px side padding, 10 px top). Outside a sheet it renders its children where it is. It clears itself when it unmounts.

## States

| State | Look |
|---|---|
| Opening | Springs up (`spring.soft`), the scrim fades in over 260 ms |
| Open | Up to 88% of the screen high, 30 px top corners, 40 by 5 grab handle |
| With glow | Radial glow from the top right (55% to 0) |
| With footer | Footer pinned under the scroll |
| Keyboard up (native) | Lifts above the keyboard; max height is the space left (at least 260 px) |
| Dragging | Follows the finger down; up drags are damped to 18% |
| Closing | Drag down more than 120 px or flick faster than 900, or tap the scrim: slides down in 260 ms, scrim fades in 220 ms |

## Do and don't

- Do start the content with a title, then one sentence, then the controls.
- Do use `SheetFooter` when the content scrolls and has one main action.
- Do let the member drag it away; never trap them.
- Don't open a sheet on top of a sheet. Close it with `closeSheet(after)` and open the next one in `after`.
- Don't put two `SheetFooter`s in one sheet; the last one wins.

## Accessibility

- The sheet is a modal view (`accessibilityViewIsModal`) with your `label`.
- The scrim is a pressable labelled "Close sheet".
- The grab handle is drag only; screen reader users close with the scrim or a close button in the content.
- While a sheet is open, a snackbar moves to the top so it is not hidden behind it.

## Copy rules

- The label says what the sheet is for: "Log breakfast", not "Sheet".
- Title, then a sentence, then a quiet info line. No dot separators.
- One main button, verb first.
