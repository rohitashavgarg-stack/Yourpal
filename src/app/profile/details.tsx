import React, { useState } from 'react';
import { ageFrom, defaultDob, fmtDob } from '@/lib/dob';
import { PersonAvatar } from '@/components/Brand';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Button, Field, NoteField, Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronRight, Image as ImageIcon, Trash2 } from '@/lib/icons';
import { router } from 'expo-router';
import { DobPicker } from '@/features/body/BodyLog';
import { useDomain } from '@/lib/domain';
import { useShell } from '@/features/shell/state';
import { Platform } from 'react-native';
import { Pressy } from '@/components/ui';
import { useScenarios, useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { fade, fadeOut } from '@/theme/motion';
import { goBack, Label, Note, SubPage, useShake } from '@/features/shell/parts';

const maskNum = (p: string) => (p.replace(/D/g, '').length === 10 ? `+91 ${p.slice(0, 2)}xxxxxx${p.slice(8)}` : '+91 98xxxxxx21');

// Changing the number needs a code sent to the new one, so nobody can lock themselves out by a typo.
function ChangePhoneSheet() {
  const { c } = useTheme();
  const { state, set } = useStore();
  const { closeSheet, toast } = useOverlay();
  const [num, setNum] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const send = () => {
    if (num.length !== 10) { setErr('Enter a 10-digit mobile number.'); haptic.error(); return; }
    if (num === state.phone) { setErr('That is already your number.'); haptic.error(); return; }
    setErr(''); setSent(true); haptic.light();
  };
  const verify = () => {
    if (code.length !== 6 || code === '000000') { setErr('That code is not right. Try again.'); haptic.error(); return; }
    set({ phone: num });
    haptic.success();
    closeSheet(() => toast('Mobile number updated'));
  };
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: 22, lineHeight: 29 }}>{sent ? 'Enter the code' : 'Change mobile number'}</Txt>
      <Txt muted style={{ fontSize: 14 }}>{sent ? `We sent a 6-digit code to +91 ${num}.` : 'We will send a code to the new number to confirm it is yours. Your gym sees the new number after this.'}</Txt>
      {sent ? (
        <Field value={code} onChangeText={(t) => { setCode(t.replace(/D/g, '').slice(0, 6)); setErr(''); }} keyboardType="number-pad" placeholder="6-digit code" accessibilityLabel="Verification code" error={!!err} />
      ) : (
        <Field value={num} onChangeText={(t) => { setNum(t.replace(/D/g, '').slice(0, 10)); setErr(''); }} keyboardType="number-pad" prefix="+91" placeholder="New mobile number" accessibilityLabel="New mobile number" error={!!err} />
      )}
      {!!err && <Txt accessibilityRole="alert" style={{ color: c.warn, fontSize: 14 }}>{err}</Txt>}
      <Button label={sent ? 'Verify and update' : 'Send code'} onPress={sent ? verify : send} />
    </View>
  );
}

function PhotoSheet({ hasCustom, onPick, onRemove }: { hasCustom: boolean; onPick: (src: 'library' | 'camera') => void; onRemove: () => void }) {
  const { c } = useTheme();
  const { closeSheet } = useOverlay();
  const opt = (label: string, icon: React.ReactNode, run: () => void, warn?: boolean) => (
    <Pressy key={label} accessibilityRole="button" onPress={() => closeSheet(run)} scaleTo={0.98}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingHorizontal: 16, borderRadius: 20, backgroundColor: c.surface2 }}>
      {icon}
      <Txt style={{ fontFamily: font.semibold, color: warn ? c.warn : c.ink }}>{label}</Txt>
    </Pressy>
  );
  return (
    <View style={{ gap: 10, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: 20, lineHeight: 27 }}>Profile photo</Txt>
      {opt('Choose from gallery', <ImageIcon size={22} color={c.accentText} />, () => onPick('library'))}
      {opt('Take a photo', <Camera size={22} color={c.accentText} />, () => onPick('camera'))}
      {hasCustom && opt('Remove my photo', <Trash2 size={22} color={c.warn} />, onRemove, true)}
    </View>
  );
}

function DobSheet() {
  const { state, setProfile } = useStore();
  const { closeSheet, toast } = useOverlay();
  const [dob, setDob] = useState(state.profile.dob || defaultDob());
  return (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <Txt v="title" style={{ fontSize: 22, lineHeight: 29 }}>Date of birth</Txt>
      <DobPicker dob={dob} onChange={setDob} />
      <Button label="Save" onPress={() => { setProfile({ dob, age: String(ageFrom(dob)) }); haptic.success(); closeSheet(() => toast('Date of birth updated')); }} />
    </View>
  );
}

