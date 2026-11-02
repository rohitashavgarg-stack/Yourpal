import React, { useState } from 'react';
import { Button, Field, Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { goBack, Label, Note, SubPage } from '@/features/shell/parts';
import { fontSizes } from '@/design-system/tokens';

const RELATIONS = ['Parent', 'Spouse', 'Sibling', 'Friend', 'Other'];

// Who the gym calls in an emergency: name, mobile number and how they are related to you.
export default function EmergencyContact() {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const { toast } = useOverlay();
  const e = state.profile.emergency;
  const [name, setName] = useState(e?.name ?? '');
  const [phone, setPhone] = useState(e?.phone ?? '');
  const [rel, setRel] = useState(e?.relation ?? '');
  const [tried, setTried] = useState(false);
  const dirty = name !== (e?.name ?? '') || phone !== (e?.phone ?? '') || rel !== (e?.relation ?? '');
  const bad = { name: name.trim().length < 2, phone: phone.length !== 10 || phone === state.phone, rel: !rel };
  const save = () => {
    if (bad.name || bad.phone || bad.rel) { setTried(true); haptic.error(); return; }
    setProfile({ emergency: { name: name.trim(), phone, relation: rel } });
    haptic.success();
    goBack('/profile');
    toast('Emergency contact saved');
  };
  const remove = () => { setProfile({ emergency: undefined }); haptic.light(); goBack('/profile'); toast('Emergency contact removed'); };
  const err = (m: string) => <Txt accessibilityRole="alert" style={{ color: c.warn, fontSize: fontSizes.md, paddingHorizontal: 6 }}>{m}</Txt>;
  return (
    <SubPage title="Emergency contact" fallback="/profile" footer={dirty ? <Button kind="accent" label="Save" onPress={save} /> : undefined}>
      <Note>Only your gym staff can see this, and only to call in an emergency.</Note>
      <Label>Name</Label>
      <Field value={name} onChangeText={(t) => setName(t)} error={tried && bad.name} accessibilityLabel="Contact name" autoCapitalize="words" placeholder="Full name" returnKeyType="next" />
      {tried && bad.name && err('Enter their name.')}

      <Label style={{ marginTop: 16 }}>Mobile number</Label>
      <Field value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 10))} keyboardType="number-pad" prefix="+91" placeholder="10-digit number" accessibilityLabel="Contact mobile number" error={tried && bad.phone} />
      {tried && bad.phone && err(phone.length === 10 ? 'Use a number other than your own.' : 'Enter a 10-digit mobile number.')}

      <Label style={{ marginTop: 16 }}>Relation</Label>
      <Row style={{ gap: 6, flexWrap: 'wrap', marginTop: -4 }}>
        {RELATIONS.map((x) => <Pill key={x} label={x} on={rel === x} onPress={() => { setRel(x); haptic.tick(); }} />)}
      </Row>
      {tried && bad.rel && err('Pick how they are related to you.')}

      {!!e && <Button kind="warn" small label="Remove contact" onPress={remove} style={{ marginTop: 24, alignSelf: 'flex-start' }} />}
    </SubPage>
  );
}
