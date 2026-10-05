import React, { useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Minus, Plus, X } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { iconFor } from './content';
import { artIdFor, ExerciseArt, hasPhoto } from '@/features/workout/ExerciseArt';

export const goBackToPlans = () => (router.canGoBack() ? router.back() : router.replace('/plans'));

// Header for pushed Plans pages: 44 px round close / back, centred title, optional right action.
export function PageHeader({ title, icon = 'back', onClose, right }: { title: string; icon?: 'back' | 'close'; onClose?: () => void; right?: React.ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Row style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, gap: 8, backgroundColor: c.bg }}>
      <RoundBtn label={icon === 'close' ? 'Close' : 'Back'} onPress={onClose ?? goBackToPlans} glass>
        {icon === 'close' ? <X size={20} color={c.ink} /> : <ChevronLeft size={22} color={c.ink} />}
      </RoundBtn>
      <Txt v="headline" numberOfLines={1} accessibilityRole="header" style={{ flex: 1, textAlign: 'center' }}>{title}</Txt>
      {right ?? <View style={{ width: 44 }} />}
    </Row>
  );
}

// Sheet / page title in the big light style.
export function BigTitle({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Txt accessibilityRole="header" style={[{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1 }, style]}>{children}</Txt>;
}

// A list row: 64 px min, hairline between rows.
export function ListRow({ label, sub, right, onPress, last, tone, chevron = true, a11y }: { label: string; sub?: string; right?: React.ReactNode; onPress: () => void; last?: boolean; tone?: string; chevron?: boolean; a11y?: string }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={a11y ?? label} onPress={onPress} scaleTo={0.985}
      style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      <View style={{ flex: 1, paddingVertical: 8 }}>
        <Txt style={{ fontFamily: font.medium, color: tone ?? c.ink }}>{label}</Txt>
        {sub ? <Txt v="caption">{sub}</Txt> : null}
      </View>
      {right}
      {chevron && <ChevronRight size={18} color={c.muted} />}
    </Pressy>
  );
}

export function InfoBox({ children, tone = 'accent', style }: { children: React.ReactNode; tone?: 'accent' | 'warn' | 'plain'; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const bg = tone === 'warn' ? c.warnSoft : tone === 'plain' ? c.surface2 : c.accentSoft;
  const fg = tone === 'warn' ? c.warn : tone === 'plain' ? c.muted : c.accentText;
  return (
    <View style={[{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: bg }, style]}>
      {typeof children === 'string' ? <Txt style={{ fontSize: 14, color: fg }}>{children}</Txt> : children}
    </View>
  );
}

// Error line that shakes each time `n` changes (no bounce: a short timing wiggle).
export function ShakeText({ text, n }: { text: string; n: number }) {
  const { c } = useTheme();
  const x = useSharedValue(0);
  useEffect(() => {
    if (!text) return;
    haptic.error();
    x.value = withSequence(withTiming(-6, { duration: 60 }), withTiming(6, { duration: 80 }), withTiming(-6, { duration: 80 }), withTiming(6, { duration: 80 }), withTiming(0, { duration: 60 }));
  }, [n, text]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  if (!text) return null;
  return <Animated.View style={a} accessibilityLiveRegion="assertive"><Txt style={{ color: c.warn, fontSize: 14, paddingHorizontal: 6 }}>{text}</Txt></Animated.View>;
}

// Exercise tile: soft blue square with a line drawing and the order number.
export function ExTile({ name, num, size = 56 }: { name: string; num?: string; size?: number }) {
  const { c } = useTheme();
  const art = artIdFor(name);
  const photo = !!art && hasPhoto(art);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: 16, backgroundColor: photo ? '#F4F6FA' : c.accentSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {art ? <View style={{ width: size - 4, height: size - 4 }}><ExerciseArt id={art} fill /></View> : null}
      <Svg width={size} height={size} viewBox="0 0 56 56" style={{ position: 'absolute' }}><Circle cx={46} cy={6} r={26} fill="#FFFFFF" opacity={0.1} /></Svg>
      {!art && <Svg width={size * 0.54} height={size * 0.54} viewBox="0 0 24 24"><Path d={iconFor(name)} fill="none" stroke={c.accentText} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" /></Svg>}
      {num ? (
        <View style={{ position: 'absolute', left: 4, top: 4, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 10, lineHeight: 13, color: '#fff' }}>{num}</Txt>
        </View>
      ) : null}
    </View>
  );
}

// − value + stepper row (sets, reps, time, weight, portion).
export function Stepper({ label, value, onMinus, onPlus, minusLabel, plusLabel }: { label: string; value: string; onMinus: () => void; onPlus: () => void; minusLabel: string; plusLabel: string }) {
  const { c } = useTheme();
  return (
    <Row style={{ gap: 10, minHeight: 60 }}>
      <Txt muted style={{ flex: 1 }}>{label}</Txt>
      <RoundBtn label={minusLabel} onPress={onMinus}><Minus size={18} color={c.ink} /></RoundBtn>
      <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.display, fontSize: 25, minWidth: 76, textAlign: 'center' }}>{value}</Txt>
      <RoundBtn label={plusLabel} onPress={onPlus}><Plus size={18} color={c.ink} /></RoundBtn>
    </Row>
  );
}

// Row background that pulses the accent twice, used for "new from Coach" items.
export function Highlight({ on, delay = 0, style, children }: { on: boolean; delay?: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const { c } = useTheme();
  const o = useSharedValue(0);
  useEffect(() => {
    if (!on) { o.value = 0; return; }
    o.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 0 }), withDelay(770, withTiming(0, { duration: 630 }))), 2, false));
  }, [on]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <View style={style}>
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 14, backgroundColor: c.accentSoft }, a]} />
      {children}
    </View>
  );
}

export function Moon({ size = 64 }: { size?: number }) {
  const { c } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityElementsHidden>
      <Circle cx={32} cy={32} r={30} fill={c.surface2} />
      <Path d="M40 20a14 14 0 1 0 6 20 11 11 0 0 1-6-20z" fill={c.accentText} />
    </Svg>
  );
}
