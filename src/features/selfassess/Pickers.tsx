/* eslint-disable react-hooks/refs -- the slider's touch handler reads the latest value through a ref */
import React, { useMemo, useRef, useState } from 'react';
import { Image, PanResponder, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Info, Minus, Plus } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { Ruler } from '@/design-system/primitives/Ruler';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';

// Every step of the self assessment has its own look, suited to what it asks. This file has the ones that are not a plain list.
type Pick = { options: { v: string; sub?: string }[]; value: string | undefined; onPick: (v: string) => void };

// (not used now: body fat has its own picker)
export function FatGrid({ options, value, onPick }: Pick) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {options.map((o) => {
        const on = value === o.v;
        const wide = o.v === 'Not sure';
        return (
          <Pressy key={o.v} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onPick(o.v)} scaleTo={0.96}
            style={{ width: wide ? '100%' : '31%', flexGrow: 1, height: wide ? 52 : 84, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : c.surface }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: wide ? fontSizes.base : fontSizes.lg, color: on ? c.accentInk : c.ink }}>{o.v}</Txt>
          </Pressy>
        );
      })}
    </View>
  );
}

// Body fat: a photo for each range (one sheet of photos, cut into tiles the way the design cuts it). Tap the one that looks most like you.
const SHEET = require('../../../assets/selfassess/body-fat.png');
// where each range's photo sits on the sheet, in percent of the tile: width, height, left, top
const FAT_TILES: { v: string; w: string; h: string; l: string; t: string }[] = [
  { v: '3-5 %', w: '301%', h: '407.72%', l: '0%', t: '-59.73%' },
  { v: '6-9 %', w: '302.01%', h: '407.72%', l: '-101.01%', t: '-59.73%' },
  { v: '10-12 %', w: '302.01%', h: '416.1%', l: '-201.68%', t: '-62.33%' },
  { v: '13-17 %', w: '302.01%', h: '410.47%', l: '0%', t: '-178.04%' },
  { v: '17-22 %', w: '302.01%', h: '410.47%', l: '-101.01%', t: '-178.04%' },
  { v: '23-27 %', w: '301%', h: '410.47%', l: '-201%', t: '-178.04%' },
  { v: '28-32 %', w: '301%', h: '410.47%', l: '0%', t: '-294.93%' },
  { v: '33-37 %', w: '301%', h: '410.47%', l: '-201%', t: '-294.93%' },
];
export function FatImages({ value, onPick }: { value: string | undefined; onPick: (v: string) => void }) {
  const { c } = useTheme();
  const tile = (v: string, content: React.ReactNode) => {
    const on = value === v;
    return (
      <Pressy key={v} accessibilityRole="button" accessibilityLabel={v === 'Not sure' ? 'Not sure' : `Body fat ${v}`} accessibilityState={{ selected: on }} onPress={() => onPick(v)} scaleTo={0.96} style={{ width: '31%', flexGrow: 1, alignItems: 'center', gap: 6 }}>
        <View style={{ width: '82%', aspectRatio: 1, borderRadius: radii.lg, overflow: 'hidden', borderWidth: 2.5, borderColor: on ? c.accent : 'transparent', backgroundColor: c.accentSoft }}>
          {content}
          {on && <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: c.accent + '4D' }} />}
        </View>
        <Txt style={{ fontFamily: on ? font.semibold : font.medium, fontSize: fontSizes.md, color: on ? c.accentText : c.ink }}>{v}</Txt>
      </Pressy>
    );
  };
  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, columnGap: 8 }}>
        {FAT_TILES.map((t) => tile(t.v, <Image source={SHEET} resizeMode="stretch" style={{ position: 'absolute', width: t.w as `${number}%`, height: t.h as `${number}%`, left: t.l as `${number}%`, top: t.t as `${number}%` }} />))}
        {tile('Not sure', <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Txt style={{ fontFamily: font.displayBold, fontSize: 44, color: c.accentText }}>?</Txt></View>)}
      </View>
      <Row style={{ gap: 8, padding: 12, borderRadius: radii.md, backgroundColor: c.accentSoft, alignItems: 'flex-start' }}>
        <Info size={18} color={c.accentText} />
        <Txt style={{ flex: 1, fontSize: fontSizes.sm, lineHeight: 19 }}>Images are provided for reference, actual body types may vary.</Txt>
      </Row>
    </View>
  );
}

