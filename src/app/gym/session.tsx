import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PersonAvatar } from '@/components/Brand';
import { Button, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { Star } from '@/lib/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { ListCard as CardList } from '@/features/shell/parts';
import { FlagSheet } from '@/features/gym/sheets';
import { useGymScenarios } from '@/features/gym/state';
import { useSessions } from '@/features/gym/sessions';
import { StatusTag } from '@/features/gym/SessionBits';
import { Chip } from '@/design-system/primitives/Chip';
import { radii, fontSizes, fixed } from '@/design-system/tokens';

// One PT session. Its footer changes with where the session is: to confirm, confirmed, under review or still to come.
export default function SessionDetail() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { openSheet } = useOverlay();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = useSessions().find((x) => x.id === id);
  useGymScenarios('Gym · Session');

  if (!s) {
    return <SubPage title="Session" fallback="/gym/sessions"><Txt muted style={{ textAlign: 'center', paddingVertical: 32 }}>This session is not in your list</Txt></SubPage>;
  }

  const waiting = s.status === 'awaiting';
  return (
    <SubPage
      title=""
      fallback="/gym/sessions"
      backdrop={<LinearGradient pointerEvents="none" colors={[waiting ? c.accentSoft : c.surface2, c.bg]} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }} />}
      footer={waiting ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 16) + 6, gap: 4 }}>
          <Button label="Confirm and rate" onPress={() => router.push('/gym/confirm')}
            style={{ shadowColor: fixed.black, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 }} />
          <Pressy accessibilityRole="button" onPress={() => openSheet(<FlagSheet />, { label: 'Flag session' })} style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Txt style={{ fontFamily: font.semibold, color: c.muted }}>This didn’t happen</Txt>
          </Pressy>
        </View>
      ) : undefined}>
      {/* who, when, and the status */}
      <View style={{ gap: 14, paddingTop: 4 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <PersonAvatar who="coach" size={56} />
          <StatusTag s={s} />
        </Row>
        <View style={{ gap: 4 }}>
          <Txt accessibilityRole="header" v="display">{s.long}</Txt>
          <Txt muted style={{ fontSize: fontSizes.base }}>{`${s.time} with Coach Vikram`}</Txt>
        </View>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          <Chip label={s.focus} />
          {s.rating ? (
            <View accessible accessibilityLabel={`You rated it ${s.rating} stars`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, paddingHorizontal: 12, borderRadius: radii.pill, backgroundColor: c.surface2 }}>
              <Star size={14} color={c.ink} fill={c.ink} />
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.sm }}>{String(s.rating)}</Txt>
            </View>
          ) : null}
        </Row>
      </View>

      {s.status === 'flagged' && (
        <View style={{ backgroundColor: c.warnSoft, borderRadius: radii.xl, padding: 16 }}>
          <Txt style={{ color: c.warn, fontFamily: font.medium }}>The gym admin is checking this session. It isn’t counted in your package.</Txt>
        </View>
      )}

      {s.status === 'upcoming' ? (
        <View style={{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18, gap: 4 }}>
          <Txt style={{ fontFamily: font.semibold }}>{s.focus}</Txt>
          <Txt muted>Your coach shares the plan for this session before it starts.</Txt>
        </View>
      ) : (
        <>
          <Txt v="label" style={{ paddingHorizontal: 4 }}>WHAT YOU DID</Txt>
          <CardList>
            {s.exercises.map((e, i) => (
              <View key={e.n} style={{ minHeight: 60, justifyContent: 'center', gap: 1, paddingVertical: 10, borderBottomWidth: i < s.exercises.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                <Txt style={{ fontFamily: font.medium }}>{e.n}</Txt>
                <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{e.d}</Txt>
              </View>
            ))}
          </CardList>
          {s.remarks ? (
            <>
              <Txt v="label" style={{ paddingHorizontal: 4 }}>YOUR REMARKS</Txt>
              <View style={{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18 }}>
                <Txt style={{ fontSize: fontSizes.base, lineHeight: 22 }}>{s.remarks}</Txt>
              </View>
            </>
          ) : null}
          {s.note ? (
            <>
              <Txt v="label" style={{ paddingHorizontal: 4 }}>NOTE FROM COACH VIKRAM</Txt>
              <View style={{ backgroundColor: c.surface, borderRadius: radii.xl, padding: 18 }}>
                <Txt style={{ fontSize: fontSizes.base, lineHeight: 22 }}>{s.note}</Txt>
              </View>
            </>
          ) : null}
        </>
      )}
      <View style={{ height: waiting ? 120 : 24 }} />
    </SubPage>
  );
}
