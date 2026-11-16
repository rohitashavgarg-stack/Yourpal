import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, NoteField, Pill, Row, Txt } from '@/components/ui';
import { Card } from '@/design-system/primitives/Card';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';
import { fadeOut } from '@/theme/motion';
import { SubPage } from '@/features/shell/parts';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { DIETS, TRAIN_DAYS } from '@/features/profile/PrefSheets';
import { PenLine } from '@/lib/icons';

// One card per choice: a heading, one line on why it matters, then the value (or the chips while editing).
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

const Value = ({ children }: { children: React.ReactNode }) => (
  <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl2, lineHeight: 29, letterSpacing: -0.4 }}>{children}</Txt>
);

// Training days, diet and injuries. The page opens to read: nothing changes by accident. Edit opens the chips, Save changes keeps them.
export default function Preferences() {
  const { state, setProfile } = useStore();
  const { toast } = useOverlay();
  const p = state.profile;
  const [editing, setEditing] = useState(false);
  const [days, setDays] = useState(p.days);
  const [diet, setDiet] = useState(p.diet);
  const [inj, setInj] = useState<'No' | 'Yes'>(p.injury === 'Yes' ? 'Yes' : 'No');
  const [note, setNote] = useState(p.injuryNote || '');
  const changed = days !== p.days || diet !== p.diet || inj !== (p.injury === 'Yes' ? 'Yes' : 'No') || (inj === 'Yes' && note !== (p.injuryNote || ''));
  const startEdit = () => { setDays(p.days); setDiet(p.diet); setInj(p.injury === 'Yes' ? 'Yes' : 'No'); setNote(p.injuryNote || ''); setEditing(true); haptic.light(); };
  const cancel = () => setEditing(false);
  const save = () => {
    setProfile({ days, diet, injury: inj, injuryNote: inj === 'Yes' ? note : '' });
    haptic.success(); setEditing(false); toast('Training and diet saved. Coach Vikram sees the update');
  };
  const footer = editing ? (
    <Row style={{ gap: 10 }}>
      <Button kind="secondary" label="Cancel" onPress={cancel} style={{ flex: 1 }} />
      <Button kind="primary" label="Save changes" disabled={!changed} onPress={save} style={{ flex: 2 }} />
    </Row>
  ) : (
    <Button kind="primary" label="Edit" icon={<PenLine size={18} />} onPress={startEdit} />
  );
  return (
    <SubPage title="Training and diet" fallback="/profile" gap={12} floatingFooter footer={footer}>
      <Group title="Days you can train" line="Coach Vikram plans your week around this.">
        {editing ? (
          <>
            <View accessibilityRole="radiogroup" accessibilityLabel="Days you can train" style={{ flexDirection: 'row', gap: 6 }}>
              {TRAIN_DAYS.map((n) => <Pill key={n} label={String(n)} on={days === n} onPress={() => setDays(n)} style={{ flex: 1, paddingHorizontal: 0 }} />)}
            </View>
            <Txt muted style={{ fontSize: fontSizes.xs, lineHeight: 18, textAlign: 'center' }}>days a week</Txt>
          </>
        ) : <Value>{`${p.days} days a week`}</Value>}
      </Group>

      <Group title="Diet type" line="Your Diet plan follows this.">
        {editing ? (
          <View accessibilityRole="radiogroup" accessibilityLabel="Diet type" style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {DIETS.map((x) => <Pill key={x} label={x} on={diet === x} onPress={() => setDiet(x)} />)}
          </View>
        ) : <Value>{p.diet || 'Not set'}</Value>}
      </Group>

      <Group title="Injuries or pain" line="Coach Vikram avoids moves that could make it worse.">
        {editing ? (
          <>
            <View accessibilityRole="radiogroup" accessibilityLabel="Injuries or pain" style={{ flexDirection: 'row', gap: 6 }}>
              <Pill label="No" on={inj === 'No'} onPress={() => setInj('No')} style={{ flex: 1 }} />
              <Pill label="Yes, add note" on={inj === 'Yes'} onPress={() => setInj('Yes')} style={{ flex: 1 }} />
            </View>
            {inj === 'Yes' && (
              <FadeIn exiting={fadeOut()}>
                <NoteField value={note} onChangeText={setNote} placeholder="e.g. left knee pain on lunges, worse when I squat below parallel" accessibilityLabel="Injury note" />
              </FadeIn>
            )}
          </>
        ) : (
          <>
            <Value>{p.injury === 'Yes' ? 'Yes' : 'None'}</Value>
            {p.injury === 'Yes' && !!p.injuryNote && <Txt muted style={{ fontSize: fontSizes.md, lineHeight: 22 }}>{p.injuryNote}</Txt>}
          </>
        )}
      </Group>
    </SubPage>
  );
}
