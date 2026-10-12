import { createStore } from '@/lib/createStore';

// Which workout screen to show. "New" is the full-screen clip with the sets in a bottom sheet; "Current" is the page as it was.
// Switch it from the edge-case panel.
export type WorkoutDesign = 'Current' | 'New';
export const workoutUiStore = createStore(() => ({ design: 'Current' as WorkoutDesign }));
