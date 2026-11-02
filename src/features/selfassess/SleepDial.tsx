/* eslint-disable react-hooks/refs -- the touch handlers read the latest times through a ref */
import React, { useMemo, useRef } from 'react';
import { PanResponder, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Moon, Sun } from '@/lib/icons';
import { Row, Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { haptic } from '@/lib/haptics';
import { font } from '@/theme/tokens';
import { fontSizes, radii } from '@/design-system/tokens';
import { fmtClock } from '@/features/plans/TimeSheet';

const SIZE = 296;
const C = SIZE / 2;
const R = 106;
const DAY = 1440;

// 12 am is at the top, the day runs clockwise. m is minutes since midnight.
const angle = (m: number) => (m / DAY) * Math.PI * 2 - Math.PI / 2;
const at = (m: number, r = R) => ({ x: C + r * Math.cos(angle(m)), y: C + r * Math.sin(angle(m)) });
const snap = (x: number, y: number) => { let a = Math.atan2(y - C, x - C) + Math.PI / 2; if (a < 0) a += Math.PI * 2; return (Math.round(((a / (Math.PI * 2)) * DAY) / 5) * 5) % DAY; };
const gap = (a: number, b: number) => { const d = Math.abs(a - b) % DAY; return Math.min(d, DAY - d); };

export const sleepMinutes = (bed: number, wake: number) => ((wake - bed + DAY) % DAY) || DAY;

// The sleep dial from the assessment flow: a clock face for the whole day. Drag the moon to the time you go to bed and the sun to the time you wake up.
// The blue arc between them is the sleep, and the middle says how long it is.
export function SleepDial({ bed, wake, onChange }: { bed: number; wake: number; onChange: (bed: number, wake: number) => void }) {
  const { c } = useTheme();
  const live = useRef({ bed, wake, onChange });
  live.current = { bed, wake, onChange };
  const active = useRef<'bed' | 'wake'>('bed');
  const pan = useMemo(() => {
    const move = (x: number, y: number) => {
      const m = snap(x, y);
      const cur = live.current;
      if (active.current === 'bed' ? m === cur.bed : m === cur.wake) return;
      haptic.tick();
      cur.onChange(active.current === 'bed' ? m : cur.bed, active.current === 'wake' ? m : cur.wake);
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        const m = snap(x, y);
        active.current = gap(m, live.current.bed) <= gap(m, live.current.wake) ? 'bed' : 'wake'; // the nearer one moves
        move(x, y);
      },
      onPanResponderMove: (e) => move(e.nativeEvent.locationX, e.nativeEvent.locationY),
    });
  }, []);

  const dur = sleepMinutes(bed, wake);
  const a = at(bed), b = at(wake);
  const arc = `M ${a.x} ${a.y} A ${R} ${R} 0 ${dur > DAY / 2 ? 1 : 0} 1 ${b.x} ${b.y}`;
  const hours = Math.floor(dur / 60), mins = dur % 60;
  const marks = [{ m: 0, t: '12 am' }, { m: 360, t: '6 am' }, { m: 720, t: '12 pm' }, { m: 1080, t: '6 pm' }];
  return (
    <View style={{ gap: 18, alignItems: 'center' }}>
      <View {...pan.panHandlers} accessibilityLabel={`Sleep dial. Bedtime ${fmtClock(bed)}, wake up ${fmtClock(wake)}`} style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE} pointerEvents="none">
          <Circle cx={C} cy={C} r={R} stroke={c.surface3} strokeWidth={26} fill="none" />
          {Array.from({ length: 24 }, (_, h) => { const p1 = at(h * 60, R - 22), p2 = at(h * 60, R - (h % 6 === 0 ? 32 : 27)); return <Line key={h} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={c.chipLine} strokeWidth={h % 6 === 0 ? 2 : 1} />; })}
          <Path d={arc} stroke={c.accent} strokeWidth={26} strokeLinecap="round" fill="none" />
          <Circle cx={a.x} cy={a.y} r={19} fill={c.accentText} />
          <Circle cx={b.x} cy={b.y} r={19} fill={c.warn} />
        </Svg>
        {/* the icons sit on the two handles */}
        <View pointerEvents="none" style={{ position: 'absolute', left: a.x - 19, top: a.y - 19, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}><Moon size={19} color={c.bg} /></View>
        <View pointerEvents="none" style={{ position: 'absolute', left: b.x - 19, top: b.y - 19, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}><Sun size={19} color={c.bg} /></View>
        {marks.map((k) => { const p = at(k.m, R - 46); return <View key={k.t} pointerEvents="none" style={{ position: 'absolute', left: p.x - 20, top: p.y - 9, width: 40, alignItems: 'center' }}><Txt style={{ fontSize: fontSizes.sm, lineHeight: 18, color: c.muted }}>{k.t}</Txt></View>; })}
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Txt accessibilityLiveRegion="polite" style={{ fontFamily: font.displayBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6 }}>{`${hours}h ${mins}m`}</Txt>
          <Txt muted style={{ fontSize: fontSizes.sm }}>Sleep duration</Txt>
        </View>
      </View>
      <Row style={{ gap: 12, alignSelf: 'stretch' }}>
        {[{ l: 'Bedtime', m: bed, I: Moon, col: c.accentText }, { l: 'Wake up', m: wake, I: Sun, col: c.warn }].map((x) => (
          <View key={x.l} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radii.lg, backgroundColor: c.surface }}>
            <x.I size={22} color={x.col} />
            <View>
              <Txt v="caption" style={{ fontSize: fontSizes.sm }}>{x.l}</Txt>
              <Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.base }}>{fmtClock(x.m)}</Txt>
            </View>
          </View>
        ))}
      </Row>
    </View>
  );
}
