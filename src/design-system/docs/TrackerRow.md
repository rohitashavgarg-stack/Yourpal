# TrackerRow and tiles

`src/design-system/patterns/TrackerRow.tsx`. The quick trackers on Today: 160 px tiles in a sideways scroll.

`TrackerRow({ connected, wearable, weight, steps, connect, water, health })` order: weight, then steps (connected) or the Connect tile, then water, then the three watch tiles when `connected && wearable`.

| Tile | Props |
|---|---|
| WeightTile | `kg`, `delta` (week change; amber when up), `series` (sparkline), `onPress` |
| WaterTile | `litres` (bottle fills to 3 L), `hit` (ripple counter), `onPress`, `onAdd` (+250 ml) |
| HealthTile | `kind` hr, sleep or kcal, `onPress`. Readings are samples |
| ConnectTile | `name` (Apple Health or Health Connect), `onPress` |
| TrackerTile | the shared 160 px frame: `bg`, `label`, `right`, `a11y`, `onPress` |

Containers in `features/today/Trackers.tsx` keep the old names (`Trackers`, `WaterCard`, `WeightCard`, `HealthCards`, `ConnectCard`). Steps tile and the alternative tile designs stay there. Images: `trackers-*`.
