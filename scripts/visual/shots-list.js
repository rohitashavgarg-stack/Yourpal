// What scripts/visual/shots.js captures. name, url (the page opens with ?signedin=1&theme=...), optional clicks and wait.
// {"app": ...} patches the app state, {"dom": ...} the domain, {"sc": ...} the scenarios, {"prof": ...} the profile (src/lib/devParams.ts).
const q = (o) => encodeURIComponent(JSON.stringify(o));
const SHEETS = ['AttachSheet', 'CalendarSheet', 'ChangePhoneSheet', 'ChatOptionsSheet', 'DateSheet', 'DaySheet', 'DietMenuSheet', 'DietSwapSheet', 'DiscardSheet', 'DobSheet', 'EditItemSheet', 'FlagSheet',
  'HealthSheet', 'HistSheet', 'ItemMenuSheet', 'JoinConsentSheet', 'LibrarySheet', 'LogMealsSheet', 'LogoutSheet', 'ManualLogSheet', 'NutritionSheet', 'PhotoSheet', 'PlanMenuSheet', 'ProgrammeSwitcherSheet',
  'QtySheet', 'QuickLogSheet', 'ResetSheet', 'StepsSheet', 'StillTrainingSheet', 'UndoEatenSheet', 'UpdatesSheet', 'WaterSheet', 'WeighDateSheet'];
const STEPS = ['welcome', 'facility', 'goal', 'exp', 'sched', 'age', 'height', 'weight', 'target', 'plan', 'health', 'basics', 'consent', 'building', 'ready'];
const PROF = { goal: 'Weight loss', exp: 'Beginner', age: '30', dob: '1996-04-12', heightCm: '172', weightKg: '74', targetKg: '68' };
const onboarding = (step, extra = {}) => ({ name: 'step-' + step, url: '/onboarding?app=' + q({ onboarded: false, onboardingStep: step }) + '&prof=' + q({ ...PROF, ...extra }), settle: step === 'building' ? 1200 : 2500 });

const MAIN = ['Start workout', 'Start main workout'];
module.exports = [
  ...SHEETS.map((s) => ({ name: 'sheet-' + s, url: '/dev-cards?c=sheet&s=' + s })),
  ...STEPS.map((s) => onboarding(s)),
  { name: 'sheet-LogMealsSheet-extra', url: '/dev-cards?c=sheet&s=LogMealsSheet&dom=' + q({ meals: { sn: { eaten: [0], extra: [{ n: '1 bowl Poha', k: 180, p: 4, type: 'veg' }], repl: {}, at: 940 } }, min: 1000 }) },
  // sheets that need the running workout
  { name: 'sheet-WorkoutSwapSheet', url: '/', clicks: [...MAIN, 'Exercise options', 'Swap exercise'] },
  { name: 'sheet-FormTipsSheet', url: '/', clicks: [...MAIN, 'Exercise options', 'Form tips & video'] },
  { name: 'sheet-SetMenuSheet', url: '/', clicks: [...MAIN, 'Exercise options', 'Options for the current set'] },
  { name: 'sheet-FinishConfirmSheet', url: '/', clicks: [...MAIN, 'Finish workout'] },
  { name: 'sheet-WkMenuSheet', url: '/', clicks: [...MAIN, 'Exercise options'] },
  // sheets and overlays that need a tap or a typed value (round 4)
  { name: 'sheet-NotificationPermissionSheet', url: '/onboarding?app=' + q({ onboarded: false, onboardingStep: 'consent' }) + '&prof=' + q(PROF), settle: 2500, clicks: ['Agree and continue'] },
  { name: 'sheet-DisconnectHealthSheet', url: '/profile/health?dom=' + q({ hc: true }), clicks: ['Disconnect'] },
  { name: 'sheet-JoinCodeSheet', url: '/login', noSignedIn: true, clicks: ['I have a join code from my gym'] },
  { name: 'overlay-snackbar-undo', url: '/profile/health?dom=' + q({ hc: true }), clicks: ['Disconnect', 'Disconnect'], wait: 600 },
  { name: 'overlay-push-banner', url: '/?stores=' + q({ push: { shown: { key: 'water', title: 'YourPal', body: 'No water logged since 11 am. A glass is 250 ml.', at: 1 } } }), settle: 600 },
  { name: 'overlay-rest-timer', url: '/', clicks: [...MAIN, 'Log set'] },
  { name: 'overlay-finish-screen', url: '/', clicks: [...MAIN, 'Finish workout', 'Finish now'], wait: 2500 },
    { name: 'exp-diet', url: '/plans?day=2&tab=diet', clicks: ['Diet'], wait: 2500 },
  { name: 'exp-tab-plans', url: '/', clicks: ['Plans'], wait: 2500 },
  { name: 'exp-tab-gym', url: '/', clicks: ['Progress', 'Gym'], wait: 2500 },
  // empty, loading and error states
  { name: 'state-today-loading', url: '/', settle: 100 },
  { name: 'state-login-notfound', url: '/login?sc=' + q({ number: 'Not found' }), noSignedIn: true, fill: [['Phone number', '9876543210']], clicks: ['Send code'], wait: 2000 },
  { name: 'state-login-wrongcode', url: '/login?sc=' + q({ otp: 'Wrong' }), noSignedIn: true, fill: [['Phone number', '9876543210']], clicks: ['Send code'], then: [['Enter the 6-digit code', '123456']], wait: 1500 },
  { name: 'state-streak-broken', url: '/progress/streaks?stores=' + q({ streak: { mode: 'Broken' } }) },
  { name: 'state-today-comeback', url: '/?dom=' + q({ todayVariant: 'Comeback' }) },
  { name: 'state-today-updates', url: '/?dom=' + q({ todayVariant: 'With updates' }) },
  { name: 'state-today-expired', url: '/?dom=' + q({ membership: 'Expired' }) },
  { name: 'state-today-morning', url: '/?dom=' + q({ min: 480 }) },
  { name: 'state-plans-noplan', url: '/plans?stores=' + q({ plans: { noPlan: true } }) },
  { name: 'state-plans-expired', url: '/plans?dom=' + q({ membership: 'Expired' }) },
  { name: 'state-plans-diet', url: '/plans?day=2' },
  { name: 'state-plans-offline', url: '/plans?sc=' + q({ net: 'Offline' }) },
  { name: 'state-checkin-near', url: '/checkin?dom=' + q({ ci: 'Near' }) },
  { name: 'state-exercise-search-nomatch', url: '/exercise-search?q=zzzz' },
  { name: 'state-progress-newmember', url: '/progress?stores=' + q({ progress: { data: 'New member' } }) },
  { name: 'state-plans-scan-denied', url: '/plans/log?stores=' + q({ plans: { cam: 'Denied' } }) },
  { name: 'state-export-offline', url: '/profile/export?sc=' + q({ net: 'Offline' }) },
  { name: 'state-login-offline', url: '/login?sc=' + q({ net: 'Offline' }), noSignedIn: true },
];
