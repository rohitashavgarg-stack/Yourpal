import React from 'react';
import { View } from 'react-native';
import { NoteField, Pill, Row, Txt } from '@/components/ui';
import { Card } from '@/design-system/primitives/Card';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';
import { fadeOut } from '@/theme/motion';
import { Note, SubPage } from '@/features/shell/parts';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { DIETS, TRAIN_DAYS } from '@/features/profile/PrefSheets';

// One card per choice: a heading, one line on why it matters, then the chips. Every tap saves at once.
function Group({ title, line, children }: { title: string; line: string; children: React.ReactNode }) {
  return (
    <Card variant="compact" gap={12}>
      <View style={{ gap: 2 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21 }}>{title}</Txt>
        <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{line}</Txt>
      </View>
      {children}
    </Card>
  );
}

// Training days, diet and injuries. Every change is saved as you make it.
export default function Preferences() {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const { toast } = useOverlay();
  const p = state.profile;
  const days = p.days, diet = p.diet, inj = p.injury, note = p.injuryNote;
  const setDays = (n: number) => { if (n !== days) { setProfile({ days: n }); toast(`Training days set to ${n} a week`); } };
  const setDiet = (x: string) => { if (x !== diet) { setProfile({ diet: x }); toast(`Diet type set to ${x}`); } };
  const setInj = (v: 'No' | 'Yes') => { if (v !== inj) setProfile({ injury: v, ...(v === 'No' ? { injuryNote: '' } : {}) }); };
  const setNote = (t: string) => setProfile({ injuryNote: t });
  return (
    <SubPage title="Training and diet" fallback="/profile" gap={12}>
      <Group title="Days you can train" line="Coach Vikram plans your week around this.">
        <View accessibilityRole="radiogroup" accessibilityLabel="Days you can train" style={{ flexDirection: "row", gap: 6 }}>
          {TRAIN_DAYS.map((n) => <Pill key={n} label={String(n)} on={days === n} onPress={() => setDays(n)} style={{ flex: 1, paddingHorizontal: 0 }} />)}
        </View>
        <Txt muted style={{ fontSize: fontSizes.xs, lineHeight: 18, textAlign: 'center' }}>days a week</Txt>
      </Group>

      <Group title="Diet type" line="Your Diet plan follows this.">
        <View accessibilityRole="radiogroup" accessibilityLabel="Diet type" style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          {DIETS.map((x) => <Pill key={x} label={x} on={diet === x} onPress={() => setDiet(x)} />)}
        </View>
      </Group>

      <Group title="Injuries or pain" line="Coach Vikram avoids moves that could make it worse.">
        <View accessibilityRole="radiogroup" accessibilityLabel="Injuries or pain" style={{ flexDirection: "row", gap: 6 }}>
          <Pill label="No" on={inj === 'No'} onPress={() => setInj('No')} style={{ flex: 1 }} />
          <Pill label="Yes, add note" on={inj === 'Yes'} onPress={() => setInj('Yes')} style={{ flex: 1 }} />
        </View>
        {inj === 'Yes' && (
          <FadeIn exiting={fadeOut()}>
            <NoteField value={note} onChangeText={setNote} placeholder="e.g. left knee pain on lunges, worse when I squat below parallel" accessibilityLabel="Injury note" />
          </FadeIn>
        )}
      </Group>

      <Note style={{ fontSize: fontSizes.sm, color: c.muted }}>Changes save as you tap.</Note>
    </SubPage>
  );
}
