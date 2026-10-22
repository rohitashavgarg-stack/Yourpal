import React from 'react';
import { YourPalLogo } from '@/components/YourPalLogo';
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
import { switchProgramme, useShell } from '@/features/shell/state';
import { useVisibleNotifs } from '@/features/shell/notifs';
import { ProgLogo } from '@/features/shell/parts';
import { useDomain } from '@/lib/domain';
import { haptic } from '@/lib/haptics';
import { radii, fontSizes, fixed } from '@/design-system/tokens';

export const Avatar = ({ size = 44 }: { size?: number }) => <PersonAvatar who="me" size={size} />;
export const GymLogo = GymLogoMark;

const lift = { shadowColor: fixed.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 3 } as const;

// A rounded glass container; children sit above the blur.
function GlassShell({ radius, style, children }: { radius: number; style: any; children: React.ReactNode }) {
  // Only the glass is clipped to the rounded shape; the content (like the Premium crown on the photo) may reach past the edge.
  return (
    <View style={[{ borderRadius: radius }, style]}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius, overflow: 'hidden' }}>
        <GlassBackdrop radius={radius} />
      </View>
      {React.Children.map(children, (ch) => (ch == null || ch === false ? ch : <View style={{ zIndex: 2, flexShrink: 1 }}>{ch}</View>))}
    </View>
  );
}

export function GymHeader() {
  const { c } = useTheme();
  const { openSheet, toast } = useOverlay();
  const { s, current, multi } = useShell();
  const { d } = useDomain();
  const NOTIFS = useVisibleNotifs();
  const unread = s.sc.notifs === 'None' ? 0 : NOTIFS.filter((n) => n.unread && !d.notifsRead[n.id]).length;
  // Long-press jumps back to the last programme, like switching accounts.
  const jumpLast = () => { if (!multi) return; haptic.medium(); const n = switchProgramme(s.last); if (n) toast(`Switched to ${n}`); };
  return (
    <Row style={{ gap: 8 }}>
      {!d.hasGym ? (
        <View style={{ height: 52, justifyContent: 'center' }}><YourPalLogo height={26} color={c.ink} /></View>
      ) : (
      <Pressy accessibilityRole="button" accessibilityLabel={`Switch programme, current: ${current.short}`} onPress={() => openSheet(<ProgrammeSwitcherSheet />, { label: 'Switch programme' })} onLongPress={jumpLast} delayLongPress={500} style={{ flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 52 }}>
        <ProgLogo p={current} size={40} />
        <Txt numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 26, letterSpacing: -0.4, flexShrink: 1 }}>{current.short}</Txt>
        {multi && (
          <View style={{ width: 26, height: 26, borderRadius: 13, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
            <GlassBackdrop radius={13} />
            <View style={{ zIndex: 2 }}><ChevronDown size={16} color={c.ink} strokeWidth={2.4} /></View>
          </View>
        )}
      </Pressy>
      )}
      <View style={{ flex: 1 }} />
      {/* The bell has its own round glass button; the profile photo stands on its own beside it. */}
      <View style={[{ width: 44, height: 44, borderRadius: radii.lg }, lift]}>
        <GlassShell radius={22} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Pressy accessibilityRole="button" accessibilityLabel={unread ? `Notifications, ${unread} unread` : 'Notifications'} onPress={() => router.push('/notifications')} style={{ width: 44, height: 44, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={19} color={c.ink} />
            {unread > 0 && <View style={{ position: 'absolute', top: 9, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: c.danger }} />}
          </Pressy>
        </GlassShell>
      </View>
      <Pressy accessibilityRole="button" accessibilityLabel="Profile" onPress={() => router.push('/profile')} style={[{ width: 44, height: 44, borderRadius: radii.lg }, lift]} hitSlop={4}>
        <Avatar size={44} />
      </Pressy>
    </Row>
  );
}
