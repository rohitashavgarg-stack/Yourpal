import React from 'react';
import { View } from 'react-native';
import { Pressy, Txt } from '@/components/ui';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { Check } from '@/lib/icons';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { Note, SubPage } from '@/features/shell/parts';

// Only English has its text written. Other languages are listed so the member can see they are planned, and cannot be picked yet.
const LANGUAGES = [
  { name: 'English', ready: true },
  { name: 'Hindi', ready: false },
];

export default function Language() {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const { toast } = useOverlay();
  const current = state.profile.language || 'English';
  return (
    <SubPage title="Language" fallback="/profile">
      <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, overflow: 'hidden' }} accessibilityRole="radiogroup" accessibilityLabel="Language">
        <CardEdge radius={radii.lg} />
        {LANGUAGES.map((l, i) => {
          const on = current === l.name;
          return (
            <Pressy key={l.name} accessibilityRole="radio" accessibilityState={{ selected: on, disabled: !l.ready }} accessibilityLabel={l.ready ? l.name : `${l.name}, coming soon`}
              onPress={() => { if (!l.ready) { toast(`${l.name} is coming soon`); return; } haptic.tap(); setProfile({ language: l.name }); toast('Language changed'); }} scaleTo={0.99}
              style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderBottomWidth: i === LANGUAGES.length - 1 ? 0 : 1, borderBottomColor: c.line, opacity: l.ready ? 1 : 0.55 }}>
              <Txt style={{ flex: 1, fontFamily: font.semibold }}>{l.name}</Txt>
              {!l.ready && <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Coming soon</Txt>}
              {on && <Check size={20} color={c.good} />}
            </Pressy>
          );
        })}
      </View>
      <Note>The language changes the app&apos;s own text. Messages from Coach Vikram stay as he wrote them.</Note>
    </SubPage>
  );
}
