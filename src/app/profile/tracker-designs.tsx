import React from 'react';
import { View } from 'react-native';
import { Check } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { STEPS_DESIGNS, StepsDesign, stepsStore } from '@/features/today/StepsCards';
import { Note, SubPage } from '@/features/shell/parts';

const SUB: Record<StepsDesign, string> = {
  Current: 'A ring that fills as you walk',
  Ruler: 'A measuring scale for the day',
  'Day bars': 'Steps through the day as bars',
};

// A tiny drawing of each design, enough to tell them apart at a glance.
function Mini({ design, ink, accent, faint }: { design: StepsDesign; ink: string; accent: string; faint: string }) {
  if (design === 'Ruler') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 44 }}>
        {Array.from({ length: 11 }, (_, i) => <View key={i} style={{ width: 3, height: i % 5 === 0 ? 34 : 18, borderRadius: 1.5, backgroundColor: i < 7 ? accent : faint }} />)}
      </View>
    );
  }
  if (design === 'Day bars') {
    const h = [8, 14, 30, 22, 38, 26, 16, 32, 20];
    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 44 }}>
        {h.map((v, i) => <View key={i} style={{ width: 6, height: v, borderRadius: 3, backgroundColor: i < 7 ? accent : faint }} />)}
      </View>
    );
  }
  return (
    <View style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 5, borderColor: faint, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', left: -5, top: -5, width: 46, height: 46, borderRadius: 23, borderWidth: 5, borderColor: accent, borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '35deg' }] }} />
      <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, color: ink }}>65%</Txt>
    </View>
  );
}

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
              style={{ minHeight: 96, borderRadius: 24, backgroundColor: c.surface, borderWidth: on ? 2 : 1, borderColor: on ? c.ink : c.line, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ width: 96, height: 64, borderRadius: 16, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Mini design={dsg} ink={c.ink} accent={c.accent} faint={c.surface3} />
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
