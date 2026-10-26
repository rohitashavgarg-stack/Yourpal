# Component library

Every component in `src/design-system/`, with its variants and states. Each has a doc in `src/design-system/docs/` with Purpose, Props, States, Do and don't, Accessibility notes and Copy rules. Old import paths still work: `components/ui.tsx`, `components/bits.tsx`, `components/Overlay.tsx` and the feature files re-export or wrap them.

## Primitives (`src/design-system/primitives/`)

| Component | Source | Purpose | Variants and states |
|---|---|---|---|
| [AmountStepper](../src/design-system/docs/AmountStepper.md) | `primitives/AmountStepper.tsx` | The amount control on a food: outlined pill, small round minus and plus | rest, at minimum (`lessDisabled`), at maximum (`moreDisabled`), holdable (`onLongPress`) |
| [Button, IconButton](../src/design-system/docs/Button.md) | `primitives/Button.tsx` | Every action; IconButton is the icon-only button (rounded square, or a pill with `width`) | Button kind: primary, accent, secondary, ghost, outline, white, glass, dashed, line, quiet, soft, whiteLine, surface, glassAccent (blue glass), glassPrimary (white or near-black glass). size: large 56, medium 50, small 44, chip 44, fill 44 (no side padding), tight 40, compact 36, xs 32 (under 44 px keeps a 44 px tap area). `icon`, `iconAfter`, `weight`, `muted`, `scaleTo`, disabled. IconButton: fill, glass, outline; `size`, `width`, `radius`, `scaleTo`, `hitSlop`, disabled (announced) |
| [Card](../src/design-system/docs/Card.md) | `primitives/Card.tsx` | The white or dark rounded container | default (28/20), roomy (28/18), compact (24/18), tight (24/16), dark; `gap`, `flat`, `border`, `clip`, `padding` per side; passes View props |
| [Chevron](../src/design-system/docs/Chevron.md) | `primitives/Chevron.tsx` | Down chevron that turns when a row opens | open, closed; motion timing or spring |
| [Chip](../src/design-system/docs/Chip.md) | `primitives/Chip.tsx` | Outline chip for information, never an action | tone default, good, warn, live; `onDark` |
| [FadeIn](../src/design-system/docs/FadeIn.md) | `primitives/FadeIn.tsx` | The one 180 ms fade-in for screens and cards | none; `i`, `step`, `delay`; no fade with reduce motion on |
| [IconBadge](../src/design-system/docs/IconBadge.md) | `primitives/IconBadge.tsx` | Tinted tile with one centred icon | round, rounded square (`radius`), outlined (`borderWidth`) |
| [Field, NoteField](../src/design-system/docs/Input.md) | `primitives/Input.tsx` | One-line and multi-line text inputs | rest, focus, error; Field `prefix`; NoteField count and `maxLength` |
| [ListCard](../src/design-system/docs/ListCard.md) | `primitives/ListCard.tsx` | A list inside a white card | rows, container, titled; row plain, pressable, muted, warn |
| [ProgressBar, ProgressSegments](../src/design-system/docs/ProgressBar.md) | `primitives/ProgressBar.tsx` | Thin progress: a track with a fill, or a row of segments, one per step | height 3, 4, 6, 8; track surface2 or surface3; filled by percent or animated; segments with a colour and a spoken label each |
| [Callout](../src/design-system/docs/Callout.md) | `primitives/Callout.tsx` | A soft notice, tip or quiet panel inside a page or sheet | tone warn, accent, plain; size compact, sm, md, lg, xl |
| [Option](../src/design-system/docs/Option.md) | `primitives/Option.tsx` | One choice in a set that stays selected (programme, days a week, food type, range, tab) | look fill, outline; selected, not selected; role radio, tab; `height`, `minHeight`, `minWidth`, `radius`, `padX`, `gap`, `row`, `offFill`, `offLine`, `scaleTo` |
| [MetaRow](../src/design-system/docs/MetaRow.md) | `primitives/MetaRow.tsx` | Facts in one quiet line, icon and words, thin lines between | none; wraps when long |
| [Pill](../src/design-system/docs/Pill.md) | `primitives/Pill.tsx` | Selectable option or filter | off, on (ink fill over 220 ms) |
| [Pressy](../src/design-system/docs/Pressy.md) | `primitives/Pressy.tsx` | The pressable under every tap target: press scale and haptic | rest, pressed; `scaleTo`, `haptics` |
| [ScanBracket](../src/design-system/docs/ScanBracket.md) | `primitives/ScanBracket.tsx` | One corner of the plate-photo viewfinder | pos tl, tr, bl, br; size small, large |
| [SectionLabel](../src/design-system/docs/SectionLabel.md) | `primitives/SectionLabel.tsx` | Small heading above a group of cards, announced as a header | overline, quiet, label; `inset` |
| [Sheet, SheetFooter](../src/design-system/docs/Sheet.md) | `primitives/Sheet.tsx` | The bottom sheet; SheetFooter pins the main button under the scroll | opening, open, glow, with footer, keyboard up, dragging, closing |
| [Snackbar](../src/design-system/docs/Snackbar.md) | `primitives/Snackbar.tsx` | The message bar, with optional Undo (44 px tap area) | plain, with undo, raised (sheet open), lifted |
| [StatusDot](../src/design-system/docs/StatusDot.md) | `primitives/StatusDot.tsx` | A small solid dot: status, legend key, unread, grid cell | none; colour is the state |
| [Stepper](../src/design-system/docs/Stepper.md) | `primitives/Stepper.tsx` | Minus, value, plus for numbers | card, row, inline (scrub, `min`, `block`) |
| [SubPage](../src/design-system/docs/SubPage.md) | `primitives/SubPage.tsx` | Full-screen pushed page with back, title, floating header, footer | shell, progress; `close`, `footer`, `right`, `backdrop`, `scroll`, `onBack`; header at rest or scrolled |
| [Txt](../src/design-system/docs/Txt.md) | `primitives/Txt.tsx` | The text primitive: eight variants, always a line height of about 1.3 times the size | v display, title, headline, body, label, caption, mono, number; `muted`, `color` |
| [Row](../src/design-system/docs/Row.md) | `primitives/Row.tsx` | A horizontal row, children centred on the cross axis | none; `style` for gap, wrap and justify |
| [FoodMark](../src/design-system/docs/FoodMark.md) | `primitives/FoodMark.tsx` | The veg, egg or non-veg mark (Indian food label style) | type veg, egg, nv; `size` |
| [CheckCircle](../src/design-system/docs/CheckCircle.md) | `primitives/CheckCircle.tsx` | A round check with a drawn tick | on, off; tone accent, good; `size`, `hit` |
| [Tag](../src/design-system/docs/Tag.md) | `primitives/Tag.tsx` | A small filled pill with a short label | any `bg` and `fg` |
| [Ring](../src/design-system/docs/Ring.md) | `primitives/Ring.tsx` | A thin progress ring that animates to its value | `size`, `r`, `stroke`, `pct`, `delay` |
| [Beat](../src/design-system/docs/Beat.md) | `primitives/Beat.tsx` | A heartbeat pulse for a live value | children: any icon |
| [HeartIcon](../src/design-system/docs/HeartIcon.md) | `primitives/HeartIcon.tsx` | A solid heart icon | `size`, `color` |
| [Brand](../src/design-system/docs/Brand.md) | `primitives/Brand.tsx` | The gym logo mark, the premium badge and the person avatar | GymLogoMark `size`; PremiumBadge `size`; PersonAvatar who me, coach; `ring`, `square`, `photo` |
| [Glass](../src/design-system/docs/Glass.md) | `primitives/Glass.tsx` | The frosted glass layer behind pills and bars, and the progressive blur under headers | GlassBackdrop `radius`, `tint`, `frost`; ProgressiveBlur `height`, `edge`; WebLiquidGlass |
| [TrendsButton](../src/design-system/docs/TrendsButton.md) | `primitives/TrendsButton.tsx` | The glass "Trends" pill that opens a tracker trend page | `label` (accessibility), `onPress` |
| [YourPalLogo](../src/design-system/docs/YourPalLogo.md) | `primitives/YourPalLogo.tsx` | The YourPal logo, symbol and wordmark, as one vector | `height`, `color` |
| [Wheel](../src/design-system/docs/Wheel.md) | `primitives/Wheel.tsx` | A vertical number wheel that snaps to a value | `min`, `max`, `unit`, `fmt`, `size` |
| [Ruler](../src/design-system/docs/Ruler.md) | `primitives/Ruler.tsx` | A drag ruler for a decimal value, horizontal or vertical | `vertical`; `step`, `decimals`, `majorEvery`, `markEvery` |

