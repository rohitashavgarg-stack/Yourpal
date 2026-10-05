import React from 'react';
import Animated from 'react-native-reanimated';
import { BellOff } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useScenarios, useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fade, fadeOut } from '@/theme/motion';
import { LineRow, ListCard, Note, SubPage, Switch } from '@/features/shell/parts';
import { useShell } from '@/features/shell/state';

const PERM = { on: 'Allowed', off: 'Blocked', unset: 'Not asked' } as const;

export default function NotificationSettings() {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const { s, set } = useShell();
  const { toast } = useOverlay();
  const perm = state.profile.notifications;
  const flip = (k: keyof typeof s.notif) => () => set((x) => ({ notif: { ...x.notif, [k]: !x.notif[k] } }));

  useScenarios({
    title: 'Notification settings',
    rows: [
      { label: 'Phone permission', options: ['Allowed', 'Blocked', 'Not asked'], value: PERM[perm], onPick: (v) => setProfile({ notifications: v === 'Allowed' ? 'on' : v === 'Blocked' ? 'off' : 'unset' }) },
    ],
    actions: [{ label: 'Turn all reminders on', run: () => set((x) => ({ notif: { ...x.notif, remind: true, water: true } })) }],
  }, [perm]);

  const rows: { k: keyof typeof s.notif; l: string; s?: string }[] = [
    { k: 'plan', l: 'Plan updates', s: 'When Coach sends or changes your plan' },
    { k: 'msgs', l: 'Trainer messages' },
    { k: 'remind', l: 'Workout reminders', s: 'Off by default' },
    { k: 'water', l: 'Water reminders', s: 'Off by default' },
    { k: 'member', l: 'Membership & payments', s: 'Renewals and receipts' },
  ];

  return (
    <SubPage title="Notifications" fallback="/profile">
      {perm === 'off' && (
        <Animated.View entering={fade()} exiting={fadeOut()} style={{ padding: 16, borderRadius: 22, backgroundColor: c.warnSoft, gap: 10 }}>
          <Row style={{ gap: 10 }}>
            <BellOff size={18} color={c.warn} />
            <Txt style={{ flex: 1, fontFamily: font.semibold, color: c.warn }}>Notifications are off on this phone</Txt>
          </Row>
          <Txt style={{ fontSize: 14, color: c.warn }}>You won't hear about plan changes or Coach replies. Your choices below are kept for when you turn them on.</Txt>
          <Button small kind="primary" label="Turn on notifications" style={{ alignSelf: 'flex-start' }} onPress={() => { setProfile({ notifications: 'on' }); toast('Notifications on'); }} />
        </Animated.View>
      )}
      <Note style={{ fontSize: 13 }}>Reminders are off until you turn them on.</Note>
      <ListCard>
        {rows.map((r, i) => (
          <LineRow key={r.k} title={r.l} sub={r.s} last={i === rows.length - 1}
            right={<Switch label={r.l} on={s.notif[r.k]} onChange={flip(r.k)} />} />
        ))}
      </ListCard>
    </SubPage>
  );
}
