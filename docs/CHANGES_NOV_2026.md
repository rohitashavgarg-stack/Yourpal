# What we changed, request by request (about 6 to 12 Nov 2026)

A record of every change the designer (Rohitashav) asked for in this long chat and what was done. It is grouped by area, with the request first and the result after it. Everything is on `main` (last commit before this file: `c52f08e`, live at https://yourpal-psi.vercel.app). It is written from the chat itself, so early items are summarised; use `git log` for exact commits.

How to read the marks: **Done** means built and published. **Checked** means I looked at it in a real browser. **Not checked on a phone** applies to everything, because Expo Go was never run on a phone.

## 1. Gym: memberships, assessments, attendance

| Request | What was done |
|---|---|
| Fix the assessment header like Assessment 1: pills under the header, a graph in the card, gradient card, icons in the measurements | Assessment detail page rewritten: centred "Assessment N", pills (date and Coach Vikram), summary card, capsule graph, grouped measurement rows with icon tiles |
| Card gradient should not be blue, it should fade from grey | Grey gradient, then (later) removed the container altogether so the key numbers sit on the page |
| Numbers not big in the assessment summary (at least 8 px bigger, only there) | Key numbers 42 px, measurement values 22 px, only on that page |
| Icon at the top and a green glow; chips with a stroke and coloured icons; icon tiles visible but grey | Done: tile icon, green top glow, notes chips with stroke and coloured icons, grey icon tiles with a stroke |
| Stroke missing on the card before the summary and on list cards | Assessments list cards and Memberships list cards have the lighter fill and gradient stroke |
| Add upcoming memberships | Added an "Upcoming" status. First as a fourth tab, then (on request) as "Starts next" on the Active tab, no fourth tab |
| Add a frozen membership card, then "frozen is paused, show paused" | Paused status (pause icon, grey bar, cool tint) with its own detail page. Admin "Frozen" shows as Paused |
| "Why does a paused plan still show 2 pauses left?" | A paused membership counts its current pause as one used |
| Top glow on Attendance, Assessments, Memberships; Attendance glow was yellow, make it blue | TopGlow on the three pages, all blue |
| Membership detail "not loading properly" | Checked in Chrome: all four membership details load without errors. The cause of the moment of black while it slides was not found |
| Payments in Profile: why does it open from the bottom, then "should have a cross", "closing should slide down", "not working on Expo" | Payments is now a cross page (comes up from the bottom, slides down). Android back plays the same slide. Not confirmed on a phone |

## 2. Cards, strokes, glass, design consistency

| Request | What was done |
|---|---|
| Stroke missing from Profile cards and inside pages | Profile cards, list cards, waiver cards, sound and details cards: lighter fill (`c.cardLift`) and the thin gradient stroke (`CardEdge`) |
| "Do not put it everywhere, only where required, as per consistency" | Strokes added to standalone cards only (Gym, Attendance, Membership detail, PT, Sessions, Streaks, Progress cards, Today cards, Finish, Exercise, Workout plan) |
| Design consistency missing in cards and icon buttons | A plain `IconButton` now gets the card look by default; buttons swell when pressed |
| Meal cards in Plans: double outline and a distorted pressed state | Fill moved onto the food card itself so pressing shows no second edge |
| "Why did you remove the dotted food cards? I only meant the pressed state" | Dotted food cards restored |
| Meal card stroke radius differs from the card's | Root cause fixed in `Card`: the stroke uses the card's own `borderRadius` |
| "Zooming and gooey press on every icon button" (a video that could not be opened) | Icon buttons swell to 1.14 and settle with a soft overshoot. This is my reading of the video |
| Warm-up and cool-down picture roundness should follow the parent card | Thumbnail radius 18 inside the 28 px card |

## 3. Headers, footers, floating buttons

| Request | What was done |
|---|---|
| Solid black header on the Edit pages: use the progressive blur like Today, nowhere hard-coded | `PageHeader` floats with `ProgressiveBlur`; content is padded under it. Same for the workout, onboarding and food library headers |
| Bottom buttons should be floating sticky, not in footer bars | Floating: Save changes, Edit logged workout, the Progress page actions (Log weight etc.), food library "Add kcal", workout buttons, onboarding buttons, Change goal Save |
| Content hidden under the blur at first look | The first content starts clear of the blur (`PAGE_HEADER_CLEAR`, bigger workout paddings) |
| Remove the top Save button on Edit pages | Header Save removed on Edit plan and Edit logged workout |

## 4. Motion and animation

| Request | What was done |
|---|---|
| Closing a sheet with the cross looks like fading, not sliding down | Sheet leaves on the phone curve over 0.32 s with the dim fading over the same time |
| Cross pages come from the bottom and go down; back pages slide from right to left and out left to right | Wired and documented. Found why the slide-out was dead on web (`router.back` was replaced by the router after load) and fixed it with `installSlideBack()`; slide-in now starts on mount; both use the phone curve |
| "Sliding is not smooth, check our skills" | One curve for all slides; Reduce Motion bypassed on web so the prototype always animates (phones follow the setting) |
| Check animation patterns HIG says and fix the Reduce Motion gaps | `docs/ANIMATION_PATTERNS.md` written; Reduce Motion applied to sheets, toast, nav pill, switches, slides, loops and confetti through `useReduce()` |
| Start workout: delay and layers of black pages before the page | Start opens the workout page at once with its own session; cross pages have a see-through screen behind them |
| Payments and Edit logged workout not sliding down | Slide-out measures the screen at close; Android back wired. Cause for Edit logged workout not definitely found |
| Card pages (Streaks) should have a draggable top anchor and no back button | Drag handle on every card page; back button removed |
| Profile goal tiles (daily steps and water) open and close properly | Tiles prime the grow animation |

## 5. Navigation bar

| Request | What was done |
|---|---|
| Selected tab has a black outline: remove | Selected circle tab has no border |
| Shrink the nav while scrolling instead of hiding it; reduce width, padding, margins; keep the pill | The bar narrows to its icons, drops the names, has an even 4 px gap round the highlight, and stays a pill. Floating buttons follow it down by 20 px |

## 6. Workout

| Request | What was done |
|---|---|
| Completion screen should be more interactive, use the draggable slider ("How was it?") | Finish page: count-up numbers, staggered fades, draggable effort slider |
| Remove the blue circle and glass card; floating Done | Plain page on the signed-waiver background (blue glow top, lines, no dots), floating Done with a white glow |
| Logged sets and "How was it?" in cards; no week row; Share at the bottom of its card; bigger coach note; heading nicer | Done. Heading is two lines ("Nice work," then the name softer) |
| Background should scroll with the page or fade | Backdrop scrolls with the content; cards are translucent glass |
| Logged workout in Plans: keep effort numeric, heading "How hard was it?" | Word and number only, no slider |
| Ring on the finish page | Added then removed on request |
| Plans menu: only the trainer creates or edits a workout | Removed Edit plan, Create a workout, Reset; "Edit logged workout" is a full page like Edit plan; rest day offers "Ask Coach Vikram for a workout" |

## 7. Food logging and meals

| Request | What was done |
|---|---|
| Add a better look for the Ate something else page | Quick food picks, one confirmation line, protein in words, chat bar mic no longer clipped |
| Food library: suggested vs most eaten; categories | Shelves: Most eaten first when logging, Suggested first when swapping, plus Breakfast, Meals, Snacks, Drinks, Protein; chip row not clipped |
| Swap should open the same sheet as Ate something else | Swap opens that sheet; its library puts related foods first |
| Meal arrows in the "all logged" list open a sheet of logged foods | `MealLoggedSheet` with foods, calories, protein, total and Edit log |
| After logging the current meal show the next meal | Meals card advances to the next meal that needs logging |

## 8. Waiver

| Request | What was done |
|---|---|
| Waiver pages white and grey, amber glow and orange Pending kept | Done on the sign page and details |
| Signed details page: green glow (the tag is green) | Done |
| Signed screen: blue glow top, black bottom, no back button | Backdrop sized to the phone (not the browser window); back button removed |
| Pending waiver needs a skip option | "Skip for now" link |
| Waiver card stroke should be a gradient and look right | Gradient stroke in amber |
| Profile chip "Completed" to "Signed" | Text changed |
| Side panel: add waiver not signed | Waiver row (Signed, Not signed) in the Member card |

## 9. Notifications and Profile settings

| Request | What was done |
|---|---|
| Programme name on every notification; a better view | Grouped Today, Yesterday, Earlier; one card each; programme name as a small coloured label above a larger title |
| No blue highlight on unread; remove the footer note | Same card colour; unread shown by a dot and a bold title; note removed |
| Profile notifications spacing; shorten lines; quiet hours time in a container | Heading and line sit together; shorter lines; quiet hours time in a pill |

## 10. Goal, onboarding, small items

| Request | What was done |
|---|---|
| Your goal page: top glow, not a gradient | TopGlow |
| Change goal does not scroll to the end; Save disabled until a change | Room under the content for the floating Save; Save waits for a change |
| Onboarding last page: swipe to start sticky and floating, header with progressive blur | Done for the whole onboarding |

## 11. Personalisation proposal (the attached HTML)

| Request | What was done |
|---|---|
| Check what the proposal covers; frontend only | `docs/PERSONALISATION_COVERAGE.md`: built, partly built, not built |
| Wireframes first, shown in chat only | Ten wireframes, then hi-fi mocks, a where-and-how mock by time of day, meal card states, and a final scope list |
| Decisions | Supplements (creatine), the sponsored card, challenges and leaderboards later; membership stays view only |
| Build: greeting, Health connect, profile step, quick tip | Built with a switch each in the side panel. Day count in the greeting; Connect Health bottom sheet that asks to connect; profile step as "Your profile is 40% done" with a progress ring and an "Add height" button; quick tip as a violet gradient card with a big soft bulb, last on Today |
| Removed on request | The Day done card, the protein-low card and note, Repeat last meal and the fallback card were not built this round |

## 12. Skills and documents

- `docs/TRAINER_APP_BRIEF.md` and the skill `yourpal-trainer-app`: the brief for building the trainer app.
- `learned.md`, `screens.md` of the `yourpal-mobile-ui` skill updated with this session's rules.
- A skill for the whole member app is on hold until this document is approved.
- Third-party skill `mobile-ui` (timequity): read, not installed (generic, conflicts with our rules).

## 13. Open items

- Nothing tested on a physical phone (Expo Go).
- Payments page shows black where Profile should be for a moment while it closes on web.
- Edit logged workout slide-down not confirmed.
- Not built: supplement logging, the sponsored card, challenges and leaderboards, Repeat last meal, the fallback and offline strip.
- The day count (12 of 90) and the profile ring (40%) are fixed demo values.
- About 238 dot separators remain in copy.
- Sessions were slow because of length and long checks: publish in batches.