// Workouts a week: the number big on top, a bar with five equal segments to choose from, and "I don't workout" under it.
export function FreqPicker({ options, value, onPick }: Pick) {
  const { c } = useTheme();
  const nums = options.filter((o) => o.v !== "I don't workout");
  const none = value === "I don't workout";
  return (
    <View style={{ gap: 26, paddingTop: 12 }}>
      <View style={{ alignItems: 'center' }}>
        <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.displayBold, fontSize: 80, lineHeight: 92, letterSpacing: -2 }}>{none ? '0' : value ?? '3'}</Txt>
        <Txt muted style={{ fontSize: fontSizes.base }}>Days per week</Txt>
      </View>
      <Row style={{ padding: 6, gap: 6, borderRadius: radii.xl, backgroundColor: c.surface }}>
        {nums.map((o) => {
          const on = value === o.v;
          return (
            <Pressy key={o.v} accessibilityRole="button" accessibilityLabel={`${o.v} ${o.sub ?? ''}`} accessibilityState={{ selected: on }} onPress={() => onPick(o.v)} scaleTo={0.94}
              style={{ flex: 1, height: 64, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : 'transparent' }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, color: on ? c.accentInk : c.ink }}>{o.v}</Txt>
            </Pressy>
          );
        })}
      </Row>
      <Row style={{ gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
        <Txt muted>or</Txt>
        <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
      </Row>
      <Pressy accessibilityRole="button" accessibilityState={{ selected: none }} onPress={() => onPick("I don't workout")} scaleTo={0.98}
        style={{ minHeight: 60, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: none ? c.accentSoft : c.surface, borderWidth: 1.5, borderColor: none ? c.accent : 'transparent' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, color: none ? c.accentText : c.muted }}>I don’t workout</Txt>
      </Pressy>
    </View>
  );
}

// A water bottle that fills up to the level, with litre marks down its side.
function Bottle({ level }: { level: number }) {
  const { c } = useTheme();
  const top = 50, bottom = 220;
  const h = level * (bottom - top);
  const y = bottom - h;
  const body = 'M50 14 H90 V50 Q120 56 120 84 V196 Q120 220 96 220 H44 Q20 220 20 196 V84 Q20 56 50 50 Z';
  return (
    <View accessibilityElementsHidden style={{ width: 190, height: 232 }}>
      <Svg width={190} height={232} viewBox="0 0 190 232">
        <Defs><ClipPath id="bottle"><Path d={body} /></ClipPath></Defs>
        <Rect x={46} y={0} width={48} height={14} rx={4} fill={c.water} />
        <Path d={body} fill={c.waterSoft} />
        <G clipPath="url(#bottle)">
          <Path d={`M10 ${y} Q35 ${y - 9} 70 ${y} T130 ${y} V232 H10 Z`} fill={c.water} opacity={0.9} />
        </G>
        <Path d={body} fill="none" stroke={c.water} strokeWidth={3} />
        {[1, 2, 3, 4].map((l) => { const ly = bottom - (l / 4) * (bottom - top); return (
          <G key={l}>
            <Line x1={126} y1={ly} x2={138} y2={ly} stroke={c.chipLine} strokeWidth={2} />
            <SvgText x={144} y={ly + 5} fontSize={13} fill={c.muted}>{`${l} L`}</SvgText>
          </G>
        ); })}
      </Svg>
    </View>
  );
}

