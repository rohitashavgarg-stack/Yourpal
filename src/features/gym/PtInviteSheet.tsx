import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { radii, fontSizes, fixed, onDark as onDarkTokens } from '@/design-system/tokens';
import { CornerGlow } from '@/features/progress/parts';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { Mail } from '@/lib/icons';
import { DECLINE_REASONS, PT_INVITE, ptInviteStore } from '@/features/gym/ptInvite';

const H = { fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.5 } as const;

/** Accept the invitation: the package is the member's and starts the day after the current one ends. Coach Vikram is told. */
export function useAcceptPtInvite() {
  const { toast } = useOverlay();
  return () => {
    ptInviteStore.set({ state: 'accepted' });
    haptic.success();
    toast(`Accepted. ${PT_INVITE.name} is now your active package. ${PT_INVITE.trainer} notified`);
  };
}

/** Say no: an optional reason, then the invitation moves to Past as Declined. */
export function DeclinePtSheet() {
  const { closeSheet, toast } = useOverlay();
  const [reason, setReason] = useState<string | null>(null);
  return (
    <>
      <Txt style={H}>Decline this invitation?</Txt>
      <Txt muted>{`${PT_INVITE.trainer} will see that you declined ${PT_INVITE.name}. You can tell him why.`}</Txt>
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {DECLINE_REASONS.map((l) => <Pill key={l} label={l} on={reason === l} onPress={() => setReason(reason === l ? null : l)} />)}
      </View>
      <Button label="Decline invitation" onPress={() => closeSheet(() => {
        ptInviteStore.set({ state: 'declined', reason: reason ?? '' });
        haptic.medium();
        toast(`Declined. ${PT_INVITE.trainer} notified`);
      })} />
      <Button kind="secondary" label="Cancel" onPress={() => closeSheet()} />
    </>
  );
}

/** What the package is, as plain text with no boxes: each number large with its small label beside it, a thin divider between. */
export function PtInviteFacts({ onDark = false }: { onDark?: boolean }) {
  const { c } = useTheme();
  const muted = onDark ? onDarkTokens.soft : c.ink;
  const ink = onDark ? onDarkTokens.text : c.ink;
  const facts: [string, string][] = [[String(PT_INVITE.sessions), 'sessions'], [String(PT_INVITE.validDays), 'days valid']];
  return (
    <View style={{ gap: 10 }}>
      <Row style={{ gap: 16, alignItems: 'center' }}>
        {facts.map(([v, l], i) => (
          <React.Fragment key={l}>
            {i > 0 ? <View style={{ width: 1, height: 28, backgroundColor: onDark ? 'rgba(255,255,255,0.2)' : c.line }} /> : null}
            <View accessible accessibilityLabel={`${v} ${l}`} style={{ flexDirection: 'row', gap: 6, alignItems: 'baseline' }}>
              <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl3, lineHeight: 34, letterSpacing: -0.6, color: ink }}>{v}</Txt>
              <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, color: muted }}>{l}</Txt>
            </View>
          </React.Fragment>
        ))}
      </Row>
    </View>
  );
}

/** The invitation as a card, at the top of the PT packages page: the package details on the card, then Reject and Accept. */
export function PtInviteCard() {
  const { c } = useTheme();
  const { openSheet } = useOverlay();
  const accept = useAcceptPtInvite();
  return (
    <View style={{ position: 'relative', zIndex: 0, borderRadius: radii.xl, padding: 18, gap: 16, overflow: 'hidden', backgroundColor: c.cardLift }}>
      <CornerGlow color={c.accent} size={300} side="left" />
      <CardEdge radius={radii.xl} />
      <Row style={{ gap: 14 }}>
        <IconBadge size={52} radius={radii.lg} bg={c.accent}><Mail size={26} color={fixed.white} /></IconBadge>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20, color: c.ink }}>{`${PT_INVITE.trainer} invited you`}</Txt>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.5 }}>{PT_INVITE.name}</Txt>
        </View>
      </Row>
      <PtInviteFacts />
      <Row style={{ gap: 10 }}>
        <View style={{ flex: 1 }}><Button kind="grey" label="Reject" onPress={() => openSheet(<DeclinePtSheet />, { label: 'Decline invitation' })} /></View>
        <View style={{ flex: 1 }}><Button label="Accept" onPress={accept} /></View>
      </Row>
    </View>
  );
}
