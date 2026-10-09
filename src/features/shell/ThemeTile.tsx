import React from 'react';
import { View } from 'react-native';
import { Check } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';

// A small phone drawn in each theme's own colours, so the choice is something you can see.
const MOCK = {
  Light: { bg: '#F4F6F9', card: '#FFFFFF', ink: '#14171C', mute: '#C9CFD8' },
  Dark: { bg: '#0F1218', card: '#1A1F29', ink: '#F1F3F6', mute: '#3A4250' },
} as const;
export function ThemeTile({ mode, on, onPress }: { mode: 'Light' | 'Dark' | 'System'; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const Phone = ({ t, style }: { t: 'Light' | 'Dark'; style?: any }) => {
    const m = MOCK[t];
    return (
      <View style={[{ flex: 1, backgroundColor: m.bg, padding: 8, gap: 5 }, style]}>
        <View style={{ width: 22, height: 5, borderRadius: 3, backgroundColor: m.ink, opacity: 0.8 }} />
        <View style={{ height: 22, borderRadius: 7, backgroundColor: c.accent }} />
        <View style={{ height: 14, borderRadius: 6, backgroundColor: m.card }} />
        <View style={{ height: 14, borderRadius: 6, backgroundColor: m.card }} />
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: m.mute }} />
          <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: m.mute }} />
        </View>
      </View>
    );
  };
  return (
    <Pressy accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${mode} theme`} onPress={onPress} scaleTo={0.97} style={{ flex: 1, gap: 8, alignItems: 'center' }}>
      <View style={{ width: '100%', height: 116, borderRadius: 18, overflow: 'hidden', borderWidth: on ? 2.5 : 1, borderColor: on ? c.accent : c.line, flexDirection: 'row' }}>
        {mode === 'System' ? (<><Phone t="Light" /><Phone t="Dark" /></>) : <Phone t={mode} />}
      </View>
      <Row style={{ gap: 6 }}>
        <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: on ? 0 : 1.5, borderColor: c.surface3, backgroundColor: on ? c.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
          {on && <Check size={10} strokeWidth={3.5} color="#fff" />}
        </View>
        <Txt style={{ fontFamily: on ? font.semibold : font.medium, fontSize: 14, lineHeight: 20 }}>{mode}</Txt>
      </Row>
    </Pressy>
  );
}