## Patterns (`src/design-system/patterns/`)

| Component | Source | Purpose | Variants and states |
|---|---|---|---|
| [Banner](../src/design-system/docs/Banner.md) | `patterns/Banner.tsx` | The account banner: what is happening with the membership, open the plan ("See plan" on strip and card) | strip, card; tone warn, plain; icon clock, pause, ok; `once` (dismissible). Membership active, expiring, expired |
| [BudgetCard](../src/design-system/docs/BudgetCard.md) | `patterns/BudgetCard.tsx` | Daily budget on Today: goal row, then eat and burn halves on a charcoal card | `burnSource` plan, done, watch; goal row in every GoalCardState plus needs a weigh-in |
| [GoalCard](../src/design-system/docs/GoalCard.md) | `patterns/GoalCard.tsx` | The Programme goal | card, flat, strip; onTrack, behind, almost, complete, comeback, backOn, noGoal (strip says only "No goal set yet"); needs a weigh-in (10 days or more) |
| [MealsCard](../src/design-system/docs/MealsCard.md) | `patterns/MealsCard.tsx` | The meal for right now; the button opens the log sheet | now (todo, logged, skipped; with or without the missed-meal prompt), complete, paused |
| [TrackerRow and tiles](../src/design-system/docs/TrackerRow.md) | `patterns/TrackerRow.tsx` | Quick trackers on Today: 160 px tiles in a sideways scroll | not connected, connected, connected + wearable. WeightTile down or up; WaterTile 0 to 3 L, ripple; HealthTile hr, sleep, kcal; ConnectTile; TrackerTile pressable or not |
| [WeekCard](../src/design-system/docs/WeekCard.md) | `patterns/WeekCard.tsx` | This week: two stat tiles, seven days, legend | day today, past, future; workout done, rest, open ring, dashed ring; meals 0 to 4 dots on plan |
| [FoodCard](../src/design-system/docs/FoodCard.md) | `patterns/FoodCard.tsx` | One food as its own card: dashed when not eaten, solid when eaten | state todo, eaten, skipped; swipe left for Swap and Skip (44 px); hold for the food page; amount stepper or locked text; tag "Yours" |
| [WorkoutCard](../src/design-system/docs/WorkoutCard.md) | `patterns/WorkoutCard.tsx` | Today's workout | upcoming, due, live, missed, moved, skipped, done, rest, paused, comeback (small grey "Easy session" card: 20 min, "4 exercises", "Half your usual load", "Start easy session" and "Not today"); burned row with a watch |

