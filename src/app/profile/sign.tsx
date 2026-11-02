import React, { useMemo, useState } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { Button, Row, Txt } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { goBack, SubPage } from '@/features/shell/parts';
import { radii, fontSizes } from '@/design-system/tokens';

type Pt = { x: number; y: number };
const PAD_H = 280;

// The sign pad: draw your signature with a finger. Done saves it and the waiver shows as signed.
export default function SignPad() {
  const { c } = useTheme();
  const { setProfile } = useStore();
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const [w, setW] = useState(0);
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => { const { locationX: x, locationY: y } = e.nativeEvent; setStrokes((s) => [...s, [{ x, y }]]); },
    onPanResponderMove: (e) => {
      const { locationX: x, locationY: y } = e.nativeEvent;
      setStrokes((s) => { const n = s.slice(); n[n.length - 1] = [...n[n.length - 1], { x, y }]; return n; });
    },
  }), []);
  const f = (n: number) => n.toFixed(1);
  const d = strokes.map((st) => (st.length === 1 ? `M${f(st[0].x)} ${f(st[0].y)} l0.1 0` : 'M' + st.map((p) => `${f(p.x)} ${f(p.y)}`).join(' L'))).join(' ');
  const drawn = strokes.reduce((n, st) => n + st.length, 0) >= 12;
  const done = () => {
    if (!drawn) return;
    setProfile({ waiver: { signedAt: new Date().toISOString(), path: d, w, h: PAD_H } });
    haptic.success();
    goBack('/profile/waiver');
  };
  return (
    <SubPage title="Sign here" variant="progress" scroll={false} fallback="/profile/waiver" footer={
      <Row style={{ gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 }}>
        <Button kind="secondary" label="Clear" disabled={!strokes.length} onPress={() => { setStrokes([]); haptic.light(); }} style={{ flex: 1 }} />
        <Button kind="accent" label="Done" disabled={!drawn} onPress={done} style={{ flex: 2 }} />
      </Row>
    }>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        <View {...pan.panHandlers} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))} accessibilityLabel="Signature pad. Draw your signature with your finger."
          style={{ height: PAD_H, borderRadius: radii.lg, backgroundColor: c.surface, overflow: 'hidden' }}>
          <Svg width="100%" height={PAD_H} pointerEvents="none">
            <Line x1={20} y1={PAD_H - 56} x2={Math.max(w - 20, 20)} y2={PAD_H - 56} stroke={c.chipLine} strokeWidth={1.5} strokeDasharray="4 4" />
            <Path d={d} stroke={c.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
          {!strokes.length && (
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 56, alignItems: 'center', justifyContent: 'center' }}>
              <Txt muted style={{ fontSize: fontSizes.md }}>Sign here with your finger</Txt>
            </View>
          )}
        </View>
      </View>
    </SubPage>
  );
}
