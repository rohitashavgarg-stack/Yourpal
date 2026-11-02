import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Pressy, Row, Txt } from '@/components/ui';
import { Star } from '@/lib/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { PtConfirmCard } from '@/features/today/TopCards';
import { useGymScenarios } from '@/features/gym/state';
import { Session, useAwaitingSession, useSessions } from '@/features/gym/sessions';
import { StatusTag } from '@/features/gym/SessionBits';
import { radii, fontSizes } from '@/design-system/tokens';

function Stars({ n }: { n: number }) {
  const { c } = useTheme();
  return (
    <View accessible accessibilityLabel={`You rated it ${n} stars`} style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={15} color={i <= n ? c.ink : c.surface3} fill={i <= n ? c.ink : c.surface3} />)}
    </View>
  );
}

// One stop on the trail: a dot on the line, and the session next to it.
function Stop({ s, first, last }: { s: Session; first: boolean; last: boolean }) {
  const { c } = useTheme();
  const done = s.status === 'confirmed';
  const dot = s.status === 'awaiting' ? c.accent : done ? c.good : s.status === 'flagged' ? c.warn : c.surface3;
  return (
    <Row style={{ alignItems: 'stretch', gap: 12 }}>
      <View style={{ width: 16, alignItems: 'center' }}>
        <View style={{ width: 2, height: 20, backgroundColor: first ? 'transparent' : c.line }} />
        <View style={{ width: 14, height: 14, borderRadius: radii.pill, backgroundColor: done || s.status !== 'upcoming' ? dot : c.bg, borderWidth: 2, borderColor: dot }} />
        <View style={{ width: 2, flex: 1, backgroundColor: last ? 'transparent' : c.line }} />
      </View>
      <Pressy accessibilityRole="button" accessibilityLabel={`${s.focus}, ${s.long}`} onPress={() => router.push({ pathname: '/gym/session', params: { id: s.id } })}
        style={{ flex: 1, backgroundColor: c.surface, borderRadius: radii.card, padding: 14, gap: 8, marginBottom: last ? 0 : 10 }}>
        <Row style={{ justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flex: 1, gap: 1 }}>
            <Txt style={{ fontFamily: font.semibold }}>{s.focus}</Txt>
            <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{`${s.day}, ${s.time}`}</Txt>
          </View>
          {s.rating ? <Stars n={s.rating} /> : <StatusTag s={s} />}
        </Row>
      </Pressy>
    </Row>
  );
}

// PT sessions for a PT member: the session to confirm (the same card as on Today), then the trail of upcoming and completed sessions.
export default function Sessions() {
  const waiting = useAwaitingSession();
  const all = useSessions();
  useGymScenarios('Gym · Sessions');

  return (
    <SubPage title="Sessions" fallback="/gym">
      {waiting && <PtConfirmCard />}
      <View>
        {all.map((s, i) => <Stop key={s.id} s={s} first={i === 0} last={i === all.length - 1} />)}
      </View>
    </SubPage>
  );
}
