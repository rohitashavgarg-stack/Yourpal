import React, { createContext, useContext, useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, G, LinearGradient as SvgGradient, Mask, Path, Rect, Stop } from 'react-native-svg';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import { GlassBackdrop, hasLiquidGlass } from './Glass';
import { navStore } from './navStyle';
import { ChartLine, ClipboardList, Dumbbell, Sun } from '@/lib/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';

// ---- Hide-on-scroll: scrolling down hides the nav, scrolling up brings it back ----
const NavCtx = createContext<{ hidden: SharedValue<number> } | null>(null);

export function NavHideProvider({ children }: { children: React.ReactNode }) {
  const hidden = useSharedValue(0);
  return <NavCtx.Provider value={{ hidden }}>{children}</NavCtx.Provider>;
}

export function useNavHidden() {
  return useContext(NavCtx)?.hidden;
}

export function useHideOnScroll() {
  const hidden = useNavHidden();
  const last = useSharedValue(0);
  return useAnimatedScrollHandler({
    onScroll: (e) => {
      if (!hidden) return;
      const y = e.contentOffset.y;
      const dy = y - last.value;
      if (y < 30) hidden.value = withTiming(0, { duration: 260 });
      else if (dy > 6 && y > 60) hidden.value = withTiming(1, { duration: 280 });
      else if (dy < -6) hidden.value = withTiming(0, { duration: 260 });
      last.value = y;
    },
  });
}

const ICONS: Record<string, any> = { index: Sun, plans: ClipboardList, progress: ChartLine, gym: Dumbbell };
const LABELS: Record<string, string> = { index: 'Today', plans: 'Plans', progress: 'Progress', gym: 'Gym' };

