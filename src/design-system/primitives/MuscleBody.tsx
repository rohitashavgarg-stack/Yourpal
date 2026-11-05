import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import { useTheme } from '@/theme/ThemeProvider';

export type MuscleName = 'Chest' | 'Arms' | 'Shoulders' | 'Core' | 'Legs' | 'Back';
export type BodySide = 'front' | 'back';

// The parts of the drawing that make up each group, seen from the front and from the back.
const SLUGS: Record<BodySide, Partial<Record<MuscleName, Slug[]>>> = {
  front: { Chest: ['chest'], Shoulders: ['deltoids'], Arms: ['biceps', 'forearm'], Core: ['abs', 'obliques'], Legs: ['quadriceps', 'adductors', 'tibialis', 'calves', 'knees'] },
  back: { Back: ['trapezius', 'upper-back', 'lower-back'], Shoulders: ['deltoids'], Arms: ['triceps', 'forearm'], Legs: ['gluteal', 'hamstring', 'calves'] },
};

// Every part of the drawing. Each one that is not lit is given the body colour, so the neck, the hands and the head all match.
const ALL: Slug[] = ['abs', 'adductors', 'ankles', 'biceps', 'calves', 'chest', 'deltoids', 'feet', 'forearm', 'gluteal', 'hamstring', 'hands', 'knees', 'lower-back', 'neck', 'obliques', 'quadriceps', 'tibialis', 'trapezius', 'triceps', 'upper-back'];

// A skull shape centred on x, in the 724 by 1448 drawing: wide rounded top, narrower jaw.
const skull = (x: number) => `M${x - 48} 170 C${x - 48} 128 ${x - 28} 104 ${x} 104 C${x + 28} 104 ${x + 48} 128 ${x + 48} 170 C${x + 48} 196 ${x + 38} 214 ${x + 28} 232 C${x + 22} 246 ${x + 12} 254 ${x} 254 C${x - 12} 254 ${x - 22} 246 ${x - 28} 232 C${x - 38} 214 ${x - 48} 196 ${x - 48} 170 Z`;

/** The drawing is 200 by 400 at scale 1. */
export const BODY_W = 200;
export const BODY_H = 400;

/**
 * A plain dark front or back view of the body with the muscle groups you pass lit in the accent blue. `lit` maps a group to how far along it is (0 to 1): a group that is
 * not in it stays dark, one that is part way is lit softer, one that is done is lit fully. The figure is drawn by react-native-body-highlighter.
 */
export function MuscleBody({ side = 'front', lit, width = BODY_W }: { side?: BodySide; lit: Partial<Record<MuscleName, number>>; width?: number }) {
  const { c } = useTheme();
  const data: ExtendedBodyPart[] = ALL.map((slug) => ({ slug, color: c.surface3 }));
  (Object.keys(SLUGS[side]) as MuscleName[]).forEach((m) => {
    const v = lit[m] ?? 0;
    if (v <= 0) return;
    SLUGS[side][m]!.forEach((slug) => data.push({ slug, intensity: v >= 1 ? 2 : 1 }));
  });
  // The package draws a head with ears and a hair line. It is hidden and a plain skull shape is drawn in its place (rounded top, narrower jaw), in the body colour: no nose, mouth or ears.
  const viewBox = side === 'front' ? '0 0 724 1448' : '724 0 724 1448';
  const cx = side === 'front' ? 362 : 1083;
  return (
    <View style={{ width, height: width * 2 }}>
      <Body data={data} side={side} gender="male" scale={width / BODY_W} border="none" defaultFill={c.surface3} hiddenParts={['head', 'hair']} colors={[c.accent + '80', c.accent]} />
      <Svg pointerEvents="none" width={width} height={width * 2} viewBox={viewBox} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Path d={skull(cx)} fill={c.surface3} />
      </Svg>
    </View>
  );
}
