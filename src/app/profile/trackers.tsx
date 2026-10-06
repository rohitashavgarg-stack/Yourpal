import React from 'react';
import { HEALTH_NAME } from '@/lib/health';
import Animated from 'react-native-reanimated';
import { useScenarios } from '@/lib/store';
import { fade, fadeOut } from '@/theme/motion';
import { LineRow, ListCard, Note, SubPage, Switch } from '@/features/shell/parts';
import { useShell } from '@/features/shell/state';

export default function Trackers() {
  const { s, set } = useShell();
  const flip = (k: keyof typeof s.trk) => () => set((x) => ({ trk: { ...x.trk, [k]: !x.trk[k] } }));
  const allOff = !s.trk.water && !s.trk.weight && !s.trk.steps;

  useScenarios({
    title: 'Quick trackers',
    rows: [{ label: 'Trackers', options: ['All on', 'All off'], value: allOff ? 'All off' : 'All on', onPick: (v) => { const on = v === 'All on'; set({ trk: { water: on, weight: on, steps: on } }); } }],
  }, [allOff]);

  const rows: { k: keyof typeof s.trk; l: string; s: string }[] = [
    { k: 'water', l: 'Water', s: 'Bottle on Today · glasses' },
    { k: 'weight', l: 'Weight', s: 'Weekly average trend' },
    { k: 'steps', l: 'Steps', s: `From ${HEALTH_NAME}` },
  ];

  return (
    <SubPage title="Quick trackers" fallback="/profile">
      <Note style={{ fontSize: 13 }}>Choose which quick trackers show on Today. Trackers are shared across programmes.</Note>
      <ListCard>
        {rows.map((r, i) => (
          <LineRow key={r.k} title={r.l} sub={r.s} last={i === rows.length - 1} right={<Switch label={r.l} on={s.trk[r.k]} onChange={flip(r.k)} />} />
        ))}
      </ListCard>
      {allOff && (
        <Animated.View entering={fade()} exiting={fadeOut()}>
          <Note tone="soft">With every tracker off, the quick-tracker row disappears from Today and their Progress cards hide.</Note>
        </Animated.View>
      )}
    </SubPage>
  );
}
