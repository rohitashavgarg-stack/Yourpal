import React, { useMemo, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { fixed, round } from '@/design-system/tokens';
import { haptic } from '@/lib/haptics';

const THUMB = 38;
const TRACK = 10;

/**
 * A drag slider for "how hard was it": one continuous track from easy (blue) through green and yellow to max (red), with fine tick marks and a round white
 * handle with a grey centre. `value` runs from 0 (easy) to 1 (max). With `readOnly` it only shows a value that was already logged: the handle does not move. Drag the handle or tap the track; with a screen reader it adjusts in steps of one tenth.
 */
export function EffortSlider({ value, onChange, label = 'Effort', readOnly }: { value: number; onChange?: (v: number) => void; label?: string; readOnly?: boolean }) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const pan = useMemo(() => {
    const set = (x: number) => { const span = w - THUMB; if (span > 0) onChange?.(Math.round(Math.max(0, Math.min(1, (x - THUMB / 2) / span)) * 20) / 20); };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => { haptic.tick(); set(e.nativeEvent.locationX); },
      onPanResponderMove: (e) => set(e.nativeEvent.locationX),
    });
  }, [w, onChange]);
  const left = (w - THUMB) * value;
  const words = value < 0.2 ? 'Easy' : value < 0.45 ? 'Moderate' : value < 0.7 ? 'Hard' : value < 0.9 ? 'Very hard' : 'Max';
  return (
    <View
      accessible accessibilityRole={readOnly ? 'image' : 'adjustable'} accessibilityLabel={label} accessibilityValue={{ text: words }}
      accessibilityActions={readOnly ? undefined : [{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange?.(Math.max(0, Math.min(1, value + (e.nativeEvent.actionName === 'increment' ? 0.1 : -0.1))))}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[{ height: THUMB + 8, justifyContent: 'center' }, { touchAction: 'none' } as object]} {...(readOnly ? null : pan.panHandlers)}>
      <View pointerEvents="none" style={{ height: TRACK, borderRadius: TRACK / 2, overflow: 'hidden' }}>
        <LinearGradient colors={[c.cWater, c.cNutri, c.cFat, c.cAct, c.danger]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
        {Array.from({ length: 9 }, (_, i) => <View key={i} style={{ position: 'absolute', left: `${(i + 1) * 10}%`, top: 3, width: 1, height: 4, backgroundColor: c.bg, opacity: 0.4 }} />)}
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', left, width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: fixed.white, alignItems: 'center', justifyContent: 'center', shadowColor: fixed.shadow, shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}>
        <View style={{ width: 20, height: 20, borderRadius: round(20), backgroundColor: fixed.lineOnWhite }} />
      </View>
    </View>
  );
}
