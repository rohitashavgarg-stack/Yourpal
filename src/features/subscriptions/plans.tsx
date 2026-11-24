import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, Dumbbell, Leaf } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { Chip } from '@/design-system/primitives/Chip';
import { Pill } from '@/design-system/primitives/Pill';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { CornerGlow } from '@/features/progress/parts';
import { rupees } from '@/features/reports/payments';
import { haptic } from '@/lib/haptics';
import { Plan, SubKind, dateText, saving, subStore } from '@/features/subscriptions/data';

/** The colour that tells the two kinds apart: Fitness is orange (activity), Wellness is green (nutrition). Tints for both themes. */
export function useKindColors(kind: SubKind) {
  const { c } = useTheme();
  return kind === 'Fitness' ? { fg: c.cAct, bg: c.tAct } : { fg: c.cNutri, bg: c.tNutri };
}

export function KindBadge({ kind, size = 44 }: { kind: SubKind; size?: number }) {
  const k = useKindColors(kind);
  const Icon = kind === 'Fitness' ? Dumbbell : Leaf;
  return <IconBadge size={size} radius={radii.md} bg={k.bg}><Icon size={Math.round(size * 0.5)} color={k.fg} /></IconBadge>;
}

/** The price: the amount large, the old price struck through, and what the offer saves, in words. */
export function PlanPrice({ p, big }: { p: Plan; big?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Row style={{ alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <Txt accessibilityLabel={`${rupees(p.price)} for ${p.days} days`} style={{ fontFamily: font.displayBold, fontSize: big ? fontSizes.xl5 : fontSizes.xl3, lineHeight: big ? 44 : 34, letterSpacing: -0.8 }}>{rupees(p.price)}</Txt>
        <Txt accessibilityLabel={`was ${rupees(p.was)}`} style={{ fontSize: fontSizes.base, lineHeight: 23, color: c.muted, textDecorationLine: 'line-through' }}>{rupees(p.was)}</Txt>
        <Txt muted>{`for ${p.days} days`}</Txt>
      </Row>
      <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20, color: c.accentText }}>{`You save ${rupees(saving(p))}`}</Txt>
    </View>
  );
}

/** One plan on the Available tab: what it is, three of what it includes, the price, and one button that opens the plan. */
export function PlanCard({ p }: { p: Plan }) {
  const { c } = useTheme();
  const k = useKindColors(p.kind);
  const more = p.benefits.length - 3;
  return (
    <View style={{ position: 'relative', zIndex: 0, borderRadius: radii.xl, backgroundColor: c.cardLift, padding: 18, gap: 16, overflow: 'hidden' }}>
      <CornerGlow color={k.fg} size={280} side="right" />
      <CardEdge radius={radii.xl} />
      <Row style={{ gap: 12 }}>
        <KindBadge kind={p.kind} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20, color: k.fg }}>{p.kind}</Txt>
          <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.5 }}>{p.name}</Txt>
        </View>
        <Chip label={`${p.days} days`} />
      </Row>
      <Txt muted>{p.tagline}</Txt>
      <View style={{ gap: 8 }}>
        {p.benefits.slice(0, 3).map((b) => (
          <Row key={b} style={{ gap: 10 }}>
            <Check size={16} color={c.good} />
            <Txt style={{ flex: 1, fontSize: fontSizes.md, lineHeight: 20 }}>{b}</Txt>
          </Row>
        ))}
        {more > 0 ? <Txt v="caption" style={{ fontSize: fontSizes.sm, paddingLeft: 26 }}>{`and ${more} more`}</Txt> : null}
      </View>
      <PlanPrice p={p} />
      <Button label="View plan" onPress={() => router.push({ pathname: '/profile/subscription-plan', params: { id: p.id } })} />
    </View>
  );
}

type Method = 'UPI' | 'Card';

/** Review and pay. The summary, how to pay, then one button with the amount. Paying opens the result page: payment successful or payment failed. */
export function BuyPlanSheet({ p }: { p: Plan }) {
  const { c } = useTheme();
  const { closeSheet } = useOverlay();
  const [method, setMethod] = useState<Method>('UPI');
  const [paying, setPaying] = useState(false);
  const [now] = useState(() => Date.now());
  const end = new Date(now + p.days * 86400000);
  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      const ok = subStore.get().pay === 'Succeeds';
      if (ok) subStore.set((s) => ({ bought: s.bought.includes(p.id) ? s.bought : [...s.bought, p.id] }));
      ok ? haptic.success() : haptic.error();
      closeSheet(() => router.push({ pathname: '/profile/subscription-pay', params: { id: p.id, status: ok ? 'ok' : 'failed', method } }));
    }, 900);
  };
  const row = (l: string, v: string, last?: boolean) => (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      <Txt muted>{l}</Txt>
      <Txt style={{ fontFamily: font.semibold }}>{v}</Txt>
    </Row>
  );
  return (
    <>
      <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.5 }}>Review and pay</Txt>
      <View>
        {row('Plan', p.name)}
        {row('Starts', 'Today')}
        {row('Active till', dateText(end))}
        {row('Total', rupees(p.price), true)}
      </View>
      <View style={{ gap: 8 }}>
        <Txt v="label" style={{ paddingHorizontal: 6 }}>PAY WITH</Txt>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 8 }}>
          {(['UPI', 'Card'] as Method[]).map((m) => <Pill key={m} label={m} on={method === m} onPress={() => setMethod(m)} />)}
        </View>
      </View>
      <Button label={paying ? 'Paying' : `Pay ${rupees(p.price)}`} disabled={paying} onPress={pay} />
      <Txt v="caption" style={{ textAlign: 'center', fontSize: fontSizes.sm }}>You can cancel any time in Subscriptions. The plan keeps working till the date above.</Txt>
    </>
  );
}
