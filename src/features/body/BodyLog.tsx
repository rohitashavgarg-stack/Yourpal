import React, { useState } from 'react';
import { ageFrom, daysIn, defaultDob, MAX_AGE, MIN_AGE, MONTHS, parseDob, toDob } from '@/lib/dob';
import { Pressable, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays, ChevronRight, X } from '@/lib/icons';
import { Button, Card, Pill, Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn, UnitPill } from '@/components/bits';
import { Wheel } from '@/components/Wheel';
import { Ruler } from '@/components/Ruler';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useScenarios, useStore } from '@/lib/store';
import { setShell, useShell } from '@/features/shell/state';
import { SPARK } from '@/features/today/Trackers';
import { useTheme } from '@/theme/ThemeProvider';
import { fade } from '@/theme/motion';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';

const KG_LB = 2.2046226218;
const r1 = (n: number) => Math.round(n * 10) / 10;
const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

type Editable = { onCommit: (t: string) => boolean; hint: string; kb: 'decimal-pad' | 'number-pad' };

// Big number. Tap it to type an exact value; invalid input warns (colour, message, haptic).
function BigNumber({ title, big, unit, editable, hint = 'Tap to edit', size = 76, align = 'center' }: { title: string; big: string; unit: string; editable: Editable; hint?: string; size?: number; align?: 'center' | 'flex-start' }) {
  const { c } = useTheme();
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const [bad, setBad] = useState(false);
  const commit = () => {
    if (editable.onCommit(text)) { setTyping(false); setBad(false); haptic.tick(); }
    else { setBad(true); haptic.warn(); }
  };
  const numStyle = { fontFamily: font.displayBold, fontSize: size, lineHeight: Math.round(size * 1.2), letterSpacing: -2 } as const;
  return (
    <View style={{ alignItems: align, gap: 2 }}>
      {typing ? (
        <Row style={{ alignItems: 'baseline', gap: 6 }}>
          <TextInput autoFocus value={text} onChangeText={(t) => { setText(t); setBad(false); }} keyboardType={editable.kb} onSubmitEditing={commit} onBlur={() => { if (!bad) commit(); }} returnKeyType="done"
            accessibilityLabel={`Type ${title.toLowerCase()}`} style={{ ...numStyle, minWidth: 120, textAlign: align === 'center' ? 'center' : 'left', color: bad ? c.warn : c.ink, outlineStyle: 'none' as any }} />
          {!!unit && <Txt muted style={{ fontFamily: font.semibold, fontSize: 15, letterSpacing: 1.2 }}>{unit.toUpperCase()}</Txt>}
        </Row>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel={`${big} ${unit}. Tap to type a number`} onPress={() => { setText(big.replace(/[^\d.]/g, '')); setTyping(true); setBad(false); }}
          style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, minHeight: Math.round(size * 1.2) }}>
          <Txt style={numStyle}>{big}</Txt>
          {!!unit && <Txt muted style={{ fontFamily: font.semibold, fontSize: 15, letterSpacing: 1.2 }}>{unit.toUpperCase()}</Txt>}
        </Pressable>
      )}
      <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.4, color: bad ? c.warn : c.muted }}>{(bad ? editable.hint : hint).toUpperCase()}</Txt>
    </View>
  );
}

// ================= Pickers (also used by the onboarding steps) =================
// Weight: big number, horizontal ruler, compact kg | lb pill underneath.
export function WeightPicker({ kg, onChange, title = 'Weight', chip, children }: { kg: number; onChange: (kg: number) => void; title?: string; chip?: React.ReactNode; children?: React.ReactNode }) {
  const { s } = useShell();
  const unit = s.unitsW;
  const shown = unit === 'kg' ? kg : r1(kg * KG_LB);
  const lo = unit === 'kg' ? 30 : 66, hi = unit === 'kg' ? 250 : 551;
  const toKg = (v: number) => (unit === 'kg' ? v : v / KG_LB);
  const editable: Editable = { kb: 'decimal-pad', hint: `Between ${lo} and ${hi} ${unit}`, onCommit: (t) => { const n = parseFloat(t.replace(',', '.')); if (!isFinite(n) || n < lo || n > hi) return false; onChange(toKg(n)); return true; } };
  return (
    <View style={{ gap: 22 }}>
      <View style={{ paddingTop: 12, gap: 10 }}>
        <BigNumber title={title} big={String(shown)} unit={unit} editable={editable} />
        {chip ? <View style={{ alignSelf: 'center' }}>{chip}</View> : null}
      </View>
      <Ruler key={unit} accessibilityLabel={`${title} in ${unit}`} value={shown} onChange={(v) => onChange(toKg(v))}
        min={lo} max={hi} step={unit === 'kg' ? 0.1 : 0.2} decimals={1} majorEvery={unit === 'kg' ? 10 : 5} markEvery={5} label={(v) => String(Math.round(v))} />
      <UnitPill<'kg' | 'lb'> label="Weight unit" value={unit} onChange={(u) => { haptic.tick(); setShell({ unitsW: u }); }} options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
      {children}
    </View>
  );
}

