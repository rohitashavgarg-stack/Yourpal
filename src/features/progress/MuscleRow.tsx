import React from 'react';
import { View } from 'react-native';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { MuscleThumb } from '@/design-system/primitives/MuscleThumb';
import type { MuscleName } from '@/design-system/primitives/MuscleBody';

// One row for a muscle: the figure with it lit, the name, the count with the sets done in the accent colour, then chunky capsules (a half set fills half a capsule).
export function MuscleRow({ name, done, target }: { name: MuscleName; done: number; target: number }) {
  const { c } = useTheme();
  return (
    <Row style={{ gap: 14, alignItems: 'center' }}>
      <MuscleThumb muscle={name} />
      <View style={{ flex: 1, gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt style={{ fontFamily: font.semibold }}>{name}</Txt>
          <Txt v="caption" style={{ fontSize: fontSizes.sm, lineHeight: 19 }}><Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, lineHeight: 19, color: c.accentText }}>{done}</Txt>{` / ${target} sets`}</Txt>
        </Row>
        <Row style={{ gap: 4 }}>
          {Array.from({ length: target }, (_, j) => (
            <View key={j} style={{ flex: 1, height: 22, borderRadius: radii.xs + 2, backgroundColor: c.surface3, overflow: 'hidden' }}>
              <View style={{ width: `${Math.round(Math.max(0, Math.min(1, done - j)) * 100)}%`, height: '100%', backgroundColor: c.accent }} />
            </View>
          ))}
        </Row>
      </View>
    </Row>
  );
}
