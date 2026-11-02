import React from 'react';
import { View } from 'react-native';
import { Row, Txt } from '@/components/ui';
import { Ruler } from '@/design-system/primitives/Ruler';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';

// One number on its own screen: a big value that follows a ruler you drag. Used for every measurement in the self assessment.
export function RulerStep({ value, onChange, unit, min, max, step, decimals = 0, major, caption, a11y }: {
  value: number; onChange: (v: number) => void; unit?: string; min: number; max: number; step: number; decimals?: number; major: number; caption?: string; a11y: string;
}) {
  return (
    <View style={{ gap: 26, paddingTop: 16 }}>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Row style={{ alignItems: 'baseline', gap: 6 }}>
          <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.displayBold, fontSize: 68, lineHeight: 80, letterSpacing: -2 }}>{decimals ? value.toFixed(decimals) : String(Math.round(value))}</Txt>
          {!!unit && <Txt muted style={{ fontSize: fontSizes.lg }}>{unit}</Txt>}
        </Row>
        {!!caption && <Txt muted style={{ fontSize: fontSizes.base }}>{caption}</Txt>}
      </View>
      <Ruler accessibilityLabel={a11y} value={value} onChange={onChange} min={min} max={max} step={step} decimals={decimals} majorEvery={major} label={(v) => String(Math.round(v))} />
    </View>
  );
}
