# Components defined more than once (Phase 3, part 2a)

The audit (section 2.3) counted 28 names defined more than once. Earlier steps had already merged nine of them (Card, ListCard, Label, Chip, Enter, E, Marker, Journey, GoalStrip). A fresh scan with `scripts/codemods/dup-components.js` found 19 left. Uses are JSX tags in the defining file and in files that import it.

| Name | Definitions (uses) | What it is | Decision |
|---|---|---|---|
| SubPage | primitive (1), progress/parts wrapper (14) | the wrapper is the "progress" variant of the primitive | already one component; wrapper keeps the old import path |
| Stepper | primitive (4), plans/parts wrapper (5) | the wrapper is the "row" variant | same |
| Bracket | plans/log (4), QuickLogSheet (4) | the same viewfinder corner, 34 px vs 30 px | **merged** into `ScanBracket` (size large / small) |
| Chevron | DietPlan (1), MealsCard (1) | the same turning chevron, timing vs spring | **merged** into `Chevron` (motion timing / spring) |
| Title | onboarding (10), WorkoutCard (3) | a step heading; a workout name with a time pill | different things; renamed `StepTitle`, `WorkoutTitle` |
| Dot | chat (3), ForYou (1), WeekCard (3) | typing dot; pager dot; day dot | different; `TypingDot`, `PagerDot`, `DayDot` |
| Shell | _layout (1), WorkoutCard (6) | app root; gradient card shell | different; `AppShell`, `WorkoutShell` |
| DateSheet | BodyLog (1), FinishBy (3), TrendUI (2) | weigh-in day; finish date wheel; calendar | different; `WeighDateSheet`, `CalendarSheet`; FinishBy keeps `DateSheet` |
| Segments | GoalCard (1), Widgets (4) | 36 view ticks; SVG segment bar | different; `TickBar`, `SegmentBar` |
| Glow | welcome (1), bits (1), GoalCard (2) | welcome glow; pulsing dot; radial glow | different; `WelcomeGlow`, `RadialGlow` (old name `Glow` still exported); bits keeps `Glow` |
| SwapSheet | plans/Sheets (3), WorkoutSheets (1) | swap a diet item; swap an exercise | different; `DietSwapSheet`, `WorkoutSwapSheet`; old name exported from both |
| GoalTile | onboarding (1), profile (2) | goal choice; goal summary | different; `GoalChoiceTile`, `GoalSummaryTile` |
| Bar | TrendUI (1), WeekCard (2) | animated chart bar; 22 px week bar | different; `ChartBar`, `WeekBar` |
| Item | help (1), Wheel (1) | FAQ row; wheel number | different; `FaqItem`, `WheelItem` |
| MembershipCard | gym (1), PaymentBanner (1) | a wrapper; the card | the gym one is a one-line wrapper, renamed `GymMembership`; PaymentBanner keeps the name |
| GoalCard | pattern (2), TopCards (0) | the pattern; the old ring card, unused | ring card renamed `RingGoalCard` (old name still exported) |
| Progress, Welcome, Trackers | page screens and onboarding steps | a screen and a local piece | renamed `ProgressScreen`, `WelcomeScreen`, `TrackersScreen`, `StepProgress`, `WelcomeStep` |

Two real copies were merged. For the other 15 names the definitions looked alike only by name, so merging them would have changed behaviour; they were renamed so each name means one thing. Nothing changed on screen.
