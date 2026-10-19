import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CircleCheck, Clock, Pause } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// Membership is view-only in the app: this only tells the member what is going on and points to the membership page.
// One card design for the membership everywhere (the Today banner and the Gym tab card), full card width:
// title = what is happening, line = what it means, act = what to do, as quiet info text on its own line (it is not a button). Never "text · text" in one line.
// When the membership has ended, logging and the other member features pause, and the card says so.
type Notice = { icon: 'clock' | 'pause' | 'ok'; tone: 'warn' | 'plain'; title: string; line: string; act?: string };
const ACT = 'Renew at Wulf Fitness reception.';

export function useMembershipNotice(): Notice {
  const { d } = useDomain();
  switch (d.membership) {
    case 'Expiring': return { icon: 'clock', tone: 'warn', title: 'Membership ends in 12 days', line: 'Expires on 6 Oct.', act: ACT };
    case 'Grace': return { icon: 'clock', tone: 'warn', title: 'Membership expired 3 days ago', line: 'Logging and other features pause in 11 days.', act: ACT };
    case 'Grace over': return { icon: 'pause', tone: 'warn', title: 'Membership expired', line: 'Logging and other features are paused. Your history is safe.', act: ACT };
    default: return { icon: 'ok', tone: 'plain', title: 'Annual plan is active', line: 'Expires on 14 Oct 2027.', act: 'Renew early at Wulf Fitness reception.' };
  }
}

// Today only shows it when something needs attention.
export function usePaymentNotice() {
  const { d } = useDomain();
  const n = useMembershipNotice();
  return d.hasGym && n.tone === 'warn' ? n : null;
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

// The banner at the top of Today.
export function PaymentBanner() {
  const n = usePaymentNotice();
  return n ? <MembershipCard n={n} /> : null;
}
