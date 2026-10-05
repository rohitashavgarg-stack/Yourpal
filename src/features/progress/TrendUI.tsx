import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { ChevronLeft, ChevronRight } from '@/lib/icons';
import { Pressy, Row, Segmented, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { fade } from '@/theme/motion';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { dow, RANGES, Range, shift, sod, START, TODAY, Trend, windowOf } from './trends';
import { progressStore } from './store';

// ============ Day | Week | Month | Year, with ‹ date › you can also swipe ============
export function RangeBar() {
  const { c } = useTheme();
  const { openSheet } = useOverlay();
  const ps = progressStore.use();
  const anchor = new Date(ps.anchor);
  const win = windowOf(ps.range, anchor);
  const go = (n: number) => {
    if ((n > 0 && !win.canNext) || (n < 0 && !win.canPrev)) { haptic.warn(); return; }
    haptic.tick();
    progressStore.set({ anchor: shift(ps.range, anchor, n).getTime() });
  };
  // Swipe the date row: left = later, right = earlier.
  const swipe = Gesture.Pan().runOnJS(true).activeOffsetX([-14, 14]).failOffsetY([-12, 12])
    .onEnd((e) => { if (e.translationX < -40) go(1); else if (e.translationX > 40) go(-1); });
  return (
    <View style={{ gap: 10 }}>
      <Segmented<Range> accessibilityLabel="Period" value={ps.range} onChange={(range) => progressStore.set({ range })} options={RANGES} />
      <GestureDetector gesture={swipe}>
        <Row collapsable={false} style={{ gap: 8 }}>
          <Pressy accessibilityRole="button" accessibilityLabel="Earlier" disabled={!win.canPrev} onPress={() => go(-1)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: win.canPrev ? 1 : 0.35 }}>
            <ChevronLeft size={20} color={c.ink} />
          </Pressy>
          <Pressy accessibilityRole="button" accessibilityLabel={`${win.label}. Pick a date`} onPress={() => openSheet(<DateSheet />, { label: 'Pick a date' })} style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Txt accessibilityLiveRegion="polite" numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 15 }}>{win.label}</Txt>
            <Txt v="caption">{win.current ? 'Swipe or tap for a calendar' : 'Tap for a calendar'}</Txt>
          </Pressy>
          <Pressy accessibilityRole="button" accessibilityLabel="Later" disabled={!win.canNext} onPress={() => go(1)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: win.canNext ? 1 : 0.35 }}>
            <ChevronRight size={20} color={c.ink} />
          </Pressy>
        </Row>
      </GestureDetector>
      {!win.current && (
        <Pressy accessibilityRole="button" onPress={() => { haptic.tick(); progressStore.set({ anchor: sod(TODAY).getTime() }); }} style={{ alignSelf: 'center', height: 32, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.accentSoft, justifyContent: 'center', marginTop: -2 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 12, color: c.accentText }}>Back to today</Txt>
        </Pressy>
      )}
    </View>
  );
}

// Slim version that docks under the header once the full bar has scrolled away: period chips + ‹ › + the date in one small block.
export function RangeBarSlim() {
  const { c } = useTheme();
  const { openSheet } = useOverlay();
  const ps = progressStore.use();
  const anchor = new Date(ps.anchor);
  const win = windowOf(ps.range, anchor);
  const go = (n: number) => {
    if ((n > 0 && !win.canNext) || (n < 0 && !win.canPrev)) { haptic.warn(); return; }
    haptic.tick();
    progressStore.set({ anchor: shift(ps.range, anchor, n).getTime() });
  };
  const btn = { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <View style={{ gap: 4 }}>
      <Row style={{ gap: 6 }}>
        <Pressy accessibilityRole="button" accessibilityLabel="Earlier" disabled={!win.canPrev} onPress={() => go(-1)} style={[btn, { opacity: win.canPrev ? 1 : 0.35 }]}><ChevronLeft size={18} color={c.ink} /></Pressy>
        <View accessibilityRole="radiogroup" accessibilityLabel="Period" style={{ flex: 1, flexDirection: 'row', gap: 4, backgroundColor: c.surface2, borderRadius: 18, padding: 2 }}>
          {RANGES.map((r) => {
            const on = r.value === ps.range;
            return (
              <Pressy key={r.value} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={r.label} onPress={() => { haptic.tick(); progressStore.set({ range: r.value }); }}
                style={{ flex: 1, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.ink : 'transparent' }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 18, color: on ? c.bg : c.muted }}>{r.label}</Txt>
              </Pressy>
            );
          })}
        </View>
        <Pressy accessibilityRole="button" accessibilityLabel="Later" disabled={!win.canNext} onPress={() => go(1)} style={[btn, { opacity: win.canNext ? 1 : 0.35 }]}><ChevronRight size={18} color={c.ink} /></Pressy>
      </Row>
      <Pressy accessibilityRole="button" accessibilityLabel={`${win.label}. Pick a date`} onPress={() => openSheet(<DateSheet />, { label: 'Pick a date' })} style={{ alignSelf: 'center', minHeight: 24, paddingHorizontal: 12, justifyContent: 'center' }}>
        <Txt v="caption" style={{ textAlign: 'center', fontSize: 12, lineHeight: 16 }}>{win.label}</Txt>
      </Pressy>
    </View>
  );
}

