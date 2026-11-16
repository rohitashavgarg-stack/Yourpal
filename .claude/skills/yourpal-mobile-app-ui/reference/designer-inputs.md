# The designer's inputs, as rules (all of them, old and new)

Rohitashav is a UX designer, not a coder. Each item is a correction he gave; follow it. The date or session says where it came from. Newest groups first. Rules that were later replaced are in `replaced-rules.md`, not here.

## Page structure and chrome (6 to 12 Nov 2026)
- **No hard-coded headers or footers.** A header floats with the progressive blur, never a solid colour; a bottom button floats, no footer bar and no line above it. Applies to every screen (Plans pages, workout, food library, onboarding, Change goal, Progress actions, finish).
- **The first content must not hide under the blur.** Pad it clear.
- **A page opened from a card has no back button**; a drag handle at the top closes it.
- **Detail pages with few actions use a cross** (Payments): up from the bottom, down to close.
- **Cross pages go up and down; back-button pages slide in from the right and out to the right;** closing a sheet reads as sliding down, never as fading. Slides must be smooth, one phone curve, the page behind visible.
- **Animation must play on web** (the prototype) and respect Reduce Motion on phones.
- **The nav bar shrinks while scrolling** (no names, narrower, even small padding, still a pill), never hides.
- **Page titles and the Today greeting share one style** (28 px, line height 37, letter spacing -1.1); a greeting on three lines is too big.
- **The first screen of a flow has no back arrow.** A back arrow only where something is behind it.

## Cards, strokes, glass, buttons
- **Strokes where required, not everywhere.** Standalone cards: lighter fill plus the thin gradient stroke. A nested item never gets a second stroke. A stroke has the same curve as its card (a mismatched radius looked like a bug).
- **Food cards stay dotted** (dashed not eaten, solid eaten, faded and struck skipped); the fix for a distorted pressed state is to put the fill on the card itself.
- **Glass only for the one main action floating over scrolling content** and for the round back, close and bell buttons. Glass keeps the button's original colour; no outline; a blue glass tint is strong (92%). Real iOS glass on iOS 26, a blurred tinted fallback elsewhere. Secondary actions ("Log this workout", "Start it anyway") are plain secondary buttons, never primary, never glass.
- **Every icon button has a visible container** (use `IconButton`, never a hand-built round button). Icon buttons swell when pressed; cards shrink.
- **Green only on checks and numbers**, never a card fill. Amber for warnings; **never red for a pause, frozen, comeback, or eating more or less**. "Frozen" is shown as Paused.
- **A glow means something:** amber while pending, green once signed, blue accent by default. A top glow (radial), not a gradient wash. Backgrounds are sized to the phone, never the browser window.
- **"Put it in a card"** means the standard card. **"With gradient and a bigger icon at the side"** is a tinted gradient fill with a large soft icon behind the words. When he says the previous version was better, restore it.
- **Small status dots have no dark outline ring.** The flame icon is only for the streak. Heading icons have no coloured container.
- **A small way back** ("Back to today") is a quiet text button, not a filled pill.
- **Destructive:** `Button kind="warn"` is a soft red tint, only for an action the member must confirm (Log out).
- **Things tried and dropped:** a gooey fan-out menu on the workout screen, an AI orb beside the tab bar, a ring on the finish page, a blue circle and glass card on the finish page, twinkling dots on it. Do not bring them back unless asked.

## Hierarchy, data, copy
- **No dot separators** ("text · text") in any text. **Never bulk-replace them**: a codemod that swapped all of them was reverted; change only the screens he points at.
- **Every fact gets its own place** (its own line, size or element); two lines at most under a headline; a number and what it measures sit side by side with the change underneath; a small coloured label above a larger title for repeated cards (notifications: programme name above the title).
- **Streak hero card is the model** of a card hierarchy: key number big in the accent, its name, one plain muted sentence, a progress picture with one caption, a hairline between groups, the week as segments with the done count highlighted.
- **Numbers big and light.** When he says they are not big, add at least 8 px, on that page only.
- **One fact, one place.** Assessments live only on Gym. Do not show the same information twice (no week row on the finish page; the protein card and Day done were removed when they overlapped).
- **Never show a time the product does not have.** Say "Coach Vikram will confirm the day and time".
- **A hint line that explains gestures is not wanted:** delete it, do not reword it.
- **No guilt, no fake cheer, no emoji.** Number first, then the next step. Name Coach Vikram. Never shame ("A bit behind", "one good week catches up").
- **Do not show details the product does not have yet** (an assessment time, a payment screen for view-only membership).

## Progress data
- Extremes named and dated (Heaviest and Lightest, Most steps and Fewest steps, Longest sleep and Shortest sleep, Most workouts and Fewest workouts, Most eaten and Least eaten).
- **Diet is calories first:** "1,766 kcal avg. per day", target 1,800, bars with a dashed target line, a day within 10% of target green, others grey. Stats: most eaten, least eaten, days on target, daily target.
- A card on Progress has one headline line (number big, unit beside it), only the change underneath ("↓67 kcal vs last week").

