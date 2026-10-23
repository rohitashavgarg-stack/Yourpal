/* eslint-disable react-hooks/immutability, react-hooks/refs -- reanimated shared values and refs are mutated from gesture / animation callbacks */
import React, { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureType } from 'react-native-gesture-handler';
import { Minus, Plus } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { font, fontSizes, radii } from '@/design-system/tokens';
import { haptic } from '@/lib/haptics';
import { fmt1 } from '@/lib/useNow';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The "minus, value, plus" control. One component for the three steppers that existed, as three variants:
 *   card    big 52 px buttons around a 64 px value card with a unit (onboarding: height, weight)
 *   row     a label on the left and round buttons around a large number (plans: sets, reps, time, weight, portion)
 *   inline  compact 44 px control inside a set row; drag the number sideways to scrub (workout)
 * The value formatting, step maths and accessibility labels are exactly what each one did before.
 */
type CardProps = { variant: 'card'; value: number; onChange: (v: number) => void; step: number; unit: string; label: string };
type RowProps = { variant: 'row'; label: string; value: string; onMinus: () => void; onPlus: () => void; minusLabel: string; plusLabel: string };
type InlineProps = { variant: 'inline'; value: number; unit: string; onChange: (v: number) => void; step: number; min: number; label: string; block?: GestureType };
export type StepperProps = CardProps | RowProps | InlineProps;

export function Stepper(props: StepperProps) {
  if (props.variant === 'card') return <CardStepper {...props} />;
  if (props.variant === 'row') return <RowStepper {...props} />;
  return <InlineStepper {...props} />;
}

function CardStepper({ value, onChange, step, unit, label }: CardProps) {
  const { c } = useTheme();
  return (
    <Row style={{ gap: 10 }}>
      <Pressy accessibilityRole="button" accessibilityLabel={'Less ' + label} onPress={() => onChange(Math.max(step, +(value - step).toFixed(1)))} style={{ width: 52, height: 52, borderRadius: radii.xl, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Minus size={20} color={c.ink} /></Pressy>
      <View accessibilityLabel={`${label} ${value} ${unit}`} style={{ flex: 1, height: 64, borderRadius: radii.lg, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
        <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl4, color: c.ink }}>{value}</Txt>
        <Txt muted>{unit}</Txt>
      </View>
      <Pressy accessibilityRole="button" accessibilityLabel={'More ' + label} onPress={() => onChange(+(value + step).toFixed(1))} style={{ width: 52, height: 52, borderRadius: radii.xl, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Plus size={20} color={c.ink} /></Pressy>
    </Row>
  );
}

function RowStepper({ label, value, onMinus, onPlus, minusLabel, plusLabel }: RowProps) {
  const { c } = useTheme();
  return (
    <Row style={{ gap: 10, minHeight: 60 }}>
      <Txt muted style={{ flex: 1 }}>{label}</Txt>
      <RoundBtn label={minusLabel} onPress={onMinus}><Minus size={18} color={c.ink} /></RoundBtn>
      <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.display, fontSize: fontSizes.xl3, minWidth: 76, textAlign: 'center' }}>{value}</Txt>
      <RoundBtn label={plusLabel} onPress={onPlus}><Plus size={18} color={c.ink} /></RoundBtn>
    </Row>
  );
}

// − value + stepper; drag the number sideways to scrub.
function InlineStepper({ value, unit, onChange, step, min, label, block }: InlineProps) {
  const { c } = useTheme();
  const base = useRef(value);
  const last = useRef(value);
  let pan = Gesture.Pan().runOnJS(true).activeOffsetX([-4, 4])
    .onBegin(() => { base.current = value; last.current = value; })
    .onUpdate((e) => {
      const v = Math.max(min, Math.round((base.current + Math.round(e.translationX / 14) * step) * 10) / 10);
      if (v !== last.current) { last.current = v; haptic.tap(); onChange(v); }
    });
  if (block) pan = pan.blocksExternalGesture(block);
  const shown = unit === 'kg' ? fmt1(value) : String(value);
  return (
    <View accessibilityRole="adjustable" accessibilityLabel={`${label}, ${shown} ${unit}`}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.max(min, value + (e.nativeEvent.actionName === 'increment' ? step : -step)))}
      style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: radii.lg, backgroundColor: c.surface2 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Minus ${step} ${unit}`} hitSlop={{ left: 5, right: 5 }} onPress={() => { haptic.tap(); onChange(Math.max(min, Math.round((value - step) * 10) / 10)); }} style={{ width: 34, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: fontSizes.lg, lineHeight: 23, color: c.ink }}>−</Text>
      </Pressable>
      <GestureDetector gesture={pan}>
        <View collapsable={false} style={{ flex: 1, minWidth: 0, height: 44, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 2, paddingTop: 9, cursor: 'ew-resize' } as any}>
          <Text style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 29, color: c.ink }}>{shown}</Text>
          <Text style={{ fontSize: fontSizes.xs2, lineHeight: 13, color: c.muted }}>{unit}</Text>
        </View>
      </GestureDetector>
      <Pressable accessibilityRole="button" accessibilityLabel={`Plus ${step} ${unit}`} hitSlop={{ left: 5, right: 5 }} onPress={() => { haptic.tap(); onChange(Math.round((value + step) * 10) / 10); }} style={{ width: 34, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: fontSizes.lg, lineHeight: 23, color: c.ink }}>+</Text>
      </Pressable>
    </View>
  );
}
