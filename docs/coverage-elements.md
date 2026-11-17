# Elements per screen

For each row of `docs/coverage.md`: the design-system components it uses (count of tags) and every hand-built element found (file:line, kind, the start of the JSX). Generated; do not edit.

## Gym (routes)

- Files: `app/(tabs)/gym.tsx`
- Library components used: Txt x39, Row x13, CardEdge x7, FadeIn x6, Button x6, Pressy x3, StatusDot x2, IconBadge x2, Chip x2
- Hand-built:
  - `app/(tabs)/gym.tsx:56` icon badge: `<View style={{ width: 44, height: 44, borderRadius: radii.md, backgroundColor: c.accentSof`
  - `app/(tabs)/gym.tsx:66` card: `<View key={m.id} style={{ flex: 1, borderRadius: radii.md, backgroundColor: c.surface2, pa`
  - `app/(tabs)/gym.tsx:152` icon badge: `<View style={{ width: 36, height: 36, borderRadius: radii.pill, alignItems: 'center', just`
  - `app/(tabs)/gym.tsx:161` card: `<View style={{ gap: 12, padding: 12, borderRadius: radii.lg, backgroundColor: c.surface2 }`
  - `app/(tabs)/gym.tsx:173` card: `<View key={r.k} style={{ flex: 1, borderRadius: radii.md, backgroundColor: c.surface, padd`
  - `app/(tabs)/gym.tsx:203` card: `<View style={{ backgroundColor: onDark.card, borderRadius: radii.xl, padding: 18, gap: 14 `
  - `app/(tabs)/gym.tsx:217` card: `<View accessible accessibilityLabel={'Last message: ${last.t}. ${last.meta}'} style={{ gap`
  - `app/(tabs)/gym.tsx:252` card: `<View ref={grow.ref} collapsable={false} onTouchStart={grow.prime} onPointerDown={grow.pri`
  - `app/(tabs)/gym.tsx:262` card: `<View ref={grow.ref} collapsable={false} onTouchStart={grow.prime} onPointerDown={grow.pri`
  - `app/(tabs)/gym.tsx:279` card: `<View ref={grow.ref} collapsable={false} onTouchStart={grow.prime} onPointerDown={grow.pri`
  - `app/(tabs)/gym.tsx:291` card: `<View ref={grow.ref} collapsable={false} onTouchStart={grow.prime} onPointerDown={grow.pri`

## Today (routes)

