import React, { useState } from 'react';
import { Button, NoteField, Pill, Row } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { fadeOut } from '@/theme/motion';
import { goBack, Label, SubPage } from '@/features/shell/parts';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { DIETS, TRAIN_DAYS } from '@/features/profile/PrefSheets';

// Training days, diet and injuries. Tap to change; the Save button appears once something is different.
export default function Preferences() {
  const { state, setProfile } = useStore();
  const { toast } = useOverlay();
  const p = state.profile;
  const [days, setDays] = useState(p.days);
  const [diet, setDiet] = useState(p.diet);
  const [inj, setInj] = useState<'No' | 'Yes'>(p.injury);
  const [note, setNote] = useState(p.injuryNote);
  const dirty = days !== p.days || diet !== p.diet || inj !== p.injury || (inj === 'Yes' && note !== p.injuryNote);
  const save = () => {
    setProfile({ days, diet, injury: inj, injuryNote: inj === 'Yes' ? note : '' });
    haptic.success();
    goBack('/profile');
    toast('Saved. Coach Vikram sees the update');
  };
  return (
    <SubPage title="Preferences" fallback="/profile" footer={dirty ? <Button kind="accent" label="Save" onPress={save} /> : undefined}>
      <Label>Days you can train</Label>
      <Row style={{ gap: 6, marginTop: -4 }}>
        {TRAIN_DAYS.map((n) => <Pill key={n} label={String(n)} on={days === n} onPress={() => setDays(n)} style={{ flex: 1, paddingHorizontal: 0 }} />)}
      </Row>

      <Label style={{ marginTop: 16 }}>Diet type</Label>
      <Row style={{ gap: 6, flexWrap: 'wrap', marginTop: -4 }}>
        {DIETS.map((x) => <Pill key={x} label={x} on={diet === x} onPress={() => setDiet(x)} />)}
      </Row>

      <Label style={{ marginTop: 16 }}>Injuries or pain</Label>
      <Row style={{ gap: 6, marginTop: -4 }}>
        <Pill label="No" on={inj === 'No'} onPress={() => setInj('No')} style={{ flex: 1 }} />
        <Pill label="Yes, add note" on={inj === 'Yes'} onPress={() => setInj('Yes')} style={{ flex: 1 }} />
      </Row>
      {inj === 'Yes' && (
        <FadeIn exiting={fadeOut()}>
          <NoteField value={note} onChangeText={setNote} placeholder="e.g. left knee pain on lunges, worse when I squat below parallel" accessibilityLabel="Injury note" />
        </FadeIn>
      )}
    </SubPage>
  );
}
