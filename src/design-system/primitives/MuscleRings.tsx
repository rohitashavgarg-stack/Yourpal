import React, { useId } from 'react';
import Svg, { Defs, Path, Text as SvgText, TextPath } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { fontSizes } from '@/design-system/tokens';

export type MuscleGroup = { name: string; done: number; target: number };

const VB = 270;
const C = VB / 2;
const RINGS = [84, 60, 36]; // outer, middle, inner
const GAP = 28; // the gap between two segments, in px along the arc: the same on every ring
const STROKE = 14;

function pt(r: number, a: number) { return [C + r * Math.cos(a), C + r * Math.sin(a)]; }
const f = (n: number) => n.toFixed(1);

/**
 * Concentric rings, one segment of each ring for every muscle group, with the name curved around the outside. A group fills its rings from the inside out, in thirds, as it gets
 * closer to its weekly target (a third of the target lights the inner ring, two thirds the middle one, all of it the outer one). Names at the bottom are turned so
 * they still read left to right.
 */
export function MuscleRings({ groups, size = 260 }: { groups: MuscleGroup[]; size?: number }) {
  const { c } = useTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const n = groups.length;
  const label = groups.map((g) => `${g.name}: ${g.done} of ${g.target} sets`).join('. ');
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} accessibilityLabel={`Muscles trained this week. ${label}`}>
      <Defs>
        {groups.map((g, i) => {
          const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n;
          const a1 = a0 + (2 * Math.PI) / n;
          const low = Math.sin((a0 + a1) / 2) > 0.1;
          const r = low ? 116 : 102;
          const p0 = pt(r, a0), p1 = pt(r, a1);
          const d = low ? `M${f(p1[0])} ${f(p1[1])} A${r} ${r} 0 0 0 ${f(p0[0])} ${f(p0[1])}` : `M${f(p0[0])} ${f(p0[1])} A${r} ${r} 0 0 1 ${f(p1[0])} ${f(p1[1])}`;
          return <Path key={g.name} id={`mr${uid}${i}`} d={d} />;
        })}
      </Defs>
      {groups.map((g, i) => RINGS.map((r, k) => {
        const half = GAP / r / 2;
        const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n + half;
        const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n - half;
        const p0 = pt(r, a0), p1 = pt(r, a1);
        const on = (g.done / g.target) * 3 > RINGS.length - 1 - k; // the rings fill from the inside out
        return <Path key={g.name + k} d={`M${f(p0[0])} ${f(p0[1])} A${r} ${r} 0 0 1 ${f(p1[0])} ${f(p1[1])}`} fill="none" stroke={on ? c.accent : c.surface3} strokeWidth={STROKE} strokeLinecap="round" />;
      }))}
      {groups.map((g, i) => (
        <SvgText key={g.name} fill={c.muted} fontFamily={font.medium} fontSize={fontSizes.xs} letterSpacing={0.5} textAnchor="middle">
          <TextPath href={`#mr${uid}${i}`} startOffset="50%">{g.name}</TextPath>
        </SvgText>
      ))}
    </Svg>
  );
}
