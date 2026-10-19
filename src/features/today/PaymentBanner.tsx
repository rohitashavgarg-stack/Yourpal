import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CalendarClock, CircleAlert, CircleCheck, Clock, Lock, Pause } from '@/lib/icons';
import { acctStore } from '@/lib/acct';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// Membership is view-only in the app: this only tells the member what is going on and points to the membership page.
// One card design for the membership everywhere (the Today banner and the Gym tab card), full card width:
// title = what is happening, line = what it means, act = what to do, as quiet info text on its own line (it is not a button). Never "text · text" in one line.
// When the membership has ended, logging and the other member features pause, and the card says so.
// Account banner on Today: information only (members cannot pay or lift a freeze in the app), never dismissible, one at a time.
// Precedence: expired, paused or frozen, expiring. Colour is always paired with an icon and words.
type Notice = { icon: 'clock' | 'pause' | 'ok'; tone: 'warn' | 'plain'; title: string; line: string; act?: string };
const ACT = 'Renew at Wulf Fitness reception.';

export function useMembershipNotice(): Notice {
  const { d } = useDomain();
  switch (d.membership) {
    case 'Expiring': return { icon: 'clock', tone: 'warn', title: 'Membership ends in 10 days', line: 'Expires on 6 Oct.', act: ACT };
    case 'Grace': return { icon: 'clock', tone: 'warn', title: 'Membership expired 3 days ago', line: 'Logging and other features pause in 11 days.', act: ACT };
    case 'Grace over': return { icon: 'pause', tone: 'warn', title: 'Membership expired', line: 'Logging and other features are paused. Your history is safe.', act: ACT };
    default: return { icon: 'ok', tone: 'plain', title: 'Annual plan is active', line: 'Expires on 14 Oct 2027.', act: 'Renew early at Wulf Fitness reception.' };
  }
}

// Today's banner: one line of information. Colour always comes with an icon and words.
// red = urgent (48 hours, overdue, expired), amber = expiring in 10 days, blue = freeze scheduled, grey = paused, frozen or suspended.
type Tone = 'red' | 'amber' | 'blue' | 'grey';
type Banner = { icon: any; tone: Tone; title: string; link?: string };

// Every account notice that applies, highest precedence first: suspended, expired, overdue, paused, 48 hours, 10 days, freeze scheduled.
function useAccountNotices(): Banner[] {
  const { d } = useDomain();
  const a = acctStore.use();
  if (!d.hasGym) return [];
  const out: Banner[] = [];
  if (a.suspended) out.push({ icon: Lock, tone: 'grey', title: 'Your membership is suspended. Contact the gym' });
  if (d.membership === 'Grace' || d.membership === 'Grace over') out.push({ icon: CircleAlert, tone: 'red', title: 'Membership expired on 30 Nov' });
  if (a.overdue) out.push({ icon: CircleAlert, tone: 'red', title: 'Payment overdue.', link: 'View invoice' });
  if (d.hold !== 'None') out.push({ icon: Pause, tone: 'grey', title: 'Membership paused. Resumes 8 Oct' });
  if (a.in48) out.push({ icon: Clock, tone: 'red', title: 'Membership ends in 48 hours' });
  if (d.membership === 'Expiring') out.push({ icon: Clock, tone: 'amber', title: 'Membership ends 29 Oct (10 days left)' });
  if (a.freezeScheduled) out.push({ icon: CalendarClock, tone: 'blue', title: 'Freeze starts 8 Oct, 30 days' });
  return out;
}

export function usePaymentNotice(): (Banner & { more: number }) | null {
  const all = useAccountNotices();
  return all.length ? { ...all[0], more: all.length - 1 } : null;
}

export function MembershipCard({ n }: { n: Notice }) {
  const { c } = useTheme();
  const warn = n.tone === 'warn';
  const Icon = n.icon === 'pause' ? Pause : n.icon === 'ok' ? CircleCheck : Clock;
  const fg = warn ? c.warn : c.good;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${n.title}. ${n.line} ${n.act ?? ''} See plan`} onPress={() => router.push('/gym/membership')} scaleTo={0.98}
      style={{ alignSelf: 'stretch', borderRadius: 20, backgroundColor: warn ? c.warnSoft : c.surface, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ gap: 12, alignItems: 'flex-start' }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: fg + '2E', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={fg} /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: c.ink }}>{n.title}</Txt>
          <Txt style={{ fontSize: 13, lineHeight: 19, color: c.ink, opacity: 0.8 }}>{n.line}</Txt>
          {!!n.act && <Txt muted style={{ fontSize: 12, lineHeight: 17, marginTop: 2 }}>{n.act}</Txt>}
        </View>
        <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 21, color: c.ink, textDecorationLine: 'underline' }}>See plan</Txt>
      </Row>
    </Pressy>
  );
}

// The strip at the top of Today: edge to edge under the header, the title and one sentence on the left, "View plan" on the right.
// (The "what to do" line stays on the Gym tab card; the strip only says what is happening and what it means.)
export function PaymentBanner() {
  const { c } = useTheme();
  const n = usePaymentNotice();
  if (!n) return null;
  const col = { red: c.danger, amber: c.warn, blue: c.accentText, grey: c.muted }[n.tone];
  const Icon = n.icon;
  return (
    <View style={{ borderRadius: 18, backgroundColor: col + '1F', borderWidth: 1, borderColor: col + '4D' }}>
      <Pressy accessibilityRole="button" accessibilityLabel={n.title + (n.link ? ' ' + n.link : '')} onPress={() => router.push('/gym/membership')} scaleTo={0.99}
        style={{ minHeight: 52, paddingVertical: 10, paddingHorizontal: 14 }}>
        <Row style={{ gap: 12 }}>
          <Icon size={19} color={col} />
          <Txt style={{ flex: 1, fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: col }}>
            {n.title}{n.link ? ' ' : ''}{n.link ? <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: col, textDecorationLine: 'underline' }}>{n.link}</Txt> : null}
          </Txt>
        </Row>
      </Pressy>
      {n.more > 0 && (
        <Pressy accessibilityRole="button" onPress={() => router.push('/gym/membership')} scaleTo={1} style={{ minHeight: 40, paddingHorizontal: 14, marginTop: -6, justifyContent: 'center' }}>
          <Txt muted style={{ fontSize: 13, lineHeight: 19, textDecorationLine: 'underline' }}>{n.more === 1 ? '1 more account notice' : `${n.more} more account notices`}</Txt>
        </Pressy>
      )}
    </View>
  );
}
