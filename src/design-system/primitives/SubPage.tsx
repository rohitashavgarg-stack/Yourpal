import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { CardRect, takeCardOrigin } from '@/lib/cardGrow';
import { KeyboardAvoidingView, Platform, ScrollView, View, type ViewInstance } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, X } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { ProgressiveBlur, useScrolled } from '@/components/Glass';
import { useToastLift } from '@/components/Overlay';
import { font, fontSizes } from '@/design-system/tokens';
import { useTheme } from '@/theme/ThemeProvider';
import { useOwnGlow } from '@/design-system/primitives/PageGlow';

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
  /** Drawn behind the top of the content and scrolls with it (for example a tinted gradient). Position it absolutely from the top. */
  backdrop?: React.ReactNode;
  // progress
  titleIcon?: React.ReactNode;
  onTitlePress?: () => void;
  scroll?: boolean;
  toastLift?: number;
  onBack?: () => boolean;
};

function ToastLift({ value }: { value: number }) { useToastLift(value); return null; }

// A page opened from a card grows out of that card (about a third of a second, no bounce) and shrinks back into it when you go back.
// Pages opened any other way do not animate. The card's position comes from setCardOrigin (src/lib/cardGrow.ts).
type GrowHandle = { leave: (go: () => void) => void };
function GrowFrame({ children, handle }: { children: React.ReactNode; handle: React.Ref<GrowHandle> }) {
  const [origin] = useState(() => takeCardOrigin());
  const root = useRef<ViewInstance>(null);
  const [box, setBox] = useState<CardRect | null>(null);
  const p = useSharedValue(origin ? 0 : 1);
  useEffect(() => { if (origin && box) p.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }); }, [origin, box, p]);
  // go back: shrink into the card first, then leave
  useImperativeHandle(handle, () => ({
    leave: (go) => {
      if (!origin || !box) { go(); return; }
      p.value = withTiming(0, { duration: 260, easing: Easing.in(Easing.cubic) }, (done) => { if (done) scheduleOnRN(go); });
    },
  }), [origin, box, p]);
  const style = useAnimatedStyle(() => {
    if (!origin) return {};
    if (!box) return { opacity: 0 };
    const t = p.value;
    const sc = origin.w / box.w;
    return {
      opacity: Math.min(1, t * 3),
      borderRadius: 28 * (1 - t),
      transform: [{ translateX: (origin.x + origin.w / 2 - (box.x + box.w / 2)) * (1 - t) }, { translateY: (origin.y + origin.h / 2 - (box.y + box.h / 2)) * (1 - t) }, { scale: sc + (1 - sc) * t }],
    };
  }, [origin, box]);
  const measure = () => { root.current?.measureInWindow((x, y, w, h) => { if (w > 0 && h > 0) setBox((bx) => bx ?? { x, y, w, h }); }); };
  return <Animated.View ref={root as never} collapsable={false} onLayout={measure} style={[{ flex: 1, overflow: 'hidden' }, style]}>{children}</Animated.View>;
}

export function SubPage({ title, children, right, footer, fallback, variant = 'shell', close, gap = 12, titleIcon, onTitlePress, scroll = true, toastLift = 24, onBack, backdrop }: SubPageProps) {
  useOwnGlow(!!backdrop);
  const frame = useRef<GrowHandle>(null);
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { scrolled, onScroll } = useScrolled();
  const shell = variant === 'shell';
  const headH = insets.top + 12 + 44 + 8;
  const useScroll = shell ? true : scroll;
  const back = () => { if (!shell && onBack?.()) return; { const go = () => goBack(fallback); if (frame.current) frame.current.leave(go); else go(); } };
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
    <GrowFrame handle={frame}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      {!shell && <ToastLift value={insets.bottom + toastLift} />}
      {useScroll ? (
        <>
          <ScrollView onScroll={onScroll} scrollEventThrottle={16} keyboardShouldPersistTaps="handled"
            contentContainerStyle={shell ? { paddingHorizontal: 16, paddingTop: headH + 4, paddingBottom: footer ? 24 : 40 + insets.bottom, gap } : { paddingHorizontal: 16, paddingTop: insets.top + 12 + 44 + 8 + 4, paddingBottom: insets.bottom + 28, gap: 12 }}>
            {backdrop}
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
    </GrowFrame>
  );
}
