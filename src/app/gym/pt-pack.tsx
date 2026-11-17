import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { Chip } from '@/design-system/primitives/Chip';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { LineRow, ListCard as PayList } from '@/features/shell/parts';
import { TimeBar } from '@/app/gym/membership';
import { Trail } from '@/app/gym/sessions';
import { useGymScenarios } from '@/features/gym/state';
import { usePtPackages } from '@/features/gym/memberships';
import { useSessions } from '@/features/gym/sessions';
import { PtConfirmCard } from '@/features/today/TopCards';
import { radii, fontSizes } from '@/design-system/tokens';

// One PT pack: the pack and its sessions left, who it is with and when it ends, then the sessions that belong to this pack:
// the ones still to come, then the ones that are done, skipped or waiting for a confirm.
export default function PtPack() {
  const { c } = useTheme();
  const { id, details } = useLocalSearchParams<{ id: string; details?: string }>();
  const p = usePtPackages().find((x) => x.id === id);
  const sessions = useSessions().filter((s) => s.pack === id);
  useGymScenarios('Gym · PT pack');
  if (!p) return <SubPage title="PT pack" fallback="/gym/pt-packs"><Txt muted style={{ textAlign: 'center', paddingVertical: 32 }}>This pack is not in your list</Txt></SubPage>;
  const rupees = (n: number) => '\u20B9' + n.toLocaleString('en-IN');
  const value = (t: string) => <Txt style={{ fontFamily: font.semibold }}>{t}</Txt>;
  const coming = sessions.filter((s) => s.status === 'upcoming');
  const before = sessions.filter((s) => s.status !== 'upcoming');
  // Opened from the membership list: the package, like a membership page, with no sessions.
  if (details) {
    return (
      <SubPage title="" fallback="/gym/membership">
        <Row style={{ justifyContent: 'space-between', gap: 8, paddingTop: 4 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt accessibilityRole="header" v="display">{p.name}</Txt>
            <Txt muted style={{ fontSize: fontSizes.base, lineHeight: 23 }}>Extra PT package</Txt>
          </View>
          <Chip label={p.past ? 'Past' : 'Active'} tone={p.past ? 'default' : 'good'} />
        </Row>
        <View style={{ gap: 14 }}>
          <Row style={{ alignItems: 'baseline', gap: 6 }}>
            <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl6, lineHeight: 52, letterSpacing: -1.2 }}>{p.past ? p.total : p.left}</Txt>
            <Txt muted>{p.past ? 'sessions, all used' : `of ${p.total} sessions left`}</Txt>
          </Row>
          {p.past ? null : <TimeBar pct={p.pct} />}
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ gap: 1 }}>
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>Started</Txt>
              <Txt style={{ fontFamily: font.semibold }}>{p.start}</Txt>
            </View>
            <View style={{ gap: 1, alignItems: 'flex-end' }}>
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{p.past ? 'Ended' : 'Ends'}</Txt>
              <Txt style={{ fontFamily: font.semibold }}>{p.ends}</Txt>
            </View>
          </Row>
        </View>
        <View style={{ height: 1, backgroundColor: c.line }} />
        <Txt v="label" style={{ paddingHorizontal: 6 }}>DETAILS</Txt>
        <PayList>
          <LineRow title="Trainer" right={value(p.trainer)} last={p.price === undefined} />
          {p.price !== undefined ? <LineRow title="Price" right={value(rupees(p.price))} last /> : null}
        </PayList>
      </SubPage>
    );
  }
  return (
    <SubPage title="" fallback="/gym/pt-packs">
      {sessions.some((s) => s.status === 'awaiting') && <PtConfirmCard />}
      <Row style={{ justifyContent: 'space-between', gap: 8, paddingTop: 4 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt accessibilityRole="header" v="display">{p.name}</Txt>
          <Txt muted style={{ fontSize: fontSizes.base, lineHeight: 23 }}>{p.source}</Txt>
        </View>
        <Chip label={p.past ? 'Past' : 'Active'} tone={p.past ? 'default' : 'good'} />
      </Row>
      <View style={{ borderRadius: radii.lg, backgroundColor: c.cardLift, padding: 16, gap: 12 }}>
        <CardEdge radius={radii.lg} />
        <Txt accessibilityLabel={p.past ? `${p.total} sessions` : `${p.left} of ${p.total} sessions left`} style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 39 }}>
          {p.past ? p.total : p.left}<Txt muted style={{ fontFamily: font.display, fontSize: fontSizes.lg }}>{p.past ? ' sessions, all used' : ` of ${p.total} sessions left`}</Txt>
        </Txt>
        {p.past ? null : <TimeBar pct={p.pct} />}
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <Txt v="caption">{p.trainer}</Txt>
          <Txt v="caption">{`${p.past ? 'Ended' : 'Ends'} ${p.ends}`}</Txt>
        </Row>
      </View>
      {coming.length > 0 && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 4 }}>UPCOMING</Txt>
          <Trail items={coming} />
        </>
      )}
      {before.length > 0 && (
        <>
          <Txt v="label" style={{ paddingHorizontal: 4 }}>PAST SESSIONS</Txt>
          <Trail items={before} />
        </>
      )}
      {sessions.length === 0 && <Txt muted style={{ paddingHorizontal: 4 }}>No sessions in this pack yet. Coach Vikram will book them with you.</Txt>}
    </SubPage>
  );
}
