# Old rules that no longer apply (and what replaced them)

These lines are still in the older `yourpal-mobile-ui` skill (`SKILL.md`, `learned.md`) or in old docs. Do not follow them. If you meet one, follow the replacement and say so.

| Old rule | Where it was | Now |
|---|---|---|
| Work goes to the `staging` branch first; `main` only when he says so | learned.md (28 Oct to 4 Nov), SESSION_HANDOFF "Shipping" | He wants every change on `main` (said repeatedly in Nov). Publish with `node scripts/publish.js web --direct --yes --message "..."` |
| Light mode is out of scope until he says otherwise; capture dark only | learned.md | Light mode must work (tokens only, both themes); he reviews dark. The older playbook's "light-first" is also outdated: review dark, support both |
| Glow (the tilted blue ellipse) belongs to the Today goal hero only, never inside a detail page | SKILL.md section 2 | Detail pages have a soft top glow (`TopGlow`) in the colour of their meaning (blue default, amber pending, green signed). The Today card itself has no glow |
| Streak, goals, "frozen" and "paused" wording | older docs | A goal is never frozen or paused. A membership pause shows as an account banner and a paused card; admin "Frozen" is shown as Paused |
| The Plans three dot menu (Edit plan, Create a workout, Reset to the coach's version) stays as it is | learned.md | Removed: only the trainer creates or edits a workout. The menu is Ask Coach to change the plan, Exercise library, Edit logged workout, Download PDF |
| Edit logged workout / log a past workout as a bottom sheet | Plans, `LogPastWorkoutSheet` | "Edit logged workout" is a full page (`/plans/entries`) styled like Edit plan; the sheet remains only for "Log this workout" on an unlogged past day |
| Header Save button on Edit pages; footer bars with a top border for bottom buttons | many pages | Floating button over the page (no bar, no line); no header Save |
| Solid page headers (`PageHeader` with a colour behind it) | Plans pages, workout | Floating header with the progressive blur |
| Cards are 24 px radius with 16 to 18 px padding (a single spec); plain `c.surface` cards | SKILL.md section 3 | Card variants (default 28/20, roomy, compact, tight); a standalone card is `c.cardLift` plus `CardEdge` whose radius follows the card |
| Press feedback is a shrink on everything | Pressy | Icon buttons swell (`grow`); cards and rows shrink |
| Screens and cards enter with `fade()` from `@/theme/motion` | SKILL.md section 7 | Same behaviour, but import from `@/design-system/tokens` and use the `FadeIn` component; page slides use the phone curve; Reduce Motion goes through `useReduce()` |
| A fixed stat tile or a container around the key numbers on the assessment page | assessments | The numbers sit on the page with no container |
| Assessment pills "Latest" and "Starting"; "Starting assessment" and "Reassessment" names | assessments | Assessment 1, 2, 3; no self-assessment at all |
| The Today streak card, the streak line on the finish page, the week row on the finish page | Today, finish | Removed. The streak is on Progress and in the greeting fact |
| Day done card, protein-low card and protein note | personalisation round | Removed on request (11 to 12 Nov) |
| Quick tip "no card, plain text" and the plain card version | quick tip | The violet tinted gradient card with a big soft bulb behind the words (final) |
| Health consent sheet ("Read only", consent wording) | Connect Health sheet | The sheet asks to connect Steps and Active energy: "Connect" plus the Health app's name, a Connect button and Not now |
| Profile step with number chips | profile step | A card in the updates stack with a progress ring and an "Add height" button |
| The member's own assessment entries, the monthly assessment nudge | Gym, Today | Removed (assessments are the trainer's; view only) |
| `thinking-orbs` and the gooey fan-out menu | earlier previews | Dropped; do not bring back unless asked |
| Mint `#3CCB9A` as the progress colour | SKILL.md section 2 | Use `c.good` (mint on dark cards is `onDark.mint` `#2EE6A8`) from the tokens, never the literal |
| Bulk codemod for dot separators | tried and reverted | Never bulk-replace; fix the screens he points at |

## Still true from the older playbook (kept in SKILL.md)
Number first with a short caption; the answer in the headline and the chart as proof; no duplicates; a visual per metric; weekly goals are never a percent bar; status and category colours carry meaning; small status dots have no outline ring; 44 px targets; one gap value inside a component; section headings above cards, not ALL CAPS inside every card; long names never truncate; "do not miss anything": change a pattern on every surface that shows it.
