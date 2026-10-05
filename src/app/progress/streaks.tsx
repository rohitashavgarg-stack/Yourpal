import React from 'react';
import { View } from 'react-native';
import { Award, ClipboardCheck, Droplets, Dumbbell, Flame, Footprints, Medal, Scale, Target, Trophy } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { cardShadow, CornerGlow, GrowBar, SubPage } from '@/features/progress/parts';
import { BADGE_LOOK, BadgeArt } from '@/features/streak/BadgeArt';
import { goalV2Store } from '@/features/goalv2/model';
import { BADGES, Badge, BadgeIcon, streakStore, StreakMode } from '@/features/streak/data';
import { useStreak } from '@/features/streak/useStreak';
import { StreakHero } from '@/features/streak/StreakHero';
import { FLAME } from '@/features/streak/StreakChip';

const ICONS: Record<BadgeIcon, any> = { dumbbell: Dumbbell, flame: Flame, trophy: Trophy, award: Award, medal: Medal, scale: Scale, target: Target, droplets: Droplets, footprints: Footprints, clipboard: ClipboardCheck };

function Label({ children }: { children: string }) {
  const { c } = useTheme();
  return <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.3, color: c.muted, paddingHorizontal: 4 }}>{children}</Txt>;
}

function BadgeCard({ b, weeks }: { b: Badge; weeks: number }) {
  const { c, isDark } = useTheme();
  const Icon = ICONS[b.icon];
  // the streak badges follow the live streak
  const have = b.id === 'w12' ? weeks : b.have;
  const earned = !!b.earned;
  return (
    <View accessible accessibilityLabel={earned ? `${b.title}, earned ${b.earned}` : `${b.title}, locked. ${b.hint}${b.need ? `. ${have} of ${b.need}` : ''}`}
      style={[{ width: '48%', backgroundColor: c.surface, borderRadius: 24, paddingHorizontal: 12, paddingVertical: 16, gap: 10, minHeight: 200, alignItems: 'center', overflow: 'hidden' }, cardShadow(isDark)]}>
      {earned && <CornerGlow color={BADGE_LOOK[b.id].b} size={240} />}
      <BadgeArt id={b.id} icon={Icon} earned={earned} />
      <View style={{ gap: 2, alignItems: 'center' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, textAlign: 'center', color: earned ? c.ink : c.muted }}>{b.title}</Txt>
        <Txt v="caption" style={{ fontSize: 12, textAlign: 'center' }}>{earned ? `Earned ${b.earned}` : b.hint}</Txt>
      </View>
      {!earned && b.need ? (
        <View style={{ marginTop: 'auto', gap: 4, alignSelf: 'stretch' }}>
          <GrowBar pct={Math.min(100, Math.round(((have ?? 0) / b.need) * 100))} color={BADGE_LOOK[b.id].b} />
          <Txt v="caption" style={{ fontSize: 12, textAlign: 'center' }}>{have} of {b.need}</Txt>
        </View>
      ) : null}
    </View>
  );
}

export default function Streaks() {
  const { c, isDark } = useTheme();
  const { d } = useDomain();
  const st = useStreak();
  const es = streakStore.use();
  const v2 = goalV2Store.use().version === 'Version 2';

  useScenarios({
    title: 'Streaks & badges',
    rows: [
      { label: 'Streak', options: ['Active', 'Broken', 'New member'], value: es.mode, onPick: (v) => streakStore.set({ mode: v as StreakMode }) },
      { label: 'Earlier this week', options: ['0', '1', '2', '3'], value: String(es.earlier), onPick: (v) => streakStore.set({ earlier: Number(v) }) },
    ],
  }, [es.mode, es.earlier, d.wkScenario]);

  const cells = [...st.past.slice(-11), null] as (boolean | null)[]; // null = this week
  const pad = 12 - cells.length;

  return (
    <SubPage title="Streaks & badges" fallback="/progress">
      <StreakHero />

      <Label>LAST 12 WEEKS</Label>
      <View style={[{ backgroundColor: c.surface, borderRadius: 24, padding: 16, gap: 10 }, cardShadow(isDark)]}>
        <Row style={{ gap: 6 }}>
          {Array.from({ length: pad }, (_, i) => <View key={`p${i}`} style={{ flex: 1, height: 28, borderRadius: 8, backgroundColor: c.surface2 }} />)}
          {cells.map((k, i) => (
            <View key={i} style={{ flex: 1, height: 28, borderRadius: 8, backgroundColor: k === null ? (st.kept ? FLAME : 'transparent') : k ? FLAME : c.surface3, borderWidth: k === null && !st.kept ? 2 : 0, borderColor: FLAME }} />
          ))}
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt v="caption">12 weeks ago</Txt>
          <Txt v="caption">This week</Txt>
        </Row>
      </View>

      <View style={{ padding: 14, borderRadius: 20, backgroundColor: c.accentSoft, gap: 2 }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 14, lineHeight: 20, color: c.accentText }}>1 rest pass a month</Txt>
        <Txt style={{ fontSize: 13, lineHeight: 19, color: c.accentText, opacity: 0.85 }}>If you miss a week, a rest pass keeps your streak. It is used for you automatically. A membership pause also freezes your streak.</Txt>
      </View>

      {!v2 && (
        <>
          <Label>{`BADGES · ${BADGES.filter((b) => b.earned).length} OF ${BADGES.length} EARNED`}</Label>
          <Row style={{ flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
            {BADGES.map((b) => <BadgeCard key={b.id} b={b} weeks={st.weeks} />)}
          </Row>
          <Txt v="caption" style={{ textAlign: 'center' }}>More badges will unlock as you train</Txt>
        </>
      )}
    </SubPage>
  );
}
