/* eslint-disable react-hooks/immutability, react-hooks/refs -- reanimated shared values are mutated from gesture and animation callbacks */
import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { useFocusEffect, usePathname } from 'expo-router';
import { CardRect, isCardPage, takeCardOrigin } from '@/lib/cardGrow';
import { haptic } from '@/lib/haptics';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, View, useWindowDimensions, type ViewInstance } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, X } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { ProgressiveBlur, useScrolled } from '@/components/Glass';
import { useToastLift } from '@/components/Overlay';
import { font, fontSizes, radii } from '@/design-system/tokens';
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

// A page opened from a card grows out of that card (about 0.4 s, a long smooth ease-out, no bounce). It has no back button: a small grabber at the top drags it away.
// Drag down and the whole page follows your finger and scales down, with the page underneath showing; let go past the middle (or with a flick) and it carries on down and
// away, let go early and it eases back. Pages opened any other way do not animate. The card's position comes from setCardOrigin (src/lib/cardGrow.ts).
export type GrowHandle = { leave: (go: () => void) => void };
const SMOOTH = Easing.bezier(0.22, 1, 0.36, 1);
export function GrowFrame({ children, handle, onClose, origin }: { children: React.ReactNode; handle: React.Ref<GrowHandle>; onClose: () => void; origin: CardRect | null }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const root = useRef<ViewInstance>(null);
  const win = useWindowDimensions();
  // on a phone the page is the whole screen, so there is nothing to measure; on the web it sits inside the phone frame and is measured
  const [box, setBox] = useState<CardRect | null>(Platform.OS === 'web' ? null : { x: 0, y: 0, w: win.width, h: win.height });
  const [late, setLate] = useState(false); // the measure took too long: show the page without the grow rather than leave it hidden
  const p = useSharedValue(origin ? 0 : 1);
  const dy = useSharedValue(0); // how far the page has been dragged down
  const dx = useSharedValue(0); // how far the page has been swiped to the right from the left edge (the back gesture)
  useEffect(() => { if (origin && box) p.value = withTiming(1, { duration: 420, easing: SMOOTH }); }, [origin, box, p]);
  useEffect(() => {
    if (!origin || box) return;
    const t = setTimeout(() => { setLate(true); p.value = 1; }, 250);
    return () => clearTimeout(t);
  }, [origin, box, p]);
  // On the web the stack hides the page underneath: show it again while this page is over it. A layout effect, so it happens before the first paint
  // and the page underneath never flashes blank when this one opens.
  useLayoutEffect(() => {
    if (!origin || Platform.OS !== 'web') return;
    const el = root.current as unknown as HTMLElement | null;
    let n: HTMLElement | null = el;
    while (n && n.parentElement && !(n.parentElement.children.length > 1 && getComputedStyle(n).position === 'absolute')) n = n.parentElement;
    const screens = n?.parentElement ? ([...n.parentElement.children] as HTMLElement[]) : [];
    const mine = n ? screens.indexOf(n) : -1;
    const under = mine > 0 ? screens[mine - 1] : null;
    if (under) under.style.display = 'flex';
  }, [origin]);
  // leave: the page carries on down and away (the way a drag does), then the real back runs
  const leave = (go: () => void) => {
    if (!origin || !box) { go(); return; }
    dy.value = withTiming(box.h * 1.05, { duration: 260, easing: Easing.out(Easing.cubic) }, (done) => { if (done) scheduleOnRN(go); });
  };
  // Every way of going back gives the same tap the back button gives, and plays the same closing animation.
  const dismiss = () => { haptic.tap(); leave(onClose); };
  const dismissNow = () => { haptic.tap(); leave(onClose); };
  // The phone's back (a swipe from the left edge, the Android back button) plays this page's own closing animation, the same one the page has everywhere else: the page
  // carries on down and away over the page beneath, then the real back runs. Pages that were not opened from a card keep the stack's own back (slide to the right).
  const edge = Gesture.Pan()
    .activeOffsetX([10, 1000]).failOffsetY([-16, 16])
    .onUpdate((e) => { dx.value = Math.max(0, e.translationX) * 0.25; })
    .onEnd((e) => {
      dx.value = withTiming(0, { duration: 200, easing: SMOOTH });
      if (e.translationX > 110 || e.velocityX > 800) scheduleOnRN(dismissNow);
    });
  useImperativeHandle(handle, () => ({ leave }));
  // Android back button and gesture
  useFocusEffect(useCallback(() => {
    if (!origin) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { haptic.tap(); leave(onClose); return true; });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, box]));
  const drag = Gesture.Pan()
    .onUpdate((e) => { dy.value = Math.max(0, e.translationY); })
    .onEnd((e) => {
      if (e.translationY > 130 || e.velocityY > 900) scheduleOnRN(dismiss);
      else dy.value = withTiming(0, { duration: 320, easing: SMOOTH });
    });
  const style = useAnimatedStyle(() => {
    if (!origin || late) return dx.value > 0 ? { borderRadius: 28 * Math.min(1, dx.value / 40), transform: [{ translateX: dx.value }] } : {};
    if (!box) return { opacity: 0 };
    const t = p.value;
    const pull = Math.min(1, dy.value / 320);
    const sc = origin.w / box.w;
    return {
      opacity: Math.min(1, t * 3),
      borderRadius: 28 * Math.max(1 - t, Math.min(1, dy.value / 40)),
      transform: [
        { translateX: (origin.x + origin.w / 2 - (box.x + box.w / 2)) * (1 - t) + dx.value },
        { translateY: (origin.y + origin.h / 2 - (box.y + box.h / 2)) * (1 - t) + dy.value * 0.9 },
        { scale: (sc + (1 - sc) * t) * (1 - 0.14 * pull) },
      ],
    };
  }, [origin, box, late]);
  const measure = () => { root.current?.measureInWindow((x, y, w, h) => { if (w > 0 && h > 0) setBox((bx) => bx ?? { x, y, w, h }); }); };
  return (
    <Animated.View ref={root as never} collapsable={false} onLayout={measure} style={[{ flex: 1, overflow: 'hidden' }, style]}>
      {children}
      {/* the back gesture: a thin strip at the left edge (card pages) */}
      {origin ? (
        <GestureDetector gesture={edge}>
          <View collapsable={false} style={{ position: 'absolute', left: 0, top: insets.top + 56, bottom: 0, width: 22, zIndex: 40 }} />
        </GestureDetector>
      ) : null}
      {origin ? (
        <GestureDetector gesture={drag}>
          <View accessible accessibilityLabel="Drag down to close" style={{ position: 'absolute', top: Math.max(insets.top - 4, 0), alignSelf: 'center', width: 140, height: 28, alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <View style={{ width: 40, height: 5, borderRadius: radii.pill, backgroundColor: c.muted, opacity: 0.55 }} />
          </View>
        </GestureDetector>
      ) : null}
    </Animated.View>
  );
}

export function SubPage({ title, children, right, footer, fallback, variant = 'shell', close, gap = 12, titleIcon, onTitlePress, scroll = true, toastLift = 24, onBack, backdrop }: SubPageProps) {
  useOwnGlow(!!backdrop);
  const frame = useRef<GrowHandle>(null);
  const path = usePathname();
  // set when a card opened this page; a page that is not one of the card pages still clears it, so it never goes stale
  const [origin] = useState(() => { const o = takeCardOrigin(); return o && isCardPage(path) ? o : null; });
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { scrolled, onScroll } = useScrolled();
  const shell = variant === 'shell';
  const headH = insets.top + 12 + 44 + 8;
  const useScroll = shell ? true : scroll;
  const back = () => { if (!shell && onBack?.()) return; { const go = () => goBack(fallback); if (frame.current) frame.current.leave(go); else go(); } };
  const header = (
    <Row style={[{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 8, gap: 8 }, useScroll && { position: 'absolute', top: 0, left: 0, right: 0 }]}>
      {origin ? <View style={{ width: 44, height: 44 }} /> : (
        <RoundBtn label={close ? 'Close' : 'Back'} onPress={back} glass>
          {close ? <X size={20} color={c.ink} /> : <ChevronLeft size={shell ? 22 : 20} color={c.ink} />}
        </RoundBtn>
      )}
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
    <GrowFrame handle={frame} onClose={() => goBack(fallback)} origin={origin}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      {!shell && <ToastLift value={insets.bottom + toastLift} />}
      {useScroll ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16} keyboardShouldPersistTaps="handled"
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
