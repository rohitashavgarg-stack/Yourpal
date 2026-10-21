# Component library

Every component in `src/design-system/`, with its variants and states. Each has a short doc in `src/design-system/docs/`. Old import paths still work: `components/ui.tsx`, `components/bits.tsx`, `components/Overlay.tsx` and the feature files re-export or wrap them.

## Primitives (`src/design-system/primitives/`)

| Component | Variants | States and props |
|---|---|---|
| Pressy | none | `scaleTo` (0.97), `haptics`; any Pressable prop |
| Button | kind: primary, accent, secondary, ghost, outline, white, glass. size: large, medium, small, tight, compact | `disabled`, `icon`, `height` (compact) |
| IconButton | fill, glass | `bg`, `scaleTo`; wrapped as RoundBtn and StepBtn |
| Pill | none | `on` (selected, ink fill over 220 ms) |
| Chip | tone: default, good, warn, live | `onDark`, `icon` |
| Field | none | rest, focus, error; `prefix` |
| NoteField | none | rest, focus, error; character count, `maxLength` |
| Sheet | none | `glow`; opened by `useOverlay().openSheet` |
| Snackbar | none | `undo`, `raised` (a sheet is open), `lift`; opened by `toast` |
| Card | default, compact, dark | `gap` |
| FadeIn | none | `i`, `step`, `delay` |
| SectionLabel | overline, quiet, label | `inset` |
| ListCard | rows, container, titled | row: `onPress`, `muted`, `warn` |
| SubPage | shell, progress | `close`, `footer`, `right`, `scroll`, `onBack` |
| Stepper | card, row, inline | inline: scrub, `min`, `block` |
| Chevron | none | `open`; motion timing or spring |
| ScanBracket | size large, small | `pos` tl, tr, bl, br |

## Patterns (`src/design-system/patterns/`)

| Component | Variants | States |
|---|---|---|
| GoalCard | card, flat, strip | onTrack, behind, almost, complete, comeback, backOn, noGoal; stale weigh-in (10 days or more) |
| BudgetCard | none | `burnSource` plan, done, watch; goal row follows GoalCard strip |
| Banner | strip, card | tone warn, plain; icon clock, pause, ok; `once` (dismissible) |
| WeekCard | none | day: today, past, future; workout dot done, rest, planned |
| WorkoutCard | none | upcoming, due, live, missed, moved, skipped, done, rest, paused, comeback |
| MealsCard | none | now (with or without the missed-meal prompt), complete, paused |
| TrackerRow | none | `connected` (steps or Connect tile), `wearable` (adds watch tiles) |
| WeightTile | none | delta down (green) or up (amber) |
| WaterTile | none | litres 0 to 3 and over; ripple on reaching 3 L |
| HealthTile | kind hr, sleep, kcal | sample readings |
| ConnectTile | none | name Apple Health or Health Connect |
| TrackerTile | none | the shared 160 px frame; pressable or not |

## Tokens (`src/design-system/tokens/`)

colors (light, dark, fixed, semantic), typography (fontSizes, lineHeights, font), spacing, radii (4, 12, 18, 22, 24 card, 28, pill), shadows, motion (fade, spring).

## Still in `components/ui.tsx` (not moved yet)

Txt (display, title, headline, body, label, caption, mono, number), Row, Segmented, plus `components/bits.tsx` (FoodMark, CheckCircle, Tag, Ring, Glow, Beat) and `components/FloatingTabBar.tsx`, `TabScreen.tsx`.

## Not yet merged

- Five 28 px bordered chip-like views on the workout card, meals card and comeback card: custom line colours or a 1 px different line height, so using Chip would move pixels.
- Option rows that look like pills (food type picker, range switch on Trends): different height, radius or content from Pill.
- OtpInput, the chat Composer and the number inputs on the log and body pages: different controls from Field.
- StarBtn (rating stars): an animated toggle.
- `SwitchChip` and `ActionChip` on the web demo panel: developer controls.
- `Bottle` and `BottleArt` in `features/today/Trackers.tsx`: unused.
- Steps tile and the alternative tracker designs (Dot matrix, Glasses, Ruler, Stages, Stack) stay in features.
