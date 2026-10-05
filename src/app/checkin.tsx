import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { router } from 'expo-router';
import { Crosshair, LocateOff, MapPin, RefreshCw, X } from '@/lib/icons';
import { Button, Chip, Row, Txt } from '@/components/ui';
import { RoundBtn } from '@/components/bits';
import { useOverlay, useToastLift } from '@/components/Overlay';
import { CheckInScenario, nowMin, useDomain } from '@/lib/domain';
import { useCheckIn, useCheckInPanel } from '@/features/checkin/useCheckIn';
import { elapsedMin, isIn, LIMIT_MIN } from '@/features/checkin/logic';
import { useNow } from '@/lib/useNow';
import { fmtT } from '@/lib/data';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { GlassBackdrop } from '@/components/Glass';
import { GymMap, hasRealMap } from '@/features/checkin/GymMap';


// Manual check-in only, only inside the 20 m area. Location is read while this page is open.
export default function CheckIn() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  useToastLift(insets.bottom + 340);
  const CI = useCheckIn();
  const ciActions = useCheckInPanel();
  const checkedIn = isIn(d);
  const now = useNow(checkedIn, 15000);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);

  useScenarios({
    title: 'Check-in map',
    rows: [{ label: 'Check-in (location)', options: ['Away', 'Near (25 m)', 'At the gym', 'Location off'], value: d.ci, onPick: (v) => CI.pickCi(v as CheckInScenario) }],
    actions: [{ label: 'Refresh location', run: () => refresh() }, ...ciActions],
  }, [d.ci, d.ciStart, d.ciOut, d.ciExtend]);

  const off = d.ci === 'Location off';
  const inside = d.ci === 'At the gym' || checkedIn || !!d.ciOut;
  const far = d.ci === 'Away';
  const ux = inside ? 186 : far ? 300 : 236, uy = inside ? 138 : far ? 250 : 196;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const refresh = () => { setRefreshing(true); clearTimeout(t.current); t.current = setTimeout(() => setRefreshing(false), 900); };
  const checkIn = () => {
    if (!inside) return;
    setBusy(true); haptic.medium();
    t.current = setTimeout(() => {
      const at = nowMin(d);
      CI.checkIn(); haptic.success(); close();
      toast(`Checked in ${fmtT(at).full} · counted in your attendance`);
    }, 700);
  };

  const mins = Math.floor(elapsedMin(d, now));
  const status = checkedIn ? { t: `Checked in ${fmtT(d.ciAt ?? nowMin(d)).full}`, s: mins >= LIMIT_MIN + d.ciExtend ? `${mins} min so far · checking you out soon` : `${mins} min so far · we check you out automatically after ${LIMIT_MIN + d.ciExtend} min`, bg: c.goodSoft, fg: c.good }
    : d.ciOut ? { t: `Checked out ${fmtT(d.ciOut.at).full}`, s: `${d.ciOut.mins} min at the gym${d.ciOut.auto === 'time' ? ' · automatic' : d.ciOut.auto === 'left' ? ' · you left the gym' : ''}`, bg: c.surface2, fg: c.ink }
    : off ? { t: 'Location is off', s: 'Turn it on to check in. The front desk can also mark your visit.', bg: c.warnSoft, fg: c.warn }
    : refreshing ? { t: 'Finding you…', s: 'Hold on a second', bg: c.surface2, fg: c.ink }
    : inside ? { t: "You're inside the check-in area", s: '8 m from the entrance', bg: c.goodSoft, fg: c.good }
    : far ? { t: "You're 140 m from Wulf Fitness", s: 'Check-in opens when you are within 20 m.', bg: c.warnSoft, fg: c.warn }
    : { t: "You're 25 m from Wulf Fitness", s: 'Walk a little closer. Check-in opens within 20 m.', bg: c.warnSoft, fg: c.warn };

  return (
    <View style={{ flex: 1, backgroundColor: c.mapBg }} accessibilityLabel="Check in map">
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 250 }} importantForAccessibility={hasRealMap ? 'yes' : 'no-hide-descendants'}>
        {hasRealMap ? <GymMap where={inside ? 'inside' : far ? 'far' : 'near'} off={off} /> : <Svg width="100%" height="100%" viewBox="0 -70 358 390" preserveAspectRatio="xMidYMid slice">
          <G fill={c.mapBlock}>
            {[[-10, -80, 120, 68], [130, -80, 96, 68], [246, -80, 130, 68], [-10, 276, 120, 70], [130, 276, 96, 70], [246, 276, 130, 70], [-10, -10, 120, 80], [130, -10, 96, 80], [246, -10, 130, 80], [-10, 92, 120, 70], [246, 92, 130, 70], [-10, 184, 120, 80], [130, 184, 96, 80], [246, 184, 130, 80]].map(([x, y, w, h], i) => <Rect key={i} x={x} y={y} width={w} height={h} rx={8} />)}
          </G>
          <Rect x={252} y={100} width={54} height={54} rx={10} fill={c.mapPark} />
          <G stroke={c.mapRoad} strokeWidth={12} strokeLinecap="round">
            <Line x1={0} y1={-1} x2={358} y2={-1} /><Line x1={0} y1={266} x2={358} y2={266} /><Line x1={0} y1={81} x2={358} y2={81} /><Line x1={0} y1={173} x2={358} y2={173} />
            <Line x1={120} y1={-80} x2={120} y2={340} /><Line x1={236} y1={-80} x2={236} y2={340} />
          </G>
          <Rect x={136} y={98} width={84} height={58} rx={10} fill={c.surface} stroke={c.line} />
          <Circle cx={178} cy={127} r={34} fill={c.accentSoft} stroke={c.accent} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.9} />
          <SvgText x={178} y={131} textAnchor="middle" fill={c.ink} fontSize={11} fontWeight="600" fontFamily={font.semibold}>Wulf Fitness</SvgText>
          {!off && !inside && <Line x1={178} y1={127} x2={ux} y2={uy} stroke={c.muted} strokeWidth={1.5} strokeDasharray="3 4" />}
          {!off && (
            <>
              <Circle cx={ux} cy={uy} r={16} fill="#3478F6" opacity={0.16} />
              <Circle cx={ux} cy={uy} r={10} fill="#3478F6" opacity={0.25} />
              <Circle cx={ux} cy={uy} r={7} fill="#3478F6" stroke="#fff" strokeWidth={3} />
            </>
          )}
        </Svg>}
      </View>

      <Row style={{ position: 'absolute', top: insets.top + 12, left: 16, right: 16, gap: 8, alignItems: 'center' }}>
        <RoundBtn label="Close map" onPress={close} glass><X size={20} color={c.ink} /></RoundBtn>
        {/* GPS accuracy: centred between the two buttons, same height row, glass like them. */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          {!off && (
            <View accessibilityLabel={`GPS accuracy, plus or minus ${refreshing ? 'unknown' : inside ? 6 : 9} metres`} style={{ height: 36, paddingHorizontal: 14, borderRadius: 18, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: '#101828', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}>
              <GlassBackdrop radius={18} />
              <View style={{ zIndex: 2 }}><Crosshair size={14} color={c.ink} /></View>
              <Txt style={{ zIndex: 2, fontFamily: font.semibold, fontSize: 13, lineHeight: 18 }}>{`GPS ±${refreshing ? '…' : inside ? 6 : 9} m`}</Txt>
            </View>
          )}
        </View>
        <RoundBtn label="Refresh my location" onPress={refresh} glass><RefreshCw size={18} color={c.ink} /></RoundBtn>
      </Row>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 20, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 14, gap: 12,
        shadowColor: '#101828', shadowOpacity: isDark ? 0 : 0.12, shadowRadius: 30, shadowOffset: { width: 0, height: -10 } }}>
        <View style={{ gap: 2 }}>
          <Txt style={{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1 }}>Wulf Fitness</Txt>
          <Txt muted style={{ fontSize: 13 }}>Vaishali Nagar, Jaipur · 20 m check-in area</Txt>
        </View>
        <Animated.View key={status.t} entering={fade()} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: status.bg }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            {off ? <LocateOff size={17} color={status.fg} /> : <MapPin size={17} color={status.fg} />}
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.semibold, color: status.fg }}>{status.t}</Txt>
            <Txt style={{ fontSize: 13, color: status.fg, opacity: 0.85 }}>{status.s}</Txt>
          </View>
        </Animated.View>
        {checkedIn ? (
          <Button kind="primary" label="Check out" onPress={CI.checkOut} />
        ) : d.ciOut ? (
          <Button kind="secondary" label="Checked out" disabled />
        ) : off ? (
          <Button kind="accent" label="Turn on location" onPress={() => { set({ ci: 'At the gym' }); refresh(); toast('Location on · we only check it while the app is open'); }} />
        ) : (
          <Button kind="accent" label={busy ? 'Checking you in…' : inside ? 'Check in now' : 'Not in range yet'} disabled={!inside || refreshing || busy} onPress={checkIn} />
        )}
        <Txt v="caption" style={{ textAlign: 'center' }}>{checkedIn ? 'Check out any time. If you leave the gym area, we check you out for you.' : "We check your location only while this is open. It isn't stored. The front desk can also mark your visit."}</Txt>
      </View>
    </View>
  );
}
