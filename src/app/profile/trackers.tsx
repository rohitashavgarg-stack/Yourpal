import React from 'react';
import { HEALTH_NAME } from '@/lib/health';
import { useScenarios } from '@/lib/store';
import { fadeOut } from '@/theme/motion';
import { LineRow, ListCard, Note, SubPage, Switch } from '@/features/shell/parts';
import { useShell } from '@/features/shell/state';
import { fontSizes } from '@/design-system/tokens';
import { FadeIn } from '@/design-system/primitives/FadeIn';

export default function TrackersScreen() {
  const { s, set } = useShell();
  const flip = (k: keyof typeof s.trk) => () => set((x) => ({ trk: { ...x.trk, [k]: !x.trk[k] } }));
  const allOff = Object.values(s.trk).every((v) => !v);

  useScenarios({
    title: 'Quick trackers',
    rows: [{ label: 'Trackers', options: ['All on', 'All off'], value: allOff ? 'All off' : 'All on', onPick: (v) => { const on = v === 'All on'; set({ trk: { water: on, weight: on, steps: on, hr: on, sleep: on, energy: on } }); } }],
  }, [allOff]);

  const rows: { k: keyof typeof s.trk; l: string; s: string }[] = [
    { k: 'water', l: 'Water', s: 'Bottle on Today · glasses' },
    { k: 'weight', l: 'Weight', s: 'Weekly average trend' },
    { k: 'steps', l: 'Steps', s: `From ${HEALTH_NAME}` },
    { k: 'hr', l: 'Heart rate', s: 'From your watch' },
    { k: 'sleep', l: 'Sleep', s: 'From your watch' },
    { k: 'energy', l: 'Active energy', s: 'From your watch' },
  ];

  return (
    <SubPage title="Quick trackers" fallback="/profile">
      <Note style={{ fontSize: fontSizes.sm }}>Choose which quick trackers show on Today. Trackers are shared across programmes. Heart rate, sleep and active energy appear once {HEALTH_NAME} and a watch are connected.</Note>
      <ListCard>
        {rows.map((r, i) => (
          <LineRow key={r.k} title={r.l} sub={r.s} last={i === rows.length - 1} right={<Switch label={r.l} on={s.trk[r.k]} onChange={flip(r.k)} />} />
        ))}
      </ListCard>
      {allOff && (
        <FadeIn exiting={fadeOut()}>
          <Note tone="soft">With every tracker off, the quick-tracker row disappears from Today and their Progress cards hide.</Note>
        </FadeIn>
      )}
    </SubPage>
  );
}
