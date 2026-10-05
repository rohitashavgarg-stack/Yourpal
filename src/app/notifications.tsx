import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { router } from 'expo-router';
import { BellRing } from '@/lib/icons';
import { Pill, Pressy, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fade, fadeOut } from '@/theme/motion';
import { goHome, ListCard, Note, ProgLogo, SubPage } from '@/features/shell/parts';
import { NOTIFS, switchProgramme, useShell } from '@/features/shell/state';

export default function Notifications() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { s, set: setS, progs } = useShell();
  const { toast } = useOverlay();
  const [filter, setFilter] = useState('all');

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
        <Txt style={{ fontFamily: font.semibold, fontSize: 13, color: c.accentText }}>Read all</Txt>
      </Pressy>
    }>
      {filters.length > 2 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} style={{ marginHorizontal: -16 }}>
          <View style={{ width: 10 }} />
          {filters.map((f) => <Pill key={f.id} label={f.l} on={filter === f.id} onPress={() => setFilter(f.id)} />)}
          <View style={{ width: 10 }} />
        </ScrollView>
      )}
      <ListCard style={{ paddingHorizontal: 14 }}>
        {list.map((n, i) => {
          const p = byId[n.p];
          return (
            <Animated.View key={n.id} entering={fade()} exiting={fadeOut()}>
              <Pressy accessibilityRole="button" accessibilityLabel={`${n.unread ? 'Unread. ' : ''}${p.short}: ${n.t}. ${n.s}. ${n.when} ago`} onPress={() => open(n)} scaleTo={0.985}
                style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: i === list.length - 1 ? 0 : 1, borderBottomColor: c.line }}>
                <ProgLogo p={p} size={40} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt style={{ fontFamily: n.unread ? font.semibold : font.medium }}>{n.t}</Txt>
                  <Txt muted style={{ fontSize: 13 }} numberOfLines={1}>{n.s}</Txt>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Txt v="mono" muted style={{ fontSize: 12 }}>{n.when}</Txt>
                  {n.unread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.accent }} />}
                </View>
              </Pressy>
            </Animated.View>
          );
        })}
        {list.length === 0 && (
          <Animated.View entering={fade()} style={{ paddingVertical: 36, paddingHorizontal: 10, alignItems: 'center', gap: 10 }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><BellRing size={22} color={c.accentText} /></View>
            <Txt muted style={{ textAlign: 'center' }}>You're all caught up. New updates from your programmes show up here.</Txt>
          </Animated.View>
        )}
      </ListCard>
      {progs.length > 1 && <Note center>One inbox for every programme · tapping one from another programme switches to it</Note>}
    </SubPage>
  );
}
