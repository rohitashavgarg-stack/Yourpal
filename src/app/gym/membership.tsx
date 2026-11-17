import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { View } from 'react-native';
import { router } from 'expo-router';
import { NameAvatar } from '@/design-system/primitives/Brand';
import { ArrowRightLeft, ChevronRight, Pause } from '@/lib/icons';
import { Pressy, Row, Segmented, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { Hint, SubPage } from '@/features/progress/parts';
import { useGymScenarios } from '@/features/gym/state';
import { MTABS, MTab, Membership, ptKind, tabOf, useMemberships, usePtPackages } from '@/features/gym/memberships';
import { radii, fontSizes } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';

// A thin bar showing how much of the membership's time has gone.
export function TimeBar({ pct, warn, paused }: { pct: number; warn?: boolean; paused?: boolean }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }} style={{ height: 6, borderRadius: 3, backgroundColor: c.surface3, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: 6, borderRadius: radii.xs, backgroundColor: warn ? c.warn : paused ? c.muted : c.accent }} />
    </View>
  );
}

/** For a plan another member transferred to this member: its own small container at the bottom, a transfer icon and who it came from. Neutral: it is not a state, so it sits beside the state, not in it. */
export function TransferTag({ m }: { m: Membership }) {
  const { c } = useTheme();
  if (!m.transferred) return null;
  const from = m.transferred.from;
  // one line: the transfer icon, "Transferred from", the person's avatar and their name, highlighted
  return (
    <View accessible accessibilityLabel={from ? `Transferred from ${from}` : 'Transferred'} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.surface2, borderRadius: radii.md, paddingHorizontal: 12, paddingVertical: 10 }}>
      <ArrowRightLeft size={16} color={c.muted} />
      <Txt numberOfLines={1} style={{ fontSize: fontSizes.md, lineHeight: 20, color: c.muted }}>{from ? 'Transferred from' : 'Transferred'}</Txt>
      {from ? <NameAvatar name={from} size={24} photo={m.transferred.photo} /> : null}
      {from ? <Txt numberOfLines={1} style={{ flexShrink: 1, fontFamily: font.semibold, fontSize: fontSizes.md, lineHeight: 20, color: c.ink }}>{from}</Txt> : null}
    </View>
  );
}

export function StatusChip({ m }: { m: Membership }) {
  const { c } = useTheme();
  if (m.status === 'Paused') return <Chip label="Paused" filled outlined icon={<Pause size={14} color={c.accentText} />} />;
  return <Chip label={m.status === 'Expired' ? 'Past' : m.status} tone={m.status === 'Active' ? 'good' : m.status === 'Suspended' ? 'warn' : 'default'} />;
}

function MembershipCard({ m }: { m: Membership }) {
  const { c } = useTheme();
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${m.name}, ${m.transferred ? 'transferred, ' : ''}${m.status}. ${m.note}`} onPress={() => router.push({ pathname: '/gym/membership-detail', params: { id: m.id } })} scaleTo={0.985}
      style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 16, gap: 10, overflow: 'hidden' }}>
      {m.status === 'Paused' && <LinearGradient pointerEvents="none" colors={[c.accentSoft, c.cardLift]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />}
      <CardEdge radius={radii.lg} />
      <Row style={{ justifyContent: 'space-between', gap: 8 }}>
        <Txt style={{ flex: 1, fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{m.name}</Txt>
        <StatusChip m={m} />
      </Row>
      {(m.status === 'Active' || m.status === 'Paused') && <TimeBar pct={m.pct} warn={m.warn} paused={m.status === 'Paused'} />}
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ flex: 1, fontSize: fontSizes.md, color: m.warn ? c.warn : c.muted }}>{m.note}</Txt>
        <ChevronRight size={18} color={c.muted} />
      </Row>
      <TransferTag m={m} />
    </Pressy>
  );
}

// PT packages: a separate product from the gym membership, so each has its own card here, like a membership. It opens the pack's details (no sessions).
function ExtraPtCards({ past }: { past?: boolean }) {
  const { c } = useTheme();
  const extra = usePtPackages().filter((p) => (ptKind(p) === 'past') === !!past && ptKind(p) !== 'invited');
  return (
    <>
      {extra.map((p) => (
        <Pressy key={p.id} accessibilityRole="button" accessibilityLabel={`Personal training package, ${p.name}, ${p.past ? 'ended ' + p.ends : p.left + ' of ' + p.total + ' sessions left, ends ' + p.ends}`} onPress={() => router.push({ pathname: '/gym/pt-pack', params: { id: p.id, details: '1' } })} scaleTo={0.985}
          style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 16, gap: 10 }}>
          <CardEdge radius={radii.lg} />
          <Row style={{ justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 24 }}>{p.name}</Txt>
              <Txt style={{ fontSize: fontSizes.md, color: c.muted }}>Personal training package</Txt>
            </View>
            <Chip label={p.state === 'declined' ? 'Declined' : p.state === 'upcoming' ? 'Upcoming' : p.past ? 'Past' : 'Active'} tone={p.past || p.state === 'upcoming' ? 'default' : 'good'} />
          </Row>
          {p.past || p.state === 'upcoming' ? null : <TimeBar pct={p.pct} />}
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt style={{ flex: 1, fontSize: fontSizes.md, color: c.muted }}>{p.state === 'declined' ? 'You declined this invitation' : p.state === 'upcoming' ? `${p.total} sessions, starts ${p.start}` : p.past ? `${p.total} sessions, ended ${p.ends}` : `${p.left} of ${p.total} sessions left, ends ${p.ends}`}</Txt>
            <ChevronRight size={18} color={c.muted} />
          </Row>
        </Pressy>
      ))}
    </>
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
      {tab === 'Active' && <ExtraPtCards />}
      {tab === 'Past' && <ExtraPtCards past />}
      {list.some((m) => m.status === 'Upcoming') && (
        <View style={{ gap: 10, marginTop: 6 }}>
          <SectionLabel>Starts next</SectionLabel>
          {list.filter((m) => m.status === 'Upcoming').map((m) => <MembershipCard key={m.id} m={m} />)}
        </View>
      )}
      {!list.length && (
        <View style={{ padding: 24, borderRadius: radii.lg, backgroundColor: c.cardLift, alignItems: 'center' }}>
<CardEdge radius={radii.lg} />
          <Txt muted>{tab === 'Suspended' ? 'No suspended memberships.' : tab === 'Past' ? 'No past memberships yet.' : 'No active memberships.'}</Txt>
        </View>
      )}
      <Hint style={{ fontSize: fontSizes.base, lineHeight: 23, paddingVertical: 12 }}>Logging pauses if no plan is active.</Hint>
    </SubPage>
  );
}
