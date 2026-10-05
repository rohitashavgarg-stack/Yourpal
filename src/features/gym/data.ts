import type { Palette } from '@/theme/tokens';
import type { Domain } from '@/lib/domain';

// Membership is VIEW-ONLY in the app: renewals and freezes happen at the front desk.
export function membershipView(m: Domain['membership'], c: Palette) {
  return {
    Active: { t: 'Annual · active', sub: 'Expires 14 Oct 2027', bg: c.surface, fg: c.ink, rt: 'Active till 14 Oct 2027', rs: 'Renew early at the front desk. The new period starts after this one ends.', rbg: c.surface, rfg: c.ink, ends: '14 Oct 2027' },
    Expiring: { t: 'Expires in 12 days', sub: 'Annual · ends 6 Oct · renew at the front desk', bg: c.accent, fg: '#FFFFFF', rt: 'Expires in 12 days', rs: 'Renew at the front desk before 6 Oct to keep your plan and logging without a gap.', rbg: c.accentSoft, rfg: c.accentText, ends: '6 Oct' },
    Grace: { t: 'Expired 3 days ago', sub: 'Grace period · logging open 11 more days · renew at the front desk', bg: c.warnSoft, fg: c.warn, rt: 'Expired 3 days ago', rs: 'Grace period: history and logging stay open for 11 more days. Renew at the front desk.', rbg: c.warnSoft, rfg: c.warn, ends: '21 Sep' },
    'Grace over': { t: 'Logging paused', sub: 'History is still here · renew at the front desk to log again', bg: c.surface2, fg: c.ink, rt: 'Grace period ended', rs: 'Your history stays visible. Logging resumes as soon as the front desk renews you.', rbg: c.surface2, rfg: c.ink, ends: '21 Sep' },
  }[m];
}

// September attendance: c = check-in, h = home workout, p = PT session, a = PT awaiting confirmation, x = visit with nothing logged
export const VISITS: Record<number, string> = { 1: 'c', 2: 'c', 3: 'c', 4: 'c', 6: 'c', 7: 'c', 8: 'c', 9: 'c', 10: 'c', 11: 'c', 13: 'x', 14: 'c', 15: 'c', 16: 'c', 18: 'h', 20: 'c', 22: 'p', 23: 'a', 24: 'c' };

export const ASSESS = [
  { g: 'Body', tone: 'nutri', rows: [['Weight', '74.5 kg', '72.4 kg', '−2.1 kg', 1], ['Waist', '92 cm', '89 cm', '−3 cm', 1], ['Body fat', '27%', '25.5%', '−1.5%', 1]] },
  { g: 'Strength', tone: 'act', rows: [['Squat · 5 reps', '40 kg', '60 kg', '+20 kg', 1], ['Push-ups · 1 set', '12', '18', '+6', 1]] },
  { g: 'Mobility & fitness', tone: 'heart', rows: [['Deep squat hold', '30 s', '45 s', '+15 s', 1], ['Sit-and-reach', '−4 cm', '−4 cm', 'Same', 0], ['Resting heart rate', '78 bpm', '72 bpm', '−6 bpm', 1]] },
] as { g: string; tone: 'nutri' | 'act' | 'heart'; rows: [string, string, string, string, number][] }[];

export const STAR_WORDS = ['Tap a star to rate', 'Not great', 'Could be better', 'Good', 'Great', 'Excellent'];
export const FLAG_REASONS = ["I wasn't there", 'Wrong date or time', 'Session was cut short'];
export const BREAK_REASONS = ['Travel', 'Work', 'Family', 'Other'];
export const PT_TOTAL = 12;
export const PAUSE_TOTAL = 2;
export const PAUSE_HISTORY = [
  { from: '14 Jul', to: '27 Jul', days: 14, reason: 'Travel' },
  { from: '2 Sep', to: '8 Sep', days: 7, reason: 'Family' },
];