// Water: a bottle that fills up as you drag the slider under it. The four stops are the four answers.
const WATER = ['Less than 1 l', '1-2 l', '3-4 l', 'More than 4 l'];
export const WATER_STOPS = WATER;
export function WaterSlider({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { c } = useTheme();
  const idx = Math.max(0, WATER.indexOf(value));
  const [w, setW] = useState(0);
  const live = useRef({ idx, w, onChange });
  live.current = { idx, w, onChange };
  const pan = useMemo(() => {
    const set = (x: number) => {
      const { w: width, idx: cur, onChange: ch } = live.current;
      if (!width) return;
      const i = Math.round(Math.min(1, Math.max(0, x / width)) * (WATER.length - 1));
      if (i !== cur) { haptic.tick(); ch(WATER[i]); }
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => set(e.nativeEvent.locationX),
      onPanResponderMove: (e) => set(e.nativeEvent.locationX),
    });
  }, []);
  const level = [0.18, 0.45, 0.75, 1][idx];
  return (
    <View style={{ gap: 28, alignItems: 'center', paddingTop: 8 }}>
      <Bottle level={level} />
      <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.displayBold, fontSize: 40, lineHeight: 48, letterSpacing: -1 }}>{WATER[idx]}</Txt>
      <View style={{ alignSelf: 'stretch', gap: 8 }}>
        <View {...pan.panHandlers} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="adjustable" accessibilityLabel="Water a day" accessibilityValue={{ text: WATER[idx] }} style={{ height: 56, justifyContent: 'center' }}>
          <View pointerEvents="none" style={{ height: 10, borderRadius: radii.xs, backgroundColor: c.surface3 }}>
            <View style={{ width: `${(idx / (WATER.length - 1)) * 100}%`, height: 10, borderRadius: radii.xs, backgroundColor: c.water }} />
          </View>
          {WATER.map((_, i) => <View key={i} pointerEvents="none" style={{ position: 'absolute', left: w ? (i / (WATER.length - 1)) * w - 4 : 0, top: 24, width: 8, height: 8, borderRadius: radii.xs, backgroundColor: i <= idx ? c.accentInk : c.chipLine }} />)}
          <View pointerEvents="none" style={{ position: 'absolute', left: w ? (idx / (WATER.length - 1)) * w - 17 : 0, top: 11, width: 34, height: 34, borderRadius: radii.pill, backgroundColor: c.surface, borderWidth: 3, borderColor: c.water }} />
        </View>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt muted style={{ fontSize: fontSizes.sm }}>Less</Txt>
          <Txt muted style={{ fontSize: fontSizes.sm }}>More</Txt>
        </Row>
      </View>
    </View>
  );
}

// The chart-bar picture from the design: three bars of rising height. The bars up to the level are filled, the rest are outlines.
function LevelIcon({ level, color }: { level: number; color: string }) {
  return (
    <Svg width={44} height={44} viewBox="0 0 40.2353 40.2353" fill="none">
      {[0, 1, 2].map((j) => (
        <Rect key={j} x={10.1176 + j * 7.5} y={20.1176 - j * 5} width={5} height={10 + j * 5} rx={1.25}
          fill={j <= level ? color : 'none'} stroke={color} strokeWidth={1.4} />
      ))}
    </Svg>
  );
}

// Training level: three cards with the chart-bar picture, filled up to the level.
export function LevelCards({ options, value, onPick }: Pick) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 14 }}>
      {options.map((o, i) => {
        const on = value === o.v;
        return (
          <Pressy key={o.v} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onPick(o.v)} scaleTo={0.98}
            style={{ minHeight: 96, borderRadius: radii.lg, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: on ? c.accentSoft : c.surface, borderWidth: 1.5, borderColor: on ? c.accent : 'transparent' }}>
            <LevelIcon level={i} color={on ? c.accent : c.muted} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, color: on ? c.accentText : c.ink }}>{o.v}</Txt>
              {!!o.sub && <Txt muted style={{ fontSize: fontSizes.md }}>{o.sub}</Txt>}
            </View>
          </Pressy>
        );
      })}
    </View>
  );
}

// Flexibility: five columns that grow from Poor to Excellent. Tap the one that matches how far you reached.
export function FlexBars({ options, value, onPick }: Pick) {
  const { c } = useTheme();
  return (
    <Row style={{ alignItems: 'flex-end', gap: 8, height: 230 }}>
      {options.map((o, i) => {
        const on = value === o.v;
        return (
          <Pressy key={o.v} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onPick(o.v)} scaleTo={0.96} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
            <View style={{ width: '100%', height: 50 + i * 30, borderRadius: radii.md, backgroundColor: on ? c.accent : c.surface3 }} />
            <Txt style={{ fontSize: fontSizes.sm, fontFamily: on ? font.semibold : font.regular, color: on ? c.accentText : c.muted, textAlign: 'center' }}>{o.v}</Txt>
          </Pressy>
        );
      })}
    </Row>
  );
}

