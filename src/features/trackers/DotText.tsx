import React from 'react';
import Svg, { Rect } from 'react-native-svg';

// 5 × 7 dot-matrix glyphs: rounded squares, lit or dim, like a small LED display.
const G: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '.': ['0', '0', '0', '0', '0', '0', '1'],
  ',': ['0', '0', '0', '0', '0', '1', '1'],
  ':': ['0', '1', '0', '0', '0', '1', '0'],
  h: ['10000', '10000', '10110', '11001', '10001', '10001', '10001'],
  m: ['00000', '00000', '11010', '10101', '10101', '10101', '10101'],
  ' ': ['00', '00', '00', '00', '00', '00', '00'],
};

// The text is sized to fit maxW: dots shrink for longer numbers.
export function DotText({ text, maxW, on = '#fff', off = 'rgba(255,255,255,0.1)', maxDot = 8 }: { text: string; maxW: number; on?: string; off?: string; maxDot?: number }) {
  const chars = [...text].map((ch) => G[ch] ?? G[' ']);
  const cols = chars.reduce((a, g) => a + g[0].length + 1, 0) - 1;
  const d = Math.min(maxDot, maxW / (cols * 1.34 - 0.34));
  const gap = d * 0.34;
  const step = d + gap;
  const W = cols * step - gap, H = 7 * step - gap;
  let x = 0;
  const rects: React.ReactElement[] = [];
  chars.forEach((g, ci) => {
    const w = g[0].length;
    for (let r = 0; r < 7; r++) for (let c = 0; c < w; c++) {
      rects.push(<Rect key={`${ci}-${r}-${c}`} x={(x + c) * step} y={r * step} width={d} height={d} rx={d * 0.28} fill={g[r][c] === '1' ? on : off} />);
    }
    x += w + 1;
  });
  return <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>{rects}</Svg>;
}
