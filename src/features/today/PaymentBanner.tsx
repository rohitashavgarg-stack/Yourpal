import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CircleCheck, Clock, Pause, X } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// Membership is view-only in the app: this only tells the member what is going on and points to the membership page.
// One card design for the membership everywhere (the Today banner and the Gym tab card), full card width:
// title = what is happening, line = what it means, act = what to do, as quiet info text on its own line (it is not a button). Never "text · text" in one line.
// When the membership has ended, logging and the other member features pause, and the card says so.
// once: a one-time notice (it is ending or has ended): the member can cross it away. A paused membership is never dismissible: it stays at the top.
type Notice = { icon: 'clock' | 'pause' | 'ok'; tone: 'warn' | 'plain'; title: string; line: string; act?: string; once?: boolean };
const ACT = 'Renew at Wulf Fitness reception.';

export function useMembershipNotice(): Notice {
  const { d } = useDomain();
  switch (d.membership) {
    case 'Expiring': return { icon: 'clock', tone: 'warn', once: true, title: 'Membership ends in 12 days', line: 'Expires on 6 Oct.', act: ACT };
    case 'Expired': return { icon: 'pause', tone: 'warn', title: 'Membership expired', line: 'Logging and other features are paused. Your history is safe.', act: ACT };
    default: return { icon: 'ok', tone: 'plain', title: 'Annual plan is active', line: 'Expires on 14 Oct 2027.', act: 'Renew early at Wulf Fitness reception.' };
  }
}

// Today only shows it when something needs attention.
export function usePaymentNotice() {
  const { d } = useDomain();
  const n = useMembershipNotice();
  // only an ended membership gets the strip (it stays at the top); "ends in 12 days" is a card in the updates stack
  if (!d.hasGym || d.membership !== 'Expired') return null;
  return n;
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
  const { d, set } = useDomain();
  const n = usePaymentNotice();
  if (!n) return null;
  const Icon = n.icon === 'pause' ? Pause : Clock;
  const cross = () => set((x) => ({ dismissed: { ...x.dismissed, ['membership-' + d.membership]: true } }));
  return (
    <View style={{ marginHorizontal: -16, backgroundColor: c.warnSoft, flexDirection: 'row', alignItems: 'center' }}>
      <Pressy accessibilityRole="button" accessibilityLabel={`${n.title}. ${n.line} View plan`} onPress={() => router.push('/gym/membership')} scaleTo={1}
        style={{ flex: 1, paddingVertical: 14, paddingLeft: 16, paddingRight: n.once ? 4 : 16 }}>
        <Row style={{ gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: c.warn + '2E', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={c.warn} /></View>
          <View style={{ flex: 1, gap: 1 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: c.ink }}>{n.title}</Txt>
            <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>{n.line}</Txt>
          </View>
          <View style={{ minHeight: 40, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: c.ink + '55', alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.medium, fontSize: 14, lineHeight: 20, color: c.ink }}>View plan</Txt>
          </View>
        </Row>
      </Pressy>
      {n.once && (
        <Pressy accessibilityRole="button" accessibilityLabel="Dismiss" onPress={cross} scaleTo={0.9} style={{ width: 44, height: 44, marginRight: 4, alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} color={c.muted} />
        </Pressy>
      )}
    </View>
  );
}