// A barbell: a 20 kg bar with plates on both sides that follow the weight (the biggest plates first).
const PLATES: { kg: number; w: number; h: number }[] = [{ kg: 20, w: 14, h: 96 }, { kg: 10, w: 12, h: 80 }, { kg: 5, w: 10, h: 62 }, { kg: 2.5, w: 8, h: 48 }, { kg: 1.25, w: 6, h: 38 }];
export function BarbellVisual({ kg }: { kg: number }) {
  const { c } = useTheme();
  const colors = [c.accentText, c.good, c.warn, c.muted, c.chipLine];
  let left = Math.max(0, (kg - 20) / 2);
  const side: number[] = [];
  PLATES.forEach((p, i) => { while (left >= p.kg - 0.001 && side.length < 12) { side.push(i); left -= p.kg; } });
  const plate = (i: number, key: string) => <View key={key} style={{ width: PLATES[i].w, height: PLATES[i].h, borderRadius: radii.xs, backgroundColor: colors[i], marginHorizontal: 1 }} />;
  return (
    <View accessibilityElementsHidden style={{ height: 110, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>{side.slice().reverse().map((i, k) => plate(i, 'l' + k))}</View>
      <View style={{ width: 96, height: 10, borderRadius: radii.xs, backgroundColor: c.muted }} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>{side.map((i, k) => plate(i, 'r' + k))}</View>
    </View>
  );
}

// The barbell straight on the page, with a thin line under it like the floor, so the plates are easy to see as the weight changes.
export function BarbellCard({ kg }: { kg: number }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 10, paddingTop: 6 }}>
      <BarbellVisual kg={kg} />
      <View style={{ alignSelf: 'stretch', height: 1, backgroundColor: c.line }} />
    </View>
  );
}

// Leg press: a stack of plates, one for every 25 kg, and a pin. Drag up and down the stack to move the pin; the plates under it light up and the weight is what they add up to.
export function PinStack({ value, onChange, plate = 25, count = 16 }: { value: number; onChange: (v: number) => void; plate?: number; count?: number }) {
  const { c } = useTheme();
  const rowH = 21;
  const H = count * rowH;
  const live = useRef({ value, onChange });
  live.current = { value, onChange };
  const pan = useMemo(() => {
    const set = (y: number) => {
      const k = Math.min(count, Math.max(0, count - Math.floor(y / rowH))); // plates from the bottom, up to the one touched
      const w = k * plate;
      if (w !== live.current.value) { haptic.tick(); live.current.onChange(w); }
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => set(e.nativeEvent.locationY),
      onPanResponderMove: (e) => set(e.nativeEvent.locationY),
    });
  }, [count, plate]);
  const k = Math.round(value / plate);
  const bump = (d: number) => { haptic.tick(); onChange(Math.min(count * plate, Math.max(0, value + d))); };
  return (
    <Row style={{ gap: 18, alignItems: 'center' }}>
      <View style={{ flex: 1, gap: 16 }}>
        <View>
          <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.displayBold, fontSize: 72, lineHeight: 84, letterSpacing: -2 }}>{String(Math.round(value))}</Txt>
          <Txt muted style={{ fontSize: fontSizes.lg }}>kg</Txt>
        </View>
        <Txt muted style={{ fontSize: fontSizes.md }}>Drag the pin up or down the stack.</Txt>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {[-25, -5, 5, 25].map((d) => (
            <Pressy key={d} accessibilityRole="button" accessibilityLabel={`${d > 0 ? 'Add' : 'Take off'} ${Math.abs(d)} kg`} onPress={() => bump(d)} scaleTo={0.94}
              style={{ height: 44, minWidth: 60, paddingHorizontal: 12, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface }}>
              <Txt style={{ fontFamily: font.semibold }}>{`${d > 0 ? '+' : '−'}${Math.abs(d)}`}</Txt>
            </Pressy>
          ))}
        </Row>
      </View>
      <View {...pan.panHandlers} accessibilityRole="adjustable" accessibilityLabel="Weight stack" accessibilityValue={{ text: `${value} kilograms` }} style={{ width: 150, height: H }}>
        {Array.from({ length: count }, (_, r) => {
          const fromBottom = count - r; // 1 is the bottom plate
          const on = fromBottom <= k;
          return <View key={r} pointerEvents="none" style={{ height: rowH - 3, marginBottom: 3, borderRadius: radii.xs, backgroundColor: on ? (fromBottom % 2 ? c.accent : c.accentText) : c.surface3 }} />;
        })}
        {k > 0 && <View pointerEvents="none" style={{ position: 'absolute', left: -14, right: -14, top: (count - k) * rowH + (rowH - 3) / 2 - 2, height: 4, borderRadius: radii.xs, backgroundColor: c.warn }} />}
      </View>
    </Row>
  );
}

