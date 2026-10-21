import React, { useEffect } from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Polyline, RadialGradient, Rect, Stop } from 'react-native-svg';
import { ChevronRight } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { SubPage as DSSubPage, SubPageProps } from '@/design-system/primitives/SubPage';
import { ListCard } from '@/design-system/primitives/ListCard';


// ---------- White data card that is pressable ----------
export function cardShadow(isDark: boolean): ViewStyle {
  return isDark ? {} : { shadowColor: fixed.shadow, shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 2 };
}
export function PCard({ onPress, label, children, style }: { onPress?: () => void; label?: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c, isDark } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} scaleTo={0.98}
      style={[{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18, gap: 10 }, cardShadow(isDark), style]}>
      {children}
    </Pressy>
  );
}

// Soft coloured glow tucked into a card corner. Sits behind the content (zIndex -1) and is clipped by the card.
// Gaussian-like falloff so the glow has no visible edge.
const STOPS: [number, number][] = [[0, 0.26], [0.15, 0.22], [0.3, 0.15], [0.45, 0.09], [0.6, 0.045], [0.75, 0.016], [0.9, 0.004], [1, 0]];
export function CornerGlow({ color, size = 280 }: { color: string; size?: number }) {
  const { isDark } = useTheme();
  const id = 'glow' + color.replace('#', '');
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: -size * 0.5, right: -size * 0.4, width: size, height: size, zIndex: -1 }}>
      <Svg width={size} height={size}>
        <Defs><RadialGradient id={id} cx="50%" cy="50%" r="50%">{STOPS.map(([o, a]) => <Stop key={o} offset={o} stopColor={color} stopOpacity={a * (isDark ? 0.85 : 1)} />)}</RadialGradient></Defs>
        <Rect width={size} height={size} fill={"url(#" + id + ")"} />
      </Svg>
    </View>
  );
}

export function CardTitle({ title, right, icon, tint }: { title: string; right?: React.ReactNode; icon?: React.ReactNode; tint?: string }) {
  const { c } = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between', gap: 8 }}>
      <Row style={{ gap: 10, flexShrink: 1 }}>
        {icon ? <View style={{ width: 32, height: 32, borderRadius: radii.md, backgroundColor: (tint ?? c.accent) + '26', alignItems: 'center', justifyContent: 'center' }}>{icon}</View> : null}
        <Txt v="label" style={{ flexShrink: 1 }}>{title}</Txt>
      </Row>
      {right ?? <ChevronRight size={16} color={c.muted} />}
    </Row>
  );
}


// ---------- Charts ----------
export function toPts(vals: number[], w: number, h: number, padX: number, padY = padX) {
  let mn = Math.min(...vals), mx = Math.max(...vals);
  if (mx === mn) { mx += 1; mn -= 1; }
  return vals.map((v, i) => [padX + (i * (w - padX * 2)) / Math.max(1, vals.length - 1), padY + ((mx - v) / (mx - mn)) * (h - padY * 2)] as [number, number]);
}
const APoly = Animated.createAnimatedComponent(Polyline);

// A polyline that draws itself in (timing only). Re-draws when `points` change.
export function DrawLine({ pts, color, width = 2.5 }: { pts: [number, number][]; color: string; width?: number }) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  len = Math.ceil(len) + 2;
  const key = pts.map((p) => p.join(',')).join(' ');
  const p = useSharedValue(0);
  useEffect(() => { p.value = 0; p.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }); }, [key]);
  const ap = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - p.value) }));
  return <APoly points={key} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len}`} animatedProps={ap} />;
}

export function Spark({ vals, color, w = 112, h = 44 }: { vals: number[]; color: string; w?: number; h?: number }) {
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <DrawLine pts={toPts(vals, w, h, 4)} color={color} />
    </Svg>
  );
}

// A thin progress bar whose fill grows in (timing).
export function GrowBar({ pct, color, h = 6, track }: { pct: number; color: string; h?: number; track?: string }) {
  const { c } = useTheme();
  const v = useSharedValue(0);
  useEffect(() => { v.value = withTiming(Math.max(0, Math.min(100, pct)), { duration: 1000, easing: Easing.out(Easing.cubic) }); }, [pct]);
  const a = useAnimatedStyle(() => ({ width: `${v.value}%` }));
  return (
    <View style={{ height: h, borderRadius: h / 2, backgroundColor: track ?? c.surface2, overflow: 'hidden', width: '100%' }}>
      <Animated.View style={[{ height: '100%', borderRadius: h / 2, backgroundColor: color }, a]} />
    </View>
  );
}

// ---------- Round − / + stepper button ----------
export function StepBtn({ label, sign, onPress }: { label: string; sign: '−' | '+'; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} scaleTo={0.9}
      style={{ width: 44, height: 44, borderRadius: radii.lg, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
      <Txt style={{ fontSize: fontSizes.xl, fontFamily: font.medium }}>{sign}</Txt>
    </Pressy>
  );
}

// ---------- Horizontal shake for inline errors (timing, no overshoot) ----------
export function useShake() {
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const run = () => { x.set(withSequence(withTiming(-6, { duration: 60 }), withTiming(6, { duration: 80 }), withTiming(-6, { duration: 80 }), withTiming(6, { duration: 80 }), withTiming(0, { duration: 60 }))); };
  return { style, run };
}

export function Hint({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Txt v="caption" style={[{ textAlign: 'center', fontSize: fontSizes.sm }, style]}>{children}</Txt>;
}

// SubPage and ListCard moved to src/design-system/primitives/. The Progress, Gym and Goal pages use the "progress" layout of SubPage.
export function SubPage(props: Omit<SubPageProps, 'variant' | 'close' | 'gap'>) { return <DSSubPage variant="progress" {...props} />; }
export { ListCard };
