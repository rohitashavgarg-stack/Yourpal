import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { CirclePlus, Droplet, Flame, GlassWater, Heart, Moon, Plus, Scale } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { font } from '@/theme/tokens';
import { fmt1 } from '@/lib/useNow';
import { DotText } from './DotText';
import { radii, fontSizes, fixed } from '@/design-system/tokens';

// New tracker widget designs. Plain tiles driven by props, so they can sit on Today, on the designs page and on the Profile card.
export const TILE = 164;
const W_IN = TILE - 28;

type Icon = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export function WTile({ colors, onPress, label, Icon, a11y, children, right, add }: { colors: [string, string, ...string[]]; onPress?: () => void; label?: string; Icon?: Icon; a11y: string; children: React.ReactNode; right?: React.ReactNode; add?: { label: string; onPress?: () => void; variant?: 'round' | 'glass' } }) {
  const inner = (
    <>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
      {label ? (
        <Row style={{ gap: 8, minHeight: 26, justifyContent: 'space-between' }}>
          <Row style={{ gap: 8 }}>
            <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, lineHeight: 19, color: 'rgba(255,255,255,0.9)' }}>{label}</Txt>
          </Row>
          {right}
        </Row>
      ) : null}
      {children}
      {add ? <AddButton label={add.label} onPress={add.onPress} variant={add.variant} /> : null}
    </>
  );
  const style = { width: TILE, height: TILE, borderRadius: radii.xl, overflow: 'hidden', padding: 14 } as const;
  return onPress
    ? <Pressy accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} scaleTo={0.97} style={style}>{inner}</Pressy>
    : <View accessible accessibilityLabel={a11y} style={style}>{inner}</View>;
}

