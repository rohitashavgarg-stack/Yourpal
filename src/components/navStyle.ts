import { createStore } from '@/features/progress/store';

// Bottom navigation designs to compare. Picked in the edge-case panel ("Navigation style").
export type NavStyle = 'Pill' | 'Circles' | 'Linked circles';
export const NAV_STYLES: NavStyle[] = ['Pill', 'Circles', 'Linked circles'];
export const navStore = createStore(() => ({ style: 'Pill' as NavStyle }));
