import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { PersonAvatar } from '@/components/Brand';
import { Button, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { Star } from '@/lib/icons';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { radii, fontSizes } from '@/design-system/tokens';
import { FlagSheet } from '@/features/gym/sheets';
import { Session } from '@/features/gym/sessions';
import { STAR_WORDS } from '@/features/gym/data';
import { StatusTag } from '@/features/gym/SessionBits';

// One PT session in a bottom sheet: who and when, what was done, the member's remarks and the coach's note.
// A session that waits for a confirm also has its two actions here.
export function SessionSheet({ s }: { s: Session }) {
  const { c } = useTheme();
  const { openSheet, closeSheet } = useOverlay();
  const waiting = s.status === 'awaiting';
  const note = (label: string, text: string) => (
    <View style={{ gap: 8 }}>
      <Txt v="label" style={{ paddingHorizontal: 4 }}>{label}</Txt>
      <View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 18 }}>
        <CardEdge radius={radii.xl} />
        <Txt style={{ fontSize: fontSizes.base, lineHeight: 22 }}>{text}</Txt>
      </View>
    </View>
  );
  return (
    <>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Txt accessibilityRole="header" v="title">{s.long}</Txt>
          <Row style={{ gap: 8 }}>
            <PersonAvatar who="coach" size={24} />
            <Txt muted style={{ fontSize: fontSizes.md }}>Coach Vikram</Txt>
          </Row>
        </View>
        <StatusTag s={s} />
      </Row>

      {s.status === 'flagged' && (
        <View style={{ backgroundColor: c.warnSoft, borderRadius: radii.xl, padding: 16 }}>
          <Txt style={{ color: c.warn, fontFamily: font.medium }}>The gym admin is checking this session. It isn’t counted in your package.</Txt>
        </View>
      )}

      {s.status === 'skipped' ? (
        <Txt muted>{s.note}</Txt>
      ) : s.status === 'upcoming' ? (
        <Txt muted>Your coach shares the plan for this session before it starts.</Txt>
      ) : (
        <>
          {s.rating ? (
            <View style={{ gap: 8 }}>
              <Txt v="label" style={{ paddingHorizontal: 4 }}>YOUR RATING</Txt>
              <View accessible accessibilityLabel={`You rated it ${s.rating} of 5 stars`} style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <CardEdge radius={radii.xl} />
                <Row style={{ gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={22} color={i <= s.rating! ? c.ink : c.surface3} fill={i <= s.rating! ? c.ink : c.surface3} />)}
                </Row>
                <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base }}>{STAR_WORDS[s.rating]}</Txt>
              </View>
            </View>
          ) : null}
          {s.remarks ? note('YOUR REMARKS', s.remarks) : null}
          {s.note ? note('NOTE FROM COACH VIKRAM', s.note) : null}
        </>
      )}

      {waiting ? (
        <View style={{ gap: 4 }}>
          <Row style={{ gap: 10 }}>
            <View style={{ flex: 1 }}><Button kind="secondary" label="Reject" onPress={() => closeSheet(() => openSheet(<FlagSheet />, { label: 'Flag session' }))} /></View>
            <View style={{ flex: 1.4 }}><Button label="Confirm & rate" onPress={() => closeSheet(() => router.push('/gym/confirm'))} /></View>
          </Row>
        </View>
      ) : null}
    </>
  );
}
