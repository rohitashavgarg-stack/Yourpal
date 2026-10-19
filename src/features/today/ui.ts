import { createStore } from '@/lib/createStore';

// Which Today layout is showing. Current = the cards as they have been. New = greeting, slim goal strip, one "For you" stack,
// Right now, trackers, then the plan. New is the default and the panel no longer switches it.
export type TodayLayout = 'Current' | 'New';
export const todayUiStore = createStore(() => ({ layout: 'New' as TodayLayout }));