// Round + in the top right corner (same place as on the steps card) of a water or weight tile: logs from the tile without opening it.
export const ADD_STYLE = { position: 'absolute', top: 12, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', zIndex: 3 } as const;
// variant 'glass': the pill with a glass and a plus (add a glass of water).
export function AddButton({ label, onPress, variant = 'round' }: { label: string; onPress?: () => void; variant?: 'round' | 'glass' }) {
  if (variant === 'glass') {
    return (
      <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} disabled={!onPress} scaleTo={0.92}
        style={{ position: 'absolute', top: 10, right: 10, height: 44, minWidth: 74, paddingHorizontal: 12, borderRadius: radii.lg, backgroundColor: 'rgba(255,255,255,0.16)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 3 }}>
        <GlassWater size={18} color={fixed.white} />
        <CirclePlus size={18} color={fixed.white} />
      </Pressy>
    );
  }
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={label} onPress={onPress} disabled={!onPress} hitSlop={10} scaleTo={0.88} style={ADD_STYLE}>
      <Plus size={17} color={fixed.white} />
    </Pressy>
  );
}

const cap = { fontSize: fontSizes.xs, lineHeight: 17, color: 'rgba(255,255,255,0.7)' } as const;

function Segments({ n, on, color, off = 'rgba(255,255,255,0.14)', h = 6, gap = 4, width = W_IN }: { n: number; on: number; color: string; off?: string; h?: number; gap?: number; width?: number }) {
  const w = (width - gap * (n - 1)) / n;
  return (
    <Svg width={width} height={h}>
      {Array.from({ length: n }, (_, i) => <Rect key={i} x={i * (w + gap)} width={w} height={h} rx={Math.min(3, h / 2)} fill={i < on ? color : off} />)}
    </Svg>
  );
}

// ---- Active energy ----
export function EnergyDot({ onPress }: { onPress?: () => void }) {
  return (
    <WTile colors={['#8A3A12', '#1A0D06']} label="Active energy" Icon={Flame} a11y="Active energy 320 of 450 kilocalories" onPress={onPress}>
      <View style={{ marginTop: 22 }}><DotText text="320" maxW={W_IN - 6} on="#FFB072" /></View>
      <Txt style={{ ...cap, marginTop: 8 }}>kcal · goal 450</Txt>
      <View style={{ marginTop: 'auto' }}><Segments n={14} on={10} color="#FF8A3D" h={6} gap={3} /></View>
    </WTile>
  );
}
export function EnergyStack({ onPress }: { onPress?: () => void }) {
  return (
    <WTile colors={['#FF8A3D', '#D4521A', '#8F2E0F']} label="Active energy" a11y="Active energy 320 of 450 kilocalories, 69 percent" onPress={onPress}>
      {/* six pills, the bottom four filled */}
      <View style={{ position: 'absolute', left: 14, bottom: 14, flexDirection: 'column-reverse', gap: 5 }}>
        {Array.from({ length: 6 }, (_, i) => <View key={i} style={{ width: 36, height: 14, borderRadius: 7, backgroundColor: i < 4 ? fixed.white : 'rgba(255,255,255,0.35)' }} />)}
      </View>
      <View style={{ position: 'absolute', right: 14, top: 58, alignItems: 'flex-end' }}>
        <Txt style={{ fontFamily: font.displayBold, fontSize: 38, lineHeight: 44, letterSpacing: -1, color: fixed.white }}>69%</Txt>
        <Txt style={{ fontSize: fontSizes.md, lineHeight: 20, color: 'rgba(255,255,255,0.75)' }}>of goal</Txt>
      </View>
      <Txt style={{ position: 'absolute', right: 14, bottom: 12, fontSize: fontSizes.md, lineHeight: 20, color: fixed.white }}>320 kcal</Txt>
    </WTile>
  );
}

// ---- Water ----
export function WaterDot({ litres, onPress, onAdd }: { litres: number; onPress?: () => void; onAdd?: () => void }) {
  const left = Math.max(0, 3 - litres);
  return (
    <WTile colors={['#0E4A8A', '#07192F']} label="Water" Icon={Droplet} a11y={`Water ${fmt1(litres)} of 3 litres, ${fmt1(left)} left`} onPress={onPress} add={{ label: 'Add a glass, 250 millilitres', onPress: onAdd, variant: 'glass' }}>
      <View style={{ marginTop: 22 }}><DotText text={fmt1(litres)} maxW={W_IN - 6} on="#CBE9FF" off="rgba(255,255,255,0.07)" maxDot={9} /></View>
      <Txt style={{ fontSize: fontSizes.xs, lineHeight: 17, color: 'rgba(255,255,255,0.75)', marginTop: 'auto' }}>{left > 0 ? 'of 3 L' : 'Goal reached'}</Txt>
    </WTile>
  );
}
export function WaterGlasses({ litres, onPress, onAdd }: { litres: number; onPress?: () => void; onAdd?: () => void }) {
  const glasses = Math.round(litres / 0.25);
  return (
    <WTile colors={['#0B2A4A', '#061424']} label="Water" a11y={`${glasses} of 12 glasses`} onPress={onPress} add={{ label: 'Add a glass, 250 millilitres', onPress: onAdd, variant: 'glass' }}>
      <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl4, lineHeight: 40, color: fixed.white, marginTop: 10 }}>{glasses}<Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, color: 'rgba(255,255,255,0.6)' }}> / 12 </Txt><Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.6)' }}>glasses</Txt></Txt>
      <View style={{ marginTop: 'auto' }}><Segments n={12} on={glasses} color="#27A9FF" h={12} gap={3} /></View>
    </WTile>
  );
}

// ---- Weight ----
export function WeightDot({ kg, delta, onPress, onAdd }: { kg: number; delta: number; onPress?: () => void; onAdd?: () => void }) {
  return (
    <WTile colors={['#14595F', '#061A1D']} label="Weight" Icon={Scale} a11y={`Weight ${fmt1(kg)} kilograms`} onPress={onPress} add={{ label: 'Log weight', onPress: onAdd }}>
      <View style={{ marginTop: 22 }}><DotText text={fmt1(kg)} maxW={W_IN - 6} on="#7FE3D6" /></View>
      <Txt style={{ ...cap, marginTop: 8 }}>kg</Txt>
      <Txt style={{ fontSize: fontSizes.xs, lineHeight: 17, color: '#7FE3D6', marginTop: 'auto' }}>{delta <= 0 ? '↘' : '↗'} {Math.abs(delta)} kg this week</Txt>
    </WTile>
  );
}
export function WeightRuler({ kg, onPress, onAdd }: { kg: number; onPress?: () => void; onAdd?: () => void }) {
  const n = 25;
  return (
    <WTile colors={['#1FB5A6', '#0A6F78', '#0A4A55']} label="Weight" a11y={`Weight ${fmt1(kg)} kilograms`} onPress={onPress} add={{ label: 'Log weight', onPress: onAdd }}>
      <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl3, lineHeight: 34, color: fixed.white, marginTop: 8 }}>{fmt1(kg)}<Txt style={{ fontFamily: font.medium, fontSize: fontSizes.sm }}> kg</Txt></Txt>
      <View style={{ position: 'absolute', left: 14, right: 14, bottom: 34, height: 44, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {Array.from({ length: n }, (_, i) => <View key={i} style={{ width: 2, height: i % 5 === 0 ? 34 : 20, borderRadius: 1, backgroundColor: i === 12 ? fixed.white : 'rgba(255,255,255,0.5)' }} />)}
      </View>
      <Txt style={{ ...cap, position: 'absolute', left: 14, bottom: 12 }}>Goal 68 kg</Txt>
    </WTile>
  );
}

