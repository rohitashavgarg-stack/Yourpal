# Design system notes

Source: `Yourpal Design System.fig` (pages: Color palette, Typography, Button, Chips, Icons).
All values live in `design-system.css`. `app.css` and `app.js` use tokens only.
Check with `node tools/audit-tokens.js` (colours and type) and `node tools/audit-spacing.js` (4px grid).

## Taken from the Figma file
- Colour: Primary (base 60, `#303F9F`), Secondary, Neutral, Success, Warning, Error, Info scales; Background; Text primary `#121212` and secondary `#4B5563`.
- Type: Work Sans. Scale 24, 20, 18, 16 (headings), 16, 14 (body), 13 (medium). Line heights follow the file's 1.5 and 1.6 ratios.
- Buttons: Large 40, Medium 32, Small 24, pill, in filled, tonal, outline and text types.
- Chips: Medium 32, Small 24, Extra small 20, with the semantic colours.

## Decisions where the file is silent or conflicts
| Topic | Decision | Why |
| --- | --- | --- |
| Minimum text size | 13px | Project rule. The file has 12px and 10px styles; they are not used. |
| Icons | Lucide | Project rule. The file's icon page is Solar. |
| Cards, tables, tabs, modals, side panels | Layout copied from the live CRM; radius 12, 16 and 24 chosen | The file has no component for these. |
| Radius scale | 8 controls, 12 cards and inputs, 16 header cards and modals, 24 large dialog and side panel | Not defined in the file. |
| Avatar chip | Chip M (32) with a 24px text avatar showing one initial | Two initials do not fit a 24px circle at 13px. |
| Brand colour | Primary/60 `#303F9F` | The live app uses `#3F51B5`; the file wins. |
| Gradients | None | The live app uses purple and red gradients that are not in the file. Solid Primary tokens are used instead. |

## Mock data
Memberships 2 to 4 for the member doli jha and the monthly membership for john deo (marked ready for transfer) are made up for the prototype. The Transferred filter chip, the Ready for transfer chip and the Transferable membership option in Add Membership and Convert to Member are additions: live has no transfer feature. Transfers are admin-only CRM actions: a card only marks a membership as ready (Active and fully paid), and the transfer is done in the two drawers with a transfer fee and an editable start date. Everything else is copied from the Doli_GYM dev program.
