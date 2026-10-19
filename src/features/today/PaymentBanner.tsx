import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Clock, Pause } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// Membership is view-only in the app: this only tells the member what is going on and points to the membership page.
// Shown at the very top of Today (above the goal and the stack), and only when something needs attention.
// When the membership has ended, logging and the other member features pause, and the banner says so.
export function usePaymentNotice() {
  const { d } = useDomain();
  if (!d.hasGym) return null;
  // title = what happened, line = what it means, act = what to do, as quiet info text on its own line (it is not a button). Never "text · text" in one line.
  const act = 'Renew at Wulf Fitness reception.';
  switch (d.membership) {
    case 'Expiring': return { icon: 'clock' as const, title: 'Membership ends in 12 days', line: 'Expires on 6 Oct.', act };
    case 'Grace': return { icon: 'clock' as const, title: 'Membership expired 3 days ago', line: 'Logging and other features pause in 11 days.', act };
    case 'Grace over': return { icon: 'pause' as const, title: 'Membership expired', line: 'Logging and other features are paused. Your history is safe.', act };
    default: return null;
  }
}

export function PaymentBanner() {
  const { c } = useTheme();
  const n = usePaymentNotice();
  if (!n) return null;
  const Icon = n.icon === 'pause' ? Pause : Clock;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${n.title}. ${n.line} ${n.act}. See plan`} onPress={() => router.push('/gym/membership')} scaleTo={0.98}
      style={{ borderRadius: 20, backgroundColor: c.warnSoft, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ gap: 12, alignItems: 'flex-start' }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.warn + '2E', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={c.warn} /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: c.ink }}>{n.title}</Txt>
          <Txt style={{ fontSize: 13, lineHeight: 19, color: c.ink, opacity: 0.8 }}>{n.line}</Txt>
          <Txt muted style={{ fontSize: 12, lineHeight: 17, marginTop: 2 }}>{n.act}</Txt>
        </View>
        <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 21, color: c.ink, textDecorationLine: 'underline' }}>See plan</Txt>
      </Row>
    </Pressy>
  );
}