// ---- Heart rate ----
export function HrDot({ onPress }: { onPress?: () => void }) {
  return (
    <WTile colors={['#7A1828', '#1A0A10']} label="Heart rate" Icon={Heart} a11y="Heart rate 72 beats per minute" onPress={onPress}>
      <View style={{ marginTop: 22 }}><DotText text="72" maxW={W_IN - 50} on="#FF8A96" /></View>
      <Txt style={{ ...cap, marginTop: 8 }}>bpm · resting 64</Txt>
      <View style={{ marginTop: 'auto' }}><Segments n={5} on={2} color="#FF5A6E" h={6} gap={4} /></View>
    </WTile>
  );
}

// ---- Sleep ----
export function SleepStages({ onPress }: { onPress?: () => void }) {
  const hs = [4, 7, 10, 6, 9, 12, 8, 5, 9, 6];
  return (
    <WTile colors={['#7E6BFF', '#4A3BC4', '#2B2080']} label="Sleep" Icon={Moon} a11y="Sleep 7 hours 10 minutes" onPress={onPress}>
      <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl4, lineHeight: 38, color: fixed.white, marginTop: 4 }}>7h 10<Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md }}>m</Txt></Txt>
      <Txt style={cap}>11:40 pm – 6:50 am</Txt>
      <View style={{ marginTop: 'auto', flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 34 }}>
        {hs.map((h, i) => <View key={i} style={{ flex: 1, height: (h / 12) * 34, borderRadius: 5, backgroundColor: i % 3 === 2 ? 'rgba(255,255,255,0.45)' : fixed.white }} />)}
      </View>
    </WTile>
  );
}
export function SleepDot({ onPress }: { onPress?: () => void }) {
  return (
    <WTile colors={['#35288F', '#0D0B24']} label="Sleep" Icon={Moon} a11y="Sleep 7 hours 10 minutes" onPress={onPress}>
      <View style={{ marginTop: 22 }}><DotText text="7:10" maxW={W_IN - 6} on="#B3A8FF" /></View>
      <Txt style={{ ...cap, marginTop: 8 }}>hours · goal 8</Txt>
      <View style={{ marginTop: 'auto' }}><Segments n={8} on={7} color="#8C7DFF" h={6} gap={4} /></View>
    </WTile>
  );
}

// ---- Workout: this week ----
export function WeekTile({ done = [true, false, true, false, false, false, false], of = 4, onPress }: { done?: boolean[]; of?: number; onPress?: () => void }) {
  const n = done.filter(Boolean).length;
  return (
    <WTile colors={[fixed.shadow, fixed.dark]} label="This week" a11y={`${n} of ${of} workouts this week`} onPress={onPress}>
      <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl4, lineHeight: 40, color: fixed.white, marginTop: 4 }}>{n}<Txt style={{ fontFamily: font.medium, fontSize: fontSizes.base, color: 'rgba(255,255,255,0.65)' }}> of {of}</Txt></Txt>
      <View style={{ marginTop: 'auto', gap: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((l, i) => <Txt key={i} style={{ width: 16, textAlign: 'center', fontSize: fontSizes.xs2, lineHeight: 14, color: 'rgba(255,255,255,0.6)' }}>{l}</Txt>)}
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          {done.map((v, i) => <View key={i} style={{ width: 16, height: 22, borderRadius: 8, backgroundColor: v ? '#FF7A45' : 'rgba(255,255,255,0.12)' }} />)}
        </Row>
      </View>
    </WTile>
  );
}