// ============ Calendar to jump to any day ============
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function DateSheet() {
  const { c } = useTheme();
  const { closeSheet } = useOverlay();
  const ps = progressStore.use();
  const anchor = new Date(ps.anchor);
  const [cursor, setCursor] = useState(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const lead = dow(first);
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))];
  while (cells.length % 7) cells.push(null);
  const canBack = cursor > new Date(2026, 0, 1), canFwd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1) <= TODAY;
  const win = windowOf(ps.range, anchor);
  return (
    <>
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressy accessibilityRole="button" accessibilityLabel="Previous month" disabled={!canBack} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: canBack ? 1 : 0.35 }}><ChevronLeft size={20} color={c.ink} /></Pressy>
        <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: 17 }}>{MONTHS[cursor.getMonth()]} {cursor.getFullYear()}</Txt>
        <Pressy accessibilityRole="button" accessibilityLabel="Next month" disabled={!canFwd} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center', opacity: canFwd ? 1 : 0.35 }}><ChevronRight size={20} color={c.ink} /></Pressy>
      </Row>
      <Row>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => <Txt key={i} v="caption" style={{ flex: 1, textAlign: 'center' }}>{l}</Txt>)}</Row>
      <View>
        {Array.from({ length: cells.length / 7 }, (_, r) => (
          <Row key={r}>
            {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
              if (!d) return <View key={i} style={{ flex: 1, height: 46 }} />;
              const future = d > TODAY, inWin = d >= win.start && d <= win.end, isToday = sod(d).getTime() === sod(TODAY).getTime();
              return (
                <View key={i} style={{ flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' }}>
                  <Pressy accessibilityRole="button" accessibilityLabel={d.toDateString()} disabled={future} onPress={() => { progressStore.set({ anchor: sod(d).getTime() }); haptic.tick(); closeSheet(); }} scaleTo={0.9}
                    style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: inWin ? c.accentSoft : 'transparent', borderWidth: isToday ? 1.5 : 0, borderColor: c.accent, opacity: future ? 0.3 : 1 }}>
                    <Txt style={{ fontFamily: inWin ? font.semibold : font.regular, fontSize: 14, color: inWin ? c.accentText : c.ink }}>{d.getDate()}</Txt>
                    {!future && d >= sod(START) && <View style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: c.accent, opacity: 0.6 }} />}
                  </Pressy>
                </View>
              );
            })}
          </Row>
        ))}
      </View>
      <Txt v="caption" style={{ textAlign: 'center' }}>Dots mark days with data since you joined on 2 Sep.</Txt>
    </>
  );
}

// ============ Charts ============
function Bar({ h, w, color, dim }: { h: number; w: number; color: string; dim: boolean }) {
  const y = useSharedValue(0);
  useEffect(() => { y.value = withTiming(h, { duration: 450, easing: Easing.out(Easing.cubic) }); }, [h]);
  const a = useAnimatedStyle(() => ({ height: y.value }));
  return <Animated.View style={[{ width: w, borderRadius: Math.min(6, w / 2), backgroundColor: color, opacity: dim ? 0.4 : 1 }, a]} />;
}

