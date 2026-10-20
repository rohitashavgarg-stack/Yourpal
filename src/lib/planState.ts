import { createStore } from '@/lib/createStore';

// Whether the coach has assigned this member a workout plan and a diet plan. Without them the member only tracks: weight, water and whatever
// Apple Health or a wearable sends. Only the demo panel changes it for now.
export const planStore = createStore(() => ({ assigned: true }));
