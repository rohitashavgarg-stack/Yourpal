#!/usr/bin/env node
/*
 * Writes docs/coverage.md and docs/coverage-elements.md from docs/coverage-data.json (scripts/audit/coverage.js --json)
 * and the statuses in docs/coverage-status.json ({ "<row id>": { "status": "...", "note": "..." } }).
 * Run both after every screen:   node scripts/audit/coverage.js --json && node scripts/audit/coverage-md.js
 */
const fs = require('fs'); const path = require('path');
const data = JSON.parse(fs.readFileSync('docs/coverage-data.json', 'utf8'));
const statusFile = 'docs/coverage-status.json';
const status = fs.existsSync(statusFile) ? JSON.parse(fs.readFileSync(statusFile, 'utf8')) : {};
const all = [...data.routes, ...data.shared];
const hitsByFn = (file, fns) => all.flatMap((m) => m.hand).filter((h) => h.file === file && fns.includes(h.fn));
const src = (f) => fs.readFileSync(path.join('src', f), 'utf8');

// ---------- tab bar / how to reach routes
const TAB = { '/': 'Tab bar: Today', '/plans': 'Tab bar: Plans', '/progress': 'Tab bar: Progress', '/gym': 'Tab bar: Gym' };
const SCREEN = (f) => f.replace(/^app\//, '').replace(/\.tsx$/, '').replace(/^\(tabs\)\//, '');
const NAMES = {
  '/': 'Today', '/plans': 'Plans', '/progress': 'Progress', '/gym': 'Gym', '/checkin': 'Check-in map', '/coach': 'Coach', '/exercise-search': 'Exercise search',
  '/food': 'Food detail', '/goal-detail': 'Your goal', '/goal': 'Change goal', '/gym/assessments': 'Assessments', '/gym/attendance': 'Attendance', '/gym/break': 'Membership pauses',
  '/gym/chat': 'Coach chat', '/gym/confirm': 'Confirm session', '/gym/membership': 'Membership', '/gym/pt': 'PT package', '/log-height': 'Log height', '/log-weight': 'Log weight',
  '/login': 'Log in', '/notifications': 'Notifications', '/onboarding': 'Onboarding (frame)', '/plans/ask': 'Ask coach', '/plans/create': 'Create a workout', '/plans/edit': 'Edit plan',
  '/plans/exercise': 'Exercise', '/plans/history': 'Workout history', '/plans/log': 'What did you eat?', '/plans/updated': 'What changed', '/profile/appearance': 'Appearance',
  '/profile/delete': 'Delete account', '/profile/details': 'My details', '/profile/export': 'Export my data', '/profile/health': 'Connected apps', '/profile/help': 'Help and support',
  '/profile': 'Profile', '/profile/join': 'Join a programme', '/profile/notifications': 'Notification settings', '/profile/privacy': 'Privacy', '/profile/tracker-designs': 'Tracker designs',
  '/profile/trackers': 'Quick trackers', '/profile/units': 'Units and detail', '/progress/assess': 'Assessment', '/progress/goal': 'Goal (progress)', '/progress/lift': 'Lift detail',
  '/progress/metric': 'Metric detail', '/progress/photos': 'Photos', '/progress/streaks': 'Streaks and badges', '/welcome': 'Welcome', '/workout': 'Active workout',
  '(app shell)': 'App shell (layout, floating tab bar host, overlays)',
};
const kinds = (hs) => { const k = {}; hs.forEach((h) => { k[h.kind] = (k[h.kind] || 0) + 1; }); return Object.entries(k).map(([a, b]) => b + ' ' + a).join(', '); };
const handCell = (hs) => (hs.length ? hs.length + ' (' + kinds(hs) + ')' : '0');

const rows = [];
// routes
for (const r of data.routes) {
  if (r.file === 'app/index.tsx') { rows.push({ id: 'route:/index', group: 'Routes', screen: 'Entry redirect', route: '/ (app/index.tsx)', reach: 'App start: sends the member to Welcome, Login or Today', hand: [], states: [], files: [r.file] }); continue; }
  const reach = TAB[r.route] || (r.reachedFrom.length ? 'From ' + [...new Set(r.reachedFrom.map(SCREEN))].slice(0, 4).join(', ') : 'Direct link');
  rows.push({ id: 'route:' + r.route, group: 'Routes', screen: NAMES[r.route] || r.route, route: r.route, reach, hand: r.hand, ds: r.ds, files: r.files,
    states: r.scenarios.flatMap((s) => s.rows.concat(s.actions.map((a) => '(action) ' + a))) });
}
// onboarding steps and login states
const OB = [['welcome', 'WelcomeStep', 'Welcome'], ['facility', 'FacilityStep', 'Gym'], ['goal', 'GoalStep', 'Goal'], ['exp', 'ExpStep', 'Experience'], ['sched', 'SchedStep', 'Schedule'], ['age', 'AgeStep', 'Age'],
  ['height', 'HeightStep', 'Height'], ['weight', 'WeightStep', 'Weight'], ['target', 'TargetStep', 'Target'], ['plan', 'ProjectionStep', 'Projection'], ['health', 'HealthStep', 'Health'], ['basics', 'BasicsStep', 'Basics'],
  ['consent', 'ConsentStep', 'Privacy and consent'], ['building', 'BuildingStep', 'Building your plan'], ['ready', 'ReadyStep', 'All set']];
for (const [k, fn, label] of OB) {
  const fns = [fn, fn === 'GoalStep' ? 'GoalChoiceTile' : '', fn === 'ReadyStep' ? 'ReadyContent' : '', fn === 'ProjectionStep' ? 'HowStep' : '', fn === 'BuildingStep' ? 'MealStep' : ''].filter(Boolean);
  const hs = [...hitsByFn('app/onboarding.tsx', fns), ...hitsByFn('features/onboarding/Steps.tsx', fns)];
  rows.push({ id: 'step:' + k, group: 'Onboarding steps', screen: 'Onboarding: ' + label, route: '/onboarding (step ' + k + ')', reach: 'Welcome, Get started, then Continue; or the demo panel "Jump to step"', hand: hs, states: [], files: ['app/onboarding.tsx', 'features/onboarding/Steps.tsx'] });
}
// sheets
const sheetDefs = [];
for (const f of fs.readdirSync('src', { recursive: true }).map(String).filter((x) => /\.tsx$/.test(x) && !x.startsWith('design-system'))) {
  const t = src(f);
  for (const m of t.matchAll(/^(?:export )?function ([A-Z][A-Za-z]*(?:Sheet|JoinCode))\b/gm)) sheetDefs.push({ name: m[1], file: f.split(path.sep).join('/'), line: t.slice(0, m.index).split('\n').length });
}
const useSites = (name, defFile) => {
  const out = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map(String).filter((x) => /\.tsx$/.test(x) && !x.startsWith('design-system'))) {
    const lines = src(f).split('\n');
    lines.forEach((l, i) => { if (new RegExp('<' + name + '\\b').test(l) && !(f.split(path.sep).join('/') === defFile && i + 1 < 5)) out.push(f.split(path.sep).join('/') + ':' + (i + 1)); });
  }
  return out;
};
for (const s of sheetDefs) {
  const sites = useSites(s.name, s.file).filter((x) => !x.startsWith(s.file + ':' + s.line));
  const screens = [...new Set(sites.map((x) => SCREEN(x.split(':')[0])))];
  rows.push({ id: 'sheet:' + s.name, group: 'Bottom sheets', screen: s.name, route: '(sheet) ' + s.file + ':' + s.line, reach: screens.length ? 'Opened from ' + screens.slice(0, 4).join(', ') : 'Opened from code (no direct tag)', hand: hitsByFn(s.file, [s.name]), states: [], files: [s.file] });
}
const INLINE = [
  ['sheet:inline-notifications', 'Notification permission (onboarding)', '(sheet) app/onboarding.tsx', 'Onboarding, Privacy step, Agree and continue', 'app/onboarding.tsx', ['Onboarding']],
  ['sheet:inline-disconnect', 'Disconnect Health', '(sheet) app/profile/health.tsx', 'Profile, Connected apps, Disconnect', 'app/profile/health.tsx', ['ConnectedApps']],
  ['sheet:inline-joincode', 'Join with a code (JoinCode)', '(sheet) app/login.tsx', 'Log in, Join with a code', 'app/login.tsx', ['Login', 'JoinCode']],
];
for (const [id, screen, route, reach, file, fns] of INLINE) rows.push({ id, group: 'Bottom sheets', screen, route, reach, hand: fns.includes('JoinCode') ? hitsByFn(file, ['JoinCode']) : [], states: [], files: [file], inline: true });
// overlays, popups and full-screen surfaces that are not routes
const OV = [
  ['overlay:snackbar', 'Snackbar (toast)', 'design-system/primitives/Snackbar.tsx', 'Any action with an undo or a confirmation (for example tick a meal)', [], 'library'],
  ['overlay:pushbanner', 'Phone push preview banner', 'features/reminders/PushBanner.tsx', 'Demo panel: Send reminder push', ['PushBanner'], ''],
  ['overlay:tabbar', 'Floating tab bar', 'components/FloatingTabBar.tsx', 'Every tab screen; hides on scroll', ['PillBar', 'FloatingTabBar'], ''],
  ['overlay:checkinbar', 'Check-in bar and mini workout', 'features/today/CheckInBar.tsx', 'Today, near the gym', ['CheckInBar', 'MiniWorkout'], ''],
  ['overlay:finish', 'Workout finish screen (confetti and stats)', 'features/workout/FinishScreen.tsx', 'Active workout, Finish', ['FinishScreen'], ''],
  ['overlay:rest', 'Rest timer panel', 'features/workout/NewWorkoutUI.tsx', 'Active workout, tick a set', ['RestPanel', 'Rest'], ''],
  ['overlay:webframe', 'Web phone frame and demo controls panel', 'web/WebFrame.tsx', 'Web only, wide window', ['TimeSlider', 'PanelBody', 'Choice', 'PanelCard', 'Dropdown', 'SwitchChip', 'ActionChip', 'Switch', 'Segment'], 'tooling'],
];
for (const [id, screen, file, reach, fns, note] of OV) rows.push({ id, group: 'Overlays and popups', screen, route: file, reach, hand: hitsByFn(file, fns), states: [], files: [file], note });
// empty, loading and error states
const ST = [
  ['state:today-loading', 'Today loading skeleton', 'Today', 'Demo panel: loading', 'app/(tabs)/index.tsx'],
  ['state:no-plan', 'No plan yet (empty)', 'Plans', 'Demo panel: No plan yet, On', 'features/today/NoPlanCard.tsx'],
  ['state:locked-plan', 'Locked plan behind blur (membership expired)', 'Plans', 'Demo panel: Membership, Expired', 'features/plans/WorkoutPlan.tsx'],
  ['state:offline', 'Offline notices', 'Plans, Login, Onboarding, Exercise, Export', 'Demo panel: Connection, Offline', 'app/(tabs)/plans.tsx'],
  ['state:scan-fail', 'Scan failed and camera denied', 'What did you eat?', 'Demo panel: Scan result, Fails; Camera, Denied', 'app/plans/log.tsx'],
  ['state:login-errors', 'Login errors (not found, wrong code)', 'Log in', 'Demo panel: Phone number, Not found; Code entered, Wrong', 'app/login.tsx'],
  ['state:search-empty', 'Exercise search: empty and no match', 'Exercise search', 'Demo panel: Query', 'app/exercise-search.tsx'],
  ['state:no-goal', 'No goal set yet', 'Today, Progress, Your goal', 'Demo panel: Goal card state, No goal', 'design-system/patterns/GoalCard.tsx'],
  ['state:comeback', 'Comeback day', 'Today', 'Demo panel: Today variant, Comeback', 'features/today/ForYou.tsx'],
  ['state:streak-broken', 'Streak broken and new member', 'Streaks and badges', 'Demo panel: Streak', 'app/progress/streaks.tsx'],
  ['state:export-fail', 'Export failed (offline)', 'Export my data', 'Demo panel: Export result, Fails', 'app/profile/export.tsx'],
];
for (const [id, screen, where, reach, file] of ST) rows.push({ id, group: 'Empty, loading and error states', screen, route: where, reach, hand: [], states: [], files: [file], stateOnly: true });
// shared files
for (const m of data.shared) {
  if (/^web\//.test(m.file)) continue;
  rows.push({ id: 'shared:' + m.file, group: 'Shared components and features', screen: m.file, route: '(shared)', reach: 'Used by several screens', hand: m.hand, states: [], files: [m.file] });
}
// de-duplicate hits shown twice (a sheet that is also inside its owner file)
const seen = new Set();
const PRIO = { 'Onboarding steps': 0, 'Bottom sheets': 0, 'Overlays and popups': 0, 'Empty, loading and error states': 1, Routes: 2, 'Shared components and features': 3 };
for (const r of [...rows].sort((a, b) => PRIO[a.group] - PRIO[b.group])) r.hand = r.hand.filter((h) => { const k = h.file + ':' + h.line; if (seen.has(k)) return false; seen.add(k); return true; });

const ST_ALLOWED = ['not started', 'in progress', 'done', 'needs my decision'];
for (const r of rows) { r.status = (status[r.id] && status[r.id].status) || 'not started'; r.note = status[r.id] && status[r.id].note; if (!ST_ALLOWED.includes(r.status)) throw new Error('bad status ' + r.id); }

// ---------- docs/coverage.md
let md = '# Coverage map\n\nEvery screen, sub-page, bottom sheet, popup, empty, loading and error state, and onboarding step in the app. Generated by `scripts/audit/coverage.js` and `scripts/audit/coverage-md.js`; statuses live in `docs/coverage-status.json`. Element-level detail is in `docs/coverage-elements.md`.\n\n';
const total = rows.reduce((a, r) => a + r.hand.length, 0);
const cnt = (s) => rows.filter((r) => r.status === s).length;
md += `**${rows.length} rows.** not started ${cnt('not started')}, in progress ${cnt('in progress')}, done ${cnt('done')}, needs my decision ${cnt('needs my decision')}. **Hand-built elements remaining: ${total}.**\n\n`;
md += '"Hand-built" means a JSX element whose style makes it a button, pill, icon button, chip, card, icon badge, progress bar or text input, written out instead of using a library component. It is a style heuristic (see `classify()` in the script), so it finds candidates, not every one-off layout.\n\n';
for (const g of [...new Set(rows.map((r) => r.group))]) {
  md += `## ${g}\n\n| Screen | Route | How to reach it | Status | Hand-built elements |\n|---|---|---|---|---|\n`;
  for (const r of rows.filter((x) => x.group === g)) md += `| ${r.screen} | \`${r.route}\` | ${r.reach} | ${r.status}${r.note ? ' (' + r.note + ')' : ''} | ${handCell(r.hand)} |\n`;
  md += '\n';
}
md += '## Decisions for the designer\n\n' + (fs.existsSync('docs/coverage-decisions.md') ? fs.readFileSync('docs/coverage-decisions.md', 'utf8') : '_None yet._\n');
fs.writeFileSync('docs/coverage.md', md);

// ---------- docs/coverage-elements.md
let el = '# Elements per screen\n\nFor each row of `docs/coverage.md`: the design-system components it uses (count of tags) and every hand-built element found (file:line, kind, the start of the JSX). Generated; do not edit.\n\n';
for (const r of rows) {
  const ds = r.ds && Object.keys(r.ds).length ? Object.entries(r.ds).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' x' + v).join(', ') : '(see the screen\'s files)';
  el += `## ${r.screen} (${r.group.toLowerCase()})\n\n- Files: ${r.files.map((f) => '`' + f + '`').join(', ')}\n- Library components used: ${ds}\n`;
  if (r.states.length) el += `- States and edge cases: ${r.states.join('; ')}\n`;
  el += r.hand.length ? '- Hand-built:\n' + r.hand.map((h) => `  - \`${h.file}:${h.line}\` ${h.kind}: \`${h.text.replace(/`/g, "'").slice(0, 90)}\``).join('\n') + '\n\n' : '- Hand-built: none\n\n';
}
fs.writeFileSync('docs/coverage-elements.md', el);
fs.writeFileSync('docs/coverage-rows.json', JSON.stringify(rows.map((r) => ({ id: r.id, screen: r.screen, group: r.group, status: r.status, hand: r.hand.length, files: r.files })), null, 1));
console.log(rows.length + ' rows, ' + total + ' hand-built, ' + cnt('done') + ' done');