export function TrendChart({ t, unit, height = 170, onSwipe, color }: { t: Trend; unit: string; height?: number; onSwipe?: (dir: 1 | -1) => void; color?: string }) {
  const { c } = useTheme();
  const col = color ?? c.accent;
  const [w, setW] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => setSel(null), [t.key]);
  const n = t.buckets.length;
  const nums = t.vals.filter((v): v is number => v != null);
  const max = Math.max(t.goal ?? 0, ...nums, 1);
  const min = Math.min(...nums);
  const colW = w / Math.max(1, n);
  const barW = Math.max(3, Math.min(24, colW * 0.62));
  const chartH = height - 26;
  const swipe = Gesture.Pan().runOnJS(true).activeOffsetX([-16, 16]).failOffsetY([-14, 14])
    .onEnd((e) => { if (!onSwipe) return; if (e.translationX < -50) onSwipe(1); else if (e.translationX > 50) onSwipe(-1); });

  const selText = sel != null && t.vals[sel] != null ? `${t.buckets[sel].sub} · ${t.fmt(t.vals[sel] as number)}${unit}` : t.kind === 'bars' ? 'Tap a bar for details · swipe for other periods' : 'Tap the line for details · swipe for other periods';

  let body: React.ReactNode = null;
  if (w > 0 && t.hasData) {
    if (t.kind === 'bars') {
      body = (
        <View style={{ height: chartH, flexDirection: 'row', alignItems: 'flex-end' }}>
          {t.goal != null && <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: (t.goal / max) * (chartH - 6), borderTopWidth: 1, borderStyle: 'dashed', borderColor: c.chipLine }} />}
          {t.vals.map((v, i) => (
            <Pressy key={i} accessibilityRole="button" accessibilityLabel={v == null ? `${t.buckets[i].sub}, no data` : `${t.buckets[i].sub}, ${t.fmt(v)}${unit}`} haptics={false} scaleTo={1} onPress={() => { if (v != null) { haptic.tick(); setSel(sel === i ? null : i); } }}
              style={{ width: colW, height: chartH, alignItems: 'center', justifyContent: 'flex-end' }}>
              {v == null ? <View style={{ width: barW, height: 3, borderRadius: 2, backgroundColor: c.surface2 }} /> : <Bar h={Math.max(3, (v / max) * (chartH - 6))} w={barW} color={t.goal != null && v >= t.goal ? c.good : col} dim={sel != null && sel !== i} />}
            </Pressy>
          ))}
        </View>
      );
    } else {
      const span = max === min ? 1 : max - min;
      const pts = t.vals.map((v, i) => (v == null ? null : [colW * i + colW / 2, 8 + ((max - v) / span) * (chartH - 24)] as const));
      let d = '';
      pts.forEach((p, i) => { if (p) d += `${pts[i - 1] ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)} `; });
      const last = [...pts].reverse().find(Boolean);
      body = (
        <View style={{ height: chartH }}>
          <Svg width={w} height={chartH}>
            {[0.15, 0.5, 0.85].map((f) => <Line key={f} x1={0} x2={w} y1={f * chartH} y2={f * chartH} stroke={c.line} strokeWidth={1} />)}
            <Path d={d} fill="none" stroke={col} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            {n <= 12 && pts.map((p, i) => (p ? <Circle key={i} cx={p[0]} cy={p[1]} r={sel === i ? 6 : 3.5} fill={sel === i ? col : c.surface} stroke={col} strokeWidth={2} /> : null))}
            {n > 12 && last ? <Circle cx={last[0]} cy={last[1]} r={5} fill={c.surface} stroke={col} strokeWidth={2.5} /> : null}
            {sel != null && pts[sel] && n > 12 ? <Circle cx={pts[sel]![0]} cy={pts[sel]![1]} r={6} fill={col} /> : null}
          </Svg>
          <Row style={{ position: 'absolute', left: 0, top: 0, width: w, height: chartH }}>
            {t.vals.map((v, i) => <Pressy key={i} accessibilityRole="button" accessibilityLabel={v == null ? `${t.buckets[i].sub}, no data` : `${t.buckets[i].sub}, ${t.fmt(v)}${unit}`} haptics={false} scaleTo={1} onPress={() => { if (v != null) { haptic.tick(); setSel(sel === i ? null : i); } }} style={{ width: colW, height: chartH }} />)}
          </Row>
        </View>
      );
    }
  }

  return (
    <GestureDetector gesture={swipe}>
      <View collapsable={false} accessible={false} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ gap: 6 }}>
        <Txt accessibilityLiveRegion="polite" v="caption" style={{ minHeight: 18, color: sel != null ? c.ink : c.muted, fontFamily: sel != null ? font.semibold : font.regular }}>{selText}</Txt>
        <Animated.View key={t.key} entering={fade()} style={{ minHeight: height - 26 }}>
          {!t.hasData ? <View style={{ height: chartH, alignItems: 'center', justifyContent: 'center' }}><Txt muted style={{ textAlign: 'center' }}>{t.empty}</Txt></View> : body}
        </Animated.View>
        {w > 0 && t.hasData && (
          <View style={{ height: 20, flexDirection: 'row' }}>
            {t.buckets.map((b, i) => (
              <View key={i} style={{ width: colW, height: 20 }}>
                {!!b.label && <Txt style={{ position: 'absolute', top: 0, left: colW / 2 - 16, width: 32, textAlign: 'center', fontSize: 11, lineHeight: 15, color: sel === i ? c.ink : c.muted }} numberOfLines={1}>{b.label}</Txt>}
              </View>
            ))}
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

// Tiny bars for the summary cards.
export function MiniBars({ vals, color, w = 112, h = 44 }: { vals: (number | null)[]; color: string; w?: number; h?: number }) {
  const { c } = useTheme();
  const nums = vals.filter((v): v is number => v != null);
  const max = Math.max(...nums, 1);
  const cw = w / Math.max(1, vals.length);
  const bw = Math.max(2, Math.min(10, cw * 0.62));
  return (
    <View style={{ width: w, height: h, flexDirection: 'row', alignItems: 'flex-end' }}>
      {vals.map((v, i) => (
        <View key={i} style={{ width: cw, alignItems: 'center', justifyContent: 'flex-end', height: h }}>
          <View style={{ width: bw, height: v == null ? 2 : Math.max(3, (v / max) * (h - 2)), borderRadius: Math.min(3, bw / 2), backgroundColor: v == null ? c.surface2 : color }} />
        </View>
      ))}
    </View>
  );
}