// ---- Circle navigation: each tab is its own round button (separate, or linked into a chain) ----
function CircleNav({ state, navigation, linked }: any) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const hidden = useNavHidden();
  const bar = useAnimatedStyle(() => ({ transform: [{ translateY: (hidden?.value ?? 0) * 110 }] }));
  const bottom = Math.max(insets.bottom - 6, 14);
  return (
    <Animated.View accessibilityRole="tablist" pointerEvents="box-none" style={[{ position: 'absolute', left: 0, right: 0, bottom, alignItems: 'center' }, bar]}>
      <View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', gap: linked ? 0 : 14 }}>
        {state.routes.map((r: any, i: number) => {
          const on = state.index === i;
          const Icon = ICONS[r.name] ?? Sun;
          const size = linked ? (on ? 64 : 58) : 58;
          return (
            <Pressable
              key={r.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={LABELS[r.name] ?? r.name}
              onPress={() => {
                haptic.tap();
                const ev = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
                if (!on && !ev.defaultPrevented) navigation.navigate(r.name);
                if (hidden) hidden.value = withTiming(0);
              }}
              style={{ width: size, height: size, borderRadius: size / 2, marginLeft: linked && i ? -10 : 0, zIndex: on ? 3 : 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
                borderWidth: linked ? 3 : hasLiquidGlass ? 0 : 1, borderColor: linked ? c.bg : c.navLine,
                shadowColor: '#101828', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: on ? 12 : 8 }}
            >
              {on ? <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: `${c.accent}E6` }} /> : <GlassBackdrop radius={size / 2} />}
              <View pointerEvents="none" style={{ zIndex: 2 }}><Icon size={24} strokeWidth={on ? 2.3 : 1.9} color={on ? '#fff' : c.muted} /></View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

function neck(x1: number, x2: number, y: number, r: number, v = 0.5, rate = 2.4): string {
  const d = x2 - x1;
  const a = Math.PI / 2 * v;                     // neck attaches this many radians from the line between the centres (equal radii => angle2 = 90 deg)
  const p1a = [x1 + r * Math.cos(a), y + r * Math.sin(a)];
  const p1b = [x1 + r * Math.cos(-a), y + r * Math.sin(-a)];
  const p2a = [x2 + r * Math.cos(Math.PI - a), y + r * Math.sin(Math.PI - a)];
  const p2b = [x2 + r * Math.cos(-Math.PI + a), y + r * Math.sin(-Math.PI + a)];
  const dist = Math.hypot(p1a[0] - p2a[0], p1a[1] - p2a[1]);
  let k = Math.min(v * rate, dist / (2 * r));
  k *= Math.min(1, (d * 2) / (2 * r));
  const h = r * k;
  const h1a = [p1a[0] + h * Math.cos(a - Math.PI / 2), p1a[1] + h * Math.sin(a - Math.PI / 2)];
  const h1b = [p1b[0] + h * Math.cos(-a + Math.PI / 2), p1b[1] + h * Math.sin(-a + Math.PI / 2)];
  const h2a = [p2a[0] + h * Math.cos(Math.PI - a + Math.PI / 2), p2a[1] + h * Math.sin(Math.PI - a + Math.PI / 2)];
  const h2b = [p2b[0] + h * Math.cos(-Math.PI + a - Math.PI / 2), p2b[1] + h * Math.sin(-Math.PI + a - Math.PI / 2)];
  return `M${p1a} C${h1a} ${h2a} ${p2a} L${p2b} C${h2b} ${h1b} ${p1b} Z`;
}

// ---- Merged circles: one connected blob (circles fused by necks) with a blue bubble that slides to the active tab ----
function MergedNav({ state, navigation }: any) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const hidden = useNavHidden();
  const N = state.routes.length;
  const D = 58, R = D / 2, STEP = 66;
  const W = STEP * (N - 1) + D;
  const x = useSharedValue(state.index * STEP);
  useEffect(() => { x.value = withSpring(state.index * STEP, spring.nav); }, [state.index]);
  const bubble = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const bar = useAnimatedStyle(() => ({ transform: [{ translateY: (hidden?.value ?? 0) * 110 }] }));
  const bottom = Math.max(insets.bottom - 6, 14);
  const line = isDark ? 'rgba(255,255,255,0.16)' : 'rgba(18,21,28,0.13)';
  const web = Platform.OS === 'web';
  // web can blur exactly behind the shape, so its fill stays light; phones without liquid glass get a denser fill instead
  const fillColor = web ? (isDark ? 'rgba(30,35,46,0.42)' : 'rgba(255,255,255,0.5)') : (isDark ? 'rgba(30,35,46,0.93)' : 'rgba(255,255,255,0.95)');
  // the same shapes drawn twice: a wider outline first, then the solid fill on top, so only the outer edge of the merged shape shows a line
  const shapes = (props: any) => (
    <>
      {state.routes.map((_: any, i: number) => <Circle key={`c${i}`} cx={R + i * STEP} cy={R} r={R} {...props} />)}
      {state.routes.slice(1).map((_: any, i: number) => <Path key={`n${i}`} d={neck(R + i * STEP, R + (i + 1) * STEP, R, R)} {...props} />)}
    </>
  );
  return (
    <Animated.View accessibilityRole="tablist" pointerEvents="box-none" style={[{ position: 'absolute', left: 0, right: 0, bottom, alignItems: 'center' }, bar]}>
      <View style={{ width: W, height: D }}>
        {web && !hasLiquidGlass ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: W, height: D }}>
            {state.routes.map((_: any, i: number) => (
              <View key={`b${i}`} style={{ position: 'absolute', left: i * STEP, top: 0, width: D, height: D, borderRadius: R, overflow: 'hidden' }}>
                <BlurView intensity={45} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              </View>
            ))}
            {state.routes.slice(1).map((_: any, i: number) => (
              <View key={`bn${i}`} style={{ position: 'absolute', left: R + i * STEP, top: 0, width: STEP, height: D, ...({ clipPath: `path('${neck(0, STEP, R, R)}')` } as any) }}>
                <BlurView intensity={45} tint={isDark ? 'dark' : 'light'} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              </View>
            ))}
          </View>
        ) : null}
        {hasLiquidGlass ? (
          // real liquid glass: neighbouring glass circles fuse into one droplet-shaped surface
          <GlassContainer spacing={14} style={{ position: 'absolute', left: 0, top: 0, width: W, height: D, flexDirection: 'row', gap: STEP - D }}>
            {state.routes.map((_: any, i: number) => (
              <GlassView key={i} glassEffectStyle="regular" colorScheme={isDark ? 'dark' : 'light'} style={{ width: D, height: D, borderRadius: R }} />
            ))}
          </GlassContainer>
        ) : (
          // fallback glass: one translucent merged shape, a soft top highlight and a rim that follows only the outer edge
          <Svg width={W + 8} height={D + 8} viewBox={`-4 -4 ${W + 8} ${D + 8}`} style={{ position: 'absolute', left: -4, top: -4 }}>
            <Defs>
              <Mask id="navInside" x={-4} y={-4} width={W + 8} height={D + 8} maskUnits="userSpaceOnUse">{shapes({ fill: '#fff' })}</Mask>
              <Mask id="navOutside" x={-4} y={-4} width={W + 8} height={D + 8} maskUnits="userSpaceOnUse">
                <Rect x={-4} y={-4} width={W + 8} height={D + 8} fill="#fff" />
                {shapes({ fill: '#000' })}
              </Mask>
              <SvgGradient id="navShine" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#fff" stopOpacity={isDark ? 0.2 : 0.65} />
                <Stop offset="0.55" stopColor="#fff" stopOpacity={0} />
              </SvgGradient>
            </Defs>
            <G mask="url(#navOutside)">{shapes({ fill: line, stroke: line, strokeWidth: 3 })}</G>
            <Rect x={-4} y={-4} width={W + 8} height={D + 8} fill={fillColor} mask="url(#navInside)" />
            <Rect x={-4} y={-4} width={W + 8} height={D + 8} fill="url(#navShine)" mask="url(#navInside)" />
          </Svg>
        )}
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 4, top: 4, width: D - 8, height: D - 8, borderRadius: (D - 8) / 2, backgroundColor: c.accent }, bubble]} />
        {state.routes.map((r: any, i: number) => {
          const on = state.index === i;
          const Icon = ICONS[r.name] ?? Sun;
          return (
            <Pressable
              key={r.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={LABELS[r.name] ?? r.name}
              onPress={() => {
                haptic.tap();
                const ev = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
                if (!on && !ev.defaultPrevented) navigation.navigate(r.name);
                if (hidden) hidden.value = withTiming(0);
              }}
              style={{ position: 'absolute', left: i * STEP, top: 0, width: D, height: D, alignItems: 'center', justifyContent: 'center' }}
            >
              <View pointerEvents="none"><Icon size={24} strokeWidth={on ? 2.3 : 1.9} color={on ? '#fff' : c.muted} /></View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

// ---- Floating pill tab bar (Blinkit / Zomato style) ----
export function FloatingTabBar(props: any) {
  const { style } = navStore.use();
  if (style === 'Circles') return <CircleNav {...props} />;
  if (style === 'Linked circles') return <MergedNav {...props} />;
  return <PillBar {...props} />;
}

function PillBar({ state, navigation }: any) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const hidden = useNavHidden();
  const [w, setW] = useState(0);
  const count = state.routes.length;
  const seg = w > 0 ? (w - 12) / count : 0;
  const x = useSharedValue(0);
  useEffect(() => { x.value = withSpring(state.index * seg, spring.nav); }, [state.index, seg]);
  const hl = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const bar = useAnimatedStyle(() => ({ transform: [{ translateY: (hidden?.value ?? 0) * 110 }] }));
  const bottom = Math.max(insets.bottom - 6, 14);

  return (
    <Animated.View
      accessibilityRole="tablist"
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      style={[{ position: 'absolute', left: 16, right: 16, bottom, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: hasLiquidGlass ? 0 : 1, borderColor: c.navLine,
        shadowColor: '#101828', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 }, bar]}
    >
      <GlassBackdrop radius={32} />
      {seg > 0 && <Animated.View style={[{ position: 'absolute', top: 6, left: 6, width: seg, height: 50, borderRadius: 25, backgroundColor: `${c.accent}D6`, shadowColor: c.accent, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, hl]} />}
      <View style={{ flex: 1, flexDirection: 'row', padding: 6 }}>
        {state.routes.map((r: any, i: number) => {
          const on = state.index === i;
          const Icon = ICONS[r.name] ?? Sun;
          const col = on ? '#fff' : c.muted;
          return (
            <Pressable
              key={r.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={LABELS[r.name] ?? r.name}
              onPress={() => {
                haptic.tap();
                const ev = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
                if (!on && !ev.defaultPrevented) navigation.navigate(r.name);
                if (hidden) hidden.value = withTiming(0);
              }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }}
            >
              <Icon size={22} strokeWidth={on ? 2.3 : 1.9} color={col} />
              <Text style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 14, color: col }}>{LABELS[r.name] ?? r.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}