// Blood glucose: a half-circle gauge in four colour zones (low, normal, a little high, high). Drag around the gauge or use minus and plus; the needle follows.
const G_MIN = 50, G_MAX = 300;
const GW = 300, GC = { x: 150, y: 150 }, GR = 118;
const gAngle = (v: number) => Math.PI * (1 - (v - G_MIN) / (G_MAX - G_MIN)); // 50 on the left, 300 on the right
const gPt = (v: number, r = GR) => ({ x: GC.x + r * Math.cos(gAngle(v)), y: GC.y - r * Math.sin(gAngle(v)) });
const gArc = (a: number, b: number) => { const p = gPt(a), q = gPt(b); return `M ${p.x} ${p.y} A ${GR} ${GR} 0 0 1 ${q.x} ${q.y}`; };
export function GlucoseGauge({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { c } = useTheme();
  const live = useRef({ value, onChange });
  live.current = { value, onChange };
  const pan = useMemo(() => {
    const set = (x: number, y: number) => {
      const ang = Math.atan2(GC.y - y, x - GC.x); // 0 on the right, pi on the left
      const t = 1 - Math.min(1, Math.max(0, ang < 0 ? (x < GC.x ? Math.PI : 0) : ang) / Math.PI);
      const v = Math.round(G_MIN + t * (G_MAX - G_MIN));
      if (v !== live.current.value) { haptic.tick(); live.current.onChange(v); }
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => set(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e) => set(e.nativeEvent.locationX, e.nativeEvent.locationY),
    });
  }, []);
  const zones: { a: number; b: number; color: string }[] = [
    { a: 50, b: 70, color: c.warn }, { a: 70, b: 140, color: c.good }, { a: 140, b: 200, color: c.cAct }, { a: 200, b: 300, color: c.danger },
  ];
  const zone = value < 70 ? 'Low' : value <= 140 ? 'Normal range' : value <= 200 ? 'A little high' : 'High';
  const zoneColor = value < 70 ? c.warn : value <= 140 ? c.good : value <= 200 ? c.cAct : c.danger;
  const tip = gPt(value, GR - 34), mark = gPt(value);
  const bump = (d: number) => { haptic.tick(); onChange(Math.min(G_MAX, Math.max(G_MIN, value + d))); };
  return (
    <View style={{ alignItems: 'center', gap: 14 }}>
      <View {...pan.panHandlers} accessibilityRole="adjustable" accessibilityLabel="Blood glucose gauge" accessibilityValue={{ text: `${value} milligrams per decilitre, ${zone}` }} style={{ width: GW, height: 170 }}>
        <Svg width={GW} height={170} pointerEvents="none">
          {zones.map((z) => <Path key={z.a} d={gArc(z.a, z.b)} stroke={z.color} strokeWidth={22} fill="none" opacity={value >= z.a && value <= z.b ? 1 : 0.45} />)}
          <Line x1={GC.x} y1={GC.y} x2={tip.x} y2={tip.y} stroke={c.ink} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={GC.x} cy={GC.y} r={10} fill={c.ink} />
          <Circle cx={mark.x} cy={mark.y} r={15} fill={c.surface} stroke={zoneColor} strokeWidth={5} />
        </Svg>
      </View>
      <Row style={{ gap: 22 }}>
        <RoundBtn label="Lower" onPress={() => bump(-1)}><Minus size={24} color={c.ink} /></RoundBtn>
        <View style={{ alignItems: 'center', minWidth: 130 }}>
          <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.displayBold, fontSize: 60, lineHeight: 70, letterSpacing: -2 }}>{String(value)}</Txt>
          <Txt muted style={{ fontSize: fontSizes.md }}>mg/dl</Txt>
        </View>
        <RoundBtn label="Higher" onPress={() => bump(1)}><Plus size={24} color={c.ink} /></RoundBtn>
      </Row>
      <View style={{ height: 32, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: zoneColor + '2E', justifyContent: 'center' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, color: zoneColor }}>{zone}</Txt>
      </View>
    </View>
  );
}

