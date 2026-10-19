import React from 'react';
import { View } from 'react-native';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { useShell } from '@/features/shell/state';
import { haptic } from '@/lib/haptics';
import { reminderStore, ReminderKey, useReminder } from './reminders';

// Two ways to put a reminder away: just for today, or for good (the switch in Profile turns off).
function LaterSheet({ k, title }: { k: ReminderKey; title: string }) {
  const { closeSheet, toast } = useOverlay();
  const { set } = useShell();
  return (
    <>
      <Txt style={{ fontFamily: font.regular, fontSize: 24, letterSpacing: -0.8 }}>{title}</Txt>
      <Txt muted style={{ fontSize: 14, lineHeight: 21 }}>You can change this any time in Profile, under Notifications.</Txt>
      <Button label="Later today" onPress={() => { reminderStore.set((s) => ({ snoozed: { ...s.snoozed, [k]: true } })); closeSheet(() => toast('We will not remind you again today')); }} />
      <Button kind="secondary" label="Don't remind me about this" onPress={() => { set((x) => ({ notif: { ...x.notif, [k]: false } })); closeSheet(() => toast('Turned off. You can turn it back on in Profile')); }} />
    </>
  );
}

// A short caption under a tracker tile: what is missing in one line, the one thing to do, and a way to put it away.
// The text is info; the action and "Later" are the only tappable parts.
export function NudgeCaption({ k, onAct, width = 160 }: { k: ReminderKey; onAct?: () => void; width?: number }) {
  const { c } = useTheme();
  const { openSheet } = useOverlay();
  const r = useReminder(k);
  if (!r) return null;
  return (
    <View style={{ width, paddingHorizontal: 4, paddingTop: 8, gap: 2 }}>
      <Txt style={{ fontSize: 12.5, lineHeight: 18, color: c.ink }}>{r.text}</Txt>
      <Row style={{ gap: 14 }}>
        {!!r.action && !!onAct && (
          <Pressy accessibilityRole="button" accessibilityLabel={r.action} onPress={() => { haptic.light(); onAct(); }} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
            <Txt style={{ fontFamily: font.semibold, fontSize: 12.5, lineHeight: 18, color: c.accentText }}>{r.action}</Txt>
          </Pressy>
        )}
        <Pressy accessibilityRole="button" accessibilityLabel="Remind me later" onPress={() => openSheet(<LaterSheet k={k} title={`${k === 'steps' ? 'Steps' : k === 'water' ? 'Water' : 'Weight'} reminders`} />, { label: 'Reminders' })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Txt style={{ fontSize: 12.5, lineHeight: 18, color: c.muted }}>Later</Txt>
        </Pressy>
      </Row>
    </View>
  );
}
