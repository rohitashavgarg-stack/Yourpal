# TrackerRow and tiles

`src/design-system/patterns/TrackerRow.tsx`

## Purpose

The quick trackers on Today: square 160 px tiles in a sideways scroll. `TrackerRow` lays out the tiles you pass for the two connection states; each tile is its own export. Containers in `features/today/Trackers.tsx` keep the old names (`Trackers`, `WaterCard`, `WeightCard`, `HealthCards`, `ConnectCard`); the Steps tile and the alternative tile designs stay there. Also exports `BottleFigma` (the bottle art, shared with the Water sheet) and `BottleRipple`.

Order: weight, then steps (connected) or the Connect tile, then water, then the three watch tiles when `connected && wearable`.

## Props: TrackerRow

| Prop | Type | Default | What it does |
|---|---|---|---|
| `connected` | boolean | required | Health (Apple Health or Health Connect) is connected: shows `steps` instead of `connect` |
| `wearable` | boolean | required | A wearable is connected too: adds `health`. Only with `connected` |
| `weight`, `steps`, `connect`, `water`, `health` | node | required | The tiles to place |

## Props: tiles

| Tile | Prop | Type | Default | What it does |
|---|---|---|---|---|
| WeightTile | `kg` | number | required | Today's weight |
| | `delta` | number | required | Change over the week; zero or less is green "-", more is amber "+" |
| | `series` | number[] | required | Last readings, oldest first, drawn as a small area line at the bottom |
| | `onPress` | () => void | required | Opens weight logging |
| WaterTile | `litres` | number | required | Litres today; the bottle fills to 3 L |
| | `hit` | number | 0 | Counts up each time 3 L is reached; a ripple plays on the bottle |
| | `onPress` | () => void | required | Opens the water sheet |
| | `onAdd` | () => void | required | The glass-and-plus pill at the top right: adds 250 ml |
| HealthTile | `kind` | `'hr' \| 'sleep' \| 'kcal'` | required | Heart rate, sleep or active energy |
| | `onPress` | () => void | required | |
| ConnectTile | `name` | string | required | "Apple Health" or "Health Connect" |
| | `onPress` | () => void | required | |
| TrackerTile | `bg` | string | required | Tile fill |
| | `label` | string | required | Top left label |
| | `labelColor` | string | `c.muted` | |
| | `a11y` | string | required | Spoken label |
| | `onPress` | () => void | none | Makes it a button; without it the tile is a plain element |
| | `right` | node | none | Top right slot (32 px min row) |
| | `shadow` | boolean | false | Soft shadow (light mode tiles) |
| | `children` | node | required | Number and picture |

## States

| Tile | States |
|---|---|
| TrackerRow | not connected: weight, Connect, water. connected: weight, steps, water. connected + wearable: adds heart rate, sleep, active energy |
| WeightTile | Down or flat (green "- 0.4 kg this week"), up (amber "+ 0.3 kg this week"). White with a shadow in light mode, white 5% in dark mode. A "+" pill top right |
| WaterTile | Navy to blue gradient. Bottle from empty to full at 3 L (springs to the new level), "1,250 ml" bottom right. Ripple when the 3 L target is hit |
| HealthTile hr | "Heart rate", "72 bpm", "Resting 64", a pulse line, a beating heart. Sample reading |
| HealthTile sleep | "Sleep", "7h 10m", "11:40 pm – 6:50 am", a stage bar. Sample reading |
| HealthTile kcal | "Active energy", "320 kcal", "Goal 450 kcal", a progress bar. Sample reading |
| ConnectTile | Dashed outline, heart icon, "Connect Health Connect", "Steps, heart rate, sleep and energy" |

Baseline images in `docs/visual-baseline/cards/`: `trackers-default`, `trackers-hc-only`, `trackers-health`, `trackers-tiles`, `trackers-tiles-health`, `trackers-water-empty`, `trackers-water-full`, `trackers-weight-up`.

## Do and don't

- Do keep every tile 160 by 160 with the same label and number style (use `TrackerTile`).
- Do show weight going up in amber, never red.
- Do show the Connect tile in place of steps until Health is connected.
- Don't add buttons inside a tile other than the one quick-add pill.
- Don't show watch tiles without a connected wearable.
- Reminder captions under the water, weight and steps tiles live in `features/reminders/`, not here.

## Accessibility

- The row is a horizontal scroll labelled "Quick trackers, swipe for more".
- WeightTile: button "Weight 72.4 kg, down 0.4 kg this week. Log weight".
- WaterTile: button "Water 1250 of 3,000 millilitres. Open details". The add pill is a separate button "Add a glass, 250 millilitres": 32 px with a 6 px hit slop (44 px), drawn above the tile so it only adds a glass.
- HealthTile: "Heart rate 72 bpm, open details", "Sleep 7 hours 10 minutes, open details", "Active energy 320 of 450 kilocalories, open details".
- ConnectTile: button "Connect <name> for steps, heart rate, sleep and energy".
- Tiles are 160 px, well over 44.

## Copy rules

- Label, then the number and unit: "Weight", "72.4 kg". Units lower case.
- Change says the number and the period: "- 0.4 kg this week". No judgement words.
- The Connect tile says what the member gets: "Steps, heart rate, sleep and energy".
- No dot separators.
