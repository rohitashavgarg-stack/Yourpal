import { createStore } from '@/lib/createStore';
import { useDomain } from '@/lib/domain';
import { fmtT, MEALS } from '@/lib/data';
import { useShell } from '@/features/shell/state';
import { goalCardStore } from '@/features/today/goalCardState';
import { useSteps } from '@/features/today/StepsCards';
import { reminderText } from '@/lib/microcopy';
import { missedMeals } from '@/features/today/MealsCard';

// Personal reminders: small, calm nudges that sit next to the thing they are about (a caption under the tile, the meals card's own "not logged" row)
// and, when the member allows it, arrive as a phone notification with the same words. One kind per thing, never red, never guilt.
export type ReminderKey = 'water' | 'weight' | 'meals' | 'steps';
export const REMINDER_KEYS: ReminderKey[] = ['water', 'weight', 'meals', 'steps'];
export const REMINDER_LABEL: Record<ReminderKey, { title: string; sub: string }> = {
  water: { title: 'Water', sub: 'When you have not logged water for 4 hours' },
  weight: { title: 'Weight', sub: 'When you have not weighed in for about a week' },
  meals: { title: 'Meals', sub: 'When a meal time has passed and nothing is logged' },
  steps: { title: 'Steps', sub: 'When your steps are well behind the day' },
};

export const WATER_GAP_MIN = 240; // 4 hours without a glass
export const WEIGH_NUDGE_DAYS = 5; // from here a weigh-in is worth a nudge (the goal card says "Needs a weigh-in" at 10)
export const WATER_TARGET_L = 3;
const WAKE_MIN = 8 * 60;
const SLEEP_MIN = 21 * 60;

// Quiet hours: nothing is shown or sent between these times. The member picks one of three.
export const QUIET_PRESETS = [
  { from: 21 * 60, to: 8 * 60, label: '9 pm to 8 am' },
  { from: 22 * 60, to: 7 * 60, label: '10 pm to 7 am' },
  { from: 23 * 60, to: 6 * 60, label: '11 pm to 6 am' },
];
export const inQuiet = (min: number, preset: number) => { const q = QUIET_PRESETS[preset] ?? QUIET_PRESETS[0]; return min >= q.from || min < q.to; };

// waterAt: the minute of the day of the last glass (null: nothing today). snoozed: reminders put off until tomorrow ("Later today").
export const reminderStore = createStore(() => ({ waterAt: 13 * 60 as number | null, snoozed: {} as Partial<Record<ReminderKey, boolean>>, quiet: 0 }));

export type Reminder = { key: ReminderKey; text: string; action?: string };

// The reminders that are due right now, most important first. The meals reminder is shown by the meals card itself; the others are captions under their tiles.
export function useReminders(): Reminder[] {
  const { d } = useDomain();
  const { s: shell } = useShell();
  const rs = reminderStore.use();
  const { weighDays } = goalCardStore.use();
  const steps = useSteps();
  if (inQuiet(d.min, rs.quiet)) return [];
  const on = (k: ReminderKey) => shell.notif[k as keyof typeof shell.notif] !== false && !rs.snoozed[k];
  const out: Reminder[] = [];
  const missed = missedMeals(d);
  if (on('meals') && missed.length) { const m = MEALS.find((q) => q.id === missed[missed.length - 1]); if (m) out.push({ key: 'meals', text: reminderText.mealMissed(m.n), action: 'Log it' }); }
  if (on('water') && d.water < WATER_TARGET_L && d.min >= WAKE_MIN && d.min < SLEEP_MIN) {
    const since = rs.waterAt ?? WAKE_MIN;
    if (d.min - since >= WATER_GAP_MIN) out.push({ key: 'water', text: rs.waterAt == null ? reminderText.waterNone : reminderText.waterSince(fmtT(rs.waterAt).full), action: 'Add 250 ml' });
  }
  if (on('weight') && weighDays >= WEIGH_NUDGE_DAYS) out.push({ key: 'weight', text: reminderText.weight(weighDays), action: 'Log weight' });
  if (on('steps') && d.hc && d.min >= 14 * 60 && d.min < SLEEP_MIN) {
    const dayShare = Math.min(1, (d.min - WAKE_MIN) / (SLEEP_MIN - WAKE_MIN));
    if (steps.pct < 0.5 * dayShare) out.push({ key: 'steps', text: reminderText.steps });
  }
  return out;
}
export const useReminder = (k: ReminderKey) => useReminders().find((r) => r.key === k) ?? null;