// Bench press: the barbell on top, a big number with round minus and plus buttons, and quick jumps.
export function StepperStep({ value, onChange, unit, step, min, max, jumps, visual }: { value: number; onChange: (v: number) => void; unit: string; step: number; min: number; max: number; jumps: number[]; visual?: React.ReactNode }) {
  const { c } = useTheme();
  const set = (v: number) => { haptic.tick(); onChange(Math.round(Math.min(max, Math.max(min, v)) * 10) / 10); };
  return (
    <View style={{ alignItems: 'center', gap: 22, paddingTop: 8 }}>
      {visual}
      <Row style={{ gap: 20 }}>
        <RoundBtn label="Lighter" onPress={() => set(value - step)}><Minus size={26} color={c.ink} /></RoundBtn>
        <View style={{ alignItems: 'center', minWidth: 140 }}>
          <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.displayBold, fontSize: 68, lineHeight: 80, letterSpacing: -2 }}>{String(value)}</Txt>
          <Txt muted style={{ fontSize: fontSizes.lg }}>{unit}</Txt>
        </View>
        <RoundBtn label="Heavier" onPress={() => set(value + step)}><Plus size={26} color={c.ink} /></RoundBtn>
      </Row>
      <Row style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {jumps.map((j) => (
          <Pressy key={j} accessibilityRole="button" accessibilityLabel={`${j > 0 ? 'Add' : 'Take off'} ${Math.abs(j)} ${unit}`} onPress={() => set(value + j)} scaleTo={0.94}
            style={{ height: 44, minWidth: 72, paddingHorizontal: 16, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface }}>
            <Txt style={{ fontFamily: font.semibold }}>{`${j > 0 ? '+' : '−'}${Math.abs(j)}`}</Txt>
          </Pressy>
        ))}
      </Row>
    </View>
  );
}

// A stack of plates on a pin, as on a leg press machine: one plate for about every 25 kg.
function PlateStack({ kg }: { kg: number }) {
  const { c } = useTheme();
  const n = Math.min(14, Math.round(kg / 25));
  return (
    <View accessibilityElementsHidden style={{ alignItems: 'flex-start', justifyContent: 'flex-end', height: 150 }}>
      <View style={{ width: 12, height: 150, borderRadius: radii.xs, backgroundColor: c.surface3, position: 'absolute', left: 52 }} />
      {Array.from({ length: n }, (_, i) => <View key={i} style={{ width: 116, height: 8, borderRadius: radii.xs, marginTop: 2, backgroundColor: i % 2 ? c.accent : c.accentText }} />)}
    </View>
  );
}

// Leg press: the number on the left and a tall ruler on the right, like the height screen.
export function SideRuler({ value, onChange, unit, min, max, step, major }: { value: number; onChange: (v: number) => void; unit: string; min: number; max: number; step: number; major: number }) {
  return (
    <Row style={{ height: 400 }}>
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 24 }}>
        <View>
          <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.displayBold, fontSize: 76, lineHeight: 88, letterSpacing: -2 }}>{String(Math.round(value))}</Txt>
          <Txt muted style={{ fontSize: fontSizes.lg }}>{unit}</Txt>
        </View>
        <PlateStack kg={value} />
      </View>
      <Ruler vertical accessibilityLabel="Weight pressed" value={value} onChange={onChange} min={min} max={max} step={step} majorEvery={major} label={(v) => String(Math.round(v))} />
    </Row>
  );
}

