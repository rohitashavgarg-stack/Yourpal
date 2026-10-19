import { createStore } from '@/lib/createStore';

// Account facts the gym sets (members cannot pay, lift a freeze or lift a suspension in the app). Only the demo panel changes them for now.
export const acctStore = createStore(() => ({ in48: false, overdue: false, suspended: false, freezeScheduled: false }));
