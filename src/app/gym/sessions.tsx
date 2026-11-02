import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { Pill } from '@/design-system/primitives/Pill';
import { Chip } from '@/design-system/primitives/Chip';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { GrowBar, SubPage } from '@/features/progress/parts';
import { ListCard as CardList } from '@/features/shell/parts';
import { PT_TOTAL } from '@/features/gym/data';
import { useGymScenarios } from '@/features/gym/state';
import { useAwaitingSession, useSessions } from '@/features/gym/sessions';
import { DateTile, StatusTag } from '@/features/gym/SessionBits';
import { radii, fontSizes } from '@/design-system/tokens';
import { FadeIn } from '@/design-system/primitives/FadeIn';

// PT sessions for a PT member: the package, the invite to confirm, then upcoming and past sessions.
export default function Sessions() {
  const { c } = useTheme();
  const { d } = useDomain();
  const all = useSessions();
  const waiting = useAwaitingSession();
  const [tab, setTab] = useState<'up' | 'past'>('up');
  useGymScenarios('Gym · Sessions');

  const used = PT_TOTAL - d.ptLeft;
  const list = all.filter((s) => (tab === 'up' ? s.status === 'upcoming' : s.status !== 'upcoming'));

  return (
    <SubPage title="Sessions" fallback="/gym">
      <View style={{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18, gap: 12 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Txt accessibilityLabel={`${used} of ${PT_TOTAL} sessions used`} style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 36 }}>
            {used}<Txt style={{ fontFamily: font.display, fontSize: fontSizes.lg, color: c.muted }}> of {PT_TOTAL} used</Txt>
          </Txt>
          <Chip label="Renews 30 Oct" />
        </Row>
        <GrowBar pct={Math.round((used / PT_TOTAL) * 100)} color={c.accent} />
      </View>

      {waiting && (
        <FadeIn style={{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 16, gap: 14, borderWidth: 1.5, borderColor: c.accent }}>
          <Row style={{ gap: 12 }}>
            <DateTile s={waiting} />
            <View style={{ flex: 1, gap: 1 }}>
              <Txt style={{ fontFamily: font.semibold }}>Confirm your session</Txt>
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{`${waiting.focus} with Coach Vikram`}</Txt>
            </View>
          </Row>
          <Button label="Confirm session" onPress={() => router.push({ pathname: '/gym/session', params: { id: waiting.id } })} />
        </FadeIn>
      )}

      <Row style={{ gap: 8 }}>
        <Pill label="Upcoming" on={tab === 'up'} onPress={() => setTab('up')} style={{ flex: 1 }} />
        <Pill label="Past" on={tab === 'past'} onPress={() => setTab('past')} style={{ flex: 1 }} />
      </Row>

      {list.length === 0 ? (
        <Txt muted style={{ textAlign: 'center', paddingVertical: 24 }}>{tab === 'up' ? 'No sessions booked' : 'No past sessions yet'}</Txt>
      ) : (
        <CardList>
          {list.map((s, i) => (
            <Pressy key={s.id} accessibilityRole="button" accessibilityLabel={`${s.focus}, ${s.long}`} onPress={() => router.push({ pathname: '/gym/session', params: { id: s.id } })}
              style={{ minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: i < list.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
              <DateTile s={s} />
              <View style={{ flex: 1, gap: 1 }}>
                <Txt style={{ fontFamily: font.medium }}>{s.focus}</Txt>
                <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{s.time}</Txt>
              </View>
              <StatusTag s={s} />
            </Pressy>
          ))}
        </CardList>
      )}
    </SubPage>
  );
}