// Height: number and unit pill on the left, a tall vertical ruler on the right.
export function HeightPicker({ cm, onChange }: { cm: number; onChange: (cm: number) => void }) {
  const { s } = useShell();
  const ftin = s.unitsL === 'in';
  const inches = Math.round(cm / 2.54);
  const big = ftin ? `${Math.floor(inches / 12)}′ ${inches % 12}″` : String(Math.round(cm));
  const editable: Editable = { kb: 'number-pad', hint: ftin ? 'Inches, between 40 and 90' : 'Between 100 and 230 cm', onCommit: (t) => {
    const n = parseFloat(t); if (!isFinite(n)) return false;
    const v = ftin ? n * 2.54 : n; if (v < 100 || v > 230) return false; onChange(v); return true;
  } };
  return (
    <Row style={{ height: 420 }}>
      <View style={{ flex: 1, gap: 18, justifyContent: 'center', paddingBottom: 24 }}>
        <BigNumber title="Height" big={big} unit={ftin ? '' : 'cm'} editable={editable} size={ftin ? 56 : 76} align="flex-start" />
        <View style={{ alignSelf: 'flex-start' }}>
          <UnitPill<'cm' | 'in'> label="Height unit" value={s.unitsL} onChange={(u) => { haptic.tick(); setShell({ unitsL: u }); }} options={[{ value: 'cm', label: 'cm' }, { value: 'in', label: 'ft + in' }]} />
        </View>
        {ftin && <Txt v="caption">{Math.round(cm)} cm</Txt>}
      </View>
      {ftin ? (
        <Ruler vertical key="in" accessibilityLabel="Height in feet and inches" value={inches} onChange={(v) => onChange(v * 2.54)} min={40} max={90} step={1} majorEvery={12} markEvery={6} label={(v) => `${Math.floor(v / 12)}′`} />
      ) : (
        <Ruler vertical key="cm" accessibilityLabel="Height in centimetres" value={Math.round(cm)} onChange={onChange} min={100} max={230} step={1} majorEvery={10} markEvery={5} label={(v) => String(Math.round(v))} />
      )}
    </Row>
  );
}

// Date of birth: day, month and year wheels. Age is worked out from it.
export function DobPicker({ dob, onChange }: { dob: string; onChange: (dob: string) => void }) {
  const now = new Date();
  const p = parseDob(dob) ?? parseDob(defaultDob())!;
  const maxD = daysIn(p.y, p.m);
  const set = (y: number, m: number, d: number) => onChange(toDob(y, m, Math.min(d, daysIn(y, m))));
  const age = ageFrom(toDob(p.y, p.m, Math.min(p.d, maxD)));
  return (
    <View style={{ gap: 8 }}>
      <Row style={{ gap: 4 }}>
        <Wheel key={`d${maxD}`}accessibilityLabel="Day" value={Math.min(p.d, maxD)} onChange={(d) => set(p.y, p.m, d)} min={1} max={maxD} size={40} fmt={(n) => String(n)} />
        <Wheel accessibilityLabel="Month" value={p.m} onChange={(m) => set(p.y, m, p.d)} min={1} max={12} size={40} fmt={(n) => MONTHS[n - 1]} />
        <Wheel accessibilityLabel="Year" value={p.y} onChange={(y) => set(y, p.m, p.d)} min={now.getFullYear() - MAX_AGE} max={now.getFullYear() - MIN_AGE} size={40} fmt={(n) => String(n)} />
      </Row>
      {age != null && <Txt muted style={{ textAlign: 'center', fontSize: 14, lineHeight: 20 }}>{`You are ${age} years old`}</Txt>}
    </View>
  );
}

// ---------- full-screen chrome: X, title, content, Save pinned at the bottom ----------
function BodyScreen({ title, saveLabel, onSave, children }: { title: string; saveLabel: string; onSave: () => void; children: React.ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Row style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}>
        <RoundBtn label="Close" onPress={back} glass><X size={20} color={c.ink} /></RoundBtn>
        <Txt accessibilityRole="header" style={{ flex: 1, textAlign: 'center', fontFamily: font.semibold, fontSize: 17, marginRight: 44 }}>{title}</Txt>
      </Row>
      <Animated.View entering={fade()} style={{ flex: 1, paddingHorizontal: 16 }}>{children}</Animated.View>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 8, backgroundColor: c.bg }}>
        <Button kind="accent" label={saveLabel} onPress={onSave} />
      </View>
    </View>
  );
}

