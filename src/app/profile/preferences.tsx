import React from 'react';
import { NoteField, Pill, Row } from '@/components/ui';
import { useStore } from '@/lib/store';
import { fadeOut } from '@/theme/motion';
import { Label, LineRow, ListCard, SubPage, Switch } from '@/features/shell/parts';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { DIETS, TRAIN_DAYS } from '@/features/profile/PrefSheets';

// Training days, diet, injuries and the workout timer's buzzer and vibration. Every change is saved as you make it.
export default function Preferences() {
  const { state, setProfile } = useStore();
  const p = state.profile;
  const days = p.days, diet = p.diet, inj = p.injury, note = p.injuryNote;
  const setDays = (n: number) => setProfile({ days: n });
  const setDiet = (x: string) => setProfile({ diet: x });
  const setInj = (v: 'No' | 'Yes') => setProfile({ injury: v, ...(v === 'No' ? { injuryNote: '' } : {}) });
  const setNote = (t: string) => setProfile({ injuryNote: t });
  return (
    <SubPage title="Preferences" fallback="/profile">
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

      <Label style={{ marginTop: 16 }}>Workout timer</Label>
      <ListCard>
        <LineRow title="Buzzer" sub="A sound when a timer ends" right={<Switch label="Buzzer" on={p.timer?.sound !== false} onChange={(v) => setProfile({ timer: { ...p.timer, sound: v } })} />} />
        <LineRow title="Vibration" sub="A buzz when a timer ends" last right={<Switch label="Vibration" on={p.timer?.vibrate !== false} onChange={(v) => setProfile({ timer: { ...p.timer, vibrate: v } })} />} />
      </ListCard>
    </SubPage>
  );
}
