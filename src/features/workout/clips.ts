import { Ex, SetT } from '@/lib/data';

// Looping exercise clips (silent, about 6 s), keyed by exercise id. Only these videos are used in the new workout design: no pictures.
export const CLIPS: Record<string, number> = {
  dcr: require('../../../assets/exercises/crunch.mp4'),
  dlr: require('../../../assets/exercises/leg-raise-crunch.mp4'),
  dbe: require('../../../assets/exercises/back-extension.mp4'),
  dbc: require('../../../assets/exercises/ball-crunch.mp4'),
  dtd: require('../../../assets/exercises/triceps-dip.mp4'),
  dfs: require('../../../assets/exercises/front-squat.mp4'),
  dbp: require('../../../assets/exercises/bench-press.mp4'),
};

const S = (r: number, k: number, t = 0, w = false): SetT => ({ r, k, t, w, st: 'todo' });
// A demo workout made of exactly the exercises we have clips for. Opened from the edge-case panel.
export function clipDemoExercises(): Ex[] {
  return [
    { id: 'dcr', name: 'Crunch', mode: 'r', step: 1, muscles: 'Abs', cue: 'Hands behind your head, curl up with your abs, lower slowly.', alts: [], sets: [S(15, 0), S(15, 0), S(15, 0)] },
    { id: 'dlr', name: 'Lying leg-raise crunch', mode: 'r', step: 1, muscles: 'Abs · hip flexors', cue: 'Knees and chest meet in the middle. Do not swing.', alts: [], sets: [S(12, 0), S(12, 0), S(12, 0)] },
    { id: 'dbe', name: 'Back extension', mode: 'r', step: 1, muscles: 'Lower back · glutes', cue: 'Hinge at the hips, keep your back long, stop level with the floor.', alts: [], sets: [S(12, 0), S(12, 0), S(12, 0)] },
    { id: 'dbc', name: 'Stability-ball crunch', mode: 'r', step: 1, muscles: 'Abs · obliques', cue: 'Roll the ball under your lower back and crunch up slowly.', alts: [], sets: [S(15, 0), S(15, 0), S(15, 0)] },
    { id: 'dtd', name: 'Triceps dip', mode: 'r', step: 1, muscles: 'Triceps · chest · shoulders', cue: 'Lower until your elbows are at 90 degrees, press back up.', alts: [], sets: [S(10, 0), S(10, 0), S(10, 0)] },
    { id: 'dfs', name: 'Barbell front squat', mode: 'rw', step: 2.5, last: 'Last time: 3 × 8 · 37.5 kg', muscles: 'Quads · glutes · core', cue: 'Elbows high, chest up, sit down between your hips.', alts: [], sets: [S(8, 40, 0, true), S(8, 40), S(8, 40)] },
    { id: 'dbp', name: 'Barbell bench press', mode: 'rw', step: 2.5, last: 'Last time: 3 × 8 · 47.5 kg', muscles: 'Chest · shoulders · triceps', cue: 'Shoulder blades back and down, bar to mid-chest, press up.', alts: [], sets: [S(8, 50, 0, true), S(8, 50), S(8, 50)] },
  ];
}
