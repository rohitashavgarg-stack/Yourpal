import React, { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { Button, Field, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fade, fadeOut } from '@/theme/motion';
import { Label, Note, SubPage, useShake } from '@/features/shell/parts';
import { checkCode, setShell } from '@/features/shell/state';
import { JoinConsentSheet } from '@/features/shell/Switcher';

export default function JoinProgramme() {
  const { c } = useTheme();
  const q = useLocalSearchParams<{ code?: string; link?: string }>();
  const { openSheet } = useOverlay();
  const [code, setCode] = useState((q.code ?? '').toUpperCase());
  const [fromLink, setFromLink] = useState(q.link === '1');
  const [err, setErr] = useState('');
  const [tries, setTries] = useState(0);
  const shake = useShake(tries);

  const join = (raw = code) => {
    const r = checkCode(raw);
    if (!r.ok) { setErr(r.err); setTries((n) => n + 1); return; }
    setErr('');
    setShell({ pendingJoin: { name: r.name, color: r.color, logo: r.logo } });
    openSheet(<JoinConsentSheet />, { label: 'Join programme' });
  };
  const fill = (v: string) => { setCode(v); setErr(''); };

  useScenarios({
    title: 'Join a program',
    rows: [
      { label: 'Invite code', options: ['YOGA-2024 (new)', 'GLD-4821 (joined)', 'OLD-0001 (expired)', 'Wrong'], value: code === 'YOGA-2024' ? 'YOGA-2024 (new)' : code === 'GLD-4821' ? 'GLD-4821 (joined)' : code === 'OLD-0001' ? 'OLD-0001 (expired)' : 'Wrong', onPick: (v) => fill(v === 'Wrong' ? 'ABC-1234' : v.split(' ')[0]) },
      { label: 'Opened from', options: ['Typed', 'WhatsApp link'], value: fromLink ? 'WhatsApp link' : 'Typed', onPick: (v) => { setFromLink(v !== 'Typed'); if (v !== 'Typed') fill('YOGA-2024'); } },
    ],
    actions: [{ label: 'Try joining', run: () => join() }],
  }, [code, fromLink]);

  return (
    <SubPage title="Join a program" close fallback="/(tabs)">
      <Txt muted style={{ paddingHorizontal: 4 }}>Your gym or clinic gives you an invite link or code.</Txt>
      {fromLink && <Animated.View entering={fade()} exiting={fadeOut()}><Tag label="Opened from a WhatsApp invite · code filled in" bg={c.goodSoft} fg={c.good} /></Animated.View>}
      <Label>Invite code</Label>
      <View style={{ marginTop: -6 }}>
        <Field value={code} onChangeText={(t) => fill(t.toUpperCase())} placeholder="GLD-4821" autoCapitalize="characters" autoCorrect={false} autoComplete="off"
          error={!!err} accessibilityLabel="Invite code" returnKeyType="go" onSubmitEditing={() => code.trim() && join()}
          style={{ fontFamily: font.mono, letterSpacing: 1 }} />
      </View>
      {!!err && (
        <Animated.View entering={fade()} exiting={fadeOut()} style={shake}>
          <Txt accessibilityLiveRegion="polite" style={{ color: c.warn, fontSize: 14, paddingHorizontal: 6 }}>{err}</Txt>
        </Animated.View>
      )}
      <Button label="Join" disabled={!code.trim()} onPress={() => join()} />
      <Note style={{ fontSize: 13 }}>Try YOGA-2024 (new), GLD-4821 (already joined), OLD-0001 (expired) or any other code.</Note>
    </SubPage>
  );
}
