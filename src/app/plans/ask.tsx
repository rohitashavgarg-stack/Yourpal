import React, { useState } from 'react';
import { PersonAvatar } from '@/components/Brand';
import { ScrollView, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fade } from '@/theme/motion';
import { Button, Pill, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { REASONS } from '@/features/plans/content';
import { BigTitle, InfoBox, PageHeader, ShakeText } from '@/features/plans/parts';
import { setP } from '@/features/plans/store';

export default function AskCoach() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  const kind = useLocalSearchParams<{ kind?: string }>().kind === 'diet' ? 'diet' : 'workout';
  const [reason, setReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [tries, setTries] = useState(0);
  const [err, setErr] = useState(false);
  const [focus, setFocus] = useState(false);
  const list = REASONS[kind];

  const send = () => {
    if (!reason) { setErr(true); setTries((t) => t + 1); return; }
    haptic.success();
    set({ planReq: 'requested' });
    setP({ seg: kind === 'diet' ? 'diet' : 'workout', draft: null });
    // Coming from Edit diet → Ask: go all the way back to the Plans tab.
    router.dismissTo('/plans');
    toast(d.offline ? 'Request queued · sends when you are online' : 'Request sent to Coach Vikram');
  };

  useScenarios({
    title: 'Ask Coach',
    rows: [{ label: 'Reason', options: list, value: reason ?? '', onPick: (v) => { setReason(v); setErr(false); } }],
    actions: [{ label: 'Send without a reason (error)', run: () => { setReason(null); setErr(true); setTries((t) => t + 1); } }],
  }, [reason, kind]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title="Ask Coach Vikram" icon="close" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 28, gap: 14 }}>
        <Row style={{ gap: 10, paddingHorizontal: 4 }}>
          <PersonAvatar who="coach" size={44} />
          <View><Txt v="headline">Coach Vikram</Txt><Txt v="caption">Your trainer</Txt></View>
        </Row>
        <BigTitle style={{ paddingHorizontal: 4 }}>{kind === 'diet' ? 'Why do you want a diet change?' : 'Why do you want a change?'}</BigTitle>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {list.map((r) => <Pill key={r} label={r} on={reason === r} onPress={() => { setReason(reason === r ? null : r); setErr(false); }} />)}
        </Row>
        {reason === 'Injury or pain' && (
          <Animated.View entering={fade()}><InfoBox tone="warn">Pain or injury: skip anything that hurts and tell a floor trainer today.</InfoBox></Animated.View>
        )}
        <View style={{ gap: 6 }}>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>Note (optional)</Txt>
          <TextInput accessibilityLabel="Note for Coach Vikram, optional" value={note} onChangeText={setNote} multiline numberOfLines={3}
            placeholder={kind === 'diet' ? 'I eat lunch at the office most days' : 'Want more leg work'} placeholderTextColor={c.muted}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            style={{ minHeight: 96, borderRadius: 22, borderWidth: focus ? 1.5 : 1, borderColor: focus ? c.accent : c.line, backgroundColor: c.surface, color: c.ink, paddingHorizontal: 18, paddingVertical: 14, fontFamily: font.regular, fontSize: 15, lineHeight: 21, textAlignVertical: 'top', outlineStyle: 'none' as any }} />
        </View>
        <ShakeText text={err ? 'Pick a reason so Coach Vikram knows what to change.' : ''} n={tries} />
        <Button label="Send request" onPress={send} />
        <Txt muted style={{ fontSize: 13, textAlign: 'center' }}>You'll get a notification when your new plan is ready.</Txt>
      </ScrollView>
    </View>
  );
}
