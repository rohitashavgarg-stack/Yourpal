import React from 'react';
import { View } from 'react-native';
import { useLogsPaused } from '@/lib/logGate';

// A card that can no longer log anything (expired membership) is shown quieter: still readable, no longer inviting a tap.
export function ViewOnly({ children }: { children: React.ReactNode }) {
  const paused = useLogsPaused();
  if (!paused) return <>{children}</>;
  return <View style={{ opacity: 0.72 }}>{children}</View>;
}
