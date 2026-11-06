import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radii } from '@/design-system/tokens';
import { BODY_H, BODY_W, BodySide, MuscleBody, MuscleName } from '@/design-system/primitives/MuscleBody';

export type { MuscleName };

// What each small square shows: the side of the body, the point of the drawing (200 by 400) at its centre, and how large the drawing is drawn.
const VIEW: Record<MuscleName, { side: BodySide; cx: number; cy: number; scale: number }> = {
  Chest: { side: 'front', cx: 100, cy: 92, scale: 0.5 },
  Shoulders: { side: 'front', cx: 100, cy: 92, scale: 0.5 },
  Arms: { side: 'front', cx: 100, cy: 120, scale: 0.4 },
  Core: { side: 'front', cx: 100, cy: 128, scale: 0.66 },
  Legs: { side: 'front', cx: 100, cy: 300, scale: 0.34 },
  Back: { side: 'back', cx: 100, cy: 100, scale: 0.5 },
};

/**
 * A small dark square with the part of the body that matters for one muscle group (seen from the front, or from the back for Back) and that group lit in the accent blue.
 * It sits at the start of a muscle row (name, sets, capsules) on the Muscles trained page.
 */
export function MuscleThumb({ muscle, size = 64 }: { muscle: MuscleName; size?: number }) {
  const { c } = useTheme();
  const v = VIEW[muscle];
  const w = BODY_W * v.scale;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: radii.md, backgroundColor: c.surface2, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: size / 2 - v.cx * v.scale, top: size / 2 - v.cy * v.scale, width: w, height: BODY_H * v.scale }}>
        <MuscleBody side={v.side} lit={{ [muscle]: 1 }} width={w} />
      </View>
    </View>
  );
}
