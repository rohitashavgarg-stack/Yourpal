# Screens and patterns: how each is designed now (12 Nov 2026)

Current state only. The reasons are in `designer-inputs.md`. Source files named in each entry; read the file before changing a screen and update the entry after.

## Today (`src/app/(tabs)/index.tsx`, `src/features/today`)
- Order: header (bell and photo as separate round buttons), membership strip (only when it needs attention), waiver card while pending, greeting, the "For you" updates stack, the Today card, then the cards that match the time of day (workout at workout time, meals at meal time, This week at the end of the day), trackers, the quick tip card, the page end. Under the greeting and the stack the goal and anything needing an answer stay pinned on top. If every meal is logged the meals card moves below the trackers.
- **Greeting** (`TodayGreeting`, `microcopy.ts`): two light grey lines at 28 px, the key phrase brighter, the name only in the first line. With "Day count" on, the second line starts "Day 12 of 90" then one fact (a streak, otherwise what today holds).
- **Today card** (`BudgetCard`): Eat today and Burn today side by side with "kcal" and thin mint and orange bars, a goal strip along the bottom, charcoal to slate-blue, no glow. Burn is a plan number unless Health and a wearable are connected.
- **Updates stack** (`ForYou.tsx`): swipeable cards: PT confirm, coach reply, plan change, reassessment, reminders (water, weight, steps), the profile step ("Your profile is 40% done", a progress ring, "Add height"). The cross dismisses for the day.
- **Meals card** (`TodayMealNowCard` over the `MealsCard` pattern): the meal for right now with its foods, a time capsule, solid green eaten items, "Ate something else" and "Skip meal"; after logging it moves to the next meal; the all-logged summary lists the meals with arrows that open `MealLoggedSheet` (foods, kcal, protein, total, Edit log).
- **Workout card** (`WorkoutCard` pattern): one look per state: planned, live, done, rest, moved, skipped, comeback ("Easy session", Start easy session, Not today), paused.
- **Trackers:** Weight (glass card, sparkline), Water (deep blue with the bottle art), steps (green dot-matrix card by default) or the dashed Connect Health card, which opens a bottom sheet that asks to connect Steps and Active energy.
- **Quick tip:** a violet tinted gradient card with a big soft bulb behind the words, last on the page, no button.
- **States:** expired is view only (locked cards, read-only chat, the strip pinned), comeback is positive and has no workout card, "no plan assigned" shows the greeting, a note and the trackers only.

## Plans (`src/app/(tabs)/plans.tsx`, `src/features/plans`)
- Heading "Plans" with icon-only Workout and Diet tabs and the three dot menu (Ask Coach to change the plan, Exercise library, Edit logged workout, Download PDF). A compact grey week strip with the month as a button (calendar sheet).
- Workout day: name, by Coach Vikram, facts row, dashed separator, Warm-up, exercises, Cool-down (titled lists, checks on the right). Start workout inline, then floating blue glass. A rest day offers "Ask Coach Vikram for a workout".
- Past or logged day: green "Logged" tag, grey stat tiles, status per row; not logged offers "Log this workout" (secondary, floating); "Edit logged workout" is a floating button that opens `/plans/entries`, a full page like Edit plan (a card for started and how long, one card per exercise with expandable sets, a floating Save changes, no Save in the header).
- Diet day: the calorie card, the Veg, Egg, Non-veg row as the separator, then one `FoodCard` per food inside a stroked meal card.

## Progress (`src/app/(tabs)/progress.tsx`, `src/features/progress`)
- Cards ordered by goal type: weight, consistency, diet, lifts, steps, heart rate, sleep, measurements, photos, water. No assessments. Each card: icon and name, one headline, only the change underneath, a small chart with dots.
- Metric pages: Day, Week, Month, Year, a date row with a Today chip, a headline, a tappable chart (dashed goal line), named and dated stats. The primary action (Log weight, Log water, Add steps) floats.
- Streaks and badges page: the streak hero card style with a nested week card. Card pages (streaks, metric, lift, photos, muscles) grow from their card, have no back button and a drag handle.

