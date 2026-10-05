import React from 'react';
import { View } from 'react-native';
import { Row, Txt } from '@/components/ui';
import { useScenarios, useStore } from '@/lib/store';
import { font } from '@/theme/tokens';
import { LineRow, ListCard, ProgLogo, SubPage, Switch } from '@/features/shell/parts';
import { useShell } from '@/features/shell/state';

type R = { l: string; s: string; on: boolean; locked?: boolean; toggle?: () => void };

export default function Privacy() {
  const { state, setSc } = useStore();
  const { s, set, multi, progs } = useShell();
  const isPT = state.sc.member === 'PT member';
  const flip = (k: keyof typeof s.priv) => () => set((x) => ({ priv: { ...x.priv, [k]: !x.priv[k] } }));

  useScenarios({
    title: 'Privacy',
    rows: [
      { label: 'Member type (privacy wording)', options: ['Regular', 'PT member'], value: state.sc.member, onPick: (v) => setSc({ member: v as any }) },
      { label: 'Programmes joined', options: ['Three', 'Only one'], value: s.sc.progs, onPick: (v) => set((x) => ({ sc: { ...x.sc, progs: v as any }, cur: 'gold' })) },
    ],
  }, [state.sc.member, s.sc.progs]);

  const gold = progs.find((p) => p.id === 'gold')!;
  const mehta = s.progs.find((p) => p.id === 'mehta')!;
  const blocks: { p: typeof gold; name: string; wording: string; rows: R[] }[] = [{
    p: gold, name: "Wulf Fitness",
    wording: isPT ? 'Coach Vikram sees your workouts, diet and progress.' : 'Your gym sees attendance and a summary. Your trainer sees what you share.',
    rows: [
      { l: 'Attendance and check-ins', s: 'Needed for your membership', on: true, locked: true },
      isPT ? { l: 'Workouts, diet and progress', s: 'Part of personal training', on: true, locked: true }
        : { l: 'Workout and diet summary', s: 'Helps Coach Vikram adjust your plan', on: s.priv.gold_summary, toggle: flip('gold_summary') },
      { l: 'Progress photos', s: 'Always private · only you', on: false, locked: true },
    ],
  }];
  if (multi && progs.some((p) => p.id === 'mehta')) blocks.push({
    p: mehta, name: 'Dr. Mehta Skin Clinic', wording: 'Your clinic sees what you log in its own space.',
    rows: [
      { l: 'Routine check-ins', s: 'Morning and evening routine', on: s.priv.mehta_routine, toggle: flip('mehta_routine') },
      { l: 'Skin photos', s: 'Off unless you choose to share', on: s.priv.mehta_photos, toggle: flip('mehta_photos') },
    ],
  });

  return (
    <SubPage title="Privacy" fallback="/profile">
      {blocks.map((b) => (
        <ListCard key={b.name} style={{ paddingTop: 16, paddingBottom: 6, gap: 4 }}>
          <Row style={{ gap: 10, marginBottom: 2 }}>
            <ProgLogo p={b.p} size={32} />
            <Txt style={{ fontFamily: font.semibold, flex: 1 }}>What {b.name} can see</Txt>
          </Row>
          <Txt muted style={{ fontSize: 13 }}>{b.wording}</Txt>
          <View>
            {b.rows.map((r, i) => (
              <LineRow key={r.l} title={r.l} sub={r.s} minH={56} last={i === b.rows.length - 1}
                right={<Switch label={r.l} on={r.on} locked={r.locked} onChange={r.toggle} />} />
            ))}
          </View>
        </ListCard>
      ))}
    </SubPage>
  );
}
