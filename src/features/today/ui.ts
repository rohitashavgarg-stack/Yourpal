import { createStore } from '@/lib/createStore';

// Which Today layout is showing. Current = the cards as they have been. New = greeting, slim goal strip, one "For you" stack,
// Right now, trackers, then the plan. Switched from the edge-case panel.
export type TodayLayout = 'Current' | 'New';
export const todayUiStore = createStore(() => ({ layout: 'Current' as TodayLayout }));
