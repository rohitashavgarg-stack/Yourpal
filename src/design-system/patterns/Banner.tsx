import React from 'react';
import { View } from 'react-native';
import { CircleCheck, Clock, Pause, X } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font, fontSizes, radii } from '@/design-system/tokens';

export type BannerIcon = 'clock' | 'pause' | 'ok';
export type BannerVariant = 'strip' | 'card';
export type BannerProps = {
  /** strip: edge to edge under the header on Today. card: a full width card on the Gym tab and in the updates stack. */
  variant: BannerVariant;
  icon: BannerIcon;
  /** warn: amber. plain: the neutral surface with a green icon. A strip is always amber. */
  tone: 'warn' | 'plain';
  /** What is happening. */
  title: string;
  /** What it means. */
  line: string;
  /** What to do, as quiet text on its own line. Only the card shows it. */
  act?: string;
  /** A one-time notice the member can cross away (strip only). */
  once?: boolean;
  onPress: () => void;
  onDismiss?: () => void;
};

/**
 * The account banner: what is going on with the membership, and a way to open the plan. It is information, not a form.
 * Membership is view-only in the app, so the action is always "open the plan".
 */
export function Banner({ variant, icon, tone, title, line, act, once, onPress, onDismiss }: BannerProps) {
  const { c } = useTheme();
  if (variant === 'strip') {
    const Icon = icon === 'pause' ? Pause : Clock;
    return (
      <View style={{ marginHorizontal: -16, backgroundColor: c.warnSoft, flexDirection: 'row', alignItems: 'center' }}>
        <Pressy accessibilityRole="button" accessibilityLabel={`${title}. ${line} View plan`} onPress={onPress} scaleTo={1}
          style={{ flex: 1, paddingVertical: 14, paddingLeft: 16, paddingRight: once ? 4 : 16 }}>
          <Row style={{ gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: radii.sm, backgroundColor: c.warn + '2E', alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={c.warn} /></View>
            <View style={{ flex: 1, gap: 1 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21, color: c.ink }}>{title}</Txt>
              <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{line}</Txt>
            </View>
            <View style={{ minHeight: 40, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: c.ink + '55', alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, lineHeight: 20, color: c.ink }}>View plan</Txt>
            </View>
          </Row>
        </Pressy>
        {once && (
          <Pressy accessibilityRole="button" accessibilityLabel="Dismiss" onPress={onDismiss} scaleTo={0.9} style={{ width: 44, height: 44, marginRight: 4, alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color={c.muted} />
          </Pressy>
        )}
      </View>
    );
  }
  const warn = tone === 'warn';
  const Icon = icon === 'pause' ? Pause : icon === 'ok' ? CircleCheck : Clock;
  const fg = warn ? c.warn : c.good;
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${title}. ${line} ${act ?? ''} See plan`} onPress={onPress} scaleTo={0.98}
      style={{ alignSelf: 'stretch', borderRadius: 20, backgroundColor: warn ? c.warnSoft : c.surface, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Row style={{ gap: 12, alignItems: 'flex-start' }}>
        <View style={{ width: 36, height: 36, borderRadius: radii.sm, backgroundColor: fg + '2E', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={fg} /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21, color: c.ink }}>{title}</Txt>
          <Txt style={{ fontSize: fontSizes.sm, lineHeight: 19, color: c.ink, opacity: 0.8 }}>{line}</Txt>
          {!!act && <Txt muted style={{ fontSize: fontSizes.xs, lineHeight: 17, marginTop: 2 }}>{act}</Txt>}
        </View>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 21, color: c.ink, textDecorationLine: 'underline' }}>See plan</Txt>
      </Row>
    </Pressy>
  );
}
