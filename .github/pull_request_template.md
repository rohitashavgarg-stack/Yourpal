## What changed

<!-- One or two sentences. Link the design or the ticket. -->

## Design system checklist

- [ ] Reuses an existing component from `src/design-system/`, or explains below why none fits
- [ ] No new hard-coded colour, radius or font size (`npm run lint:changed` passes)
- [ ] New looks or states are added as props or variants, not as a copy of the component
- [ ] Story added or updated in `src/design-system/stories/` for every new variant or state
- [ ] Tap targets are 44 px (hit slop where the drawn size is smaller); every pressable has an accessibility label
- [ ] Looks right in light and dark; no copy changed except what this PR says
- [ ] Docs updated in `src/design-system/docs/<Name>.md` (and the index `docs/design-system-components.md` for a new component)
- [ ] Screenshots attached: before and after, light and dark (`node scripts/visual/review.js docs/review/before docs/review/after` makes the side-by-side page; see `docs/HANDOFF.md`)

## Why not an existing component?

<!-- Only if you built something new. -->

## Screenshots

| Light | Dark |
|---|---|
|  |  |
