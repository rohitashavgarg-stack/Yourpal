import React, { useEffect } from 'react';
import { ProgressiveBlur, useScrolled } from '@/components/Glass';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleProp, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, X } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
// Not imported from GymHeader to avoid a require cycle (GymHeader -> Switcher -> parts).
import { GymLogoMark } from '@/components/Brand';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fade } from '@/theme/motion';
import type { Programme } from './state';

export const goBack = (fallback: string = '/(tabs)') => (router.canGoBack() ? router.back() : router.replace(fallback as any));
export const goHome = () => (router.canDismiss() ? router.dismissAll() : router.replace('/(tabs)'));

// Full-screen pushed page: 44 px round back (or close), centred title, optional right action.
export function SubPage({ title, right, close, fallback, children, gap = 12, footer }: { title: string; right?: React.ReactNode; close?: boolean; fallback?: string; children: React.ReactNode; gap?: number; footer?: React.ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { scrolled, onScroll } = useScrolled();
  const headH = insets.top + 12 + 44 + 8;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView onScroll={onScroll} scrollEventThrottle={16} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: headH + 4, paddingBottom: footer ? 24 : 40 + insets.bottom, gap }}>
        <Animated.View entering={fade()} style={{ gap }}>{children}</Animated.View>
      </ScrollView>
      {/* The header floats over the content so the glass buttons have something to blur as it scrolls underneath. */}
      {scrolled && <ProgressiveBlur height={headH + 36} />}
      <Row style={{ position: 'absolute', top: 0, left: 0, right: 0, gap: 8, paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 8 }}>
        <RoundBtn label={close ? 'Close' : 'Back'} onPress={() => goBack(fallback)} glass>
          {close ? <X size={20} color={c.ink} /> : <ChevronLeft size={22} color={c.ink} />}
        </RoundBtn>
        <Txt accessibilityRole="header" numberOfLines={1} style={{ flex: 1, textAlign: 'center', fontFamily: font.semibold, fontSize: 17 }}>{title}</Txt>
        <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
      </Row>
      {footer ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16) + 6, gap: 8, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>{footer}</View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

// Programme logo: Wulf Fitness uses the real logo, others a coloured letter.
export function ProgLogo({ p, size = 44 }: { p: Pick<Programme, 'id' | 'logo' | 'color'>; size?: number }) {
  if (p.id === 'gold') return <GymLogoMark size={size} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: p.color, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Text style={{ color: '#fff', fontFamily: font.bold, fontSize: Math.round(size * 0.4), lineHeight: Math.round(size * 0.52) }}>{p.logo}</Text>
    </View>
  );
}

// iOS-style switch (52×32 visual, 44 px min hit area).
export function Switch({ on, onChange, label, locked }: { on: boolean; onChange?: (v: boolean) => void; label: string; locked?: boolean }) {
  const { c } = useTheme();
  const p = useSharedValue(on ? 1 : 0);
  useEffect(() => { p.value = withTiming(on ? 1 : 0, { duration: 220 }); }, [on]);
  const x = useSharedValue(on ? 20 : 0);
  useEffect(() => { x.value = withSpring(on ? 20 : 0, spring.snappy); }, [on]);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(p.value, [0, 1], [c.surface3, c.good]) }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Pressy accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: on, disabled: !!locked }} disabled={locked} haptics={!locked}
      onPress={() => onChange?.(!on)} scaleTo={0.94} hitSlop={6} style={{ opacity: locked ? 0.55 : 1 }}>
      <Animated.View style={[{ width: 52, height: 32, borderRadius: 16, padding: 3 }, track]}>
        <Animated.View style={[{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }, knob]} />
      </Animated.View>
    </Pressy>
  );
}

// A row with a title, optional subtitle and trailing control. Hairline between rows.
export function LineRow({ title, sub, right, onPress, color, last, minH = 60, a11yHint }: { title: string; sub?: string; right?: React.ReactNode; onPress?: () => void; color?: string; last?: boolean; minH?: number; a11yHint?: string }) {
  const { c } = useTheme();
  const body = (
    <>
      <View style={{ flex: 1, gap: 1 }}>
        <Txt style={{ fontFamily: font.medium, color: color ?? c.ink }}>{title}</Txt>
        {sub ? <Txt v="caption">{sub}</Txt> : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={c.muted} /> : null)}
    </>
  );
  const st: ViewStyle = { minHeight: minH, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line };
  if (!onPress) return <View style={st}>{body}</View>;
  return <Pressy accessibilityRole="button" accessibilityLabel={sub ? `${title}, ${sub}` : title} accessibilityHint={a11yHint} onPress={onPress} scaleTo={0.985} style={st}>{body}</Pressy>;
}

export function ListCard({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c, isDark } = useTheme();
  return (
    <View style={[{ backgroundColor: c.surface, borderRadius: 28, paddingHorizontal: 18, paddingVertical: 4 },
      !isDark && { shadowColor: '#101828', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 2 }, style]}>
      {children}
    </View>
  );
}

export function Label({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Txt v="label" style={[{ paddingHorizontal: 6 }, style]}>{children}</Txt>;
}

export function Note({ children, tone = 'plain', center, style }: { children: React.ReactNode; tone?: 'plain' | 'soft' | 'warn' | 'good'; center?: boolean; style?: any }) {
  const { c } = useTheme();
  if (tone === 'plain') return <Txt muted style={[{ fontSize: 12, textAlign: center ? 'center' : 'left', paddingHorizontal: 6 }, style]}>{children}</Txt>;
  const bg = tone === 'warn' ? c.warnSoft : tone === 'good' ? c.goodSoft : c.surface2;
  const fg = tone === 'warn' ? c.warn : tone === 'good' ? c.good : c.muted;
  return (
    <View style={[{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: bg }, style]}>
      <Txt style={{ fontSize: 14, color: fg }}>{children}</Txt>
    </View>
  );
}

// Horizontal shake for inline validation errors (feedback, not an entering animation).
export function useShake(trigger: number) {
  const x = useSharedValue(0);
  useEffect(() => {
    if (!trigger) return;
    haptic.error();
    x.value = withSequence(withTiming(-6, { duration: 50 }), withTiming(6, { duration: 80 }), withTiming(-4, { duration: 80 }), withTiming(0, { duration: 60 }));
  }, [trigger]);
  return useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
}
