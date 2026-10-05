import React from 'react';
import { GlassBackdrop } from '@/components/Glass';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Bell, ChevronDown } from '@/lib/icons';
import { Pressy, Row, Txt } from './ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { useOverlay } from './Overlay';
import { GymLogoMark, PersonAvatar } from './Brand';
import { ProgrammeSwitcherSheet } from '@/features/shell/Switcher';
import { NOTIFS, switchProgramme, useShell } from '@/features/shell/state';
import { ProgLogo } from '@/features/shell/parts';
import { useDomain } from '@/lib/domain';
import { haptic } from '@/lib/haptics';

export const Avatar = ({ size = 44 }: { size?: number }) => <PersonAvatar who="me" size={size} />;
export const GymLogo = GymLogoMark;

const lift = { shadowColor: '#101828', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 3 } as const;

// A rounded glass container; children sit above the blur.
function GlassShell({ radius, style, children }: { radius: number; style: any; children: React.ReactNode }) {
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <GlassBackdrop radius={radius} />
      {React.Children.map(children, (ch) => (ch == null || ch === false ? ch : <View style={{ zIndex: 2, flexShrink: 1 }}>{ch}</View>))}
    </View>
  );
}

export function GymHeader() {
  const { c } = useTheme();
  const { openSheet, toast } = useOverlay();
  const { s, current, multi } = useShell();
  const { d } = useDomain();
  const unread = s.sc.notifs === 'None' ? 0 : NOTIFS.filter((n) => n.unread && !d.notifsRead[n.id]).length;
  // Long-press jumps back to the last programme, like switching accounts.
  const jumpLast = () => { if (!multi) return; haptic.medium(); const n = switchProgramme(s.last); if (n) toast(`Switched to ${n}`); };
  return (
    <Row style={{ gap: 8 }}>
      <Pressy accessibilityRole="button" accessibilityLabel={`Switch programme, current: ${current.short}`} onPress={() => openSheet(<ProgrammeSwitcherSheet />, { label: 'Switch programme' })} onLongPress={jumpLast} delayLongPress={500} style={{ flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 }}>
        <ProgLogo p={current} size={40} />
        <Txt numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 19, lineHeight: 26, letterSpacing: -0.4, flexShrink: 1 }}>{current.short}</Txt>
        {multi && <ChevronDown size={18} color={c.muted} />}
      </Pressy>
      <View style={{ flex: 1 }} />
      <Pressy accessibilityRole="button" accessibilityLabel={unread ? `Notifications, ${unread} unread` : 'Notifications'} onPress={() => router.push('/notifications')} style={[{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, lift]}>
        <GlassBackdrop radius={24} />
        <View style={{ zIndex: 2 }}><Bell size={20} color={c.ink} /></View>
        {unread > 0 && <View style={{ zIndex: 3, position: 'absolute', top: 11, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: c.accent, borderWidth: 2, borderColor: c.surface }} />}
      </Pressy>
      <Pressy accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push('/profile')} style={[{ width: 52, height: 52, borderRadius: 26 }, lift]}>
        <GlassShell radius={26} style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
          <Avatar size={44} />
        </GlassShell>
      </Pressy>
    </Row>
  );
}
