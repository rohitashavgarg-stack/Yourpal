import { Range, sod, TODAY } from './trends';

export { createStore } from '@/lib/createStore';
import { createStore } from '@/lib/createStore';

export type LiftName = 'Bench press' | 'Squat' | 'Leg press';

export const progressStore = createStore(() => ({
  range: 'week' as Range,
  anchor: sod(TODAY).getTime(), // any day inside the window being viewed
  data: 'Normal' as 'Normal' | 'New member',
  hidden: 'None' as 'None' | 'Water & steps',
  loading: false,
  refreshing: false,
  lift: 'Leg press' as LiftName,
  metric: 0 as 0 | 1 | 2,
  stallGone: false,
  photos: [{ d: 'Sep 2' }, { d: 'Sep 30' }] as { d: string; fresh?: boolean }[],
}));