- Files: `app/(tabs)/index.tsx`, `features/today/WorkoutCard.tsx`, `features/today/OtherWorkouts.tsx`, `features/today/WeekCard.tsx`, `features/today/timeline.ts`, `features/today/ForYou.tsx`, `features/today/ui.ts`, `features/today/PaymentBanner.tsx`, `features/today/CheckInBar.tsx`, `features/today/ViewOnly.tsx`, `features/today/TodayBudget.tsx`, `features/today/TodayGreeting.tsx`, `features/today/NoPlanCard.tsx`, `features/reminders/PushBanner.tsx`, `features/profile/WaiverCard.tsx`, `features/feedback/FeedbackCard.tsx`, `features/today/GoalCards.tsx`, `features/today/MealLoggedSheet.tsx`, `features/today/LogMealsSheet.tsx`, `features/reminders/push.ts`
- Library components used: Txt x42, FadeIn x24, Button x15, Row x12, Pressy x7, IconBadge x5, WorkoutCardPattern x4, PageEnd x2, Card x2, CardEdge x2, Banner x2, FoodCard x2, WeekCardPattern x1, BudgetCard x1, AmountStepper x1, SheetFooter x1
- States and edge cases: Today variant: Regular, With updates, Comeback; Goal card state: Auto, ...GOAL_STATE_OPTIONS.map(([l; Last weigh-in: Today, 3 days ago, 10+ days ago; Health (steps): Connected, Not connected; Wearable (heart rate, sleep, energy): Has a wearable, No wearable; Time of day: Morning, Afternoon, Evening; Workout today: Not started, Done, Rest day; Check-in (location): Away, Near (25 m), At the gym, Checked in, Location off; Food scan result: Works, Fails; (action) Show loading state; (action) Reset meals for this time of day
- Hand-built:
  - `features/today/OtherWorkouts.tsx:120` icon badge: `<View style={{ width: 36, height: 36, borderRadius: round(36), backgroundColor: missed ? '`
  - `features/today/ForYou.tsx:149` button or pill: `<Pressy accessibilityRole="button" onPress={it.act} style={{ height: 40, minWidth: 132, pa`
  - `features/today/ForYou.tsx:170` bar: `<Animated.View style={[{ height: 6, borderRadius: radii.xs, backgroundColor: c.ink }, st]}`
  - `features/today/ForYou.tsx:234` chip: `<View key={t} style={{ height: 28, paddingHorizontal: 12, borderRadius: round(28), borderW`
  - `features/profile/WaiverCard.tsx:31` icon badge: `<View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.warn + '2`
  - `features/feedback/FeedbackCard.tsx:17` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="How is your gym going? Give feedbac`
  - `features/feedback/FeedbackCard.tsx:20` icon badge: `<View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: c.accent + `

## Plans (routes)

- Files: `app/(tabs)/plans.tsx`, `features/plans/DietPlan.tsx`, `features/plans/DayTimeline.tsx`, `features/plans/QtySheet.tsx`, `features/plans/FoodActionsSheet.tsx`, `features/plans/mealTime.ts`
- Library components used: Txt x40, FadeIn x9, Row x7, Button x6, Pressy x4, Card x3, IconBadge x2, IconButton x2, Segmented x1, Callout x1, ProgressBar x1, AmountStepper x1, FoodCard x1, Chevron x1, CardEdge x1
- States and edge cases: Plan type: Workout, Diet; Coach updated the plan: Off, On; Plan change request: None, Requested, Ready; No plan yet (before assessment): Off, On; Mid-workout when the update arrives: Off, On; Connection: Online, Offline; Diet type (plan + swaps): Veg, Eggetarian, Non-veg; Detail level: Detailed, Simple; Camera (scan food): Allowed, Denied; Scan result: Works, Fails; (action) Apply Coach update now; (action) Reset this prototype
- Hand-built:
  - `app/(tabs)/plans.tsx:74` button or pill: `<Pressy key={i} accessibilityRole="button" accessibilityState={{ selected: on }} accessibi`
  - `app/(tabs)/plans.tsx:84` icon badge: `<View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderStyle: 'das`
  - `app/(tabs)/plans.tsx:85` icon badge: `<View style={{ width: 4, height: 4, borderRadius: radii.xs, backgroundColor: dot }} />`
  - `features/plans/DietPlan.tsx:114` icon badge: `<View accessibilityLabel="Changed from plan" style={{ position: 'absolute', top: 0, right:`
  - `features/plans/DietPlan.tsx:190` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Ate at ${fmtClock(at)}. Change the`
  - `features/plans/DayTimeline.tsx:57` bar: `<View style={{ width: 22, height: 12, borderRadius: round(12), backgroundColor: c.surface3`
  - `features/plans/DayTimeline.tsx:66` bar: `<View style={{ width: 22, height: 12, borderRadius: round(12), backgroundColor: c.surface3`
  - `features/plans/DayTimeline.tsx:91` icon badge: `<View accessibilityLabel="Done" style={{ width: 32, height: 32, borderRadius: round(32), b`
  - `features/plans/DayTimeline.tsx:115` icon badge: `<View style={{ width: 14, height: 14, marginTop: 3, borderRadius: round(14), backgroundCol`

## Progress (routes)

- Files: `app/(tabs)/progress.tsx`, `features/progress/MusclesCard.tsx`, `features/reports/ProgressMenuSheet.tsx`, `features/reports/DownloadRow.tsx`, `features/reports/ReportSheet.tsx`
- Library components used: Txt x33, Row x11, FadeIn x5, Callout x2, IconBadge x1, ProgressSegments x1, IconButton x1, MuscleRings x1, Pressy x1, Pill x1, Button x1
- Hand-built:
  - `app/(tabs)/progress.tsx:160` card: `<View style={{ alignSelf: 'flex-start', height: 40, paddingHorizontal: 18, borderRadius: 2`
  - `features/reports/DownloadRow.tsx:28` icon badge: `<View style={{ width: 44, height: 44, borderRadius: radii.md, backgroundColor: c.surface2,`
  - `features/reports/DownloadRow.tsx:35` icon badge: `<View style={{ width: 36, height: 36, borderRadius: radii.pill, backgroundColor: c.surface`

## Check-in map (routes)

- Files: `app/checkin.tsx`, `features/checkin/GymMap.tsx`
- Library components used: Txt x6, Button x4, Row x1, FadeIn x1, IconBadge x1
- States and edge cases: Check-in (location): Away, Near (25 m), At the gym, Location off; (action) Refresh location
- Hand-built: none

## Coach (routes)

- Files: `app/coach.tsx`
- Library components used: Txt x10, Row x6, Button x3, Card x3, SectionLabel x3, Pressy x1, IconBadge x1
- States and edge cases: Coach availability: Available, Away; Unread reply: Yes, No
- Hand-built: none

## Exercise search (routes)

- Files: `app/exercise-search.tsx`
- Library components used: Txt x5, Pill x3, Row x2, Field x1, Pressy x1, IconBadge x1, Button x1
- States and edge cases: Query: Empty, Squat, No match
- Hand-built:
  - `app/exercise-search.tsx:74` button or pill: `<Pressy key={x.n} accessibilityRole="button" accessibilityLabel={'${x.n}, ${x.g}. Swap'} o`

## /food-library (routes)

- Files: `app/food-library.tsx`
- Library components used: Txt x2, Row x1, Field x1, IconButton x1, Option x1, FoodCard x1, Button x1
- Hand-built: none

## Food detail (routes)

- Files: `app/food.tsx`
- Library components used: Txt x27, Row x9, IconBadge x3, Card x3, Pressy x2, Chip x2, ProgressBar x2, Button x2, FadeIn x1
- States and edge cases: Micronutrients: Collapsed, Expanded; (action) Close food page
- Hand-built:
  - `app/food.tsx:99` card: `<View key={l} style={{ gap: 2, paddingVertical: 9, paddingHorizontal: 14, borderRadius: ra`
  - `app/food.tsx:105` button or pill: `<Pressy accessibilityRole="button" onPress={() => askCoach(fd!.n, 'Is ${fd!.n.toLowerCase(`
  - `app/food.tsx:129` button or pill: `<Pressy accessibilityRole="button" accessibilityState={{ expanded: micro }} onPress={() =>`

## Your goal (routes)

- Files: `app/goal-detail.tsx`
- Library components used: Txt x32, Card x11, Row x10, Button x7, IconBadge x4, Pressy x3, SectionLabel x1, ProgressBar x1, TopGlow x1
- Hand-built:
  - `app/goal-detail.tsx:95` chip: `<View style={{ height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: c.ink`
  - `app/goal-detail.tsx:110` bar: `<View style={{ width: 16, height: 3, borderRadius: radii.xs, backgroundColor: c.accent }} `
  - `app/goal-detail.tsx:256` chip: `<View style={{ alignSelf: 'flex-start', height: 30, paddingHorizontal: 12, borderRadius: 1`

## Change goal (routes)

- Files: `app/goal.tsx`, `features/shell/goals.ts`
- Library components used: Txt x4, Button x1, Pressy x1, CardEdge x1, Chip x1
- Hand-built:
  - `app/goal.tsx:45` button or pill: `<Pressy key={g.id} accessibilityRole="radio" accessibilityState={{ selected: on }} accessi`
  - `app/goal.tsx:56` icon badge: `<View style={{ width: 24, height: 24, borderRadius: round(24), borderWidth: on ? 0 : 1.5, `

## /gym/assessment (routes)

- Files: `app/gym/assessment.tsx`
- Library components used: Txt x10, Row x7, Chip x3, CardEdge x3, SectionLabel x2, TopGlow x1, IconBadge x1
- Hand-built:
  - `app/gym/assessment.tsx:114` icon badge: `<View style={{ width: 8, height: 8, borderRadius: radii.pill, backgroundColor: tone[k] }} `
  - `app/gym/assessment.tsx:129` card: `<View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, paddingHorizontal: 14,`
  - `app/gym/assessment.tsx:135` icon badge: `<View style={{ width: 38, height: 38, borderRadius: radii.md, backgroundColor: c.surface2,`
  - `app/gym/assessment.tsx:155` card: `<View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 16 }}>`

## Assessments (routes)

- Files: `app/gym/assessments.tsx`
- Library components used: Txt x10, Row x3, IconBadge x2, Pressy x1, CardEdge x1, TopGlow x1, Card x1, Chip x1
- Hand-built:
  - `app/gym/assessments.tsx:40` card: `<View key={k} style={{ flex: 1, borderRadius: radii.md, backgroundColor: c.surface2, paddi`

## Attendance (routes)

- Files: `app/gym/attendance.tsx`, `features/gym/attendanceMonths.ts`
- Library components used: Txt x7, Row x3, Pressy x2, IconBadge x2, TopGlow x1, CardEdge x1, StatusDot x1, Card x1, FadeIn x1
- Hand-built:
  - `app/gym/attendance.tsx:62` card: `<View style={[{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 16 }, cardSh`
  - `app/gym/attendance.tsx:65` icon button: `<Pressy accessibilityRole="button" accessibilityLabel="Earlier month" onPress={() => setBa`
  - `app/gym/attendance.tsx:70` icon button: `<Pressy accessibilityRole="button" accessibilityLabel="Later month" onPress={() => setBack`
  - `app/gym/attendance.tsx:100` icon badge: `<View accessible accessibilityLabel={r.tag === 'Location' ? 'Checked in with the phone' : `

## Coach chat (routes)

- Files: `app/gym/chat.tsx`, `features/chat/AudioBubble.tsx`, `features/chat/Composer.tsx`, `features/chat/emoji.ts`
- Library components used: Txt x17, Pressy x10, FadeIn x5, Button x3, IconButton x3, Callout x2, Row x2
- Hand-built:
  - `app/gym/chat.tsx:40` icon badge: `<Animated.View style={[{ width: 6, height: 6, borderRadius: radii.xs, backgroundColor: c.m`
  - `app/gym/chat.tsx:160` card: `<View style={{ flexShrink: 1, paddingVertical: m.img ? 6 : 10, paddingHorizontal: m.img ? `
  - `features/chat/Composer.tsx:34` icon badge: `<Animated.View style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4D4F`
  - `features/chat/Composer.tsx:198` input: `<TextInput ref={input} value={draft} onChangeText={setDraft} onFocus={() => setEmoji(false`

## Confirm session (routes)

- Files: `app/gym/confirm.tsx`
- Library components used: Txt x6, FadeIn x2, Pressy x1, Card x1, Field x1, Button x1
- Hand-built: none

## /gym/membership-detail (routes)

- Files: `app/gym/membership-detail.tsx`
- Library components used: Txt x22, Row x6, IconBadge x1, CardEdge x1, ProgressSegments x1, Pressy x1, Chip x1, Button x1
- Hand-built:
  - `app/gym/membership-detail.tsx:39` card: `<View style={{ width: '48%', flexGrow: 1, minHeight: 104, borderRadius: radii.lg, padding:`
  - `app/gym/membership-detail.tsx:147` card: `<View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 16, gap: 14 }`

## Membership (routes)

- Files: `app/gym/membership.tsx`
- Library components used: Txt x8, Row x4, Chip x3, CardEdge x3, Pressy x2, NameAvatar x1, TopGlow x1, Segmented x1, SectionLabel x1
- Hand-built:
  - `app/gym/membership.tsx:23` bar: `<View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }} `
  - `app/gym/membership.tsx:24` bar: `<View style={{ width: '${pct}%', height: 6, borderRadius: radii.xs, backgroundColor: warn `
  - `app/gym/membership.tsx:36` card: `<View accessible accessibilityLabel={from ? 'Transferred from ${from}' : 'Transferred'} st`
  - `app/gym/membership.tsx:120` card: `<View style={{ padding: 24, borderRadius: radii.lg, backgroundColor: c.cardLift, alignItem`

## /gym/payments (routes)

- Files: `app/gym/payments.tsx`
- Library components used: Txt x4, SubPage x1, Row x1, Chip x1, Button x1
- Hand-built: none

## /gym/pt-pack (routes)

- Files: `app/gym/pt-pack.tsx`
- Library components used: Txt x20, Row x5, Chip x2, CardEdge x1
- Hand-built:
  - `app/gym/pt-pack.tsx:79` card: `<View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 16, gap: 12 }`

## /gym/pt-packs (routes)

- Files: `app/gym/pt-packs.tsx`
- Library components used: Txt x10, Row x3, Pressy x1, CardEdge x1, TopGlow x1
- Hand-built:
  - `app/gym/pt-packs.tsx:65` icon badge: `<View key={i} style={{ width: 12, height: 12, borderRadius: round(12), backgroundColor: c.`

## PT package (routes)

- Files: `app/gym/pt.tsx`
- Library components used: Txt x7, TopGlow x1, Button x1, IconBadge x1, CardEdge x1, Row x1
- Hand-built:
  - `app/gym/pt.tsx:71` card: `<View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 18 }}>`

## /gym/sessions (routes)

- Files: `app/gym/sessions.tsx`, `features/gym/SessionSheet.tsx`, `features/gym/SessionBits.tsx`
- Library components used: Txt x14, Row x6, CardEdge x3, Button x2, Pressy x1
- Hand-built:
  - `app/gym/sessions.tsx:36` icon badge: `<View style={{ width: 14, height: 14, borderRadius: radii.pill, backgroundColor: done || s`
  - `app/gym/sessions.tsx:39` card: `<View style={{ flex: 1, backgroundColor: c.cardLift, borderRadius: radii.card, padding: 14`

## Entry redirect (routes)

- Files: `app/index.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## /log-chat (routes)

- Files: `app/log-chat.tsx`
- Library components used: Txt x5, Row x2, GrowFrame x1, IconButton x1, FadeIn x1, FoodCard x1, Button x1, Option x1, ChatBar x1
- Hand-built:
  - `app/log-chat.tsx:134` card: `<View style={{ backgroundColor: c.accent, borderRadius: radii.lg, borderBottomRightRadius:`
  - `app/log-chat.tsx:140` card: `<View style={{ backgroundColor: c.cardLift, borderRadius: radii.lg, borderBottomLeftRadius`
  - `app/log-chat.tsx:155` card: `<View style={{ backgroundColor: c.cardLift, borderRadius: radii.lg, borderBottomLeftRadius`

## Log height (routes)

- Files: `app/log-height.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Log weight (routes)

- Files: `app/log-weight.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Log in (routes)

- Files: `app/login.tsx`, `components/OtpInput.tsx`, `features/shell/CountrySheet.tsx`
- Library components used: Txt x32, FadeIn x14, Row x5, Button x5, Pressy x3, Field x2, Callout x2
- States and edge cases: Phone number: In CRM, Not found; Code entered: Correct, Wrong; Android SMS auto-read: Off, On; Connection: Online, Offline; Programmes on this number: Three, Only one; (action) Fill a valid number; (action) Jump to code step
- Hand-built:
  - `components/OtpInput.tsx:25` input: `<TextInput ref={ref} value={value} onChangeText={(t) => onChange(t.replace(/\D/g, '').slic`

## Notifications (routes)

- Files: `app/notifications.tsx`
- Library components used: Txt x8, Pressy x2, FadeIn x2, Pill x1, CardEdge x1, Row x1, IconBadge x1
- States and edge cases: Notifications: Some, None; Programmes joined: Three, Only one; (action) Mark everything unread
- Hand-built:
  - `app/notifications.tsx:98` icon badge: `<View accessibilityElementsHidden style={{ width: 9, height: 9, marginTop: 4, borderRadius`

## Onboarding (frame) (routes)

- Files: `app/onboarding.tsx`, `features/onboarding/plan.ts`, `features/onboarding/Steps.tsx`, `features/onboarding/path.ts`
- Library components used: Txt x79, Row x15, IconBadge x10, FadeIn x8, Pressy x4, Card x4, Pill x4, Button x3, Option x3, Chip x3, ProgressBar x1, NoteField x1, IconButton x1
- States and edge cases: Jump to step: Welcome, Gym, Goal, Experience, Schedule, Age, Height, Weight, Target, Projection, Basics, Health, Privacy, Building, All set; Assessment: Scheduled, Not scheduled; Connection: Online, Offline; (action) Restart onboarding
- Hand-built: none

## Ask coach (routes)

- Files: `app/plans/ask.tsx`
- Library components used: Txt x4, Row x2, Pill x1, FadeIn x1, Button x1
- States and edge cases: (action) Send without a reason (error)
- Hand-built:
  - `app/plans/ask.tsx:67` input: `<TextInput accessibilityLabel="Note for Coach Vikram, optional" value={note} onChangeText=`

## Create a workout (routes)

- Files: `app/plans/create.tsx`
- Library components used: Txt x8, Row x2, Button x2, Field x1, Pill x1, Card x1, Pressy x1
- States and edge cases: (action) Fill a sample workout; (action) Try to save empty (errors); (action) Pick a day that already has a workout
- Hand-built: none

## Edit plan (routes)

- Files: `app/plans/edit.tsx`, `features/plans/DragList.tsx`
- Library components used: Txt x5, Button x3, Pressy x2
- States and edge cases: (action) Remove the first row; (action) Close (asks to discard when changed)
- Hand-built:
  - `app/plans/edit.tsx:124` card: `<View style={{ height: ROW_H, borderRadius: 20, backgroundColor: c.surface, flexDirection:`

## /plans/entries (routes)

- Files: `app/plans/entries.tsx`
- Library components used: Txt x10, AmountStepper x5, Row x4, Pressy x3, CardEdge x1, Button x1
- Hand-built:
  - `app/plans/entries.tsx:71` card: `<View style={{ borderRadius: radii.xl, backgroundColor: c.cardLift, paddingHorizontal: 16,`
  - `app/plans/entries.tsx:103` icon badge: `<View style={{ width: 26, height: 26, borderRadius: radii.pill, alignItems: 'center', just`
  - `app/plans/entries.tsx:130` icon button: `<Pressy accessibilityRole="checkbox" accessibilityState={{ checked: s.done }} accessibilit`

## Exercise (routes)

- Files: `app/plans/exercise.tsx`
- Library components used: Txt x9, Card x2, IconButton x1, Row x1, CardEdge x1, Button x1
- States and edge cases: Form video: Paused, Playing; Connection: Online, Offline
- Hand-built:
  - `app/plans/exercise.tsx:43` bar: `<View style={{ position: 'absolute', left: 14, right: 14, bottom: 12, height: 4, borderRad`
  - `app/plans/exercise.tsx:100` card: `<View style={{ height: 96, borderRadius: radii.lg, backgroundColor: c.cardLift, flexDirect`

## Workout history (routes)

- Files: `app/plans/history.tsx`
- Library components used: Txt x5, Card x1, Pressy x1, IconBadge x1
- States and edge cases: (action) Open ${h.t}
- Hand-built: none

## What did you eat? (routes)

- Files: `app/plans/log.tsx`
- Library components used: Txt x27, Row x5, FadeIn x5, Card x4, Button x4, ScanBracket x4, Pressy x3, Pill x3, IconBadge x2, Field x2, Segmented x1, Option x1, Callout x1
- States and edge cases: How to add it: Search, Write, Scan; Camera (scan food): Allowed, Denied; Scan result: Works, Fails; Diet type (catalogue): Veg, Eggetarian, Non-veg; (action) Search for something missing
- Hand-built:
  - `app/plans/log.tsx:45` card: `<View style={{ flex: 1, height: 52, borderRadius: radii.xl, borderWidth: 1, borderColor: c`
  - `app/plans/log.tsx:46` input: `<TextInput accessibilityLabel={label} value={value} onChangeText={(t) => onChange(t.replac`
  - `app/plans/log.tsx:158` button or pill: `<Pressy key={f.n} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={mul`

## What changed (routes)

- Files: `app/plans/updated.tsx`
- Library components used: Txt x3, Card x1, FadeIn x1, Button x1
- States and edge cases: Mid-workout when the update arrives: Off, On
- Hand-built: none

## /plans/workout (routes)

- Files: `app/plans/workout.tsx`
- Library components used: Button x1, TopGlow x1
- Hand-built: none

## Appearance (routes)

- Files: `app/profile/appearance.tsx`, `features/shell/ThemeTile.tsx`
- Library components used: Row x2, Pressy x1, IconBadge x1, Txt x1
- Hand-built:
  - `features/shell/ThemeTile.tsx:22` bar: `<View style={{ width: 22, height: 5, borderRadius: radii.xs, backgroundColor: m.ink, opaci`
  - `features/shell/ThemeTile.tsx:27` bar: `<View style={{ flex: 1, height: 5, borderRadius: radii.xs, backgroundColor: m.mute }} />`
  - `features/shell/ThemeTile.tsx:28` bar: `<View style={{ flex: 1, height: 5, borderRadius: radii.xs, backgroundColor: m.mute }} />`

## Delete account (routes)

- Files: `app/profile/delete.tsx`
- Library components used: Txt x2, Button x2, Callout x1, Field x1
- States and edge cases: Confirmation: Empty, Typed DELETE
- Hand-built: none

## My details (routes)

- Files: `app/profile/details.tsx`
- Library components used: Txt x16, Button x6, Field x5, Pressy x4, CardEdge x4, Row x3, FadeIn x1
- States and edge cases: Name: Filled, Empty
- Hand-built: none

## Export my data (routes)

- Files: `app/profile/export.tsx`
- Library components used: Txt x3, FadeIn x3, ProgressBar x1, Button x1
- States and edge cases: Export result: Succeeds, Fails (offline); (action) Start export
- Hand-built: none

## Connected apps (routes)

- Files: `app/profile/health.tsx`
- Library components used: Txt x12, Row x5, Button x4, IconBadge x3, Card x1, Pressy x1
- Hand-built:
  - `app/profile/health.tsx:54` icon badge: `<View style={{ width: 8, height: 8, borderRadius: radii.xs, backgroundColor: on ? c.good :`

## Help and support (routes)

- Files: `app/profile/help.tsx`
- Library components used: Txt x2, Pressy x1, FadeIn x1, Button x1
- States and edge cases: FAQ: All closed, First open
- Hand-built: none

## Profile (routes)

- Files: `app/profile/index.tsx`, `features/shell/sheets.tsx`
- Library components used: Txt x20, Row x7, Pressy x4, Button x4, CardEdge x3, Chip x1, FadeIn x1
- States and edge cases: Member type (privacy wording): Regular, PT member; Programmes joined: Three, Only one; Account deletion: Not scheduled, Scheduled; (action) Log out (confirm sheet); (action) Open an invite link (WhatsApp); (action) Reset profile settings
- Hand-built:
  - `app/profile/index.tsx:85` chip: `<View style={{ alignSelf: 'flex-start', marginTop: 2, height: 24, paddingHorizontal: 10, b`
  - `app/profile/index.tsx:91` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Programme: ${current.short}${multi`
  - `app/profile/index.tsx:117` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Goal: ${g2.name}. Change goal'} on`
  - `app/profile/index.tsx:170` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'${title} goal ${value}. Edit'} onP`
  - `app/profile/index.tsx:188` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Tracker designs. Choose how your tr`

## Join a programme (routes)

- Files: `app/profile/join.tsx`
- Library components used: Txt x2, FadeIn x2, Field x1, Button x1
- States and edge cases: Invite code: YOGA-2024 (new), GLD-4821 (joined), OLD-0001 (expired), Wrong; Opened from: Typed, WhatsApp link; (action) Try joining
- Hand-built: none

## /profile/language (routes)

- Files: `app/profile/language.tsx`
- Library components used: Txt x2, CardEdge x1, Pressy x1
- Hand-built: none

## Notification settings (routes)

- Files: `app/profile/notifications.tsx`
- Library components used: Txt x4, FadeIn x1, Row x1, Button x1
- States and edge cases: Phone permission: Allowed, Blocked, Not asked; (action) Turn all reminders on
- Hand-built:
  - `app/profile/notifications.tsx:72` chip: `<View style={{ backgroundColor: c.accentSoft, borderRadius: radii.pill, paddingHorizontal:`

## /profile/preferences (routes)

- Files: `app/profile/preferences.tsx`
- Library components used: Txt x5, Pill x4, Button x3, Card x1, Row x1, FadeIn x1, NoteField x1
- Hand-built: none

## Privacy (routes)

- Files: `app/profile/privacy.tsx`
- Library components used: Txt x2, Row x1
- States and edge cases: Member type (privacy wording): Regular, PT member; Programmes joined: Three, Only one
- Hand-built: none

## /profile/sound (routes)

- Files: `app/profile/sound.tsx`
- Library components used: Row x3, Txt x3, CardEdge x1, Button x1
- Hand-built:
  - `app/profile/sound.tsx:43` bar: `<View pointerEvents="none" style={{ height: 8, borderRadius: radii.xs, backgroundColor: c.`
  - `app/profile/sound.tsx:44` bar: `<View style={{ width: '${value * 100}%', height: 8, borderRadius: radii.xs, backgroundColo`
  - `app/profile/sound.tsx:46` icon badge: `<View pointerEvents="none" style={{ position: 'absolute', left: w ? value * w - 15 : 0, to`
  - `app/profile/sound.tsx:64` card: `<View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 18, gap: 14 }`

## Tracker designs (routes)

- Files: `app/profile/tracker-designs.tsx`
- Library components used: Txt x2, Pressy x1, IconBadge x1
- Hand-built: none

## Quick trackers (routes)

- Files: `app/profile/trackers.tsx`
- Library components used: FadeIn x1
- States and edge cases: Trackers: All on, All off
- Hand-built: none

## Units and detail (routes)

- Files: `app/profile/units.tsx`
- Library components used: Row x1, Pill x1
- States and edge cases: Weight: kg, lb; Diet detail level: Simple, Detailed
- Hand-built: none

## /profile/waiver (routes)

- Files: `app/profile/waiver.tsx`, `features/profile/waiver.ts`, `features/profile/WaiverSigned.tsx`, `features/profile/WaiverDetails.tsx`, `features/profile/SignSheet.tsx`, `features/profile/Signature.tsx`, `features/profile/WaiverBadge.tsx`, `features/profile/WaiverIllustration.tsx`
- Library components used: Txt x14, Row x5, Button x4, Chip x4, CardEdge x3, TopGlow x2, IconBadge x2, Pressy x1
- Hand-built:
  - `app/profile/waiver.tsx:69` icon badge: `<View style={{ width: 28, height: 28, borderRadius: radii.pill, backgroundColor: c.surface`
  - `features/profile/WaiverDetails.tsx:35` card: `<View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 16, gap: 8 }}`
  - `features/profile/WaiverDetails.tsx:47` icon badge: `<View style={{ width: 28, height: 28, borderRadius: radii.pill, backgroundColor: c.surface`

## Goal (progress) (routes)

- Files: `app/progress/goal.tsx`
- Library components used: Txt x7, Pill x3, Button x2, Card x1, Row x1, FadeIn x1
- Hand-built: none

## Lift detail (routes)

- Files: `app/progress/lift.tsx`
- Library components used: Txt x5, FadeIn x3, TopGlow x1, Pill x1, Card x1, IconBadge x1, Row x1, Pressy x1
- Hand-built: none

## Metric detail (routes)

- Files: `app/progress/metric.tsx`, `features/progress/LogSheets.tsx`
- Library components used: Txt x9, Button x6, Pill x1, Card x1, IconBadge x1, FadeIn x1, Callout x1, Field x1
- Hand-built: none

## /progress/muscles (routes)

- Files: `app/progress/muscles.tsx`, `features/progress/MuscleRow.tsx`
- Library components used: Row x3, Txt x3, TopGlow x1, MuscleRings x1, MuscleThumb x1
- Hand-built: none

## Photos (routes)

- Files: `app/progress/photos.tsx`
- Library components used: Button x3, Row x2, Pressy x1, FadeIn x1, IconBadge x1, TopGlow x1, Txt x1
- Hand-built:
  - `app/progress/photos.tsx:32` button or pill: `<Pressy accessibilityRole="imagebutton" accessibilityLabel={'Progress photo ${d}${zoomed ?`

## Streaks and badges (routes)

- Files: `app/progress/streaks.tsx`, `features/streak/BadgeArt.tsx`, `features/streak/StreakHero.tsx`
- Library components used: Txt x16, Row x5, CardEdge x2, SectionLabel x2, Card x1, Callout x1, IconBadge x1, FadeIn x1
- States and edge cases: Streak: Active, Broken, New member; Earlier this week: 0, 1, 2, 3
- Hand-built:
  - `app/progress/streaks.tsx:32` card: `<View accessible accessibilityLabel={earned ? '${b.title}, earned ${b.earned}' : '${b.titl`

## Welcome (routes)

- Files: `app/welcome.tsx`
- Library components used: Txt x30, FadeIn x2, ProgressSegments x1, Pressy x1, Button x1
- Hand-built:
  - `app/welcome.tsx:48` icon badge: `<View style={{ width: 22, height: 22, borderRadius: radii.sm, backgroundColor: fixed.blue `
  - `app/welcome.tsx:51` icon badge: `<View style={{ width: 20, height: 20, borderRadius: radii.sm, backgroundColor: '#2A3242' }`
  - `app/welcome.tsx:79` chip: `<View style={{ marginTop: 6, height: 30, borderRadius: 15, backgroundColor: fixed.white, a`
  - `app/welcome.tsx:96` icon badge: `<View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: done ? fixed.blue `
  - `app/welcome.tsx:131` icon badge: `<View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(15,138,95,0`
  - `app/welcome.tsx:160` icon button: `<Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={{`

## Active workout (routes)

- Files: `app/workout.tsx`, `features/workout/SetRow.tsx`, `features/workout/RestPanel.tsx`, `features/workout/FinishScreen.tsx`, `features/workout/NewWorkoutUI.tsx`, `features/workout/AddExerciseSheet.tsx`, `features/workout/WorkoutSheets.tsx`
- Library components used: Txt x81, Row x25, Button x21, FadeIn x13, Pressy x12, IconButton x7, Pill x6, IconBadge x5, Card x3, Stepper x3, ProgressSegments x2, CardEdge x2, Field x2, NoteField x1, EffortSlider x1, Chip x1, Callout x1
- States and edge cases: Wearable (Health Connect): Connected, Not connected; Phase: Warm-up, Main, Cool-down; (action) Rest timer: jump to last 5 s; (action) Log all sets of this exercise; (action) Finish screen
- Hand-built:
  - `app/workout.tsx:333` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Play form video" onPress={() => api`
  - `features/workout/SetRow.tsx:98` chip: `<View accessibilityLabel="Warm-up set: a lighter set before your working sets. It doesn't `
  - `features/workout/FinishScreen.tsx:46` icon badge: `<Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.accen`
  - `features/workout/NewWorkoutUI.tsx:54` icon button: `<Pressy accessibilityRole="button" accessibilityLabel="Watch the clip" disabled={!key} onP`
  - `features/workout/NewWorkoutUI.tsx:111` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Show the clip" onPress={onOpen} sca`

## App shell (layout, floating tab bar host, overlays) (routes)

- Files: `app/_layout.tsx`
- Library components used: OverlayProvider x2, PageGlow x1
- Hand-built: none

## Onboarding: Welcome (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Gym (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Goal (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `app/onboarding.tsx:288` button or pill: `<Pressy accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel`

## Onboarding: Experience (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Schedule (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Age (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Height (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Weight (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Target (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Projection (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/onboarding/Steps.tsx:79` icon badge: `<View pointerEvents="none" style={{ position: 'absolute', left: end[0] - 20, top: end[1] -`

## Onboarding: Health (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Basics (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Privacy and consent (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Onboarding: Building your plan (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/onboarding/Steps.tsx:178` card: `<View style={{ alignSelf: 'stretch', padding: 14, borderRadius: radii.md, backgroundColor:`

## Onboarding: All set (onboarding steps)

- Files: `app/onboarding.tsx`, `features/onboarding/Steps.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## ChangePhoneSheet (bottom sheets)

- Files: `app/profile/details.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## ChangeEmailSheet (bottom sheets)

- Files: `app/profile/details.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## PhotoSheet (bottom sheets)

- Files: `app/profile/details.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `app/profile/details.tsx:106` button or pill: `<Pressy key={label} accessibilityRole="button" onPress={() => closeSheet(run)} scaleTo={0.`

## DobSheet (bottom sheets)

- Files: `app/profile/details.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## WeighDateSheet (bottom sheets)

- Files: `features/body/BodyLog.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## AttachSheet (bottom sheets)

- Files: `features/chat/Composer.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/chat/Composer.tsx:65` button or pill: `<Pressy key={src} accessibilityRole="button" onPress={() => closeSheet(() => onPick(src))}`

## StillTrainingSheet (bottom sheets)

- Files: `features/checkin/CheckInEngine.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## FeedbackSheet (bottom sheets)

- Files: `features/feedback/FeedbackSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## DateSheet (bottom sheets)

- Files: `features/goalv2/FinishBy.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## DeclinePtSheet (bottom sheets)

- Files: `features/gym/PtInviteSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## SessionSheet (bottom sheets)

- Files: `features/gym/SessionSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/gym/SessionSheet.tsx:26` card: `<View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 18 }}>`
  - `features/gym/SessionSheet.tsx:46` card: `<View style={{ backgroundColor: c.warnSoft, borderRadius: radii.xl, padding: 16 }}>`
  - `features/gym/SessionSheet.tsx:60` card: `<View accessible accessibilityLabel={'You rated it ${s.rating} of 5 stars'} style={{ backg`

## FlagSheet (bottom sheets)

- Files: `features/gym/sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## ChatOptionsSheet (bottom sheets)

- Files: `features/gym/sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## UndoEatenSheet (bottom sheets)

- Files: `features/plans/DietPlan.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## FoodActionsSheet (bottom sheets)

- Files: `features/plans/FoodActionsSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## LogPastWorkoutSheet (bottom sheets)

- Files: `features/plans/LogPastWorkoutSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/plans/LogPastWorkoutSheet.tsx:93` icon badge: `<View style={{ width: 24, height: 24, borderRadius: radii.pill, alignItems: 'center', just`
  - `features/plans/LogPastWorkoutSheet.tsx:121` icon button: `<Pressy accessibilityRole="checkbox" accessibilityState={{ checked: s.done }} accessibilit`

## PlansCalendarSheet (bottom sheets)

- Files: `features/plans/PlansCalendarSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/plans/PlansCalendarSheet.tsx:58` icon button: `<Pressy accessibilityRole="button" accessibilityState={{ selected: on, disabled: off }} ac`

## QtySheet (bottom sheets)

- Files: `features/plans/QtySheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## PlanMenuSheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## DietMenuSheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## ResetSheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## DiscardSheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## LibrarySheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## EditItemSheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## ItemMenuSheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## NutritionSheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## DietSwapSheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## HistSheet (bottom sheets)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## TimeSheet (bottom sheets)

- Files: `features/plans/TimeSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## GenderSheet (bottom sheets)

- Files: `features/profile/PrefSheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## SignSheet (bottom sheets)

- Files: `features/profile/SignSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## ManualLogSheet (bottom sheets)

- Files: `features/progress/LogSheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## CalendarSheet (bottom sheets)

- Files: `features/progress/TrendUI.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/progress/TrendUI.tsx:132` icon badge: `<View style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: radii.x`

## ProgressMenuSheet (bottom sheets)

- Files: `features/reports/ProgressMenuSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## ReportSheet (bottom sheets)

- Files: `features/reports/ReportSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## CountrySheet (bottom sheets)

- Files: `features/shell/CountrySheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## LogoutSheet (bottom sheets)

- Files: `features/shell/sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## ProgrammeSwitcherSheet (bottom sheets)

- Files: `features/shell/Switcher.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/shell/Switcher.tsx:50` icon badge: `<View style={{ width: 44, height: 44, borderRadius: radii.lg, borderWidth: 1.5, borderStyl`

## JoinConsentSheet (bottom sheets)

- Files: `features/shell/Switcher.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## LogMealsSheet (bottom sheets)

- Files: `features/today/LogMealsSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## MealLoggedSheet (bottom sheets)

- Files: `features/today/MealLoggedSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## QuickTipSheet (bottom sheets)

- Files: `features/today/PersonalCards.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/today/PersonalCards.tsx:70` icon badge: `<View style={{ width: 24, height: 24, borderRadius: radii.pill, backgroundColor: c.surface`

## HealthConsentSheet (bottom sheets)

- Files: `features/today/PersonalCards.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## QuickLogSheet (bottom sheets)

- Files: `features/today/QuickLogSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## StepsSheet (bottom sheets)

- Files: `features/today/StepsCards.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/today/StepsCards.tsx:242` button or pill: `<Pressy key={m} accessibilityRole="button" accessibilityLabel={m === 'steps' ? 'Enter step`

## UpdatesSheet (bottom sheets)

- Files: `features/today/TopCards.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## WaterSheet (bottom sheets)

- Files: `features/today/Trackers.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## HealthSheet (bottom sheets)

- Files: `features/today/Trackers.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## DaySheet (bottom sheets)

- Files: `features/today/WeekCard.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## AddExerciseSheet (bottom sheets)

- Files: `features/workout/AddExerciseSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## WkMenuSheet (bottom sheets)

- Files: `features/workout/WorkoutSheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## FormTipsSheet (bottom sheets)

- Files: `features/workout/WorkoutSheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## WorkoutSwapSheet (bottom sheets)

- Files: `features/workout/WorkoutSheets.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/workout/WorkoutSheets.tsx:86` button or pill: `<Pressy accessibilityRole="search" accessibilityLabel="Search all exercises" onPress={() =`
  - `features/workout/WorkoutSheets.tsx:96` button or pill: `<Pressy key={a.n} accessibilityRole="button" accessibilityLabel={'${a.n}. ${a.s}'} onPress`

## SetMenuSheet (bottom sheets)

- Files: `features/workout/WorkoutSheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## FinishConfirmSheet (bottom sheets)

- Files: `features/workout/WorkoutSheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Notification permission (onboarding) (bottom sheets)

- Files: `app/onboarding.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Disconnect Health (bottom sheets)

- Files: `app/profile/health.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Join with a code (JoinCode) (bottom sheets)

- Files: `app/login.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Snackbar (toast) (overlays and popups)

- Files: `design-system/primitives/Snackbar.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Phone push preview banner (overlays and popups)

- Files: `features/reminders/PushBanner.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Floating tab bar (overlays and popups)

- Files: `components/FloatingTabBar.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Check-in bar and mini workout (overlays and popups)

- Files: `features/today/CheckInBar.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/today/CheckInBar.tsx:62` card: `<View style={{ height: 40, borderRadius: 20, paddingHorizontal: 16, backgroundColor: fixed`
  - `features/today/CheckInBar.tsx:127` chip: `<View style={{ height: 20, paddingHorizontal: 8, borderRadius: radii.sm, backgroundColor: `
  - `features/today/CheckInBar.tsx:137` bar: `<View pointerEvents="none" style={{ position: 'absolute', left: 18, right: 18, bottom: 0, `

## Workout finish screen (confetti and stats) (overlays and popups)

- Files: `features/workout/FinishScreen.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/workout/FinishScreen.tsx:174` input: `<TextInput value={note} onChangeText={setNote} multiline placeholder="How did it go? Anyth`

## Rest timer panel (overlays and popups)

- Files: `features/workout/NewWorkoutUI.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Web phone frame and demo controls panel (overlays and popups)

- Files: `web/WebFrame.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Today loading skeleton (empty, loading and error states)

- Files: `app/(tabs)/index.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## No plan yet (empty) (empty, loading and error states)

- Files: `features/today/NoPlanCard.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Locked plan behind blur (membership expired) (empty, loading and error states)

- Files: `features/plans/WorkoutPlan.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Offline notices (empty, loading and error states)

- Files: `app/(tabs)/plans.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Scan failed and camera denied (empty, loading and error states)

- Files: `app/plans/log.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Login errors (not found, wrong code) (empty, loading and error states)

- Files: `app/login.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Exercise search: empty and no match (empty, loading and error states)

- Files: `app/exercise-search.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## No goal set yet (empty, loading and error states)

- Files: `design-system/patterns/GoalCard.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Comeback day (empty, loading and error states)

- Files: `features/today/ForYou.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Streak broken and new member (empty, loading and error states)

- Files: `app/progress/streaks.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Export failed (offline) (empty, loading and error states)

- Files: `app/profile/export.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## components/GymHeader.tsx (shared components and features)

- Files: `components/GymHeader.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## components/ui.tsx (shared components and features)

- Files: `components/ui.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `components/ui.tsx:42` card: `<View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} onLayout={(e: La`

## features/gym/PtInviteSheet.tsx (shared components and features)

- Files: `features/gym/PtInviteSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/gym/PtInviteSheet.tsx:59` card: `<View key={l} accessible accessibilityLabel={'${v} ${l}'} style={{ flex: 1, backgroundColo`

## components/FloatingTabBar.tsx (shared components and features)

- Files: `components/FloatingTabBar.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `components/FloatingTabBar.tsx:68` button or pill: `<Pressable key={r.key} accessibilityRole="tab" accessibilityState={{ selected: on }} acces`

## features/shell/Switcher.tsx (shared components and features)

- Files: `features/shell/Switcher.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/shell/parts.tsx (shared components and features)

- Files: `features/shell/parts.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/shell/parts.tsx:47` icon badge: `<Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: fixed.w`
  - `features/shell/parts.tsx:58` icon badge: `<View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.surface2, align`
  - `features/shell/parts.tsx:79` card: `<View style={[{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundCo`

## features/today/PersonalCards.tsx (shared components and features)

- Files: `features/today/PersonalCards.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## components/bits.tsx (shared components and features)

- Files: `components/bits.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `components/bits.tsx:57` card: `<View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row'`

## features/today/TopCards.tsx (shared components and features)

- Files: `features/today/TopCards.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/today/TopCards.tsx:44` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Your goal: ${g.name}. ${progressLi`
  - `features/today/TopCards.tsx:308` bar: `<View key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: radii.xs, backgro`

## features/today/Trackers.tsx (shared components and features)

- Files: `features/today/Trackers.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/today/MealsCard.tsx (shared components and features)

- Files: `features/today/MealsCard.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/streak/StreakChip.tsx (shared components and features)

- Files: `features/streak/StreakChip.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/streak/StreakChip.tsx:37` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'${title}. ${sub}. Open streaks and`

## features/today/StepsCards.tsx (shared components and features)

- Files: `features/today/StepsCards.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/plans/WorkoutPlan.tsx (shared components and features)

- Files: `features/plans/WorkoutPlan.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/plans/WorkoutPlan.tsx:102` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Coach Vikram updated your plan. ${`
  - `features/plans/WorkoutPlan.tsx:125` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Your new plan is ready. View" onPre`
  - `features/plans/WorkoutPlan.tsx:208` icon badge: `<View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: radii.sm, `
  - `features/plans/WorkoutPlan.tsx:209` icon badge: `<View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: radii.sm, `

## features/plans/Sheets.tsx (shared components and features)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/plans/LogPastWorkoutSheet.tsx (shared components and features)

- Files: `features/plans/LogPastWorkoutSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/plans/LoggedDay.tsx (shared components and features)

- Files: `features/plans/LoggedDay.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/plans/LoggedDay.tsx:59` icon badge: `<View style={{ width: 48, height: 48, borderRadius: round(48), backgroundColor: c.good, al`
  - `features/plans/LoggedDay.tsx:109` card: `<View accessible accessibilityLabel={'Your effort: ${effortWord(LOGGED_EFFORT)}, ${Math.ro`

## features/progress/TrendUI.tsx (shared components and features)

- Files: `features/progress/TrendUI.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/progress/TrendUI.tsx:80` card: `<View accessibilityRole="radiogroup" accessibilityLabel="Period" style={{ flex: 1, flexDir`
  - `features/progress/TrendUI.tsx:180` bar: `<View style={{ width: barW, height: 3, borderRadius: radii.xs, backgroundColor: c.surface2`

## features/today/AteSomethingElse.tsx (shared components and features)

- Files: `features/today/AteSomethingElse.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/today/AteSomethingElse.tsx:69` icon button: `<Pressy accessibilityRole="button" accessibilityLabel="Take a photo of your plate" onPress`
  - `features/today/AteSomethingElse.tsx:75` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Choose a photo from your phone" onP`
  - `features/today/AteSomethingElse.tsx:79` chip: `<View style={{ borderRadius: radii.pill, backgroundColor: c.surface2, paddingHorizontal: 1`

## features/today/QuickLogClassic.tsx (shared components and features)

- Files: `features/today/QuickLogClassic.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/today/QuickLogClassic.tsx:149` button or pill: `<Pressy key={t} accessibilityRole="button" accessibilityLabel={'Add ${t}'} onPress={() => `

## features/body/BodyLog.tsx (shared components and features)

- Files: `features/body/BodyLog.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/body/BodyLog.tsx:46` input: `<TextInput autoFocus value={text} onChangeText={(t) => { setText(t); setBad(false); }} key`
  - `features/body/BodyLog.tsx:220` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Date: ${DAYS[day].full}. Change'} `

## features/goalv2/FinishBy.tsx (shared components and features)

- Files: `features/goalv2/FinishBy.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/checkin/CheckInEngine.tsx (shared components and features)

- Files: `features/checkin/CheckInEngine.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/checkin/GymMap.native.tsx (shared components and features)

- Files: `features/checkin/GymMap.native.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/checkin/GymMap.native.tsx:53` icon badge: `<View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#3478F6', borderW`

## features/plans/PlansCalendarSheet.tsx (shared components and features)

- Files: `features/plans/PlansCalendarSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

