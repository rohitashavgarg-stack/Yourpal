import React, { useState } from 'react';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from '@/lib/icons';
import { Pressy, Row, Segmented, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Hint, SubPage } from '@/features/progress/parts';
import { useGymScenarios } from '@/features/gym/state';
import { MTABS, MTab, Membership, tabOf, useMemberships } from '@/features/gym/memberships';
import { radii, fontSizes } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';

// A thin bar showing how much of the membership's time has gone.
export function TimeBar({ pct, warn }: { pct: number; warn?: boolean }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }} style={{ height: 6, borderRadius: 3, backgroundColor: c.surface3, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: 6, borderRadius: 3, backgroundColor: warn ? c.warn : c.accent }} />
    </View>
  );
}

export function StatusChip({ m }: { m: Membership }) {
  return <Chip label={m.status === 'Expired' ? 'Past' : m.status} tone={m.status === 'Active' ? 'good' : m.status === 'Suspended' ? 'warn' : 'default'} />;
}

function MembershipCard({ m }: { m: Membership }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${m.name}, ${m.status}. ${m.note}`} onPress={() => router.push({ pathname: '/gym/membership-detail', params: { id: m.id } })} scaleTo={0.985}
      style={{ borderRadius: radii.lg, backgroundColor: c.surface, padding: 16, gap: 10 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ flex: 1, fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{m.name}</Txt>
        <StatusChip m={m} />
      </Row>
      {m.status === 'Active' && <TimeBar pct={m.pct} warn={m.warn} />}
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ flex: 1, fontSize: fontSizes.md, color: m.warn ? c.warn : c.muted }}>{m.note}</Txt>
        <ChevronRight size={18} color={c.muted} />
      </Row>
    </Pressy>
  );
}

// All of the member's memberships: Active (with the ones that start next), Suspended and Past. A member can have several active at once.
export default function Memberships() {
  const { c } = useTheme();
  useGymScenarios('Gym · Membership');
  const all = useMemberships();
  const [tab, setTab] = useState<MTab>('Active');
  const list = all.filter((m) => tabOf(m) === tab);
  return (
    <SubPage title="Memberships" fallback="/gym" backdrop={<TopGlow color={c.accent} />}>
      <Segmented accessibilityLabel="Memberships" value={tab} onChange={setTab} options={MTABS.map((t) => ({ value: t, label: t }))} />
      {list.filter((m) => m.status !== 'Upcoming').map((m) => <MembershipCard key={m.id} m={m} />)}
      {list.some((m) => m.status === 'Upcoming') && (
        <View style={{ gap: 10, marginTop: 6 }}>
          <SectionLabel>Starts next</SectionLabel>
          {list.filter((m) => m.status === 'Upcoming').map((m) => <MembershipCard key={m.id} m={m} />)}
        </View>
      )}
      {!list.length && (
        <View style={{ padding: 24, borderRadius: radii.lg, backgroundColor: c.surface, alignItems: 'center' }}>
          <Txt muted>{tab === 'Suspended' ? 'No suspended memberships.' : tab === 'Past' ? 'No past memberships yet.' : 'No active memberships.'}</Txt>
        </View>
      )}
      <Hint>When a membership ends, its history stays visible. Logging pauses only when none of your memberships is active.</Hint>
    </SubPage>
  );
}
