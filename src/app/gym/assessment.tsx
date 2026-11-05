import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, ClipboardList, Droplets, Dumbbell, Heart, Medal, PersonStanding, ShieldCheck } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { Tag } from '@/components/bits';
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

// The trainer's notes: each one has its own icon (all in the same colour).
const HABIT_ICON: Record<string, typeof Activity> = { activity: Activity, freq: Dumbbell, water: Droplets, level: Medal, flex: PersonStanding, injuries: ShieldCheck };

// A gradient card with a gradient green stroke: the stroke is a gradient of its own (bright green at the top left, fading out towards the bottom right),
// and the card is filled with a green tint that fades into the card colour.
function GradientCard({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  const stroke = 1.5;
  return (
    <LinearGradient colors={[c.cNutri, c.cNutri + '14']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ alignSelf: 'stretch', borderRadius: radii.xl, padding: stroke }}>
      <LinearGradient colors={[c.cNutri + '38', c.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: radii.xl - stroke, paddingVertical: 22, paddingHorizontal: 16, alignItems: 'center', gap: 12 }}>
        {children}
      </LinearGradient>
    </LinearGradient>
  );
}

// The graph at the top: a row of tall capsules, one for each measurement, with a wider gap between the groups. First assessment: each capsule has the colour of its
// group. Later ones: a capsule is filled when that measurement improved, and left dark when it did not.
type Seg = { color: string; start: boolean }; // start: the first capsule of a group (it gets the wider gap before it)
function CapsuleBar({ segs, empty }: { segs: Seg[]; empty: string }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', alignSelf: 'stretch', height: 52, paddingHorizontal: 4 }}>
      {segs.map((g, i) => (
        <View key={i} style={{ flex: 1, marginLeft: i === 0 ? 0 : g.start ? 12 : 4, borderRadius: radii.md, backgroundColor: g.color || empty }} />
      ))}
    </View>
  );
}

