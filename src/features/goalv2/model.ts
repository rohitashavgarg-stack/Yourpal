import { createStore } from '@/features/progress/store';
import { useDomain } from '@/lib/domain';
import { TODAY, START, sod } from '@/features/progress/trends';
import { WEEK_TARGET } from '@/features/streak/data';
import { useStreak } from '@/features/streak/useStreak';

// ---------------------------------------------------------------------------------------------
// Goal design Version 1 | Version 2.
// Version 1 is the app as it was. Version 2 is the new goal card, goal page and Progress layout.
// Everything Version 2 needs lives in this folder so Version 1 can be deleted in one pass.
// ---------------------------------------------------------------------------------------------

export type GoalDesignVersion = 'Version 1' | 'Version 2';
export const VERSIONS: GoalDesignVersion[] = ['Version 1', 'Version 2'];

export type GoalKind = 'weight' | 'muscle' | 'lean' | 'strength' | 'flexibility' | 'agility' | 'consistency';
export type GoalStatus = 'ahead' | 'onTrack' | 'aBitBehind' | 'endingSoon' | 'reached';

// Scenario-only: which state to show. The real status is always computed from dates and values (see computeStatus).
export type StatusScenario = 'Ahead' | 'On track' | 'A bit behind' | 'Ending soon' | 'Reached';
export const STATUS_SCENARIOS: StatusScenario[] = ['Ahead', 'On track', 'A bit behind', 'Ending soon', 'Reached'];

export const goalV2Store = createStore(() => ({
  version: 'Version 1' as GoalDesignVersion,
  scenario: 'On track' as StatusScenario,
  extendDays: 0, // "Extend by 4 weeks" adds days to the end date
  lowerBy: 0, // "Adjust target" moves the target toward the start
  finished: false, // "Finish with what I achieved"
  kept: false, // "Keep this as history" after a reached goal
  onboardBy: '', // finish date picked during onboarding
}));
export const useGoalDesignVersion = () => goalV2Store.use().version;

// Constants to confirm with the designer.
export const ON_TRACK_BAND = 0.1; // within 10 percentage points of the straight line = on track
export const ENDING_SOON_DAYS = 3;
export const DEFAULT_WEEKS = 12;
export const EXTEND_DAYS = 28;

const DAY = 86400000;
export const daysBetween = (a: Date, b: Date) => Math.round((sod(b).getTime() - sod(a).getTime()) / DAY);
export const addDays = (d: Date, n: number) => new Date(sod(d).getTime() + n * DAY);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const fmtDay = (d: Date) => `${d.getDate()} ${MON[d.getMonth()]}`;

// "30 Nov" -> a date in the prototype's year. "—" / "No date" / empty -> none.
export function parseBy(by?: string): Date | null {
  const m = /^(\d{1,2}) ([A-Za-z]{3})/.exec((by ?? '').trim());
  if (!m) return null;
  const mi = MON.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  if (mi < 0) return null;
  const y = TODAY.getFullYear() + (mi < START.getMonth() ? 1 : 0);
  return new Date(y, mi, +m[1]);
}

const KIND_OF: Record<string, GoalKind> = {
  'Weight loss': 'weight', 'Muscle gain': 'muscle', 'Lean body': 'lean', Strength: 'strength', Flexibility: 'flexibility', Agility: 'agility',
  'General fitness': 'consistency', 'Not sure yet': 'consistency',
};
export const kindOf = (type: string): GoalKind => KIND_OF[type] ?? 'consistency';

type Spec = { name: (t: number) => string; unit: string; start: number; target: (t: number) => number; down: boolean; dp: number; measuredBy?: 'assessment'; noun: string };
const SPEC: Record<Exclude<GoalKind, 'consistency'>, Spec> = {
  weight: { name: (t) => `Lose ${t} kg`, unit: 'kg', start: 74.5, target: (t) => 74.5 - t, down: true, dp: 1, noun: 'weight' },
  muscle: { name: (t) => `Gain ${t} kg muscle`, unit: 'kg', start: 70, target: (t) => 70 + t, down: false, dp: 1, noun: 'weight' },
  lean: { name: (t) => `Body fat −${t}%`, unit: '%', start: 24, target: (t) => 24 - t, down: true, dp: 1, noun: 'body fat' },
  strength: { name: (t) => `Squat ${t} kg`, unit: 'kg', start: 40, target: (t) => t, down: false, dp: 0, measuredBy: 'assessment', noun: 'squat' },
  flexibility: { name: () => 'Deep squat hold 60 s', unit: 's', start: 30, target: () => 60, down: false, dp: 0, measuredBy: 'assessment', noun: 'deep squat hold' },
  agility: { name: () => 'Shuttle run 12 s', unit: 's', start: 15, target: () => 12, down: true, dp: 1, measuredBy: 'assessment', noun: 'shuttle run' },
};

export type Goal2 = {
  kind: GoalKind;
  name: string; // "Lose 6 kg", "Squat 80 kg", "Train 4× a week"
  startDate: Date;
  endDate: Date | null; // null only for consistency
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  dp: number;
  noun: string;
  down: boolean;
  measuredBy?: 'assessment';
  weeklyTarget: number; // consistency only
  pct: number; // 0..1, one source for every surface
  expected: number | null; // where the straight line says you should be today
  status: GoalStatus;
  daysLeft: number | null;
  reachedWeeks: number; // weeks from start to today, for the "in N weeks" line
};

