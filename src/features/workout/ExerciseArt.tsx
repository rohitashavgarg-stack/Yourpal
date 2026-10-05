import React from 'react';
import { Image, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

type P = readonly [number, number];

// Real illustrations, keyed by exercise id. Anything not listed here keeps the drawn figure below.
// h / w: size as a fraction of the requested width (use one); mt / mr: nudge so it clears the "Form video" button.
const PLANK = require('../../../assets/exercises/plank.webp');
const PHOTOS: Record<string, { src: number; ratio: number; h?: number; w?: number; mt?: number; mr?: number }> = {
  sq: { src: require('../../../assets/exercises/squat.webp'), ratio: 1145 / 1374, h: 0.92, mr: 64 },
  lp: { src: require('../../../assets/exercises/leg-press.webp'), ratio: 1470 / 1070, w: 1.06, mt: 34 },
  wl: { src: require('../../../assets/exercises/walking-lunges.webp'), ratio: 1312 / 1199, w: 1.0, mt: 34 },
  lc: { src: require('../../../assets/exercises/leg-curl.webp'), ratio: 1374 / 1145, w: 1.06, mt: 34 },
  fc: { src: require('../../../assets/exercises/farmers-carry.webp'), ratio: 1024 / 1536, h: 0.92, mr: 64 },
  pk: { src: PLANK, ratio: 1942 / 809, w: 1.3, mt: 50 },
  pk2: { src: PLANK, ratio: 1942 / 809, w: 1.3, mt: 50 },
};

// Hand-drawn demo figures (side view) for every exercise, with the working muscles in accent.
// Keyed by the exercise id so a swapped exercise keeps the slot's figure until it has its own.
export const hasPhoto = (id: string) => !!PHOTOS[id];

// Which figure belongs to an exercise name (plan screens only know the name). Unknown names have no figure.
const BY_NAME: Record<string, string> = { squat: 'sq', 'goblet squat': 'sq', 'box squat': 'sq', 'leg press': 'lp', 'walking lunges': 'wl', 'leg curl': 'lc', "farmer's carry": 'fc', 'farmers carry': 'fc', plank: 'pk' };
export const artIdFor = (name: string): string | null => BY_NAME[name.trim().toLowerCase()] ?? null;

// fill: stretch to fill whatever box it is placed in (photo contained, drawing scaled), instead of a fixed width.
export function ExerciseArt({ id, width = 230, fill }: { id: string; width?: number; fill?: boolean }) {
  const { c, isDark } = useTheme();
  const photo = PHOTOS[id];
  if (photo && fill) {
    return <Image source={photo.src} resizeMode="contain" accessibilityLabel="Exercise demonstration" accessibilityIgnoresInvertColors style={{ width: '100%', height: '100%', ...(isDark ? null : ({ mixBlendMode: 'multiply' } as any)) }} />;
  }
  if (photo) {
    // the artwork has a white background: it blends into the light card, and sits on a soft white panel in dark mode
    const w = photo.w ? Math.round(width * photo.w) : Math.round(Math.round(width * (photo.h ?? 0.92)) * photo.ratio);
    const h = Math.round(w / photo.ratio);
    const mr = photo.mr ? photo.mr + (isDark ? 20 : 0) : 0;
    return (
      <View accessibilityLabel="Exercise demonstration" style={{ width: w + (isDark ? 24 : 0), height: h + (isDark ? 16 : 0), borderRadius: 26, marginRight: mr, marginTop: photo.mt ?? 0, backgroundColor: isDark ? '#F4F6FA' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        <Image source={photo.src} resizeMode="contain" accessibilityIgnoresInvertColors style={{ width: w, height: h, ...(isDark ? null : ({ mixBlendMode: 'multiply' } as any)) }} />
      </View>
    );
  }
  const body = isDark ? '#66718A' : '#B5BFCE';
  const gear = isDark ? '#EEF1F6' : '#12151C';
  const floor = isDark ? '#2C323E' : '#E1E6EC';
  const hi = c.accent;

  const L = (a: P, b: P, w: number, col: string, op = 1) => <Line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={col} strokeWidth={w} strokeLinecap="round" opacity={op} />;
  const head = (p: P) => <Circle cx={p[0]} cy={p[1]} r={9.5} fill={body} />;
  const ground = <Line x1={14} y1={136} x2={186} y2={136} stroke={floor} strokeWidth={3} strokeLinecap="round" />;

  let art: React.ReactNode;
  switch (id) {
    case 'lp': { // leg press: reclined, pushing a sled
      const S: P = [46, 92], H: P = [80, 106], K: P = [116, 78], A: P = [148, 62];
      art = <>
        {L([22, 112], [86, 120], 7, floor)}
        {L([150, 36], [162, 104], 11, gear)}
        {head([34, 82])}{L(S, H, 17, body)}{L(H, K, 17, body)}{L(K, A, 13, body)}
        {L(H, K, 17, hi, 0.9)}<Circle cx={H[0]} cy={H[1]} r={10} fill={hi} opacity={0.55} />
      </>; break;
    }
    case 'wl': { // walking lunge
      const S: P = [100, 44], H: P = [100, 80], K1: P = [132, 94], A1: P = [132, 130], K2: P = [78, 112], A2: P = [52, 128];
      art = <>
        {ground}{head([100, 28])}{L(S, H, 17, body)}{L(S, [88, 68], 7, body)}{L(S, [114, 66], 7, body)}
        {L(H, K2, 15, body)}{L(K2, A2, 12, body)}{L(A2, [40, 132], 7, body)}
        {L(H, K1, 17, body)}{L(K1, A1, 13, body)}{L(A1, [150, 132], 7, body)}
        {L(H, K1, 17, hi, 0.9)}<Circle cx={H[0]} cy={H[1] + 2} r={10} fill={hi} opacity={0.55} />
      </>; break;
    }
    case 'lc': { // leg curl: face down, heels curl to the glutes
      const S: P = [46, 88], H: P = [100, 90], K: P = [134, 90], A: P = [142, 52];
      art = <>
        {L([18, 100], [126, 100], 9, floor)}
        {head([32, 82])}{L(S, H, 16, body)}{L(H, K, 16, body)}{L(K, A, 12, body)}{L(A, [154, 46], 7, body)}
        <Circle cx={142} cy={64} r={7} fill={gear} />
        {L(H, K, 16, hi, 0.9)}
      </>; break;
    }
    case 'fc': { // farmer's carry
      const S: P = [100, 46], H: P = [100, 86];
      art = <>
        {ground}{head([100, 30])}{L(S, H, 17, body)}
        {L(H, [93, 110], 15, body)}{L([93, 110], [90, 132], 12, body)}{L(H, [108, 110], 15, body)}{L([108, 110], [114, 132], 12, body)}
        {L(S, [100, 90], 8, body)}
        {L([74, 92], [126, 92], 5, gear)}<Rect x={68} y={82} width={9} height={20} rx={3} fill={gear} /><Rect x={123} y={82} width={9} height={20} rx={3} fill={gear} />
        {L(S, [100, 90], 8, hi, 0.9)}<Circle cx={S[0]} cy={S[1] + 2} r={9} fill={hi} opacity={0.55} />
      </>; break;
    }
    case 'pk': { // plank
      const S: P = [48, 90], H: P = [112, 98], A: P = [176, 124];
      art = <>
        {ground}{head([34, 82])}{L(S, [52, 124], 9, body)}{L(S, H, 17, body)}{L(H, A, 14, body)}
        {L(S, H, 17, hi, 0.9)}
      </>; break;
    }
    default: { // squat (also the fallback)
      const S: P = [98, 46], H: P = [74, 84], K: P = [112, 90], A: P = [102, 130];
      art = <>
        {ground}
        {L([56, 42], [142, 42], 5, gear)}<Rect x={50} y={26} width={9} height={32} rx={3} fill={gear} /><Rect x={139} y={26} width={9} height={32} rx={3} fill={gear} />
        {head([104, 30])}{L(S, H, 17, body)}{L(S, [118, 46], 7, body)}
        {L(H, K, 17, body)}{L(K, A, 13, body)}{L(A, [122, 132], 8, body)}
        {L(H, K, 17, hi, 0.9)}<Circle cx={H[0]} cy={H[1]} r={11} fill={hi} opacity={0.55} />
      </>;
    }
  }
  return <Svg width={fill ? '100%' : width} height={fill ? '100%' : (width * 150) / 200} viewBox="0 0 200 150" accessibilityLabel="Exercise demonstration">{art}</Svg>;
}
