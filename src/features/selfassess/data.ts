// Self assessment: a few quick questions about habits, then measurements the member takes alone. The coach can enter the same form from his own app.

export type TestKey = 'weight' | 'waist' | 'hr' | 'toe' | 'pushups' | 'plank' | 'fat';
export type SelfEntry = { id: string; at: string; by: 'member' | 'coach'; answers: Record<string, string>; tests: Partial<Record<TestKey, number>> };

export const QUESTIONS: { k: string; label: string; options: string[] }[] = [
  { k: 'sleep', label: 'Sleep a night', options: ['Under 5 h', '5 to 6 h', '7 to 8 h', 'Over 8 h'] },
  { k: 'energy', label: 'Energy through the day', options: ['1', '2', '3', '4', '5'] },
  { k: 'stress', label: 'Stress', options: ['Low', 'Medium', 'High'] },
  { k: 'pain', label: 'Pain or injuries', options: ['None', 'Mild', 'Needs care'] },
  { k: 'food', label: 'Food', options: ['Mostly home', 'Mixed', 'Mostly outside'] },
  { k: 'water', label: 'Water a day', options: ['Under 1 L', '1 to 2 L', '2 to 3 L', 'Over 3 L'] },
  { k: 'steps', label: 'Steps a day', options: ['Under 4k', '4k to 8k', '8k to 12k', 'Over 12k'] },
];

// lower: a lower number is the better result
export const TESTS: { k: TestKey; label: string; unit: string; hint: string; lower: boolean; dp: number }[] = [
  { k: 'weight', label: 'Weight', unit: 'kg', hint: 'In the morning, before you eat.', lower: true, dp: 1 },
  { k: 'waist', label: 'Waist', unit: 'cm', hint: 'Around the navel, breathing out.', lower: true, dp: 0 },
  { k: 'hr', label: 'Resting heart rate', unit: 'bpm', hint: 'Sit still for 5 minutes. Count your pulse for 30 seconds and double it.', lower: true, dp: 0 },
  { k: 'toe', label: 'Toe touch', unit: 'cm', hint: 'Stand and reach down. How far your fingers are from your toes. 0 if you touch them.', lower: true, dp: 0 },
  { k: 'pushups', label: 'Push-ups', unit: '', hint: 'The most you can do in one go with good form.', lower: false, dp: 0 },
  { k: 'plank', label: 'Plank hold', unit: 's', hint: 'How long you can hold a straight plank.', lower: false, dp: 0 },
  { k: 'fat', label: 'Body fat (optional)', unit: '%', hint: 'Only if you know it from a scale or from the gym.', lower: true, dp: 1 },
];

// The assessment the coach did on 30 Sep, so there is something to compare a first self assessment with.
export const COACH_SAMPLE: SelfEntry = {
  id: 'coach-1', at: '2026-09-30T10:00:00.000Z', by: 'coach',
  answers: { sleep: '7 to 8 h', energy: '3', stress: 'Medium', pain: 'None', food: 'Mixed', water: '1 to 2 L', steps: '4k to 8k' },
  tests: { weight: 72.4, waist: 89, hr: 72, toe: 6, pushups: 12, plank: 40, fat: 25.5 },
};

export const fmtAt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Each test both entries have, with the change and whether it is an improvement. */
export function compare(now: SelfEntry, prev: SelfEntry | undefined) {
  return TESTS.flatMap((t) => {
    const a = now.tests[t.k];
    if (a == null) return [];
    const b = prev?.tests[t.k];
    if (b == null) return [{ t, now: a, prev: undefined as number | undefined, diff: 0, good: false }];
    const diff = Math.round((a - b) * 10 ** t.dp) / 10 ** t.dp;
    return [{ t, now: a, prev: b, diff, good: t.lower ? diff < 0 : diff > 0 }];
  });
}
