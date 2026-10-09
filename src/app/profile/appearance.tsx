import React from 'react';
import { Row } from '@/components/ui';
import { useStore } from '@/lib/store';
import { haptic } from '@/lib/haptics';
import { Note, SubPage } from '@/features/shell/parts';
import { ThemeTile } from '@/features/shell/ThemeTile';

export default function Appearance() {
  const { state, setSc } = useStore();
  return (
    <SubPage title="Appearance" fallback="/profile">
      <Row style={{ gap: 10, alignItems: 'flex-start' }}>
        {(['Light', 'Dark', 'System'] as const).map((m) => <ThemeTile key={m} mode={m} on={state.sc.theme === m} onPress={() => { haptic.tap(); setSc({ theme: m }); }} />)}
      </Row>
      <Note>System follows your phone's light or dark setting.</Note>
    </SubPage>
  );
}
