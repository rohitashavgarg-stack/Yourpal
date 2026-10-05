import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { LogOut, Moon, Smartphone, Sun } from '@/lib/icons';
import { Button, Pressy, Row, Segmented, Txt } from '@/components/ui';
import { Avatar } from '@/components/GymHeader';
import { useOverlay } from '@/components/Overlay';
import { useStore, useScenarios } from '@/lib/store';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fade, fadeOut } from '@/theme/motion';
import { LineRow, ListCard, Note, SubPage } from '@/features/shell/parts';
import { resetShell, useShell } from '@/features/shell/state';
import { goalSummary } from '@/features/shell/goal';
import { LogoutSheet } from '@/features/shell/sheets';

const maskPhone = (p: string) => {
  const d = (p || '').replace(/\D/g, '');
  return d.length === 10 ? `+91 ${d.slice(0, 2)}xxxxxx${d.slice(8)}` : '+91 98xxxxxx21';
};

export default function Profile() {
  const { c } = useTheme();
  const { state, setSc } = useStore();
  const { d } = useDomain();
  const { s, set } = useShell();
  const { openSheet, toast } = useOverlay();
  const p = state.profile;

  useScenarios({
    title: 'Profile',
    rows: [
      { label: 'Member type (privacy wording)', options: ['Regular', 'PT member'], value: state.sc.member, onPick: (v) => setSc({ member: v as any }) },
      { label: 'Programmes joined', options: ['Three', 'Only one'], value: s.sc.progs, onPick: (v) => set((x) => ({ sc: { ...x.sc, progs: v as any }, cur: 'gold' })) },
      { label: 'Account deletion', options: ['Not scheduled', 'Scheduled'], value: s.deleting ? 'Scheduled' : 'Not scheduled', onPick: (v) => set({ deleting: v === 'Scheduled' }) },
    ],
    actions: [
      { label: 'Log out (confirm sheet)', run: () => openSheet(<LogoutSheet />, { label: 'Log out' }) },
      { label: 'Open an invite link (WhatsApp)', run: () => router.push({ pathname: '/profile/join', params: { code: 'YOGA-2024', link: '1' } }) },
      { label: 'Reset profile settings', run: () => resetShell() },
    ],
  }, [state.sc.member, state.sc.theme, s.sc.progs, s.deleting]);

  const trackers = (['water', 'weight', 'steps'] as const).filter((k) => s.trk[k]).map((k) => k[0].toUpperCase() + k.slice(1)).join(', ') || 'None';
  const go = (path: string) => () => router.push(path as any);
  const rows: { l: string; s?: string; go: () => void; color?: string }[] = [
    { l: 'My details', s: 'Date of birth, height, weight, diet, injuries', go: go('/profile/details') },
    { l: 'Change goal', s: goalSummary(d.goal), go: go('/goal') },
    { l: 'Membership pauses', s: d.onBreak ? 'Paused by the front desk' : 'History and pauses left', go: go('/gym/break') },
    { l: 'Privacy & what each provider sees', go: go('/profile/privacy') },
    { l: 'Notifications', s: s.notif.remind || s.notif.water ? 'Reminders on' : 'Reminders off by default', go: go('/profile/notifications') },
    { l: 'Units & diet detail level', s: `${s.unitsW} · ${s.unitsL} · ${s.detail}`, go: go('/profile/units') },
    { l: 'Quick trackers to show', s: trackers, go: go('/profile/trackers') },
    { l: 'Export my data', go: go('/profile/export') },
    { l: 'Delete account', go: go('/profile/delete'), color: c.warn },
    { l: 'Help & support', go: go('/profile/help') },
  ];

  return (
    <SubPage title="Profile" fallback="/(tabs)">
      <Row style={{ gap: 14, paddingVertical: 6, paddingHorizontal: 4 }}>
        <Avatar size={64} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.6 }} numberOfLines={1}>{p.name || 'Jyotsana Rankawat'}</Txt>
          <Txt v="mono" muted>{maskPhone(state.phone)}</Txt>
          {state.sc.member === 'PT member' && <View style={{ alignSelf: 'flex-start', marginTop: 6, height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#F5B301', justifyContent: 'center' }}><Txt style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 18, color: '#3A2A00' }}>Premium · PT</Txt></View>}
        </View>
        <Pressy accessibilityRole="button" accessibilityLabel="Edit name and number" onPress={go('/profile/details')} scaleTo={0.94} style={{ height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: c.surface, justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20 }}>Edit</Txt>
        </Pressy>
      </Row>

      {s.deleting && (
        <Animated.View entering={fade()} exiting={fadeOut()} style={{ paddingVertical: 14, paddingHorizontal: 18, borderRadius: 22, backgroundColor: c.warnSoft, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Txt style={{ flex: 1, fontSize: 14, color: c.warn }}>Account scheduled for deletion on 28 Oct. Your programmes keep their own records.</Txt>
          <Button kind="secondary" small label="Cancel" accessibilityLabel="Cancel account deletion" onPress={() => { set({ deleting: false }); toast('Deletion cancelled'); }} />
        </Animated.View>
      )}

      <ListCard>
        {rows.map((r, i) => <LineRow key={r.l} title={r.l} sub={r.s} color={r.color} onPress={r.go} last={i === rows.length - 1} />)}
      </ListCard>

      <ListCard style={{ paddingVertical: 16, gap: 12 }}>
        <Txt style={{ fontFamily: font.medium }}>Appearance</Txt>
        <Segmented
          accessibilityLabel="Appearance"
          value={state.sc.theme}
          onChange={(v) => setSc({ theme: v })}
          options={[{ value: 'System', label: 'System' }, { value: 'Light', label: 'Light' }, { value: 'Dark', label: 'Dark' }]}
          icons={{ System: (col) => <Smartphone size={15} color={col} />, Light: (col) => <Sun size={15} color={col} />, Dark: (col) => <Moon size={15} color={col} /> }}
        />
      </ListCard>

      <Button kind="secondary" label="Log out" icon={<LogOut size={18} color={c.ink} />} onPress={() => openSheet(<LogoutSheet />, { label: 'Log out' })} />
      <Note center>Shared across programmes · coming in v1.5: health connections, Hindi / Hinglish</Note>
    </SubPage>
  );
}
