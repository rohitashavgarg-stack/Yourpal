import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, CreditCard } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// Membership is view-only in the app: this only tells the member what is going on and points to the membership page.
// Shown above everything else on Today, and only when something needs attention.
export function usePaymentNotice() {
  const { d } = useDomain();
  if (!d.hasGym) return null;
  switch (d.membership) {
    case 'Expiring': return { tone: 'accent' as const, title: 'Membership expires in 12 days', sub: 'Annual · ends 6 Oct · renew at the front desk' };
    case 'Grace': return { tone: 'warn' as const, title: 'Membership expired 3 days ago', sub: 'Logging stays open 11 more days · renew at the front desk' };
    case 'Grace over': return { tone: 'muted' as const, title: 'Logging is paused', sub: 'Your history is safe · renew at the front desk to log again' };
    default: return null;
  }
}

export function PaymentBanner() {
  const { c } = useTheme();
  const n = usePaymentNotice();
  if (!n) return null;
  const fg = n.tone === 'warn' ? c.warn : n.tone === 'accent' ? c.accentText : c.ink;
  const bg = n.tone === 'warn' ? c.warnSoft : n.tone === 'accent' ? c.accentSoft : c.surface2;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${n.title}. ${n.sub}. View membership`} onPress={() => router.push('/gym/membership')} scaleTo={0.98}
      style={{ borderRadius: 20, backgroundColor: bg, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}><CreditCard size={18} color={fg} /></View>
        <View style={{ flex: 1, gap: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: fg }}>{n.title}</Txt>
          <Txt style={{ fontSize: 13, lineHeight: 19, color: fg, opacity: 0.85 }}>{n.sub}</Txt>
        </View>
        <ChevronRight size={18} color={fg} />
      </Row>
    </Pressy>
  );
}