// One finished assessment, view only: the trainer recorded it. A capsule graph first, then the heading and date, the key numbers, the measurements
// in three groups (each with its heading and icon above its card), then what the trainer noted about the member.
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
    // No text in the header bar: the heading and the card sit below it, centred.
    <SubPage title="" fallback="/gym/assessments">
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 12 }}>
        <Txt accessibilityRole="header" v="title" style={{ textAlign: 'center', marginTop: 0 }}>{`Assessment ${n}`}</Txt>
        <View style={{ alignSelf: 'center' }}><Chip label={fmtAt(entry.at)} /></View>
        <GradientCard>
        {/* the number and what it counts, then the capsules, then what each colour is */}
        <Txt style={{ fontFamily: font.displayBold, fontSize: fontSizes.xl6, lineHeight: 48, letterSpacing: -1.2 }}>{judged.length > 0 ? `${better} of ${judged.length}` : String(rows.length)}</Txt>
        <Txt v="caption" style={{ fontSize: fontSizes.sm, marginTop: -8 }}>{judged.length > 0 ? 'improved' : 'measurements'}</Txt>
        {/* the key numbers, big, with the change since the assessment before */}
        {keyRows.length > 0 && (
          <Row style={{ alignItems: 'flex-start', alignSelf: 'stretch', paddingTop: 10 }}>
            {keyRows.map((r) => (
              <View key={r.k} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                <Txt style={{ fontFamily: font.display, fontSize: fontSizes.xl4, lineHeight: 36, letterSpacing: -0.8 }}>{String(r.now)}<Txt style={{ fontFamily: font.display, fontSize: fontSizes.md, color: c.muted }}>{` ${r.n.unit}`}</Txt></Txt>
                <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{r.n.label}</Txt>
                {r.prev != null && <Tag label={r.diff === 0 ? 'Same' : `${r.diff > 0 ? '+' : '−'}${Math.abs(r.diff)}`} bg={r.good ? c.goodSoft : c.surface2} fg={r.good ? c.good : c.muted} style={{ marginTop: 4 }} />}
              </View>
            ))}
          </Row>
        )}
        <CapsuleBar empty={c.surface2} segs={capsules} />
        {judged.length === 0 && (
          <Row style={{ gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {GROUPS.map((grp, k) => counts[k] > 0 && (
              <Row key={grp.g} style={{ gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: radii.pill, backgroundColor: tone[k] }} />
                <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{`${grp.short} ${counts[k]}`}</Txt>
              </Row>
            ))}
          </Row>
        )}
        </GradientCard>
      </View>

      {GROUPS.map((grp) => {
        const list = rows.filter((r) => grp.keys.includes(r.k));
        if (!list.length) return null;
        const unitW = Math.max(...list.map((r) => NUMS[r.k].unit.length)) * 8 + 2; // as wide as the longest unit in this card, so the right edge is as tight as the left
        return (
          <View key={grp.g} style={{ gap: 10, marginTop: 14 }}>
            <SectionLabel variant="section" icon={<grp.Icon size={20} color={c.ink} />}>{grp.g}</SectionLabel>
            <View style={{ backgroundColor: c.surface, borderRadius: radii.xl, paddingHorizontal: 18 }}>
              {list.map((r, k) => (
                <Row key={r.k} style={{ minHeight: 56, gap: 8, alignItems: 'center', borderBottomWidth: k < list.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                  <Txt style={{ flex: 1, fontFamily: font.medium }} numberOfLines={1}>{r.n.label}</Txt>
                  {/* the number, its unit and (only when there is an earlier assessment) the change each have a column of their own */}
                  <View style={{ width: compared ? 96 : 56, alignItems: 'flex-end' }}><Txt v="mono" numberOfLines={1}>{r.prev != null ? `${r.prev} → ${r.now}` : String(r.now)}</Txt></View>
                  <View style={{ width: unitW }}><Txt v="caption" numberOfLines={1} style={{ fontSize: fontSizes.sm }}>{NUMS[r.k].unit}</Txt></View>
                  {compared && (
                    <View style={{ width: 62, alignItems: 'flex-end' }}>
                      {r.prev != null && <Tag label={r.diff === 0 ? 'Same' : `${r.diff > 0 ? '+' : '−'}${Math.abs(r.diff)}`} bg={r.good ? c.goodSoft : c.surface2} fg={r.good ? c.good : c.muted} style={{ minWidth: 58, alignItems: 'center' }} />}
                    </View>
                  )}
                </Row>
              ))}
            </View>
          </View>
        );
      })}

      {habits.length > 0 && (
        // One card: the heading inside it, the notes as filled chips with an icon (all the same colour), a coloured stroke and a soft glow from the top.
        <View style={{ marginTop: 14, borderRadius: radii.xl, borderWidth: 1, borderColor: c.cNutri + '55', backgroundColor: c.surface, overflow: 'hidden' }}>
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150 }}>
            <Svg width="100%" height="100%">
              <Defs>
                <RadialGradient id="notesGlow" cx="30%" cy="0%" r="90%">
                  <Stop offset="0" stopColor={c.cNutri} stopOpacity="0.26" />
                  <Stop offset="1" stopColor={c.cNutri} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#notesGlow)" />
            </Svg>
          </View>
          <View style={{ padding: 16, gap: 14 }}>
            <Row style={{ gap: 10 }}>
              <ClipboardList size={20} color={c.ink} />
              <Txt accessibilityRole="header" style={{ fontFamily: font.semibold, fontSize: fontSizes.lg, lineHeight: 25, letterSpacing: -0.2 }}>Noted by your trainer</Txt>
            </Row>
            <Row style={{ gap: 8, flexWrap: 'wrap' }}>
              {habits.map(([k, v]) => {
                const I = HABIT_ICON[k] ?? ClipboardList;
                return <Chip key={k} filled size="lg" label={`${habitLabel[k]}: ${v}`} icon={<I size={18} color={c.cNutri} />} />;
              })}
            </Row>
          </View>
        </View>
      )}
      <View style={{ height: 80 }} />
    </SubPage>
  );
}
