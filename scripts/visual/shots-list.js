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
  // sheets that need the running workout
  { name: 'sheet-WorkoutSwapSheet', url: '/', clicks: [...MAIN, 'Exercise options', 'Swap exercise'] },
  { name: 'sheet-FormTipsSheet', url: '/', clicks: [...MAIN, 'Exercise options', 'Form tips & video'] },
  { name: 'sheet-SetMenuSheet', url: '/', clicks: [...MAIN, 'Exercise options', 'Options for the current set'] },
  { name: 'sheet-FinishConfirmSheet', url: '/', clicks: [...MAIN, 'Finish workout'] },
  { name: 'sheet-WkMenuSheet', url: '/', clicks: [...MAIN, 'Exercise options'] },
  // empty, loading and error states
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
