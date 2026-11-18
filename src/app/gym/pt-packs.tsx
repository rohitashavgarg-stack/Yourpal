import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { Check, ChevronRight, SkipForward, X } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { useGymScenarios } from '@/features/gym/state';
import { PtPack, ptKind, usePtPackages } from '@/features/gym/memberships';
import { PtInviteCard } from '@/features/gym/PtInviteSheet';
import { useSessions } from '@/features/gym/sessions';
import { TimeBar } from '@/app/gym/membership';
import { radii, round, fontSizes, fixed } from '@/design-system/tokens';

type DotKind = 'done' | 'booked' | 'open' | 'skipped' | 'rejected';

// One dot for a session: a check when done, its number when booked (a ring) or not booked yet (grey), a dash icon when the coach skipped it,
// and an amber cross when you rejected it. Skipped and rejected sessions have no number: the number stays for the session that is still owed.
function Dot({ kind, n }: { kind: DotKind; n: number }) {
  const { c } = useTheme();
  const base = { width: 32, height: 32, borderRadius: round(32), alignItems: 'center' as const, justifyContent: 'center' as const };
  if (kind === 'done') return <View style={[base, { backgroundColor: c.accent }]}><Check size={16} strokeWidth={3} color={fixed.white} /></View>;
  if (kind === 'skipped') return <View style={[base, { borderWidth: 2, borderStyle: 'dashed', borderColor: c.muted }]}><SkipForward size={14} color={c.muted} /></View>;
  if (kind === 'rejected') return <View style={[base, { borderWidth: 2, borderColor: c.warn }]}><X size={15} strokeWidth={2.6} color={c.warn} /></View>;
  const num = <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 16, color: kind === 'booked' ? c.accentText : c.muted }}>{String(n)}</Txt>;
  return kind === 'booked' ? <View style={[base, { borderWidth: 2, borderColor: c.accent }]}>{num}</View> : <View style={[base, { backgroundColor: c.surface3 }]}>{num}</View>;
}