function BodyRow({ label, value, onPress, last }: { label: string; value: string; onPress: () => void; last?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${label}: ${value}. Change`} onPress={onPress} scaleTo={0.99}
      style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      <Txt muted style={{ flex: 1 }}>{label}</Txt>
      <Txt style={{ fontFamily: font.semibold }}>{value}</Txt>
      <ChevronRight size={18} color={c.muted} />
    </Pressy>
  );
}

const GENDERS = ['Male', 'Female', 'Other'];
const DIETS = ['Veg', 'Eggetarian', 'Non-veg', 'Jain', 'Vegan'];

export default function MyDetails() {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const { toast, openSheet } = useOverlay();
  const p = state.profile;
  const { d } = useDomain();
  const { s: shell } = useShell();
  const [name, setName] = useState(p.name);
  const [days, setDays] = useState(p.days);
  const [diet, setDiet] = useState(p.diet);
  const [inj, setInj] = useState<'No' | 'Yes'>(p.injury);
  const [note, setNote] = useState(p.injuryNote);
  const [err, setErr] = useState(0);
  const [photo, setPhoto] = useState<string | null | undefined>(undefined); // undefined = unchanged, null = removed
  const shake = useShake(err);

  useScenarios({
    title: 'My details',
    rows: [
      { label: 'Name', options: ['Filled', 'Empty'], value: name.trim() ? 'Filled' : 'Empty', onPick: (v) => { setName(v === 'Empty' ? '' : p.name || 'Jyotsana Rankawat'); setErr(0); } },
      { label: 'Injuries', options: ['No', 'Yes'], value: inj, onPick: (v) => setInj(v as any) },
    ],
    actions: [{ label: 'Try saving', run: () => save() }],
  }, [name, inj]);

  const pickPhoto = async (src: 'library' | 'camera') => {
    try {
      const perm = src === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted && Platform.OS !== 'web') { toast(src === 'camera' ? 'Camera is off. Allow it in Settings.' : 'Photos are off. Allow access in Settings.'); return; }
      const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 };
      const r = src === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (!r.canceled && r.assets?.[0]?.uri) { setPhoto(r.assets[0].uri); haptic.mark(); }
    } catch { toast(src === 'camera' ? 'Camera is not available here' : 'Could not open your photos'); }
  };
  const hasCustom = photo === undefined ? !!p.photo : !!photo;
  const save = () => {
    if (!name.trim()) { setErr((n) => n + 1); return; }
    setProfile({ name: name.trim(), days, diet, injury: inj, injuryNote: inj === 'Yes' ? note : '', ...(photo !== undefined ? { photo: photo ?? undefined } : {}) });
    goBack('/profile');
    toast('Saved · Coach Vikram sees the update');
  };

  return (
    <SubPage title="My details" fallback="/profile" footer={<>
      <Note center>Changes are shared with your trainer so your plan stays safe.</Note>
      <Button kind="accent" label="Save" onPress={save} />
    </>}>
      <View style={{ alignItems: 'center', paddingVertical: 4, gap: 8 }}>
        <Pressy accessibilityRole="button" accessibilityLabel="Change profile photo" onPress={() => openSheet(<PhotoSheet hasCustom={hasCustom} onPick={pickPhoto} onRemove={() => setPhoto(null)} />, { label: 'Profile photo' })} scaleTo={0.96}>
          <PersonAvatar who="me" size={96} photo={photo} />
        </Pressy>
        <Pressy accessibilityRole="button" onPress={() => openSheet(<PhotoSheet hasCustom={hasCustom} onPick={pickPhoto} onRemove={() => setPhoto(null)} />, { label: 'Profile photo' })} scaleTo={0.96} style={{ minHeight: 32, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: c.accentText }}>Change photo</Txt>
        </Pressy>
      </View>
      <Label style={{ marginTop: 16 }}>Name</Label>
      <View style={{ marginTop: -6 }}>
        <Field value={name} onChangeText={(t) => { setName(t); if (err) setErr(0); }} error={!!err} accessibilityLabel="Name" autoCapitalize="words" returnKeyType="done" />
      </View>
      {!!err && (
        <Animated.View entering={fade()} exiting={fadeOut()} style={shake}>
          <Txt style={{ color: c.warn, fontSize: 14, paddingHorizontal: 6 }}>Name can't be empty.</Txt>
        </Animated.View>
      )}

      <Label style={{ marginTop: 16 }}>Mobile number</Label>
      <Row style={{ gap: 10, marginTop: -6, minHeight: 56, paddingLeft: 18, paddingRight: 8, borderRadius: 22, backgroundColor: c.surface }}>
        <Txt v="mono" style={{ flex: 1 }}>{maskNum(state.phone)}</Txt>
        <Button small kind="secondary" label="Change" accessibilityLabel="Change mobile number" onPress={() => openSheet(<ChangePhoneSheet />, { label: 'Change mobile number' })} />
      </Row>

      <Label style={{ marginTop: 16 }}>Body details</Label>
      <View style={{ marginTop: -6, borderRadius: 22, backgroundColor: c.surface, overflow: 'hidden' }}>
        <BodyRow label="Date of birth" value={p.dob ? `${fmtDob(p.dob)} · ${ageFrom(p.dob)} yrs` : p.age ? `${p.age} years` : 'Add'} onPress={() => openSheet(<DobSheet />, { label: 'Date of birth' })} />
        <BodyRow label="Height" value={p.heightCm ? `${p.heightCm} cm` : 'Add'} onPress={() => router.push('/log-height')} />
        <BodyRow label="Weight" last value={shell.unitsW === 'lb' ? `${(d.weight * 2.20462).toFixed(1)} lb` : `${d.weight.toFixed(1)} kg`} onPress={() => router.push('/log-weight')} />
      </View>
      <Txt v="caption" style={{ marginTop: 8, paddingHorizontal: 6 }}>Gender</Txt>
      <Row style={{ gap: 6, marginTop: -4 }}>
        {GENDERS.map((g) => <Pill key={g} label={g} on={p.gender === g} onPress={() => { setProfile({ gender: p.gender === g ? '' : g }); haptic.tick(); }} style={{ flex: 1 }} />)}
      </Row>

      <Label style={{ marginTop: 16 }}>Days you can train</Label>
      <Row style={{ gap: 6, marginTop: -4 }}>
        {[2, 3, 4, 5, 6].map((n) => <Pill key={n} label={String(n)} on={days === n} onPress={() => setDays(n)} style={{ flex: 1, paddingHorizontal: 0 }} />)}
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
        <Animated.View entering={fade()} exiting={fadeOut()}>
          <NoteField value={note} onChangeText={setNote} placeholder="e.g. left knee pain on lunges, worse when I squat below parallel" accessibilityLabel="Injury note" />
        </Animated.View>
      )}

    </SubPage>
  );
}