// ---------- date row (weight only) ----------
const DAYS = [{ k: 'Today', full: 'Today · Wed 24', log: 'Wed 24' }, { k: 'Yesterday', full: 'Yesterday · Tue 23', log: 'Tue 23' }, { k: 'Mon 22', full: 'Mon 22', log: 'Mon 22' }];
function DateSheet({ value, onPick }: { value: number; onPick: (i: number) => void }) {
  const { closeSheet } = useOverlay();
  return (
    <>
      <Txt style={{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1 }}>Weighed on</Txt>
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>{DAYS.map((d, i) => <Pill key={d.k} label={d.k} on={value === i} onPress={() => { onPick(i); closeSheet(); }} />)}</Row>
      <Txt v="caption">Forgot to log? Pick the day you weighed yourself.</Txt>
    </>
  );
}

function Trend({ kg, unit }: { kg: number; unit: 'kg' | 'lb' }) {
  const { c } = useTheme();
  const s = [...SPARK, kg];
  const lo = Math.min(...s) - 0.2, hi = Math.max(...s) + 0.2;
  const pts = s.map((v, i) => [10 + i * (300 / (s.length - 1)), 8 + ((hi - v) / (hi - lo)) * 48] as const);
  const last = pts[pts.length - 1];
  const diff = r1(kg - SPARK[0]);
  const shown = unit === 'kg' ? diff : r1(diff * KG_LB);
  return (
    <Card style={{ padding: 16, gap: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt v="label">Last 7 entries</Txt>
        <Txt v="caption">{shown === 0 ? 'No change' : `${shown > 0 ? '+' : '−'}${Math.abs(shown)} ${unit} since ${SPARK.length} days ago`}</Txt>
      </Row>
      <Svg width="100%" height={64} viewBox="0 0 320 64" preserveAspectRatio="none">
        <Polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={c.surface3} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <Circle cx={last[0]} cy={last[1]} r={5} fill={c.accent} />
      </Svg>
    </Card>
  );
}

// ================= Full screens =================
export function WeightScreen() {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { state, setProfile } = useStore();
  const { s } = useShell();
  const { openSheet, toast } = useOverlay();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const onboarding = from === 'onboarding';
  const [kg, setKg] = useState(onboarding ? (+state.profile.weightKg || 70) : d.weight);
  const [day, setDay] = useState(0);
  const unit = s.unitsW;

  useScenarios({ title: 'Log weight', rows: [{ label: 'Unit', options: ['kg', 'lb'], value: unit, onPick: (v) => setShell({ unitsW: v as any }) }] }, [unit]);

  const save = () => {
    if (kg < 30 || kg > 250) { haptic.warn(); return; }
    const v = r1(kg);
    if (onboarding) setProfile({ weightKg: String(v), skipBody: false });
    else set((x) => ({ ...(day === 0 ? { weight: v } : {}), weightLog: [...x.weightLog.filter((w) => w.t !== DAYS[day].log), { t: DAYS[day].log, v }] }));
    haptic.success();
    back();
    if (!onboarding) toast(`Weight saved · ${unit === 'kg' ? v : r1(v * KG_LB)} ${unit}`);
  };

  return (
    <BodyScreen title="Log weight" saveLabel="Save" onSave={save}>
      <WeightPicker kg={kg} onChange={setKg}>
        {onboarding ? (
          <Txt v="caption" style={{ textAlign: 'center' }}>Your trend line starts after your first few weigh-ins.</Txt>
        ) : (
          <View style={{ gap: 18 }}>
            <Trend kg={kg} unit={unit} />
            <Pressy accessibilityRole="button" accessibilityLabel={`Date: ${DAYS[day].full}. Change`} onPress={() => openSheet(<DateSheet value={day} onPick={setDay} />, { label: 'Weighed on' })}
              style={{ minHeight: 56, borderRadius: 18, backgroundColor: c.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <CalendarDays size={19} color={c.muted} />
              <View style={{ flex: 1 }}><Txt v="caption">Date</Txt><Txt style={{ fontFamily: font.semibold }}>{DAYS[day].full}</Txt></View>
              <ChevronRight size={18} color={c.muted} />
            </Pressy>
          </View>
        )}
      </WeightPicker>
    </BodyScreen>
  );
}

export function HeightScreen() {
  const { state, setProfile } = useStore();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [cm, setCm] = useState(+state.profile.heightCm || 170);
  const save = () => {
    if (cm < 100 || cm > 230) { haptic.warn(); return; }
    setProfile({ heightCm: String(Math.round(cm)), skipBody: false });
    haptic.success();
    back();
  };
  return (
    <BodyScreen title="Height" saveLabel={from === 'onboarding' ? 'Done' : 'Save'} onSave={save}>
      <HeightPicker cm={cm} onChange={setCm} />
    </BodyScreen>
  );
}