export function computeStatus(pct: number, expected: number, daysLeft: number): GoalStatus {
  if (pct >= 1) return 'reached';
  if (daysLeft <= ENDING_SOON_DAYS) return 'endingSoon';
  const diff = pct - expected;
  if (diff > ON_TRACK_BAND) return 'ahead';
  if (diff < -ON_TRACK_BAND) return 'aBitBehind';
  return 'onTrack';
}

const round = (v: number, dp: number) => Math.round(v * 10 ** dp) / 10 ** dp;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// The one goal object Today, Progress and the goal page all read.
export function useGoalV2(): Goal2 {
  const { d } = useDomain();
  const s = goalV2Store.use();
  const st = useStreak();
  const kind = kindOf(d.goal.type);

  if (kind === 'consistency') {
    const weeklyTarget = d.goal.type === 'General fitness' && d.goal.target ? d.goal.target : WEEK_TARGET;
    return {
      kind, name: `Train ${weeklyTarget}× a week`, startDate: START, endDate: null, startValue: 0, currentValue: st.weekDone, targetValue: weeklyTarget,
      unit: 'workouts', dp: 0, noun: 'workouts', down: false, weeklyTarget, pct: clamp01(st.weekDone / weeklyTarget), expected: null,
      status: st.weekDone >= weeklyTarget ? 'reached' : 'onTrack', daysLeft: null, reachedWeeks: st.weeks,
    };
  }

  const sp = SPEC[kind];
  const rawTarget = d.goal.target || (kind === 'weight' ? 6 : kind === 'strength' ? 80 : 3);
  const targetValue = round(sp.target(rawTarget), sp.dp);
  // "Adjust target": move the target a fifth of the way back toward the start, once per tap
  const adj = s.lowerBy ? round(targetValue + (sp.start - targetValue) * 0.2 * s.lowerBy, sp.dp) : targetValue;
  const startDate = START;
  let endDate = parseBy(d.goal.by) ?? addDays(START, DEFAULT_WEEKS * 7);
  if (s.scenario === 'Ending soon' && !s.extendDays) endDate = addDays(TODAY, 2);
  endDate = addDays(endDate, s.extendDays);

  const total = Math.max(1, daysBetween(startDate, endDate));
  const elapsed = Math.max(0, daysBetween(startDate, TODAY));
  const expected = clamp01(elapsed / total);
  const frac = s.finished ? 0.78
    : s.scenario === 'Reached' ? 1
    : s.scenario === 'Ahead' ? clamp01(expected + 0.27)
    : s.scenario === 'A bit behind' ? Math.max(0.04, expected - 0.18)
    : s.scenario === 'Ending soon' ? 0.72
    : clamp01(expected + 0.02);
  const span = adj - sp.start;
  // the frac above is a share of the ORIGINAL span, so the same "now" value reads differently after the target is adjusted
  const origSpan = targetValue - sp.start;
  const currentValue = round(sp.start + origSpan * frac, sp.dp);
  const pct = clamp01(span === 0 ? 1 : (currentValue - sp.start) / span);
  const daysLeft = daysBetween(TODAY, endDate);
  const status = s.finished ? 'reached' : computeStatus(pct, expected, daysLeft);
  return {
    kind, name: sp.name(rawTarget), startDate, endDate, startValue: sp.start, currentValue, targetValue: adj, unit: sp.unit, dp: sp.dp, noun: sp.noun, down: sp.down,
    measuredBy: sp.measuredBy, weeklyTarget: 0, pct, expected, status, daysLeft, reachedWeeks: Math.max(1, Math.round(elapsed / 7)),
  };
}

export const fmtVal = (g: Pick<Goal2, 'dp'>, v: number) => (g.dp ? v.toFixed(g.dp) : String(Math.round(v)));

// One plain line each. Neutral words only, never shame.
export function statusLine(g: Goal2): string {
  switch (g.status) {
    case 'reached': return 'Goal reached';
    case 'endingSoon': return g.daysLeft != null && g.daysLeft <= 1 ? 'Ends tomorrow' : `Ends in ${g.daysLeft} days`;
    case 'ahead': return 'Ahead of pace';
    case 'aBitBehind': return 'A bit behind';
    default: return 'On track';
  }
}
export function timeLeft(g: Goal2): string | null {
  if (g.endDate == null || g.daysLeft == null || g.status === 'reached' || g.status === 'endingSoon') return null;
  if (g.daysLeft >= 14) return `${Math.round(g.daysLeft / 7)} weeks left`;
  return `${g.daysLeft} days left`;
}
export const progressLine = (g: Goal2) => (g.kind === 'consistency' ? `${g.currentValue} of ${g.weeklyTarget} workouts this week` : `${fmtVal(g, Math.abs(g.currentValue - g.startValue))} of ${fmtVal(g, Math.abs(g.targetValue - g.startValue))} ${g.unit}`);