## Assessments (the trainer's work, view only)
- No self-assessment: no Start button, no member entry, no monthly nudge. If code like that comes back, remove it.
- Names are Assessment 1, 2, 3 (never "Starting" or "Reassessment"). Tests: weight, waist, body fat, leg press and bench press (5 reps), toe touch, resting heart rate.
- The upcoming one is quiet (neutral date tile, "In 6 days" as muted text, a line saying Coach Vikram does it at the gym). A due one does not turn yellow or become a big button. Next assessment card: title, date chip on the right, one quiet line, a full-width "Remind me" (primary with a bell) or "Reminder on" (secondary with a check).
- A finished assessment opens a view-only page: the summary numbers on the page (no container), grey icon tiles, groups of measurements with a change tag per row (green when better, grey otherwise, never red), the trainer's notes as chips with stroke and coloured icons.
- Built for many assessments (agreed, not built): compare latest with previous, a sheet to pick any two, "vs previous" and "vs Assessment 1", a trend line per row, "See all".

## Gym and memberships
- **Chat with the coach is the first card on Gym** (dark card, photo, last message, white button). The card is a plain View: no pressable inside a pressable on web.
- Memberships: Active, Suspended, Past; an upcoming plan under "Starts next" on Active (no fourth tab); a paused plan with a pause chip and grey bar; a paused plan counts its current pause. Membership is view only: no Pay or Renew. Expired makes logging view only. The Payments page is in Profile.

## Plans, food, workout
- **Only the trainer creates or edits a workout plan.** The member asks Coach Vikram (`/plans/ask`) and edits what they logged (a full page like Edit plan). The old Plans three dot menu items (Edit plan, Create a workout, Reset) are gone.
- Plans tabs Workout and Diet are icon only beside the large heading and the three dot menu. Day header: name, "by Coach Vikram" small with the photo, a facts row with icons, a dashed separator above Warm-up. Compact grey week strip with the month as a button (calendar sheet). Section headings: `SectionLabel variant="section"` with an icon; titled lists with numbered rows and the check on the right.
- **Start workout** inline, then a floating blue glass Start when it scrolls out; a past day: "Log this workout" secondary and floating. Logging a past workout: each set tickable with weight and reps (or seconds); reps-only rows say "Set 1, Planned 8 reps". A logged day looks done: green "Logged" tag, grey stat tiles without zeros, no progress bar.
- **Food cards:** the check circle on the right on the not-eaten card only; the eaten card has a darker strip with macros and a three dot button; the amount can change only before logging (never take the stepper off an editable card); swipe left reveals Swap (icon) and Skip (word), 44 px rounded squares (a food the member added shows Delete); hold opens the food; a plain tap does nothing on the diet page; foods not logged by day end count as skipped; previous days are view only. Keep the Veg, Egg, Non-veg marks and legend row. A list that is ticked then saved uses the `pick` look (solid, tick on the right, no dashes).
- Workout card answers (Move to tomorrow, Skip) show as the same full card, with a neutral outlined chip ("Moved" or "Skipped"), one plain line, Undo as a white 44 px button, and "Start it anyway" as a secondary button.
- The three dot menu on the exercise page: swap, ask the coach, form tips and video, skip. No "options for the current set".
- Food logging: Swap opens the same sheet as "Ate something else"; the food library puts Most eaten first when logging and Suggested (related) first when swapping; after logging a meal the Meals card shows the next meal; every arrow in the all-logged list opens a sheet of that meal's foods.
- **Workout finish:** a plain page on the signed-waiver background (blue glow top, thick lines, no dots), numbers on the page, logged sets and "How was it?" in cards with the draggable slider, Share at the bottom of its card, a bigger coach note, a floating Done with a soft white glow. Logged workouts in Plans show effort as a word and a number only.

## Login, onboarding, waiver, notifications
- Login: tappable country code (India first); the first screen after the code has no back arrow; onboarding buttons float; swipe to start is frosted glass.
- Waiver: pending pages white and grey with an amber glow and an orange Pending status, a "Skip for now" link; the signed details page has a green glow and a Signed chip (Profile chip says Signed); the completion screen has a blue top glow, a black bottom and no back button.
- Notifications: grouped Today, Yesterday, Earlier; one card per notification; the programme name small and coloured above a larger title; an unread dot and a bold title (no tint); no footer note.
- Reminders and quiet hours: the time in a pill; short lines.

## Today
- Order: header, membership strip, greeting, updates stack, Today card, then workout, meals, trackers by time of day, This week, quick tip card, page end. Features added 11 to 12 Nov each have a switch in the demo panel: day count in the greeting, Connect Health bottom sheet (asks to connect), profile step in the updates stack (progress ring, "Add height"), quick tip (violet gradient card, big soft bulb). Removed on request: Day done card, protein note.
- Later, not now: supplements (creatine, protein powder), the sponsored card, challenges and leaderboards, Repeat last meal, the fallback and offline strip.

## How he works
- Screenshot plus one line; mid-task corrections folded in at once; asks "why" first (answer, then fix); asks for wireframes in chat before building a new feature; short decisions ("remove this", "put it in a card", "this goes at the bottom"); rejects changes that touched something he did not name.
- Wants everything live on `main`; wants a clear "is it done and is it live". Reviews on the web prototype in a wide window, usually dark. Never assume he saw a build that has not finished on Vercel.
- "Do things on your own" means fewer questions on small steps; still ask before downloads, deleting and going live. Day reports for his sheet use UI and UX language (screens designed, flows, design system), without commit counts.
- Reports: say what changed per surface, what you saw, what you did not check. Other sessions may edit the same folder: `git status` first, never commit files you did not touch.
