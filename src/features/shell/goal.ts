// Goal model shared by the Goal page and the Profile row summary.
export const GOALS = ['Weight loss', 'Muscle gain', 'Lean body', 'Strength', 'Flexibility', 'Agility', 'General fitness', 'Not sure yet'] as const;
export const GOAL2 = ['Flexibility', 'General fitness', 'Strength', 'None'] as const;
export const GDEF: Record<string, number> = { 'Weight loss': 6, 'Muscle gain': 3, 'Lean body': 3, Strength: 80, 'General fitness': 4 };
export const GVERB: Record<string, string> = { 'Weight loss': 'Lose (kg)', 'Muscle gain': 'Gain (kg)', 'Lean body': 'Lower body fat (%)', Strength: 'Squat target (kg)', 'General fitness': 'Train (days a week)' };
export const BYS = ['No date', '30 Nov', '15 Dec', '15 Mar', '15 Jun'];

export const isNumeric = (type: string) => GDEF[type] !== undefined;
export const goalStep = (type: string) => (type === 'Strength' ? 2.5 : 1);

export function goalSummary(g: { type: string; target: number; by: string }) {
  const pre: Record<string, string> = { 'Weight loss': 'lose ', 'Muscle gain': 'gain ' };
  const unit: Record<string, string> = { 'Weight loss': ' kg', 'Muscle gain': ' kg', Strength: ' kg squat', 'Lean body': '% body fat', 'General fitness': ' days a week' };
  return g.type + (isNumeric(g.type) ? ` · ${pre[g.type] ?? ''}${g.target}${unit[g.type] ?? ''}` : '') + (g.by && g.by !== 'No date' ? ` by ${g.by}` : '');
}

export function goalNote(type: string, val: number): { text: string; warn?: boolean } | null {
  if (type === 'Not sure yet') return { text: "We'll use general fitness until you decide with Coach Vikram." };
  if (type === 'Flexibility' || type === 'Agility') return { text: 'Measured with assessment tests (deep squat hold, sit-and-reach, shuttle run). Coach Vikram sets the targets with you.' };
  if (type === 'Weight loss' && val > 15) return { text: "That's a big target. Coach Vikram may suggest milestones on the way.", warn: true };
  return null;
}
