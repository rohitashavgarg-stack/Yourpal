import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, Plus } from '@/lib/icons';
import { Button, Pressy, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { goHome, ProgLogo } from './parts';
import { joinProgramme, switchProgramme, useShell } from './state';

// "Your programs" — switch like switching accounts, or join another.
export function ProgrammeSwitcherSheet() {
  const { c } = useTheme();
  const { s, progs } = useShell();
  const { closeSheet, toast } = useOverlay();
  const pick = (id: string) => {
    closeSheet(() => {
      const n = switchProgramme(id);
      if (n) { haptic.light(); toast(`Switched to ${n}`); }
    });
  };
  const join = () => closeSheet(() => router.push('/profile/join'));
  return (
    <>
      <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.5 }}>Your programs</Txt>
      <View>
        {progs.map((p) => {
          const cur = p.id === s.cur;
          return (
            <Pressy key={p.id} accessibilityRole="button" accessibilityState={{ selected: cur }}
              accessibilityLabel={`${p.name}, ${p.kind}${cur ? ', current' : ''}${p.unread && !cur ? `, ${p.unread} new` : ''}`}
              onPress={() => pick(p.id)} scaleTo={0.985}
              style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.line }}>
              <ProgLogo p={p} />
              <View style={{ flex: 1 }}>
                <Txt style={{ fontFamily: font.medium }}>{p.name}</Txt>
                <Txt v="caption">{p.kind}</Txt>
              </View>
              {p.unread > 0 && !cur && <Tag label={`${p.unread} new`} bg={c.warnSoft} fg={c.warn} style={{ alignSelf: 'center' }} />}
              {cur && <Check size={20} strokeWidth={2.6} color={c.good} />}
            </Pressy>
          );
        })}
        <Pressy accessibilityRole="button" accessibilityLabel="Join a program" onPress={join} scaleTo={0.985}
          style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.chipLine, alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={20} color={c.muted} />
          </View>
          <Txt style={{ flex: 1, fontFamily: font.medium }}>Join a program</Txt>
        </Pressy>
      </View>
      {progs.length === 1 && <Txt muted style={{ fontSize: 13 }}>You're in one programme. When your gym or clinic sends an invite, it shows up here.</Txt>}
    </>
  );
}

// Consent before joining a new programme (opened from the Join page).
export function JoinConsentSheet() {
  const { s } = useShell();
  const { closeSheet, toast } = useOverlay();
  const j = s.pendingJoin;
  if (!j) return null;
  const confirm = () => closeSheet(() => {
    const n = joinProgramme(j);
    haptic.success();
    goHome();
    if (n) toast(`Joined · switched to ${n}`);
  });
  return (
    <>
      <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: 22, letterSpacing: -0.5 }}>Join {j.name}?</Txt>
      <Txt muted>Joining {j.name} shares your name and phone number with them. You choose what else to share.</Txt>
      <Button label="Join" onPress={confirm} />
      <Button kind="secondary" label="Not now" onPress={() => closeSheet()} />
    </>
  );
}