## Copy rules for every component

- No dot separators ("text · text"). Use a title, a sentence, then a quiet info line on its own line, or a MetaRow.
- Chips are not for actions. Actions are Buttons; a choice that stays selected is an Option.
- A paused membership and a comeback are never styled as failure. Amber for warnings, never red.
- A goal is never frozen or paused. A membership pause shows as the account banner and as the paused state of the workout card (shown only while the membership is paused); never on the goal.
- Members never see Pay or Resume buttons. Membership is view-only.
- One account banner and one top snackbar at a time.
- Voice: say the number, fact first then the smallest next step, credit the coach by name, no guilt, no emoji.

## Tokens (`src/design-system/tokens/`)

colors (light, dark, fixed incl. `lineOnWhite` #C9D1DD for buttons on the white clip stage, semantic), typography (fontSizes, lineHeights, font), spacing, radii (4, 12, 18, 22, 24 card, 28, pill, `dot` 5), shadows, motion (fade, spring).

## Still outside the library

Used on fewer than 3 screens, or app structure rather than a visual component. Each is listed with its reason in `docs/coverage-exceptions.md`: Segmented, Skeleton, Glow (the pulsing dot), UnitPill, OtpInput, Avatar and GymLogo (in GymHeader), FloatingTabBar, TabScreen, GymHeader. PillBtn and RoundBtn are the old names of Button (size compact) and IconButton and are kept as re-exports.

## Not yet merged

- Five 28 px bordered chip-like views on the workout card, meals card and comeback card: custom line colours or a 1 px different line height, so using Chip would move pixels.
- (Resolved in Phase B: the option rows that looked like pills, such as the food type picker and the Trends range, now use `Option`.)
- OtpInput, the chat Composer and the number inputs on the log and body pages: different controls from Field.
- StarBtn (rating stars): an animated toggle.
- Three icon-button look-alikes stay hand-built on purpose (story progress segment, clip thumbnail, demo panel collapse), plus the search field on "What did you eat?"; see `docs/coverage-exceptions.md`.
- `SwitchChip` and `ActionChip` on the web demo panel: developer controls.
- `Bottle` and `BottleArt` in `features/today/Trackers.tsx`: unused.
- Steps tile and the alternative tracker designs (Dot matrix, Glasses, Ruler, Stages, Stack) stay in features.
