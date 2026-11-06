import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Activity, ClipboardCheck, ClipboardList, Droplet, Droplets, Dumbbell, Footprints, Gauge, Heart, HeartPulse, Medal, Moon, Percent, PersonStanding, Ruler, Scale, ShieldCheck, Wind, Zap } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
import { PersonAvatar } from '@/components/Brand';
import { TopGlow } from '@/design-system/primitives/TopGlow';
import { IconBadge } from '@/design-system/primitives/IconBadge';
import { CardEdge } from '@/design-system/primitives/CardEdge';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { SubPage } from '@/features/progress/parts';
import { radii, fontSizes } from '@/design-system/tokens';
import { Chip } from '@/design-system/primitives/Chip';
import { SectionLabel } from '@/design-system/primitives/SectionLabel';
import { NUMS, NumKey, compare, fmtAt, habitLabel, useAssessments } from '@/features/gym/assessmentData';

// The groups the measurements are shown in, each with its own icon. The heading sits above its card, not inside it.
const GROUPS: { g: string; short: string; Icon: typeof PersonStanding; keys: NumKey[] }[] = [
  { g: 'Body', short: 'Body', Icon: PersonStanding, keys: ['height', 'weight', 'fat', 'chest', 'waist', 'hip', 'arms', 'legs', 'calves'] },
  { g: 'Strength and fitness', short: 'Strength', Icon: Dumbbell, keys: ['bench', 'legpress', 'breath'] },
  { g: 'Health', short: 'Health', Icon: Heart, keys: ['sleep', 'sys', 'dia', 'pulse', 'sugar'] },
];
const KEY_STATS: NumKey[] = ['weight', 'waist', 'pulse']; // the three numbers shown big at the top

// One icon for each measurement, shown in a small tile at the start of its row.
const NUM_ICON: Record<NumKey, typeof Ruler> = {
  height: Ruler, weight: Scale, fat: Percent, chest: PersonStanding, waist: Ruler, hip: Ruler, arms: Dumbbell, legs: Footprints, calves: Footprints,
  bench: Dumbbell, legpress: Zap, breath: Wind, sleep: Moon, sys: Gauge, dia: Gauge, pulse: HeartPulse, sugar: Droplet,
};

// The trainer's notes: each one has its own icon.
const HABIT_ICON: Record<string, typeof Activity> = { activity: Activity, freq: Dumbbell, water: Droplets, level: Medal, flex: PersonStanding, injuries: ShieldCheck };

const HABIT_TONE = (k: string, c: ReturnType<typeof useTheme>['c']) => ({ activity: c.cAct, freq: c.cAct, water: c.cWater, level: c.accent, flex: c.cSleep, injuries: c.cHeart } as Record<string, string>)[k] ?? c.accent;

// A change since the assessment before: green when it is better, quiet grey when it is the same or not better. Never red.
function Change({ diff, good }: { diff: number; good: boolean }) {
  const { c } = useTheme();
  return <Tag label={diff === 0 ? 'Same' : `${diff > 0 ? '+' : '−'}${Math.abs(diff)}`} bg={good ? c.goodSoft : c.surface2} fg={good ? c.good : c.muted} style={{ minWidth: 56, alignItems: 'center' }} />;
}

// The summary: no box around it. The key numbers, the graph and the legend sit straight on the page.
function SummaryCard({ children }: { children: React.ReactNode }) {
  return <View style={{ alignSelf: 'stretch', paddingVertical: 12, alignItems: 'center', gap: 16 }}>{children}</View>;
}

// The graph in the card: a row of tall capsules, one for each measurement, with a wider gap between the groups. First assessment: each capsule has the colour of its
// group. Later ones: a capsule is filled when that measurement improved, and left dark when it did not.
type Seg = { color: string; start: boolean }; // start: the first capsule of a group (it gets the wider gap before it)
function CapsuleBar({ segs, empty }: { segs: Seg[]; empty: string }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', alignSelf: 'stretch', height: 28 }}>
      {segs.map((g, i) => (
        <View key={i} style={{ flex: 1, marginLeft: i === 0 ? 0 : g.start ? 10 : 3, borderRadius: radii.pill, backgroundColor: g.color || empty }} />
      ))}
    </View>
  );
}

