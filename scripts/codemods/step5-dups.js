#!/usr/bin/env node
/* Phase 3 part 2a. Replaces the second copies of Chevron and Bracket with the shared primitives, and renames
 * same-name-different-thing components so every component name means one thing. Run with --write. */
const ts = require('typescript'); const fs = require('fs'); const path = require('path');
const write = process.argv.includes('--write'); const S = (p) => path.join('src', p);
function load(f) { const raw = fs.readFileSync(f, 'utf8'); return { raw, crlf: raw.includes('\r\n'), text: raw.replace(/\r\n/g, '\n') }; }
function save(f, o, text) { fs.writeFileSync(f, o.crlf ? text.replace(/\n/g, '\r\n') : text); }
function parse(f, text) { return ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX); }
function rename(f, from, to, keepOldExport) {
  const o = load(f); const sf = parse(f, o.text); const edits = [];
  (function v(n) {
    if (ts.isIdentifier(n) && n.text === from) {
      const p = n.parent;
      const skip = (ts.isPropertyAccessExpression(p) && p.name === n) || (ts.isPropertyAssignment(p) && p.name === n) || (ts.isJsxAttribute(p) && p.name === n) || (ts.isPropertySignature(p) && p.name === n) || (ts.isBindingElement(p) && p.propertyName === n) || (ts.isImportSpecifier(p) || ts.isExportSpecifier(p));
      if (!skip) edits.push([n.getStart(), n.getEnd()]);
    }
    ts.forEachChild(n, v);
  })(sf);
  if (!edits.length) { console.log('NO MATCH', f, from); return; }
  let t = o.text; for (const [a, b] of edits.sort((x, y) => y[0] - x[0])) t = t.slice(0, a) + to + t.slice(b);
  if (keepOldExport) t = t.replace(/\s*$/, '\n') + `export { ${to} as ${from} }; // old name, kept so existing imports work\n`;
  console.log((write ? 'wrote ' : 'would write ') + f + ': ' + from + ' -> ' + to + ' (' + edits.length + ')'); if (write) save(f, o, t);
}
const R = [
  ['app/onboarding.tsx', 'Title', 'StepTitle'], ['features/today/WorkoutCard.tsx', 'Title', 'WorkoutTitle'],
  ['app/gym/chat.tsx', 'Dot', 'TypingDot'], ['features/today/ForYou.tsx', 'Dot', 'PagerDot'], ['features/today/WeekCard.tsx', 'Dot', 'DayDot'],
  ['app/_layout.tsx', 'Shell', 'AppShell'], ['features/today/WorkoutCard.tsx', 'Shell', 'WorkoutShell'],
  ['features/body/BodyLog.tsx', 'DateSheet', 'WeighDateSheet'], ['features/progress/TrendUI.tsx', 'DateSheet', 'CalendarSheet'],
  ['features/trackers/Widgets.tsx', 'Segments', 'SegmentBar'], ['design-system/patterns/GoalCard.tsx', 'Segments', 'TickBar'],
  ['app/welcome.tsx', 'Glow', 'CornerGlow'], ['design-system/patterns/GoalCard.tsx', 'Glow', 'RadialGlow', true],
  ['features/plans/Sheets.tsx', 'SwapSheet', 'DietSwapSheet', true], ['features/workout/WorkoutSheets.tsx', 'SwapSheet', 'WorkoutSwapSheet', true],
  ['app/onboarding.tsx', 'GoalTile', 'GoalChoiceTile'], ['app/profile/index.tsx', 'GoalTile', 'GoalSummaryTile'],
  ['features/progress/TrendUI.tsx', 'Bar', 'ChartBar'], ['features/today/WeekCard.tsx', 'Bar', 'WeekBar'],
  ['app/profile/help.tsx', 'Item', 'FaqItem'], ['components/Wheel.tsx', 'Item', 'WheelItem'],
  ['app/(tabs)/gym.tsx', 'MembershipCard', 'GymMembership'], ['features/today/TopCards.tsx', 'GoalCard', 'RingGoalCard', true],
  ['app/onboarding.tsx', 'Progress', 'StepProgress'], ['app/onboarding.tsx', 'Welcome', 'WelcomeStep'],
  ['app/(tabs)/progress.tsx', 'Progress', 'ProgressScreen'], ['app/welcome.tsx', 'Welcome', 'WelcomeScreen'], ['app/profile/trackers.tsx', 'Trackers', 'TrackersScreen'],
];
for (const [f, a, b, keep] of R) rename(S(f), a, b, keep);
