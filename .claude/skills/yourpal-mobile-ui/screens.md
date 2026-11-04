# Screens: how each one is designed now (4 Nov 2026)

One page per area, current state only. The rules behind each choice are in `learned.md`; the components are in `catalog.md`. When a screen changes, change its entry here.

## Today (`src/app/(tabs)/index.tsx`)
- Order: header (bell and photo as separate round buttons), membership strip (only when it needs attention), greeting, the "For you" updates stack, the Today card, then the cards that match the time of day (workout at workout time, meals at meal time, This week at the end of the day), trackers, and the page end.
- Greeting: two light grey lines at 28 px, a brighter key phrase ("It's your **Leg day**"), the name only in the first line, English only.
- Today card: Eat today and Burn today side by side with thin bars (mint and orange), a goal strip along the bottom, charcoal to slate-blue gradient, no glow.
- Meals card: the meal for right now with its foods, a time capsule, solid green eaten items. Workout card: one look per state (planned, live, done, rest, moved, skipped, comeback).
- States: expired membership is view-only (locked cards, read-only chat), comeback day is positive and has no workout card, "no plan assigned" shows only the greeting, a note and the trackers.
- Ends with `PageEnd`.

## Plans (`src/app/(tabs)/plans.tsx`, `src/features/plans/`)
- Heading "Plans" with icon-only Workout and Diet tabs and the three dot menu beside it. A compact grey week strip with the month as a button above it (opens a calendar sheet).
- Workout day: name, by Coach Vikram, facts row, dashed separator, Warm-up, exercises, Cool-down (titled lists, checks on the right). Start workout inline, then floating blue glass.
- Past day: logged shows a green Logged tag, grey stat tiles, rows with their status; not logged offers "Log this workout" (secondary, also floating) and a sheet to enter sets, weights and reps.
- Diet day: the calorie card, the Veg, Egg, Non-veg row as the separator, then one `FoodCard` per food (dashed, solid or faded and struck through). Swipe left for Swap and Skip, hold to open the food, the amount stepper only before logging.

## Progress (`src/app/(tabs)/progress.tsx`, `src/features/progress/`)
- Cards in an order that follows the goal type: weight, consistency, diet, lifts, steps, heart rate, sleep, measurements, photos, water. No assessments card.
- Each card: icon and name, one headline (number big, small unit beside it), only the change underneath, a small chart with dots. Diet shows "1,766 kcal avg. per day".
- Metric pages: Day, Week, Month, Year, a date row with a Today chip, a headline, a tappable bar or line chart (dashed goal line where there is a goal), and named, dated stats (Most steps, Fewest steps, Days on target).
- Streaks and badges page: the Streak hero card style with a nested week card.

## Gym (`src/app/(tabs)/gym.tsx`)
- Order: **Chat with Coach Vikram** (dark card, last message, white button), membership card, break card if paused, Attendance, Assessments, PT (or PT package), then Membership and payments, Membership pauses, Help.
- The Assessments card shows "6 of 7 improved" and "Assessment 2 vs Assessment 1", with the next one underneath.

## Assessments (`src/app/gym/assessments.tsx`)
- Hero (blue gradient) with the latest result, the two pills to switch between assessments, grouped results (Body, Strength, Mobility and fitness) with a change tag on each row, the coach's note, History, and the next assessment card (title, date chip, one line, Remind me).
- To be built: the many-assessments layout described in `learned.md` (28 Oct to 4 Nov).

## Workout session (`src/app/workout.tsx`, `src/features/workout/`)
- Warm-up list, then one exercise per page, then Cool-down, then the finish screen. The main page is a normal scrolling page: header with progress segments and a Finish pill, the exercise name and a three dot menu (swap, ask the coach, form tips, skip), a clip card that plays only when tapped (it shrinks to "Watch form" after the first set), muscles as chips, one row per set with a check and steppers, and a Next button at the bottom with the rest timer.

## Login, onboarding, welcome
- Login: phone with a tappable country code (India default), then the 6 digit code, with a join code option. The code step can go back.
- Onboarding: Get started (no back arrow), then short question steps with plain skip links, then a ready screen with swipe to start (frosted glass).
- Welcome ("Let's begin") is shown first. Recommended and not built: only on the first launch.

## Profile and others
- Profile: a header with member since and the streak, goals, appearance (light, dark, system), grouped settings, Connected apps, notifications and reminders, payments and invoices (view only).
- Coach page: reply time, away state, no unread dot on the photo. Check-in: location only, full-page map, goes straight into the workout.
