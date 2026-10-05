import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Flame } from '@/lib/icons';
import { Chip, Row, Txt } from '@/components/ui';
import { PersonAvatar } from '@/components/Brand';
import { coachStore } from '@/features/coach/coach';
import { useOverlay } from '@/components/Overlay';
import { Pressy } from '@/components/ui';
import { fmtT } from '@/lib/data';
import { burned, useDomain, wkDoneInfo, workoutState } from '@/lib/domain';
import { font } from '@/theme/tokens';
import { mmss, useNow } from '@/lib/useNow';
import { StartWorkoutSheet } from '@/features/workout/StartSheet';
import { MODE_MIN } from '@/features/workout/session';
import { rel } from './meals';

const WKT = 1110; // planned 6:30 pm

function Tile({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <View style={{ flex: 1, gap: 2, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.07)' }}>
      <Txt style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{k}</Txt>
      <Txt style={{ fontFamily: font.semibold, color: color ?? '#fff' }}>{v}</Txt>
    </View>
  );
}

// Dark card, same layout in every state: Now / late / In progress / Done / Rest day.
export function WorkoutCard() {
  const { d } = useDomain();
  const { openSheet } = useOverlay();
  const st = workoutState(d);
  const cs = coachStore.use();
  const now = useNow(st === 'live', 1000);
  if (st === 'hidden') return null;
  const done = wkDoneInfo(d);
  const elapsed = d.session ? mmss((now - d.session.startAt) / 1000).padStart(5, '0') : '';
  const chip = st === 'done' ? 'Done' : st === 'rest' ? 'Rest' : st === 'live' ? 'In progress' : rel(d, WKT).t;
  const live = st === 'done' || st === 'live';
  const chips = st === 'rest' ? ['Recovery day', 'Next: Pull · Thu 6:30 pm'] : ['6 exercises', d.mode === 1 ? `${d.quick} min` : `~${MODE_MIN(d.mode, d.quick)} min`, '~350 kcal'];
  const did = st === 'done' ? `${fmtT(done.a).hm} – ${fmtT(done.b).full}` : st === 'live' ? `Started · ${elapsed}` : st === 'rest' ? 'A walk counts' : 'Not yet';
  const cta = st === 'todo' ? 'Start workout' : st === 'live' ? 'Resume workout' : null;
  const onCta = () => (st === 'live' ? router.push('/workout') : openSheet(<StartWorkoutSheet />, { label: 'Start options' }));

  return (
    <View accessibilityLabel="Today's workout" style={{ borderRadius: 24, backgroundColor: '#0B0E14', padding: 16, gap: 12, overflow: 'hidden' }}>
      <LinearGradient colors={['#0B0E14', '#0E1B45', '#13327A']} locations={[0, 0.6, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View pointerEvents="none" style={{ position: 'absolute', right: -70, top: -80, width: 220, height: 220, borderRadius: 110, borderWidth: 14, borderColor: 'rgba(255,255,255,0.06)' }} />
      <View pointerEvents="none" style={{ position: 'absolute', right: -30, top: -40, width: 140, height: 140, borderRadius: 70, borderWidth: 10, borderColor: 'rgba(255,255,255,0.05)' }} />
      <Row style={{ justifyContent: 'space-between', gap: 8 }}>
        <Pressy accessibilityRole="button" accessibilityLabel="Coach Vikram. Open your coach" onPress={() => router.push('/coach')} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          {st !== 'rest' && <View><PersonAvatar who="coach" size={26} />{cs.unread && <View accessibilityLabel="Unread reply" style={{ position: 'absolute', right: -1, top: -1, width: 9, height: 9, borderRadius: 5, backgroundColor: '#7CF0C8', borderWidth: 1.5, borderColor: '#0B0E14' }} />}</View>}
          <View style={{ flexShrink: 1 }}>
            <Txt style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>Today's workout</Txt>
            {st !== 'rest' && <Txt style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Planned by Coach Vikram</Txt>}
          </View>
        </Pressy>
        <Chip label={chip} onDark tone={live ? 'live' : 'default'} style={live ? { borderColor: 'rgba(124,240,200,0.5)' } : undefined} />
      </Row>
      <Txt style={{ fontFamily: font.regular, fontSize: 40, letterSpacing: -1.8, lineHeight: 42, color: '#fff' }}>{st === 'rest' ? 'Rest day' : 'Leg day'}</Txt>
      <Row style={{ gap: 6, flexWrap: 'wrap' }}>{chips.map((t) => <Chip key={t} label={t} onDark />)}</Row>
      <Row style={{ gap: 8 }}>
        <Tile k="Planned" v={st === 'rest' ? 'No workout' : '6:30 pm'} />
        <Tile k="You did it" v={did} color={live ? '#7CF0C8' : 'rgba(255,255,255,0.6)'} />
      </Row>
      {cta && (
        <Pressy accessibilityRole="button" onPress={onCta} style={{ height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 15, color: '#0B0E14' }}>{cta}</Txt>
        </Pressy>
      )}
      <Row style={{ gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
        <Flame size={15} color="#fff" />
        <Txt style={{ flex: 1, fontSize: 13, color: '#fff' }}>Burned today <Txt style={{ fontFamily: font.monoBold, fontSize: 13, color: '#fff' }}>{burned(d)}</Txt> kcal</Txt>
        <Txt style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{d.hc ? 'From your watch' : 'Estimate from steps'}</Txt>
      </Row>
    </View>
  );
}
