import { View } from 'react-native';
import React from 'react';
import { BellOff } from '@/lib/icons';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useScenarios, useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fadeOut } from '@/theme/motion';
import { LineRow, ListCard, Note, SubPage, Switch } from '@/features/shell/parts';
import { useShell } from '@/features/shell/state';
import { QUIET_PRESETS, REMINDER_KEYS, REMINDER_LABEL, reminderStore } from '@/features/reminders/reminders';
import { radii, fontSizes } from '@/design-system/tokens';
import { FadeIn } from '@/design-system/primitives/FadeIn';

const PERM = { on: 'Allowed', off: 'Blocked', unset: 'Not asked' } as const;

export default function NotificationSettings() {
  const { c } = useTheme();
  const { state, setProfile } = useStore();
  const { s, set } = useShell();
  const { toast } = useOverlay();
  const perm = state.profile.notifications;
  const flip = (k: keyof typeof s.notif) => () => set((x) => ({ notif: { ...x.notif, [k]: x.notif[k] === false } }));
  const quiet = reminderStore.use().quiet;

  useScenarios({
    title: 'Notification settings',
    rows: [
      { label: 'Phone permission', options: ['Allowed', 'Blocked', 'Not asked'], value: PERM[perm], onPick: (v) => setProfile({ notifications: v === 'Allowed' ? 'on' : v === 'Blocked' ? 'off' : 'unset' }) },
    ],
    actions: [{ label: 'Turn all reminders on', run: () => set((x) => ({ notif: { ...x.notif, remind: true, water: true, weight: true, meals: true, steps: true } })) }],
  }, [perm]);

  const rows: { k: keyof typeof s.notif; l: string; s?: string }[] = [
    { k: 'plan', l: 'Plan updates', s: 'When Coach sends or changes your plan' },
    { k: 'msgs', l: 'Trainer messages' },
    { k: 'remind', l: 'Workout reminders', s: 'Off by default' },
    { k: 'member', l: 'Membership & payments', s: 'Renewals and receipts' },
  ];

  return (
    <SubPage title="Notifications" fallback="/profile">
      {perm === 'off' && (
        <FadeIn exiting={fadeOut()} style={{ padding: 16, borderRadius: radii.lg, backgroundColor: c.warnSoft, gap: 10 }}>
          <Row style={{ gap: 10 }}>
            <BellOff size={18} color={c.warn} />
            <Txt style={{ flex: 1, fontFamily: font.semibold, color: c.warn }}>Notifications are off on this phone</Txt>
          </Row>
          <Txt style={{ fontSize: fontSizes.md, color: c.warn }}>You won&apos;t hear about plan changes or Coach replies. Your choices below are kept for when you turn them on.</Txt>
          <Button small kind="primary" label="Turn on notifications" style={{ alignSelf: 'flex-start' }} onPress={() => { setProfile({ notifications: 'on' }); toast('Notifications on'); }} />
        </FadeIn>
      )}
      <ListCard>
        {rows.map((r, i) => (
          <LineRow key={r.k} title={r.l} sub={r.s} last={i === rows.length - 1}
            right={<Switch label={r.l} on={s.notif[r.k] !== false} onChange={flip(r.k)} />} />
        ))}
      </ListCard>
      {/* the heading and its line sit together, indented the same, with room above them and a small gap below */}
      <View style={{ gap: 4, marginTop: 12, marginBottom: 2 }}>
        <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25, paddingHorizontal: 6 }}>Reminders</Txt>
        <Note style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>Small nudges when something is missing.</Note>
      </View>
      <ListCard>
        {REMINDER_KEYS.map((k, i) => (
          <LineRow key={k} title={REMINDER_LABEL[k].title} sub={REMINDER_LABEL[k].sub} last={i === REMINDER_KEYS.length - 1}
            right={<Switch label={`${REMINDER_LABEL[k].title} reminders`} on={s.notif[k] !== false} onChange={flip(k)} />} />
        ))}
      </ListCard>
      <ListCard>
        <LineRow title="Quiet hours" sub="Reminders stay quiet" last right={<View style={{ backgroundColor: c.accentSoft, borderRadius: radii.pill, paddingHorizontal: 14, height: 34, justifyContent: 'center' }}><Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20, color: c.accentText }}>{QUIET_PRESETS[quiet].label}</Txt></View>}
          onPress={() => reminderStore.set({ quiet: (quiet + 1) % QUIET_PRESETS.length })} />
      </ListCard>
    </SubPage>
  );
}
