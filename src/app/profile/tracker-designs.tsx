import React from 'react';
import { ScrollView, View } from 'react-native';
import { Check } from '@/lib/icons';
import { Pressy, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { StepsDesign, stepsStore } from '@/features/today/StepsCards';
import { TileFor } from '@/features/today/Trackers';
import { CATALOG, TrackerKey, designStore } from '@/features/trackers/designs';
import { SubPage } from '@/features/shell/parts';

// The widgets only, grouped by category. Tap one to use it on Today.
function Option({ tracker, design, on, onPick }: { tracker: TrackerKey; design: string; on: boolean; onPick: () => void }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${design} design`} onPress={onPick} scaleTo={0.97} style={{ padding: 3, borderRadius: 31, borderWidth: 2, borderColor: on ? c.ink : 'transparent' }}>
      <View pointerEvents="none"><TileFor tracker={tracker} design={design} interactive={false} /></View>
      {on && (
        <View style={{ position: 'absolute', right: 10, bottom: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Check size={14} strokeWidth={3} color={c.bg} />
        </View>
      )}
    </Pressy>
  );
}

export default function TrackerDesigns() {
  const { c } = useTheme();
  const st = stepsStore.use();
  const D = designStore.use();
  return (
    <SubPage title="Tracker designs" fallback="/profile" gap={10}>
      {CATALOG.map((cat) => (
        <View key={cat.category} style={{ gap: 14, marginTop: 8 }}>
          <Txt style={{ fontFamily: font.light, fontSize: 26, lineHeight: 34, letterSpacing: -0.6, paddingHorizontal: 4 }}>{cat.category}</Txt>
          {cat.trackers.map((t) => {
            const current = t.key === 'steps' ? st.design : D[t.key as Exclude<TrackerKey, 'steps'>];
            return (
              <View key={t.key} style={{ gap: 8 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, color: c.muted, paddingHorizontal: 4 }}>{t.title}</Txt>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 6, paddingHorizontal: 13, paddingVertical: 2 }}>
                  {t.designs.map((dsg) => (
                    <Option key={dsg} tracker={t.key} design={dsg} on={current === dsg}
                      onPick={() => { haptic.tap(); if (t.key === 'steps') stepsStore.set({ design: dsg as StepsDesign }); else designStore.set({ [t.key]: dsg } as any); }} />
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </View>
      ))}
    </SubPage>
  );
}