// One PT pack, told by its sessions (the purchase details live in Memberships): a numbered dot for each session, in order.
// A line under them says which session needs you or comes next. Tapping the card opens the sessions of this pack.
export function PackCard({ p }: { p: PtPack }) {
  const { c } = useTheme();
  const mine = useSessions().filter((s) => s.pack === p.id);
  const oldestFirst = [...mine].reverse();
  const waiting = mine.find((s) => s.status === 'awaiting');
  const next = oldestFirst.find((s) => s.status === 'upcoming');
  const last = mine.find((s) => s.status === 'confirmed');
  const skipped = mine.filter((s) => s.status === 'skipped').length;
  const rejected = mine.filter((s) => s.status === 'rejected').length;
  const done = mine.filter((s) => s.status === 'confirmed').length;
  // the sessions in order, then the ones not booked yet, until the pack's total is reached; skipped and rejected ones are extra dots
  const upcoming = p.state === 'upcoming';
  const declined = p.state === 'declined';
  const kinds: DotKind[] = oldestFirst.map((s) => (s.status === 'confirmed' ? 'done' : s.status === 'skipped' ? 'skipped' : s.status === 'rejected' ? 'rejected' : 'booked'));
  const used = kinds.filter((k) => k !== 'skipped' && k !== 'rejected').length;
  for (let i = used; i < p.total; i++) kinds.push('open');
  const dots = kinds.map((k, i) => ({ k, n: kinds.slice(0, i + 1).filter((x) => x !== 'skipped' && x !== 'rejected').length }));
  const extra = [skipped ? `${skipped} skipped` : '', rejected ? `${rejected} rejected` : ''].filter(Boolean).join(', ');
  const head = declined ? 'Declined' : upcoming ? `${p.total} sessions` : p.past ? `${p.total} sessions` : `${done} of ${p.total} done${extra ? ', ' + extra : ''}`;
  const line = waiting ? `To confirm: ${waiting.focus}, ${waiting.day}` : next ? `Next: ${next.focus}, ${next.day}` : declined ? 'You declined this invitation' : upcoming ? `Starts ${p.start}, ends ${p.ends}` : p.past ? (last ? `Last session: ${last.day}` : 'All sessions used') : 'No session booked yet';
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${p.name}, ${head}. ${line}`}
      onPress={() => router.push({ pathname: '/gym/pt-pack', params: { id: p.id } })} scaleTo={0.985}
      style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 20, gap: 24 }}>
      <CardEdge radius={radii.lg} />
      <Row style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <Txt style={{ flex: 1, fontFamily: font.semibold, fontSize: fontSizes.xl, lineHeight: 26 }}>{p.name}</Txt>
      </Row>
      {declined ? null : p.past ? (
        // a past pack: small dots, one for each session: filled when done, a dashed ring when the trainer skipped it, an amber ring when you rejected it
        <View accessible={false} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {dots.map((d, i) => (
            <View key={i} style={{ width: 12, height: 12, borderRadius: round(12), backgroundColor: d.k === 'done' ? c.accent : 'transparent', borderWidth: d.k === 'done' ? 0 : 1.5, borderStyle: d.k === 'skipped' ? 'dashed' : 'solid', borderColor: d.k === 'rejected' ? c.warn : c.muted }} />
          ))}
        </View>
      ) : upcoming ? (
        // accepted, starts when the current package ends: the sessions, none used yet
        <View accessible={false} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {dots.map((d, i) => <Dot key={i} kind="open" n={d.n} />)}
        </View>
      ) : (
        <>
          <View accessible={false} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {dots.map((d, i) => <Dot key={i} kind={d.k} n={d.n} />)}
          </View>
          {/* an active pack also counts its time: the days left and the end date */}
          {p.daysLeft !== undefined ? (
            <View style={{ gap: 14 }}>
              <Row style={{ justifyContent: 'space-between', gap: 8 }}>
                <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md }}>{`${p.daysLeft} days left`}</Txt>
                <Txt muted style={{ fontSize: fontSizes.md }}>{`Ends ${p.ends}`}</Txt>
              </Row>
              <TimeBar pct={p.timePct ?? 0} />
            </View>
          ) : null}
        </>
      )}
      <Row style={{ justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: c.line, paddingTop: 20 }}>
        <Txt style={{ flex: 1, fontSize: fontSizes.md, fontFamily: waiting ? font.semibold : font.regular, color: waiting ? c.accentText : c.muted }}>{line}</Txt>
        <ChevronRight size={18} color={c.muted} />
      </Row>
    </Pressy>
  );
}

// All of the member's PT packages on one page: an invitation waiting for your answer, then the active one, the one that starts next, and the past ones. Tap a pack to see its sessions.
export default function PtPacks() {
  const { c } = useTheme();
  const packs = usePtPackages();
  useGymScenarios('Gym · PT packages');
  const invited = packs.some((p) => ptKind(p) === 'invited');
  const active = packs.filter((p) => ptKind(p) === 'active');
  const next = packs.filter((p) => ptKind(p) === 'upcoming');
  const past = packs.filter((p) => ptKind(p) === 'past');
  return (
    <SubPage title="PT packages" fallback="/gym" backdrop={<TopGlow color={c.accent} />}>
      {invited && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 4 }}>INVITATION</Txt>
          <PtInviteCard />
        </>
      )}
      <Txt v="label" style={{ paddingHorizontal: 4, marginTop: invited ? 6 : 0 }}>ACTIVE</Txt>
      {active.length ? active.map((p) => <PackCard key={p.id} p={p} />) : <Txt muted style={{ paddingHorizontal: 4 }}>No active PT packages.</Txt>}
      {next.length > 0 && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 4, marginTop: 6 }}>STARTS NEXT</Txt>
          {next.map((p) => <PackCard key={p.id} p={p} />)}
        </>
      )}
      {past.length > 0 && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 4, marginTop: 6 }}>PAST</Txt>
          {past.map((p) => <PackCard key={p.id} p={p} />)}
        </>
      )}
    </SubPage>
  );
}
