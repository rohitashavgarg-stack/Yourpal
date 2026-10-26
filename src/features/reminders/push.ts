import { Platform } from 'react-native';
import { createStore } from '@/lib/createStore';
import { inQuiet, Reminder } from './reminders';

// The phone notification for a reminder: the same words as the in-app one. It is only sent when the phone allows notifications, the member has not
// turned this reminder off, and it is not quiet hours. In this prototype the clock is simulated, so "Send reminder push" previews it with a banner.
export const pushStore = createStore(() => ({ shown: null as null | { key: string; title: string; body: string; at: number } }), 'push');

export type PushResult = 'sent' | 'quiet' | 'blocked' | 'none';
export async function sendReminderPush(r: Reminder | undefined, ctx: { min: number; quiet: number; permission: 'on' | 'off' | 'unset' }): Promise<PushResult> {
  if (!r) return 'none';
  if (ctx.permission !== 'on') return 'blocked';
  if (inQuiet(ctx.min, ctx.quiet)) return 'quiet';
  const title = 'YourPal';
  pushStore.set({ shown: { key: r.key, title, body: r.text, at: Date.now() } });
  if (Platform.OS !== 'web') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const N = require('expo-notifications');
      await N.scheduleNotificationAsync({ content: { title, body: r.text }, trigger: null });
    } catch { /* the in-app banner is still shown */ }
  }
  return 'sent';
}
