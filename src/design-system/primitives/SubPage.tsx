import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, X } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { ProgressiveBlur, useScrolled } from '@/components/Glass';
import { useToastLift } from '@/components/Overlay';
import { font, fontSizes } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';

/** Back to the previous screen, or replace with `fallback` when there is nothing to go back to. */
export const goBack = (fallback: string = '/(tabs)') => (router.canGoBack() ? router.back() : router.replace(fallback as any));

/**
 * Full-screen pushed page: a 44 px round glass back button (or close), a centred title, an optional right slot, a floating header
 * over the scrolling content, and an optional footer. One component for the two SubPages that existed (Profile and Settings pages,
 * and Progress, Gym and Goal pages). They differ in a few details, so those are the two `variant`s:
 *
 *   variant      shell (default)                              progress
 *   scroll       always                                       `scroll` prop (default true)
 *   gap          `gap` prop, default 12, children in a View   12, children directly
 *   bottom pad   footer ? 24 : 40 + safe area                 safe area + 28
 *   footer       in a bar with a top border                   rendered as given
 *   right slot   in a box of at least 44 px, aligned right    as given, or a 44 px spacer
 *   back icon    22 px (X when `close`)                       20 px
 *   toast lift   none                                         `toastLift` (default 24) above the safe area
 *   back         goBack(fallback)                             `onBack` first (return true when handled), then goBack(fallback)
 * Only `progress` supports `titleIcon` / `onTitlePress` / `onBack` / `scroll` / `toastLift`; only `shell` supports `close` / `gap`.
 */
export type SubPageProps = {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  fallback?: string;
  variant?: 'shell' | 'progress';
  // shell
  close?: boolean;
  gap?: number;
  // progress
  titleIcon?: React.ReactNode;
  onTitlePress?: () => void;
  scroll?: boolean;
  toastLift?: number;
  onBack?: () => boolean;
};

function ToastLift({ value }: { value: number }) { useToastLift(value); return null; }

export function SubPage({ title, children, right, footer, fallback, variant = 'shell', close, gap = 12, titleIcon, onTitlePress, scroll = true, toastLift = 24, onBack }: SubPageProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { scrolled, onScroll } = useScrolled();
  const shell = variant === 'shell';
  const headH = insets.top + 12 + 44 + 8;
  const useScroll = shell ? true : scroll;
  const back = () => { if (!shell && onBack?.()) return; goBack(fallback); };
  const header = (
    <Row style={[{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 8, gap: 8 }, useScroll && { position: 'absolute', top: 0, left: 0, right: 0 }]}>
      <RoundBtn label={close ? 'Close' : 'Back'} onPress={back} glass>
        {close ? <X size={20} color={c.ink} /> : <ChevronLeft size={shell ? 22 : 20} color={c.ink} />}
      </RoundBtn>
      {!shell && titleIcon ? (
        <Pressy accessibilityRole={onTitlePress ? 'button' : undefined} accessibilityLabel={onTitlePress ? `${title}. View profile` : undefined} disabled={!onTitlePress} onPress={onTitlePress} scaleTo={0.97} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44 }}>
          {titleIcon}
          <Txt accessibilityRole="header" numberOfLines={1} style={{ flexShrink: 1, fontFamily: font.semibold, fontSize: fontSizes.lg }}>{title}</Txt>
        </Pressy>
      ) : <Txt accessibilityRole="header" numberOfLines={1} style={{ flex: 1, textAlign: 'center', fontFamily: font.semibold, fontSize: fontSizes.lg }}>{title}</Txt>}
      {shell ? <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View> : (right ?? <View style={{ width: 44 }} />)}
    </Row>
  );
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      {!shell && <ToastLift value={insets.bottom + toastLift} />}
      {useScroll ? (
        <>
          <ScrollView onScroll={onScroll} scrollEventThrottle={16} keyboardShouldPersistTaps="handled"
            contentContainerStyle={shell ? { paddingHorizontal: 16, paddingTop: headH + 4, paddingBottom: footer ? 24 : 40 + insets.bottom, gap } : { paddingHorizontal: 16, paddingTop: insets.top + 12 + 44 + 8 + 4, paddingBottom: insets.bottom + 28, gap: 12 }}>
            {shell ? <View style={{ gap }}>{children}</View> : children}
          </ScrollView>
          {/* The header floats over the content so the glass buttons have something to blur as it scrolls underneath. */}
          {scrolled && <ProgressiveBlur height={headH + 36} />}
          {header}
        </>
      ) : (
        <>
          {header}
          {children}
        </>
      )}
      {footer ? (shell
        ? <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16) + 6, gap: 8, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>{footer}</View>
        : footer) : null}
    </KeyboardAvoidingView>
  );
}
