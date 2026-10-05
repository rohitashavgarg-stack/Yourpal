import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Field, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { goBack, Label, SubPage } from '@/features/shell/parts';
import { useShell } from '@/features/shell/state';

export default function DeleteAccount() {
  const { c } = useTheme();
  const { set } = useShell();
  const { toast } = useOverlay();
  const [text, setText] = useState('');
  const ok = text.trim().toUpperCase() === 'DELETE';

  useScenarios({
    title: 'Delete account',
    rows: [{ label: 'Confirmation', options: ['Empty', 'Typed DELETE'], value: ok ? 'Typed DELETE' : 'Empty', onPick: (v) => setText(v === 'Empty' ? '' : 'DELETE') }],
  }, [ok]);

  const del = () => {
    if (!ok) return;
    haptic.medium();
    set({ deleting: true });
    goBack('/profile');
    toast('Deletion scheduled for 28 Oct');
  };

  return (
    <SubPage title="Delete account" fallback="/profile">
      <View style={{ padding: 18, borderRadius: 24, backgroundColor: c.warnSoft, gap: 6 }}>
        <Txt style={{ fontFamily: font.semibold, color: c.warn }}>Delete your YourPal account</Txt>
        <Txt style={{ fontSize: 14, color: c.warn }}>You'll leave every programme and lose your history in the app after 30 days. You can cancel any time before then.</Txt>
      </View>
      <Label>Type DELETE to confirm</Label>
      <View style={{ marginTop: -6 }}>
        <Field value={text} onChangeText={setText} autoCapitalize="characters" autoCorrect={false} autoComplete="off" accessibilityLabel="Type DELETE to confirm" />
      </View>
      {/* Uses the warn tone (not a red alarm) as in the reference; the bg-coloured label contrasts in both themes. */}
      <Button label="Delete account" disabled={!ok} onPress={del} style={{ backgroundColor: c.warn }} />
      <Button kind="secondary" label="Keep my account" onPress={() => goBack('/profile')} />
    </SubPage>
  );
}
