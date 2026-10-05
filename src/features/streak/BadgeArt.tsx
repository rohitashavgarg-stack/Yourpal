import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';
import { Lock } from '@/lib/icons';
import { Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import type { BadgeIcon } from './data';

export type Shape = 'circle' | 'hex' | 'shield' | 'tile';
export type Look = { shape: Shape; a: string; b: string; mark?: string };

// One look per badge: its own shape and colour pair so each one is recognisable on sight.
export const BADGE_LOOK: Record<string, Look> = {
  first: { shape: 'circle', a: '#6FA0FF', b: '#2F6BEA' },
  w4: { shape: 'hex', a: '#FFB347', b: '#F0692C', mark: '4' },
  w12: { shape: 'hex', a: '#FF8A5C', b: '#D6342C', mark: '12' },
  pr1: { shape: 'circle', a: '#FFD966', b: '#E0A100' },
  pr5: { shape: 'circle', a: '#FFC46B', b: '#D9701A', mark: '5' },
  kg1: { shape: 'shield', a: '#5EE0B0', b: '#0F9D74' },
  half: { shape: 'shield', a: '#5CD5E6', b: '#0E8FA0' },
  water: { shape: 'tile', a: '#7CC4FF', b: '#2371C9' },
  steps: { shape: 'tile', a: '#8A9BFF', b: '#3346E8' },
  assess: { shape: 'tile', a: '#FF8FC4', b: '#C2408A' },
};

const HEX = '40,4 71,22 71,58 40,76 9,58 9,22';
const SHIELD = 'M40 4 L68 14 V40 C68 58 56 70 40 77 C24 70 12 58 12 40 V14 Z';

function Outline({ shape, ...p }: { shape: Shape; fill?: string; stroke?: string; strokeWidth?: number; strokeDasharray?: string; opacity?: number }) {
  switch (shape) {
    case 'hex': return <Polygon points={HEX} strokeLinejoin="round" {...p} />;
    case 'shield': return <Path d={SHIELD} strokeLinejoin="round" {...p} />;
    case 'tile': return <Rect x={8} y={8} width={64} height={64} rx={22} {...p} />;
    default: return <Circle cx={40} cy={40} r={34} {...p} />;
  }
}

export function BadgeArt({ id, icon: Icon, earned, size = 84 }: { id: string; icon: React.ComponentType<any>; earned: boolean; size?: number }) {
  const { c, isDark } = useTheme();
  const look = BADGE_LOOK[id] ?? BADGE_LOOK.first;
  const gid = `bg${id}`, cid = `bc${id}`;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={look.a} /><Stop offset="1" stopColor={look.b} />
          </LinearGradient>
          <ClipPath id={cid}><Outline shape={look.shape} /></ClipPath>
        </Defs>
        {earned && look.shape === 'circle' && (
          <>
            <Polygon points="24,60 34,66 28,78 20,70" fill={look.b} opacity={0.85} />
            <Polygon points="56,60 46,66 52,78 60,70" fill={look.b} opacity={0.85} />
          </>
        )}
        {earned ? (
          <>
            <Outline shape={look.shape} fill={`url(#${gid})`} />
            <G clipPath={`url(#${cid})`}><Ellipse cx={26} cy={18} rx={26} ry={13} fill="#fff" opacity={0.22} transform="rotate(-24 26 18)" /></G>
            <Outline shape={look.shape} fill="none" stroke="#fff" strokeWidth={1.6} opacity={0.55} />
          </>
        ) : (
          <>
            <Outline shape={look.shape} fill={isDark ? '#232A36' : '#EEF1F6'} />
            <Outline shape={look.shape} fill="none" stroke={isDark ? '#3A4252' : '#CBD2DE'} strokeWidth={2} strokeDasharray="4 4" />
          </>
        )}
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={size * 0.38} color={earned ? '#fff' : c.muted} strokeWidth={2.2} />
      </View>
      {earned && look.mark ? (
        <View style={{ position: 'absolute', right: size * 0.04, bottom: size * 0.08, minWidth: size * 0.3, height: size * 0.3, paddingHorizontal: 4, borderRadius: size * 0.15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.bold, fontSize: size * 0.18, lineHeight: size * 0.24, color: look.b }}>{look.mark}</Txt>
        </View>
      ) : null}
      {!earned && (
        <View style={{ position: 'absolute', right: 0, bottom: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={12} color={c.muted} />
        </View>
      )}
    </View>
  );
}