// Blood pressure: a monitor screen showing the reading the way a cuff does (top number over bottom number, pulse underneath).
// Tap one of the three numbers to select it, then drag the ruler under the screen to set it.
const BP_RANGE = { sys: { lo: 80, hi: 200 }, dia: { lo: 50, hi: 130 }, pulse: { lo: 40, hi: 140 } } as const;
export function BpStep({ sys, dia, pulse, onChange }: { sys: number; dia: number; pulse: number; onChange: (k: 'sys' | 'dia' | 'pulse', v: number) => void }) {
  const { c } = useTheme();
  const [active, setActive] = useState<'sys' | 'dia' | 'pulse'>('sys');
  const vals = { sys, dia, pulse };
  const cat = sys >= 130 || dia >= 85 ? { t: 'High', col: c.warn } : sys >= 120 ? { t: 'Elevated', col: c.cAct } : { t: 'Normal', col: c.good };
  const LCD = '#0B0E14';
  const digit = (k: 'sys' | 'dia' | 'pulse', label: string, unit: string, size: number) => {
    const on = active === k;
    return (
      <Pressy key={k} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${label} ${vals[k]} ${unit}`} onPress={() => { haptic.tick(); setActive(k); }} scaleTo={0.97}
        style={{ alignItems: 'center', paddingVertical: 6, paddingHorizontal: 18, borderRadius: radii.md, backgroundColor: on ? 'rgba(143,178,255,0.16)' : 'transparent', borderWidth: 1.5, borderColor: on ? c.accentText : 'transparent' }}>
        <Txt style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.6)' }}>{label}</Txt>
        <Row style={{ alignItems: 'baseline', gap: 6 }}>
          <Txt style={{ fontFamily: font.displayBold, fontSize: size, lineHeight: size + 8, letterSpacing: -1.5, color: '#FFFFFF' }}>{String(vals[k])}</Txt>
          <Txt style={{ fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.6)' }}>{unit}</Txt>
        </Row>
      </Pressy>
    );
  };
  return (
    <View style={{ gap: 22 }}>
      <View style={{ borderRadius: radii.xl, backgroundColor: LCD, paddingVertical: 18, paddingHorizontal: 14, alignItems: 'center', gap: 4 }}>
        {digit('sys', 'SYS', 'mm/hg', 56)}
        <View style={{ width: '70%', height: 1, backgroundColor: 'rgba(255,255,255,0.18)' }} />
        {digit('dia', 'DIA', 'mm/hg', 56)}
        <View style={{ width: '70%', height: 1, backgroundColor: 'rgba(255,255,255,0.18)' }} />
        {digit('pulse', 'PULSE', 'bpm', 36)}
      </View>
      <View style={{ alignSelf: 'center', height: 32, paddingHorizontal: 14, borderRadius: radii.pill, backgroundColor: cat.col + '2E', justifyContent: 'center' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, color: cat.col }}>{cat.t}</Txt>
      </View>
      <Ruler key={active} accessibilityLabel={active === 'sys' ? 'Systolic' : active === 'dia' ? 'Diastolic' : 'Pulse rate'} value={vals[active]} onChange={(v) => onChange(active, v)} min={BP_RANGE[active].lo} max={BP_RANGE[active].hi} step={1} majorEvery={10} label={(v) => String(Math.round(v))} />
    </View>
  );
}

// Next assessment: a few ready-made gaps as tiles, and the date it lands on.
export function DayTiles({ days, onChange, today }: { days: number; onChange: (d: number) => void; today: number }) {
  const { c } = useTheme();
  const date = new Date(today + days * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {[30, 45, 60, 90].map((n) => {
          const on = days === n;
          return (
            <Pressy key={n} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => { haptic.tick(); onChange(n); }} scaleTo={0.96}
              style={{ width: '47%', flexGrow: 1, height: 104, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : c.surface }}>
              <Txt style={{ fontFamily: font.displayBold, fontSize: 40, lineHeight: 48, color: on ? c.accentInk : c.ink }}>{String(n)}</Txt>
              <Txt style={{ fontSize: fontSizes.md, color: on ? c.accentInk : c.muted }}>Days</Txt>
            </Pressy>
          );
        })}
      </View>
      <Txt style={{ textAlign: 'center', fontFamily: font.medium }}>{`Scheduled for ${date}`}</Txt>
    </View>
  );
}
