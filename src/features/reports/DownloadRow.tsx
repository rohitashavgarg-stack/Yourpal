import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Download, FileText } from '@/lib/icons';
import { Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';

// The download card inside a three-dots menu: a document icon, what you get, and a download mark.
// `run` makes the file (the card shows "Making your PDF" and the sheet closes when it is done); `onPress` is for a card that opens another step first.
export function DownloadRow({ title = 'Download as PDF', sub, run, onPress }: { title?: string; sub: string; run?: () => Promise<unknown>; onPress?: () => void }) {
  const { c } = useTheme();
  const { closeSheet, toast } = useOverlay();
  const [busy, setBusy] = useState(false);
  const press = async () => {
    if (busy) return;
    haptic.light();
    if (!run) { onPress?.(); return; }
    setBusy(true);
    try { await run(); closeSheet(); } catch { setBusy(false); toast('Could not make the PDF. Try again'); }
  };
  return (
    <Pressy accessibilityRole="button" accessibilityLabel={`${title}. ${sub}`} accessibilityState={{ busy }} onPress={press} scaleTo={0.985}
      style={{ minHeight: 72 }}>
      <Row style={{ flex: 1, gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: radii.md, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={22} color={c.ink} />
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base, lineHeight: 21, color: c.ink }}>{busy ? 'Making your PDF' : title}</Txt>
          <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{sub}</Txt>
        </View>
        {busy ? <ActivityIndicator color={c.ink} /> : <View style={{ width: 36, height: 36, borderRadius: radii.pill, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Download size={18} color={c.ink} /></View>}
      </Row>
    </Pressy>
  );
}
