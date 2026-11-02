import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, NoteField, Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { fontSizes } from '@/design-system/tokens';

export const GENDERS = ['Male', 'Female', 'Other'];
export const DIETS = ['Veg', 'Eggetarian', 'Non-veg', 'Jain', 'Vegan'];
export const TRAIN_DAYS = [2, 3, 4, 5, 6];

// Each preference is read-only on the Profile page. "Change" opens one of these small sheets, and Save writes it.
function Shell({ title, onSave, children }: { title: string; onSave: () => void; children: React.ReactNode }) {
  const { closeSheet, toast } = useOverlay();
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: fontSizes.xl2, lineHeight: 29 }}>{title}</Txt>
      {children}
      <Button label="Save" onPress={() => { onSave(); haptic.success(); closeSheet(() => toast('Saved. Coach Vikram sees the update')); }} />
    </View>
  );
}

export function GenderSheet() {
  const { state, setProfile } = useStore();
  const [g, setG] = useState(state.profile.gender);
  return (
    <Shell title="Gender" onSave={() => setProfile({ gender: g })}>
      <Row style={{ gap: 6 }}>
        {GENDERS.map((x) => <Pill key={x} label={x} on={g === x} onPress={() => { setG(x); haptic.tick(); }} style={{ flex: 1 }} />)}
      </Row>
    </Shell>
  );
}

export function DaysSheet() {
  const { state, setProfile } = useStore();
  const [n, setN] = useState(state.profile.days);
  return (
    <Shell title="Days you can train" onSave={() => setProfile({ days: n })}>
      <Row style={{ gap: 6 }}>
        {TRAIN_DAYS.map((x) => <Pill key={x} label={String(x)} on={n === x} onPress={() => { setN(x); haptic.tick(); }} style={{ flex: 1, paddingHorizontal: 0 }} />)}
      </Row>
    </Shell>
  );
}

export function DietSheet() {
  const { state, setProfile } = useStore();
  const [x, setX] = useState(state.profile.diet);
  return (
    <Shell title="Diet type" onSave={() => setProfile({ diet: x })}>
      <Row style={{ gap: 6, flexWrap: 'wrap' }}>
        {DIETS.map((v) => <Pill key={v} label={v} on={x === v} onPress={() => { setX(v); haptic.tick(); }} />)}
      </Row>
    </Shell>
  );
}

export function InjurySheet() {
  const { state, setProfile } = useStore();
  const p = state.profile;
  const [inj, setInj] = useState<'No' | 'Yes'>(p.injury);
  const [note, setNote] = useState(p.injuryNote);
  return (
    <Shell title="Injuries or pain" onSave={() => setProfile({ injury: inj, injuryNote: inj === 'Yes' ? note : '' })}>
      <Row style={{ gap: 6 }}>
        <Pill label="No" on={inj === 'No'} onPress={() => setInj('No')} style={{ flex: 1 }} />
        <Pill label="Yes, add note" on={inj === 'Yes'} onPress={() => setInj('Yes')} style={{ flex: 1 }} />
      </Row>
      {inj === 'Yes' && <NoteField value={note} onChangeText={setNote} placeholder="e.g. left knee pain on lunges, worse when I squat below parallel" accessibilityLabel="Injury note" />}
    </Shell>
  );
}
