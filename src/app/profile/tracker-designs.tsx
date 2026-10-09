import React from 'react';
import { View } from 'react-native';
import { Check } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { STEPS_CARD, STEPS_DESIGNS, StepsDesign, StepsPreview, stepsStore } from '@/features/today/StepsCards';
import { Note, SubPage } from '@/features/shell/parts';

const SUB: Record<StepsDesign, string> = {
  Current: 'A ring that fills as you walk',
  Ruler: 'A measuring scale for the day',
  'Day bars': 'Steps through the day as bars',
};

const PREV = 96;

export default function TrackerDesigns() {
  const { c } = useTheme();
  const st = stepsStore.use();
  return (
    <SubPage title="Tracker designs" fallback="/profile">
      <Txt v="label" style={{ paddingHorizontal: 4 }}>STEPS</Txt>
      <View style={{ gap: 10 }}>
        {STEPS_DESIGNS.map((dsg) => {
          const on = st.design === dsg;
          return (
            <Pressy key={dsg} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${dsg}. ${SUB[dsg]}`} onPress={() => { haptic.tap(); stepsStore.set({ design: dsg }); }} scaleTo={0.985}
              style={{ minHeight: 120, borderRadius: 24, backgroundColor: c.surface, borderWidth: on ? 2 : 1, borderColor: on ? c.ink : c.line, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ width: PREV, height: PREV }}>
                <View style={{ transform: [{ scale: PREV / STEPS_CARD }], transformOrigin: 'top left' } as any}><StepsPreview design={dsg} /></View>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 16, lineHeight: 22 }}>{dsg}</Txt>
                <Txt v="caption" style={{ fontSize: 13 }}>{SUB[dsg]}</Txt>
              </View>
              <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: on ? 0 : 1.5, borderColor: c.surface3, backgroundColor: on ? c.ink : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {on && <Check size={15} strokeWidth={3} color={c.bg} />}
              </View>
            </Pressy>
          );
        })}
      </View>
      <Row style={{ paddingHorizontal: 4 }}><Note>Designs for water, weight and the other trackers will appear here.</Note></Row>
    </SubPage>
  );
}
