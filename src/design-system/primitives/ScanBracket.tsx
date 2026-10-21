import React from 'react';
import { View } from 'react-native';
import { fixed } from '@/design-system/tokens';

export type ScanBracketProps = {
  /** Which corner of the viewfinder. */
  pos: 'tl' | 'tr' | 'bl' | 'br';
  /** large: the full-page scanner (34 px, 22 from the edge). small: the scan sheet (30 px, 20 from the edge). */
  size?: 'large' | 'small';
};

const SPEC = { large: { box: 34, inset: 22 }, small: { box: 30, inset: 20 } } as const;

/** One white corner of the plate-photo viewfinder. Draw four of them. */
export function ScanBracket({ pos, size = 'small' }: ScanBracketProps) {
  const t = pos[0] === 't', l = pos[1] === 'l';
  const { box, inset } = SPEC[size];
  return <View style={{ position: 'absolute', width: box, height: box, borderColor: fixed.white, opacity: 0.9, [t ? 'top' : 'bottom']: inset, [l ? 'left' : 'right']: inset,
    borderTopWidth: t ? 3 : 0, borderBottomWidth: t ? 0 : 3, borderLeftWidth: l ? 3 : 0, borderRightWidth: l ? 0 : 3,
    [`border${t ? 'Top' : 'Bottom'}${l ? 'Left' : 'Right'}Radius`]: 12 }} />;
}
