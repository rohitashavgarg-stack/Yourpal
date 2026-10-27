# Elements per screen

For each row of `docs/coverage.md`: the design-system components it uses (count of tags) and every hand-built element found (file:line, kind, the start of the JSX). Generated; do not edit.

## Gym (routes)

- Files: `app/(tabs)/gym.tsx`
- Library components used: Txt x20, FadeIn x7, Row x3, StatusDot x1, IconBadge x1, Pressy x1
- Hand-built: none

## Today (routes)

- Files: `app/(tabs)/index.tsx`, `features/today/TopCards.tsx`, `features/today/WorkoutCard.tsx`, `features/today/WeekCard.tsx`, `features/today/timeline.ts`, `features/today/ForYou.tsx`, `features/today/ui.ts`, `features/today/CheckInBar.tsx`, `features/today/ViewOnly.tsx`, `features/today/TodayBudget.tsx`, `features/today/TodayGreeting.tsx`, `features/today/NoPlanCard.tsx`, `features/reminders/PushBanner.tsx`, `features/today/GoalCards.tsx`, `features/today/LogMealsSheet.tsx`, `features/reminders/push.ts`
- Library components used: Txt x54, FadeIn x24, Row x16, Button x11, Pressy x10, IconBadge x7, Card x3, PageEnd x2, FoodCard x2, StatusDot x1, WorkoutCardPattern x1, WeekCardPattern x1, BudgetCard x1, AmountStepper x1, SheetFooter x1
- States and edge cases: Today variant: Regular, With updates, Comeback; Goal card state: Auto, ...GOAL_STATE_OPTIONS.map(([l; Last weigh-in: Today, 3 days ago, 10+ days ago; Health (steps): Connected, Not connected; Wearable (heart rate, sleep, energy): Has a wearable, No wearable; Time of day: Morning, Afternoon, Evening; Workout today: Not started, Done, Rest day; Check-in (location): Away, Near (25 m), At the gym, Checked in, Location off; Food scan result: Works, Fails; (action) Show loading state; (action) Reset meals for this time of day
- Hand-built:
  - `features/today/TopCards.tsx:43` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Your goal: ${g.name}. ${progressLi`
  - `features/today/TopCards.tsx:306` bar: `<View key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: radii.xs, backgro`
  - `features/today/ForYou.tsx:119` button or pill: `<Pressy accessibilityRole="button" onPress={it.act} style={{ height: 40, minWidth: 132, pa`
  - `features/today/ForYou.tsx:140` bar: `<Animated.View style={[{ height: 6, borderRadius: radii.xs, backgroundColor: c.ink }, st]}`
  - `features/today/ForYou.tsx:203` chip: `<View key={t} style={{ height: 28, paddingHorizontal: 12, borderRadius: round(28), borderW`

## Plans (routes)

- Files: `app/(tabs)/plans.tsx`, `features/plans/WorkoutPlan.tsx`, `features/plans/DietPlan.tsx`, `features/plans/QtySheet.tsx`
- Library components used: Txt x67, FadeIn x22, Row x13, Button x10, Card x9, Pressy x6, IconBadge x4, Callout x2, IconButton x2, ListCard x2, Segmented x1, StatusDot x1, ProgressSegments x1, ProgressBar x1, AmountStepper x1, FoodCard x1, Chevron x1
- States and edge cases: Plan type: Workout, Diet; Coach updated the plan: Off, On; Plan change request: None, Requested, Ready; No plan yet (before assessment): Off, On; Mid-workout when the update arrives: Off, On; Connection: Online, Offline; Diet type (plan + swaps): Veg, Eggetarian, Non-veg; Detail level: Detailed, Simple; Camera (scan food): Allowed, Denied; Scan result: Works, Fails; (action) Apply Coach update now; (action) Reset this prototype
- Hand-built:
  - `app/(tabs)/plans.tsx:57` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Back to this week" onPress={() => g`
  - `app/(tabs)/plans.tsx:81` button or pill: `<Pressy key={i} accessibilityRole="button" accessibilityState={{ selected: on }} accessibi`
  - `app/(tabs)/plans.tsx:91` icon badge: `<View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderStyle: 'das`
  - `app/(tabs)/plans.tsx:92` icon badge: `<View style={{ width: 4, height: 4, borderRadius: radii.xs, backgroundColor: dot }} />`
  - `features/plans/WorkoutPlan.tsx:93` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Coach Vikram updated your plan. ${`
  - `features/plans/WorkoutPlan.tsx:115` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Your new plan is ready. View" onPre`
  - `features/plans/WorkoutPlan.tsx:195` icon badge: `<View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: radii.sm, `
  - `features/plans/WorkoutPlan.tsx:196` icon badge: `<View accessibilityElementsHidden style={{ width: 24, height: 24, borderRadius: radii.sm, `
  - `features/plans/DietPlan.tsx:110` icon badge: `<View accessibilityLabel="Changed from plan" style={{ position: 'absolute', top: 0, right:`

## Progress (routes)

- Files: `app/(tabs)/progress.tsx`
- Library components used: Txt x29, Row x9, FadeIn x4, Callout x3, IconBadge x1, ProgressSegments x1
- Hand-built:
  - `app/(tabs)/progress.tsx:179` card: `<View style={{ alignSelf: 'flex-start', height: 40, paddingHorizontal: 18, borderRadius: 2`

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
  - `app/exercise-search.tsx:73` button or pill: `<Pressy key={x.n} accessibilityRole="button" accessibilityLabel={'${x.n}, ${x.g}. Swap'} o`

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
- Library components used: Txt x32, Card x11, Row x10, Button x7, IconBadge x4, Pressy x3, SectionLabel x1, ProgressBar x1
- Hand-built:
  - `app/goal-detail.tsx:94` chip: `<View style={{ height: 26, paddingHorizontal: 10, borderRadius: 13, backgroundColor: c.ink`
  - `app/goal-detail.tsx:109` bar: `<View style={{ width: 16, height: 3, borderRadius: radii.xs, backgroundColor: c.accent }} `
  - `app/goal-detail.tsx:255` chip: `<View style={{ alignSelf: 'flex-start', height: 30, paddingHorizontal: 12, borderRadius: 1`

## Change goal (routes)

- Files: `app/goal.tsx`
- Library components used: Txt x12, Card x5, Row x4, Pill x4, Button x2, FadeIn x1
- States and edge cases: Main goal: Weight loss, Strength, Flexibility, Not sure yet; Target size: Normal, Big (18 kg); (action) Save goal
- Hand-built: none

## Assessments (routes)

- Files: `app/gym/assessments.tsx`
- Library components used: Txt x15, Card x4, FadeIn x3, Row x2, Button x2, IconBadge x1, Pill x1
- Hand-built:
  - `app/gym/assessments.tsx:77` icon badge: `<View style={{ width: 8, height: 8, borderRadius: radii.xs, backgroundColor: dot[grp.tone]`

## Attendance (routes)

- Files: `app/gym/attendance.tsx`
- Library components used: Txt x10, Row x3, FadeIn x2, IconBadge x2, Button x1, StatusDot x1, Pill x1, Card x1
- Hand-built:
  - `app/gym/attendance.tsx:81` card: `<View style={[{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 16 }, cardSha`

## Membership pauses (routes)

- Files: `app/gym/break.tsx`
- Library components used: Txt x11, Card x3, Row x3
- Hand-built:
  - `app/gym/break.tsx:52` card: `<View style={{ padding: 18, borderRadius: radii.card, backgroundColor: c.surface }}>`

## Coach chat (routes)

- Files: `app/gym/chat.tsx`, `features/chat/AudioBubble.tsx`, `features/chat/Composer.tsx`, `features/chat/emoji.ts`
- Library components used: Txt x17, Pressy x10, FadeIn x5, Button x3, IconButton x3, Callout x2, Row x2
- Hand-built:
  - `app/gym/chat.tsx:38` icon badge: `<Animated.View style={[{ width: 6, height: 6, borderRadius: radii.xs, backgroundColor: c.m`
  - `app/gym/chat.tsx:158` card: `<View style={{ flexShrink: 1, paddingVertical: m.img ? 6 : 10, paddingHorizontal: m.img ? `
  - `features/chat/Composer.tsx:31` icon badge: `<Animated.View style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4D4F`
  - `features/chat/Composer.tsx:195` input: `<TextInput ref={input} value={draft} onChangeText={setDraft} onFocus={() => setEmoji(false`

## Confirm session (routes)

- Files: `app/gym/confirm.tsx`
- Library components used: Txt x6, FadeIn x2, Pressy x1, Card x1, Field x1, Button x1
- Hand-built: none

## Membership (routes)

- Files: `app/gym/membership.tsx`
- Library components used: Txt x7, FadeIn x1, Card x1, Callout x1, Button x1
- Hand-built: none

## PT package (routes)

- Files: `app/gym/pt.tsx`
- Library components used: Txt x3, Card x1, Button x1
- Hand-built: none

## Entry redirect (routes)

- Files: `app/index.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Log height (routes)

- Files: `app/log-height.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Log weight (routes)

- Files: `app/log-weight.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## Log in (routes)

- Files: `app/login.tsx`, `components/OtpInput.tsx`
- Library components used: Txt x27, FadeIn x12, Button x5, Row x4, Field x2, Callout x2, Pressy x2
- States and edge cases: Phone number: In CRM, Not found; Code entered: Correct, Wrong; Android SMS auto-read: Off, On; Connection: Online, Offline; Programmes on this number: Three, Only one; (action) Fill a valid number; (action) Jump to code step
- Hand-built:
  - `components/OtpInput.tsx:25` input: `<TextInput ref={ref} value={value} onChangeText={(t) => onChange(t.replace(/\D/g, '').slic`

## Notifications (routes)

- Files: `app/notifications.tsx`
- Library components used: Txt x5, Pressy x2, FadeIn x2, Pill x1, IconBadge x1
- States and edge cases: Notifications: Some, None; Programmes joined: Three, Only one; (action) Mark everything unread
- Hand-built:
  - `app/notifications.tsx:84` icon badge: `<View style={{ width: 8, height: 8, borderRadius: radii.xs, backgroundColor: c.accent }} /`

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
- Library components used: Txt x6, Pressy x3, Button x3
- States and edge cases: (action) Remove the first row; (action) Close (asks to discard when changed)
- Hand-built:
  - `app/plans/edit.tsx:130` card: `<View style={{ height: ROW_H, borderRadius: 20, backgroundColor: c.surface, flexDirection:`

## Exercise (routes)

- Files: `app/plans/exercise.tsx`
- Library components used: Txt x9, Card x2, IconButton x1, Row x1, Button x1
- States and edge cases: Form video: Paused, Playing; Connection: Online, Offline
- Hand-built:
  - `app/plans/exercise.tsx:40` bar: `<View style={{ position: 'absolute', left: 14, right: 14, bottom: 12, height: 4, borderRad`
  - `app/plans/exercise.tsx:97` card: `<View style={{ height: 96, borderRadius: radii.lg, backgroundColor: c.surface, flexDirecti`

## Workout history (routes)

- Files: `app/plans/history.tsx`
- Library components used: Txt x4, Card x1, Pressy x1, IconBadge x1
- States and edge cases: (action) Open ${h.t}
- Hand-built: none

## What did you eat? (routes)

- Files: `app/plans/log.tsx`
- Library components used: Txt x25, FadeIn x5, Row x4, Card x4, Button x4, ScanBracket x4, Pill x3, Pressy x2, IconBadge x2, Field x2, Segmented x1, Option x1, Callout x1
- States and edge cases: How to add it: Search, Write, Scan; Camera (scan food): Allowed, Denied; Scan result: Works, Fails; Diet type (catalogue): Veg, Eggetarian, Non-veg; (action) Search for something missing
- Hand-built:
  - `app/plans/log.tsx:41` card: `<View style={{ flex: 1, height: 52, borderRadius: radii.xl, borderWidth: 1, borderColor: c`
  - `app/plans/log.tsx:42` input: `<TextInput accessibilityLabel={label} value={value} onChangeText={(t) => onChange(t.replac`
  - `app/plans/log.tsx:152` button or pill: `<Pressy key={f.n} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={mul`

## What changed (routes)

- Files: `app/plans/updated.tsx`
- Library components used: Txt x3, Card x1, FadeIn x1, Button x1
- States and edge cases: Mid-workout when the update arrives: Off, On
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
- Library components used: Txt x12, Row x5, Pill x5, Button x4, Pressy x4, Field x3, FadeIn x2, NoteField x1
- States and edge cases: Name: Filled, Empty; Injuries: No, Yes; (action) Try saving
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
- Library components used: Txt x17, Row x5, Button x5, Pressy x3, FadeIn x1
- States and edge cases: Member type (privacy wording): Regular, PT member; Programmes joined: Three, Only one; Account deletion: Not scheduled, Scheduled; (action) Log out (confirm sheet); (action) Open an invite link (WhatsApp); (action) Reset profile settings
- Hand-built:
  - `app/profile/index.tsx:78` chip: `<View style={{ alignSelf: 'flex-start', marginTop: 2, height: 24, paddingHorizontal: 10, b`
  - `app/profile/index.tsx:98` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Goal: ${g2.name}. Change goal'} on`
  - `app/profile/index.tsx:139` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'${title} goal ${value}. Edit'} onP`
  - `app/profile/index.tsx:155` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Tracker designs. Choose how your tr`

## Join a programme (routes)

- Files: `app/profile/join.tsx`
- Library components used: Txt x2, FadeIn x2, Field x1, Button x1
- States and edge cases: Invite code: YOGA-2024 (new), GLD-4821 (joined), OLD-0001 (expired), Wrong; Opened from: Typed, WhatsApp link; (action) Try joining
- Hand-built: none

## Notification settings (routes)

- Files: `app/profile/notifications.tsx`
- Library components used: Txt x4, FadeIn x1, Row x1, Button x1
- States and edge cases: Phone permission: Allowed, Blocked, Not asked; (action) Turn all reminders on
- Hand-built: none

## Privacy (routes)

- Files: `app/profile/privacy.tsx`
- Library components used: Txt x2, Row x1
- States and edge cases: Member type (privacy wording): Regular, PT member; Programmes joined: Three, Only one
- Hand-built: none

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

## Assessment (routes)

- Files: `app/progress/assess.tsx`
- Library components used: Txt x5, FadeIn x2, Card x2, Button x2
- Hand-built: none

## Goal (progress) (routes)

- Files: `app/progress/goal.tsx`
- Library components used: Txt x7, Pill x3, Button x2, Card x1, Row x1, FadeIn x1
- Hand-built: none

## Lift detail (routes)

- Files: `app/progress/lift.tsx`
- Library components used: Txt x3, Pill x2, FadeIn x2, Card x1, Row x1, Pressy x1
- Hand-built: none

## Metric detail (routes)

- Files: `app/progress/metric.tsx`, `features/progress/LogSheets.tsx`
- Library components used: Txt x9, Button x6, Card x1, IconBadge x1, FadeIn x1, Callout x1, Field x1
- Hand-built: none

## Photos (routes)

- Files: `app/progress/photos.tsx`
- Library components used: Button x3, Row x2, Pressy x1, FadeIn x1, IconBadge x1, Txt x1
- Hand-built:
  - `app/progress/photos.tsx:30` button or pill: `<Pressy accessibilityRole="imagebutton" accessibilityLabel={'Progress photo ${d}${zoomed ?`

## Streaks and badges (routes)

- Files: `app/progress/streaks.tsx`, `features/streak/BadgeArt.tsx`, `features/streak/StreakHero.tsx`
- Library components used: Txt x16, Row x5, SectionLabel x2, Card x1, Callout x1, IconBadge x1, FadeIn x1
- States and edge cases: Streak: Active, Broken, New member; Earlier this week: 0, 1, 2, 3
- Hand-built:
  - `app/progress/streaks.tsx:31` card: `<View accessible accessibilityLabel={earned ? '${b.title}, earned ${b.earned}' : '${b.titl`

## Welcome (routes)

- Files: `app/welcome.tsx`
- Library components used: Txt x30, FadeIn x2, ProgressSegments x1, Pressy x1, Button x1
- Hand-built:
  - `app/welcome.tsx:46` icon badge: `<View style={{ width: 22, height: 22, borderRadius: radii.sm, backgroundColor: fixed.blue `
  - `app/welcome.tsx:49` icon badge: `<View style={{ width: 20, height: 20, borderRadius: radii.sm, backgroundColor: '#2A3242' }`
  - `app/welcome.tsx:77` chip: `<View style={{ marginTop: 6, height: 30, borderRadius: 15, backgroundColor: fixed.white, a`
  - `app/welcome.tsx:94` icon badge: `<View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: done ? fixed.blue `
  - `app/welcome.tsx:129` icon badge: `<View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(15,138,95,0`
  - `app/welcome.tsx:158` icon button: `<Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={{`

## Active workout (routes)

- Files: `app/workout.tsx`, `features/workout/SetRow.tsx`, `features/workout/RestPanel.tsx`, `features/workout/FinishScreen.tsx`, `features/workout/NewWorkoutUI.tsx`, `features/workout/WorkoutSheets.tsx`
- Library components used: Txt x71, Row x22, Button x17, Pressy x13, FadeIn x10, IconButton x7, IconBadge x5, Pill x3, Card x3, Stepper x3, ProgressSegments x2, NoteField x1, Field x1, Chip x1, Callout x1
- States and edge cases: Wearable (Health Connect): Connected, Not connected; Phase: Warm-up, Main, Cool-down; (action) Rest timer: jump to last 5 s; (action) Log all sets of this exercise; (action) Finish screen
- Hand-built:
  - `app/workout.tsx:314` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Play form video" onPress={() => api`
  - `features/workout/SetRow.tsx:96` chip: `<View accessibilityLabel="Warm-up set: a lighter set before your working sets. It doesn't `
  - `features/workout/FinishScreen.tsx:40` icon badge: `<Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.accen`
  - `features/workout/NewWorkoutUI.tsx:54` icon button: `<Pressy accessibilityRole="button" accessibilityLabel="Watch the clip" disabled={!key} onP`
  - `features/workout/NewWorkoutUI.tsx:111` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel="Show the clip" onPress={onOpen} sca`

## App shell (layout, floating tab bar host, overlays) (routes)

- Files: `app/_layout.tsx`
- Library components used: OverlayProvider x2
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
  - `app/onboarding.tsx:283` button or pill: `<Pressy accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel`

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

## PhotoSheet (bottom sheets)

- Files: `app/profile/details.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `app/profile/details.tsx:65` button or pill: `<Pressy key={label} accessibilityRole="button" onPress={() => closeSheet(run)} scaleTo={0.`

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
  - `features/chat/Composer.tsx:62` button or pill: `<Pressy key={src} accessibilityRole="button" onPress={() => closeSheet(() => onPick(src))}`

## StillTrainingSheet (bottom sheets)

- Files: `features/checkin/CheckInEngine.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## DateSheet (bottom sheets)

- Files: `features/goalv2/FinishBy.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

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

## ManualLogSheet (bottom sheets)

- Files: `features/progress/LogSheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## CalendarSheet (bottom sheets)

- Files: `features/progress/TrendUI.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/progress/TrendUI.tsx:132` icon badge: `<View style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: radii.x`

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

## QuickLogSheet (bottom sheets)

- Files: `features/today/QuickLogSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/today/QuickLogSheet.tsx:143` button or pill: `<Pressy key={t} accessibilityRole="button" accessibilityLabel={'Add ${t}'} onPress={() => `

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
  - `features/today/CheckInBar.tsx:126` chip: `<View style={{ height: 20, paddingHorizontal: 8, borderRadius: radii.sm, backgroundColor: `
  - `features/today/CheckInBar.tsx:136` bar: `<View pointerEvents="none" style={{ position: 'absolute', left: 18, right: 18, bottom: 0, `

## Workout finish screen (confetti and stats) (overlays and popups)

- Files: `features/workout/FinishScreen.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/workout/FinishScreen.tsx:126` button or pill: `<Pressy key={n} accessibilityRole="radio" accessibilityState={{ selected: feel === n }} on`

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

## components/bits.tsx (shared components and features)

- Files: `components/bits.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `components/bits.tsx:54` card: `<View accessibilityRole="tablist" accessibilityLabel={label} style={{ flexDirection: 'row'`

## components/ui.tsx (shared components and features)

- Files: `components/ui.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `components/ui.tsx:39` card: `<View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} onLayout={(e: La`

## components/FloatingTabBar.tsx (shared components and features)

- Files: `components/FloatingTabBar.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `components/FloatingTabBar.tsx:64` button or pill: `<Pressable key={r.key} accessibilityRole="tab" accessibilityState={{ selected: on }} acces`

## features/shell/Switcher.tsx (shared components and features)

- Files: `features/shell/Switcher.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/shell/parts.tsx (shared components and features)

- Files: `features/shell/parts.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/shell/parts.tsx:45` icon badge: `<Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: fixed.w`
  - `features/shell/parts.tsx:76` card: `<View style={[{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundCo`

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

## features/plans/Sheets.tsx (shared components and features)

- Files: `features/plans/Sheets.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/today/QuickLogSheet.tsx (shared components and features)

- Files: `features/today/QuickLogSheet.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/progress/TrendUI.tsx (shared components and features)

- Files: `features/progress/TrendUI.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/progress/TrendUI.tsx:80` card: `<View accessibilityRole="radiogroup" accessibilityLabel="Period" style={{ flex: 1, flexDir`
  - `features/progress/TrendUI.tsx:180` bar: `<View style={{ width: barW, height: 3, borderRadius: radii.xs, backgroundColor: c.surface2`

## features/goalv2/FinishBy.tsx (shared components and features)

- Files: `features/goalv2/FinishBy.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/body/BodyLog.tsx (shared components and features)

- Files: `features/body/BodyLog.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/body/BodyLog.tsx:46` input: `<TextInput autoFocus value={text} onChangeText={(t) => { setText(t); setBad(false); }} key`
  - `features/body/BodyLog.tsx:220` button or pill: `<Pressy accessibilityRole="button" accessibilityLabel={'Date: ${DAYS[day].full}. Change'} `

## features/checkin/CheckInEngine.tsx (shared components and features)

- Files: `features/checkin/CheckInEngine.tsx`
- Library components used: (see the screen's files)
- Hand-built: none

## features/checkin/GymMap.native.tsx (shared components and features)

- Files: `features/checkin/GymMap.native.tsx`
- Library components used: (see the screen's files)
- Hand-built:
  - `features/checkin/GymMap.native.tsx:53` icon badge: `<View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#3478F6', borderW`

