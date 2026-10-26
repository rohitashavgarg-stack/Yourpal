import React from 'react';
import { ThinkingOrb } from 'thinking-orbs';

// The composing orb from the thinking-orbs package (a dotted sash drawn on a 2D canvas). Web only: the package draws on a DOM canvas,
// so phones use AiOrb.native.tsx, a lighter stand-in with the same size.
export function AiOrb({ size = 64, dark, paused }: { size?: 20 | 64; dark: boolean; paused?: boolean }) {
  return <ThinkingOrb state="composing" size={size} theme={dark ? 'dark' : 'light'} paused={paused} />;
}