## Gym (`src/app/(tabs)/gym.tsx`, `src/features/gym`)
- Order: Chat with Coach Vikram (dark card, last message, white button), membership card (one line: how many active, "1 paused until", "next plan starts"), break card if paused, Attendance, Assessments, PT, links. Memberships: Active (with Starts next), Suspended, Past; a paused plan has its own look; the detail page has big time left, bar, dates, price, PT, pauses (1 of 2 used) and payments.
- Assessments: list (UPCOMING one quiet card, COMPLETED one card per assessment with a stroke, "6 of 7 improved", three key numbers); a finished one opens the view-only page (summary numbers on the page, grey icon tiles, grouped rows with change tags, the trainer's notes).

## Workout session (`src/app/workout.tsx`, `src/features/workout`)
- Start opens the page at once. Warm-up list (thumbnail radius follows the card), then one exercise per page (floating header with progress segments and a Finish pill, name and a three dot menu, a clip card that plays on tap, muscles as chips, one row per set with check and steppers, a floating Next button with the rest timer), cool-down, then the finish page.
- **Finish page:** signed-waiver background (blue glow, thick lines), heading in two lines, three numbers that count up, logged sets card (Share at its bottom), "How was it?" card with the draggable `EffortSlider`, a note for Coach Vikram, floating Done with a white glow.

## Goals and trackers (as of 19 Oct; the goal pages still follow this)
- One goal model (`useGoalV2`, `src/features/goalv2/model.ts`) feeds every surface; one shared visual (`GoalVisual.tsx`), always full width, `compact` and `large`. Weight, muscle, body fat: 36 ticks filling mint. Weekly workouts: one slot per workout. Strength: staircase of 18 steps. Flexibility: a stopwatch ruler (one mark per second or cm). Agility: a race lane to a flag. A goal is never frozen or paused.
- Goal page (`/goal-detail`): the header button says "Change"; hero with the status pill; the "now" bubble pointer sits exactly on the tick (measured with `onLayout`); Start and Goal at the ends; then the action card if ending soon or reached, To go and Time left tiles, the pace chart (a headline sentence, legend), what is moving it (icon, label, thin category bar, one big number), past goals. The top glow is `TopGlow`. Change goal: Save goal stays disabled until something changes and floats above the content.
- The goal card on Today and Progress: `GoalTickCard` states (on track, behind, almost, complete, comeback, back on, no goal); the percentage is time elapsed with the kg line beside it.

## Login, onboarding, welcome
- Login: phone with a tappable country code (India default), the 6 digit code, a join code option. Onboarding: Get started (no back arrow), short questions with plain skip links, floating header (progressive blur) and floating buttons, a ready screen with swipe to start (frosted glass). Welcome ("Let's begin") shows first.

## Profile, waiver, notifications
- Profile: header with member since and the streak, goal tiles (steps and water open with the card), appearance, grouped settings, Connected apps, notifications and reminders (heading and its line together, quiet hours time in a pill), payments and invoices (a cross page), waiver row with a status chip (Pending orange, Signed green).
- Waiver: sign page (white and grey, amber glow, Agree and sign, Skip for now), details page (green glow once signed), completion screen (blue top glow, black bottom, no back button).
- Notifications (`src/app/notifications.tsx`): one inbox for every programme, grouped by day, programme name above each title.
- Coach page: reply time, away state, no unread dot on the photo. Check-in: location only, a full-page map, straight into the workout.

## Patterns in the design system worth knowing
`Card` (variants default 28/20, roomy, compact 24/18, tight 24/16, dark; `plain`, `flat`, `clip`), `CardEdge`, `Pressy` (`grow` for icon buttons), `IconButton` (glass, edge, plain card look by default), `SubPage` (shell and progress, `floatingFooter`, `backdrop`, `close`, `GrowFrame` with a grabber), `Sheet`, `Snackbar`, `Chip` (information only), `Option` (a choice in a set), `ListCard`, `SectionLabel`, `FoodCard`, `MealsCard`, `WorkoutCard`, `BudgetCard`, `GoalCard`, `TrackerRow`, `EffortSlider`, `TopGlow`, `ProgressiveBlur`, `FadeIn`. The full list with variants is `docs/design-system-components.md`.
