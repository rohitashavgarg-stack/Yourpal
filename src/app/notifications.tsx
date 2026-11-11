import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { BellRing } from '@/lib/icons';
import { Pill, Pressy, Row, Txt } from '@/components/ui';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fadeOut } from '@/theme/motion';
import { goHome, ProgLogo, SubPage } from '@/features/shell/parts';
import { switchProgramme, useShell } from '@/features/shell/state';
import { useVisibleNotifs } from '@/features/shell/notifs';
import { radii, fontSizes } from '@/design-system/tokens';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { FadeIn } from '@/design-system/primitives/FadeIn';

const GROUPS = ['Today', 'Yesterday', 'Earlier'];
// the age text on a notification (2h, 5h, 1d, 2d) decides its day group
const bucket = (when: string) => (/[hm]$/.test(when) ? 'Today' : when === '1d' ? 'Yesterday' : 'Earlier');

export default function Notifications() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { s, set: setS, progs } = useShell();
  const { toast } = useOverlay();
  const [filter, setFilter] = useState('all');

  const NOTIFS = useVisibleNotifs();
  const visible = progs.map((p) => p.id);
  const all = s.sc.notifs === 'None' ? [] : NOTIFS.filter((n) => visible.includes(n.p)).map((n) => ({ ...n, unread: n.unread && !d.notifsRead[n.id] }));
  const list = all.filter((n) => filter === 'all' || n.p === filter);
  const unread = all.filter((n) => n.unread).length;
  const filters = [{ id: 'all', l: 'All' }, ...progs.filter((p) => all.some((n) => n.p === p.id)).map((p) => ({ id: p.id, l: p.short }))];
  const byId = Object.fromEntries(s.progs.map((p) => [p.id, p]));

  useScenarios({
    title: 'Notifications',
    rows: [
      { label: 'Notifications', options: ['Some', 'None'], value: s.sc.notifs, onPick: (v) => setS((x) => ({ sc: { ...x.sc, notifs: v as any } })) },
      { label: 'Programmes joined', options: ['Three', 'Only one'], value: s.sc.progs, onPick: (v) => { setFilter('all'); setS((x) => ({ sc: { ...x.sc, progs: v as any }, cur: 'gold' })); } },
    ],
    actions: [{ label: 'Mark everything unread', run: () => set({ notifsRead: {} }) }],
  }, [s.sc.notifs, s.sc.progs]);

  const markAll = () => { haptic.light(); set((x) => ({ notifsRead: { ...x.notifsRead, ...Object.fromEntries(NOTIFS.map((n) => [n.id, true])) } })); };
  const open = (n: (typeof all)[number]) => {
    set((x) => ({ notifsRead: { ...x.notifsRead, [n.id]: true } }));
    if (n.p !== s.cur) {
      const name = switchProgramme(n.p);
      goHome();
      if (name) toast(`Switched to ${name}`);
      return;
    }
    if (n.to) router.push(n.to);
  };

  return (
    <SubPage title="Notifications" fallback="/(tabs)" right={
      <Pressy accessibilityRole="button" accessibilityLabel="Mark all as read" accessibilityState={{ disabled: unread === 0 }} disabled={unread === 0} onPress={markAll}
        style={{ height: 44, paddingHorizontal: 8, justifyContent: 'center', opacity: unread === 0 ? 0.4 : 1 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm, color: c.accentText }}>Read all</Txt>
      </Pressy>
    }>
      {filters.length > 2 && (
        <ScrollView showsVerticalScrollIndicator={false} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} style={{ marginHorizontal: -16 }}>
          <View style={{ width: 10 }} />
          {filters.map((f) => <Pill key={f.id} label={f.l} on={filter === f.id} onPress={() => setFilter(f.id)} />)}
          <View style={{ width: 10 }} />
        </ScrollView>
      )}
      {/* grouped by day; every notification is its own card with its programme's logo and name */}
      {GROUPS.map((g) => {
        const rows = list.filter((n) => bucket(n.when) === g);
        if (!rows.length) return null;
        return (
          <View key={g} style={{ gap: 8 }}>
            <Txt v="label" style={{ paddingHorizontal: 6 }}>{g.toUpperCase()}</Txt>
            {rows.map((n) => {
              const p = byId[n.p];
              return (
                <FadeIn key={n.id} exiting={fadeOut()}>
                  <Pressy accessibilityRole="button" accessibilityLabel={`${n.unread ? 'Unread. ' : ''}${p.name}: ${n.t}. ${n.s}. ${n.when} ago`} onPress={() => open(n)} scaleTo={0.985}
                    style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <CardEdge radius={radii.lg} />
                    <ProgLogo p={p} size={44} />
                    <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                      <Row style={{ gap: 8 }}>
                        <Txt numberOfLines={1} style={{ flex: 1, fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 16, letterSpacing: 0.6, color: p.color }}>{p.name.toUpperCase()}</Txt>
                        <Txt v="mono" muted style={{ fontSize: fontSizes.xs }}>{n.when}</Txt>
                      </Row>
                      <Txt style={{ fontFamily: n.unread ? font.semibold : font.medium, fontSize: fontSizes.basePlus, lineHeight: 22 }}>{n.t}</Txt>
                      <Txt muted numberOfLines={2} style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{n.s}</Txt>
                    </View>
                    {n.unread && <View accessibilityElementsHidden style={{ width: 9, height: 9, marginTop: 4, borderRadius: radii.pill, backgroundColor: c.accent }} />}
                  </Pressy>
                </FadeIn>
              );
            })}
          </View>
        );
      })}
      {list.length === 0 && (
        <FadeIn style={{ paddingVertical: 48, paddingHorizontal: 10, alignItems: 'center', gap: 12 }}>
          <IconBadge size={56} radius={radii.xl} bg={c.accentSoft}><BellRing size={24} color={c.accentText} /></IconBadge>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25 }}>You&apos;re all caught up</Txt>
          <Txt muted style={{ textAlign: 'center' }}>New updates from your programmes show up here.</Txt>
        </FadeIn>
      )}
    </SubPage>
  );
}