// One finished assessment, view only: the trainer recorded it. The heading and two pills (the date and the coach), a card with the key numbers and a graph,
// the measurements in three groups (each with an icon in front of every row), then what the trainer noted.
export default function Assessment() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries } = useAssessments();
  const i = Math.max(0, entries.findIndex((e) => e.id === id));
  const entry = entries[i];
  const prev = entries[i + 1];
  const n = entries.length - i;
  const rows = compare(entry, prev);
  const judged = rows.filter((r) => r.prev != null && r.n.dir !== 'none');
  const better = judged.filter((r) => r.good).length;
  const compared = rows.some((r) => r.prev != null); // the change column only exists when there is an assessment before this one
  const habits = Object.entries(entry.answers).filter(([k, v]) => v && habitLabel[k]);
  const keyRows = KEY_STATS.map((k) => rows.find((r) => r.k === k)).filter((r): r is (typeof rows)[number] => !!r);
  const tone = [c.cNutri, c.cAct, c.cHeart]; // the colour of each group: the same ones the app uses for body, activity and health
  const counts = GROUPS.map((grp) => rows.filter((r) => grp.keys.includes(r.k)).length);
  // one capsule for each measurement, group by group (a first assessment: every one; later: only the ones that can be judged better or worse)
  const capsules: Seg[] = GROUPS.flatMap((grp, k) => rows
    .filter((r) => grp.keys.includes(r.k) && (judged.length === 0 || (r.prev != null && r.n.dir !== 'none')))
    .map((r, j) => ({ color: judged.length === 0 ? tone[k] : r.good ? c.good : '', start: j === 0 })));
  return (
    // No text in the header bar: the heading and the pills sit below it, centred.
    <SubPage title="" fallback="/gym/assessments" backdrop={<TopGlow color={c.good} />}>
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 12 }}>
        <IconBadge size={64} radius={radii.xl} bg={c.goodSoft}><ClipboardCheck size={32} strokeWidth={1.9} color={c.good} /></IconBadge>
        <Txt accessibilityRole="header" v="title" style={{ textAlign: 'center' }}>{`Assessment ${n}`}</Txt>
        <Row style={{ gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip filled outlined size="lg" label={fmtAt(entry.at)} />
          <Chip filled outlined size="lg" label="Coach Vikram" icon={<PersonAvatar who="coach" size={20} />} />
        </Row>
        <SummaryCard>
          {/* the key numbers, big, with the change since the assessment before */}
          {keyRows.length > 0 && (
            <Row style={{ alignItems: 'flex-start', alignSelf: 'stretch' }}>
              {keyRows.map((r) => (
                <View key={r.k} accessible accessibilityLabel={`${r.n.label} ${r.now} ${r.n.unit}`} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl6, lineHeight: 52, letterSpacing: -1.4 }}>{String(r.now)}<Txt style={{ fontFamily: font.display, fontSize: fontSizes.base, color: c.muted }}>{` ${r.n.unit}`}</Txt></Txt>
                  <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{r.n.label}</Txt>
                  {r.prev != null ? <Change diff={r.diff} good={r.good} /> : null}
                </View>
              ))}
            </Row>
          )}
          <CapsuleBar empty={c.surface3} segs={capsules} />
          {judged.length > 0 ? (
            <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{`${better} of ${judged.length} improved since the last one`}</Txt>
          ) : (
            <Row style={{ gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {GROUPS.map((grp, k) => counts[k] > 0 && (
                <Row key={grp.g} style={{ gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: radii.pill, backgroundColor: tone[k] }} />
                  <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{`${grp.short} ${counts[k]}`}</Txt>
                </Row>
              ))}
            </Row>
          )}
        </SummaryCard>
      </View>

      {GROUPS.map((grp) => {
        const list = rows.filter((r) => grp.keys.includes(r.k));
        if (!list.length) return null;
        return (
          <View key={grp.g} style={{ gap: 10, marginTop: 14 }}>
            <SectionLabel variant="section" icon={<grp.Icon size={20} color={c.ink} />}>{grp.g}</SectionLabel>
            <View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, paddingHorizontal: 14, paddingVertical: 6 }}>
              <CardEdge radius={radii.xl} />
              {list.map((r) => {
                const I = NUM_ICON[r.k];
                return (
                  <Row key={r.k} style={{ minHeight: 60, gap: 12, alignItems: 'center' }}>
                    <View style={{ width: 38, height: 38, borderRadius: radii.md, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><CardEdge radius={radii.md} /><I size={19} strokeWidth={1.9} color={c.ink} /></View>
                    <Txt style={{ flex: 1, fontFamily: font.medium }}>{r.n.label}</Txt>
                    {/* the number with its unit, right aligned, then (only when there is an assessment before) the change in a column of its own */}
                    <Row style={{ gap: 5, alignItems: 'baseline', justifyContent: 'flex-end' }}>
                      <Txt v="mono">{r.prev != null ? `${r.prev} → ${r.now}` : String(r.now)}</Txt>
                      <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{NUMS[r.k].unit}</Txt>
                    </Row>
                    {compared && <View style={{ width: 60, alignItems: 'flex-end' }}>{r.prev != null && <Change diff={r.diff} good={r.good} />}</View>}
                  </Row>
                );
              })}
            </View>
          </View>
        );
      })}

      {habits.length > 0 && (
        <View style={{ gap: 10, marginTop: 14 }}>
          <SectionLabel variant="section" icon={<ClipboardList size={20} color={c.ink} />}>Noted by your trainer</SectionLabel>
          <View style={{ backgroundColor: c.cardLift, borderRadius: radii.xl, padding: 16 }}>
            <CardEdge radius={radii.xl} />
            <Row style={{ gap: 8, flexWrap: 'wrap' }}>
              {habits.map(([k, v]) => {
                const I = HABIT_ICON[k] ?? ClipboardList;
                return <Chip key={k} filled outlined edge size="lg" label={`${habitLabel[k]}: ${v}`} icon={<I size={18} color={HABIT_TONE(k, c)} />} />;
              })}
            </Row>
          </View>
        </View>
      )}
      <View style={{ height: 80 }} />
    </SubPage>
  );
}
