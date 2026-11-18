import { createStore } from '@/features/progress/store';

// A PT package invitation: Coach Vikram builds a package and sends it. Nothing is active until the member accepts.
// waiting: the member has not answered. accepted: the package is theirs and starts when the current one ends. declined: it stays in Past as Declined.
// Sample data; the real invitation comes from the trainer.
export type PtInviteState = 'none' | 'waiting' | 'accepted' | 'declined';
export const ptInviteStore = createStore(() => ({ state: 'waiting' as PtInviteState, reason: '' }), 'ptInvite');

export const PT_INVITE = {
  name: 'Strength block',
  trainer: 'Coach Vikram',
  sessions: 8,
  validDays: 60,
  price: 8000,
  activeFrom: '24 Sep', // accepting makes it the active package from today
  endsOn: '23 Nov',
  note: 'Eight sessions to build your lifts.',
};

export const DECLINE_REASONS = ['Not now', 'Too many sessions', 'Price', 'Another trainer'];
