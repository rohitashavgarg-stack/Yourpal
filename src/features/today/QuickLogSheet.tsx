import React, { useEffect, useRef, useState } from 'react';
import { Image, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { Camera, PenLine, Search } from '@/lib/icons';
import { Button, Chip, Field, Pressy, Row, Segmented, Txt } from '@/components/ui';
import { CheckCircle, PillBtn } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { CATALOG, MealId, parseFood, Parsed, SCAN_RESULT, SWAPS } from '@/lib/data';
import { allowedFor, usePlans } from '@/features/plans/store';
import { FoodMark } from '@/components/bits';
import { mealLog, useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { mealById, mealKcal } from './meals';

type Mode = 'sugg' | 'scan' | 'write' | 'cat';
const SUGG = ['2 roti', '1 cup milk', '1 katori dal', '1 banana', '100 g paneer'];

function ScanLine() {
  const y = useSharedValue(0);
  useEffect(() => { y.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }), -1, true); }, []);
  const a = useAnimatedStyle(() => ({ top: `${8 + y.value * 80}%` }));
  return <Animated.View style={[{ position: 'absolute', left: '12%', right: '12%', height: 2, backgroundColor: '#7CF0C8', shadowColor: '#7CF0C8', shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }, a]} />;
}

function Bracket({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const t = pos[0] === 't', l = pos[1] === 'l';
  return <View style={{ position: 'absolute', width: 30, height: 30, borderColor: '#fff', opacity: 0.9, [t ? 'top' : 'bottom']: 20, [l ? 'left' : 'right']: 20,
    borderTopWidth: t ? 3 : 0, borderBottomWidth: t ? 0 : 3, borderLeftWidth: l ? 3 : 0, borderRightWidth: l ? 0 : 3,
    [`border${t ? 'Top' : 'Bottom'}${l ? 'Left' : 'Right'}Radius`]: 12 }} />;
}

export function QuickLogSheet({ mealId, mode: initial = 'scan', replaceIdx }: { mealId: MealId; mode?: Mode; replaceIdx?: number }) {
  const { c } = useTheme();
  const { d, set } = useDomain();
  const { closeSheet, toast } = useOverlay();
  const meal = mealById(mealId);
  const repl = replaceIdx != null ? meal.items[replaceIdx] : null;
  const { p: plans } = usePlans();
  const [mode, setMode] = useState<Mode>(initial);
  const [pick, setPick] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [scan, setScan] = useState<'idle' | 'busy' | 'done' | 'fail'>('idle');
  const [shot, setShot] = useState<string | null>(null); // the photo just taken or picked
  const [perm, askPerm] = useCameraPermissions();
  const cam = useRef<CameraView>(null);
  const live = !!perm?.granted && scan === 'idle' && !shot; // show the live camera
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const qq = q.toLowerCase();
  const suggestions = repl ? (SWAPS[repl.n] ?? SWAPS.any).filter((o) => allowedFor(plans.diet, o.type) && `${o.q} ${o.n}`.toLowerCase() !== `${repl.q} ${repl.n}`.toLowerCase()) : [];
  const res = CATALOG.filter((x) => !qq || x.n.toLowerCase().includes(qq)).slice(0, qq ? 10 : 6);
  const items: (Parsed & { type?: any })[] = mode === 'sugg' ? suggestions.filter((o) => `${o.n}, ${o.q}` === pick).map((o) => ({ n: `${o.n}, ${o.q}`, k: o.k, p: o.p, est: false, type: o.type }))
    : mode === 'write' ? parseFood(text)
    : mode === 'cat' ? CATALOG.filter((x) => sel.includes(x.n)).map((x) => ({ n: x.n, k: x.k, p: x.p, est: false, type: x.type }))
    : scan === 'done' ? SCAN_RESULT : [];
  const total = items.reduce((a, x) => a + x.k, 0);
  const prot = items.reduce((a, x) => a + x.p, 0);
  const diff = total - (repl ? repl.k : mealKcal(meal));
  const planned = meal.items.map((x) => x.n).join(' · ');

  const goScan = () => {
    clearTimeout(timer.current); setScan('busy'); haptic.light();
    timer.current = setTimeout(() => { setScan(d.scanFails ? 'fail' : 'done'); d.scanFails ? haptic.error() : haptic.success(); }, 1600);
  };

  const takePhoto = async () => {
    if (!perm?.granted) { const r = await askPerm(); if (!r.granted) haptic.error(); return; }
    try {
      const p = await cam.current?.takePictureAsync({ quality: 0.6, skipProcessing: true });
      if (p?.uri) setShot(p.uri);
    } catch { /* fall through: the estimate still runs on the demo plate */ }
    goScan();
  };
  const choosePhoto = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (!r.canceled && r.assets?.[0]?.uri) { setShot(r.assets[0].uri); goScan(); }
    } catch { toast('Could not open your photos'); }
  };
  const again = () => { clearTimeout(timer.current); setShot(null); setScan('idle'); haptic.tick(); };

  const log = () => {
    if (!items.length) return;
    const label = items.map((x) => x.n).join(' + ');
    const prev = d.meals;
    const cur = mealLog(d, mealId);
    const at = cur.at ?? d.min;
    closeSheet(() => {
      if (replaceIdx != null && repl) {
        const eaten = mode === 'sugg' || cur.eaten.includes(replaceIdx) ? cur.eaten : [...cur.eaten, replaceIdx];
        set({ meals: { ...d.meals, [mealId]: { ...cur, repl: { ...cur.repl, [replaceIdx]: { n: label, k: total, p: prot, est: items.some((x) => x.est), type: items[0]?.type } }, eaten, at: mode === 'sugg' ? cur.at : at, skip: false } }, openMeal: mealId });
        toast(`Swapped ${repl.n.toLowerCase()} for ${label}`, { undo: () => set({ meals: prev }) });
      } else {
        set({ meals: { ...d.meals, [mealId]: { ...cur, extra: [...cur.extra, ...items.map((x) => ({ n: x.n, k: x.k, p: x.p, est: x.est, type: x.type ?? 'veg' }))], at, skip: false } }, openMeal: mealId });
        toast(`Added to ${meal.n.toLowerCase()} · Coach sees what changed`, { undo: () => set({ meals: prev }) });
      }
      haptic.success();
    });
  };

  const cap = { idle: 'Fit the whole plate in the frame', busy: 'Looking at your plate…', done: 'Our best guess · edit below', fail: 'Try again' }[scan];
  const logL = items.length ? (repl ? `Swap · ${total} kcal` : `Add ${total} kcal`) : mode === 'sugg' ? 'Pick a swap' : mode === 'scan' ? 'Scan first' : mode === 'cat' ? 'Pick what you ate' : 'Write what you ate';

  return (
    <>
      <View style={{ gap: 2 }}>
        <Txt style={{ fontFamily: font.regular, fontSize: 28, letterSpacing: -1.1 }}>{repl ? `Swap ${repl.n.toLowerCase()}` : `Add to ${meal.n.toLowerCase()}`}</Txt>
        <Txt muted style={{ fontSize: 13 }}>{repl ? `Planned: ${repl.q} · ${repl.k} kcal` : `Planned: ${planned} · ${mealKcal(meal)} kcal`}</Txt>
      </View>
      <Segmented<Mode> accessibilityLabel="How to log" value={mode} onChange={setMode}
        options={[...(repl ? [{ value: 'sugg' as Mode, label: 'Suggested' }] : []), { value: 'scan', label: 'Scan' }, { value: 'write', label: 'Write' }, { value: 'cat', label: 'Library' }]}
        icons={{ scan: (col) => <Camera size={16} color={col} />, write: (col) => <PenLine size={16} color={col} />, cat: (col) => <Search size={16} color={col} /> }} />

      {mode === 'sugg' && (
        <View style={{ borderRadius: 20, borderWidth: 1, borderColor: c.line, paddingHorizontal: 12 }}>
          {suggestions.map((o, i) => {
            const label = `${o.n}, ${o.q}`;
            const on = pick === label;
            return (
              <Pressy key={label} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${label}, about ${o.k} kcal, ${o.p} grams protein${o.coach ? ', coach-approved' : ''}`} onPress={() => setPick(on ? null : label)} scaleTo={0.99}
                style={{ minHeight: 58, borderBottomWidth: i === suggestions.length - 1 ? 0 : 1, borderBottomColor: c.line, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <FoodMark type={o.type} />
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontFamily: font.medium }}>{label}</Txt>
                  <Txt v="mono" muted style={{ fontSize: 12 }}>≈{o.k} kcal · P {o.p} g{o.coach ? ' · Coach-approved' : ''}</Txt>
                </View>
                <CheckCircle on={on} size={30} hit={30} label={label} onPress={() => setPick(on ? null : label)} />
              </Pressy>
            );
          })}
          {suggestions.length === 0 && <Txt muted style={{ paddingVertical: 16, fontSize: 14 }}>No suggestions for this one. Use Scan, Write or Library.</Txt>}
        </View>
      )}

      {mode === 'write' && (
        <>
          <Field accessibilityLabel="What did you eat" value={text} onChangeText={setText} placeholder="2 roti, 1 cup milk" autoFocus returnKeyType="done" />
          <Txt v="caption" style={{ marginTop: -6, paddingHorizontal: 6 }}>Separate items with commas. Amounts like 2, 1 cup, 1 katori, 100 g work.</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {SUGG.map((t) => (
              <Pressy key={t} accessibilityRole="button" accessibilityLabel={`Add ${t}`} onPress={() => setText((v) => (v.trim() ? `${v.trim().replace(/,\s*$/, '')}, ${t}` : t))}
                style={{ height: 34, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1, borderColor: c.surface3, justifyContent: 'center' }}>
                <Txt style={{ fontFamily: font.medium, fontSize: 13 }}>+ {t}</Txt>
              </Pressy>
            ))}
          </Row>
        </>
      )}

      {mode === 'scan' && (
        <>
          <View accessibilityLiveRegion="polite" accessibilityLabel={cap} style={{ height: 210, borderRadius: 24, overflow: 'hidden', backgroundColor: '#0B0F16' }}>
            {live ? <CameraView ref={cam} facing="back" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              : shot ? <Image source={{ uri: shot }} accessibilityIgnoresInvertColors resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
              : (
            <Svg width="100%" height="100%" viewBox="0 0 358 210" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', opacity: scan === 'idle' ? 0.5 : 1 }}>
              <Ellipse cx={179} cy={110} rx={112} ry={76} fill="#E9E4DA" /><Ellipse cx={179} cy={110} rx={90} ry={58} fill="#F7F3EC" />
              <Circle cx={148} cy={100} r={28} fill="#8C3B2A" /><Circle cx={142} cy={93} r={4} fill="#B5543C" /><Circle cx={156} cy={106} r={3} fill="#B5543C" />
              <Ellipse cx={210} cy={100} rx={32} ry={22} fill="#FFFDF6" /><Circle cx={186} cy={140} r={20} fill="#D9A45A" />
            </Svg>)}
            <Bracket pos="tl" /><Bracket pos="tr" /><Bracket pos="bl" /><Bracket pos="br" />
            {scan === 'busy' && <ScanLine />}
            <Txt style={{ position: 'absolute', left: 0, right: 0, bottom: 12, textAlign: 'center', fontFamily: font.medium, fontSize: 13, color: '#fff', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 }}>{cap}</Txt>
          </View>
          {scan === 'fail' && (
            <Animated.View entering={fade()} style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: c.warnSoft }}>
              <Txt style={{ fontSize: 14, color: c.warn }}><Txt style={{ fontFamily: font.semibold, color: c.warn }}>Couldn't read that.</Txt> Too dark or too close. Try the whole plate in good light, or write it instead.</Txt>
            </Animated.View>
          )}
          {perm && !perm.granted && !perm.canAskAgain && (
            <Txt muted style={{ fontSize: 13, lineHeight: 19 }}>Camera is off for YourPal. Allow it in Settings, or choose a photo of your plate instead.</Txt>
          )}
          <Button kind="secondary" small disabled={scan === 'busy'} icon={<Camera size={17} color={c.ink} />}
            label={scan === 'busy' ? 'Scanning…' : scan === 'done' || scan === 'fail' ? 'Scan again' : perm && !perm.granted ? (perm.canAskAgain ? 'Allow camera' : 'Try the demo plate') : 'Take photo'}
            onPress={scan === 'done' || scan === 'fail' ? again : perm && !perm.granted && !perm.canAskAgain ? goScan : takePhoto} style={{ height: 50 }} />
          {scan === 'idle' && !shot && <Button kind="ghost" small label="Choose a photo instead" onPress={choosePhoto} />}
        </>
      )}

      {mode === 'cat' && (
        <>
          <Field accessibilityLabel="Search the food catalogue" value={q} onChangeText={setQ} placeholder="Search poha, dal, curd…" />
          <View style={{ borderRadius: 20, borderWidth: 1, borderColor: c.line, paddingHorizontal: 12 }}>
            {res.map((f) => {
              const on = sel.includes(f.n);
              const tog = () => setSel((l) => (on ? l.filter((x) => x !== f.n) : [...l, f.n]));
              return (
                <Pressy key={f.n} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={f.n} onPress={tog} scaleTo={0.99}
                  style={{ minHeight: 54, borderBottomWidth: 1, borderBottomColor: c.line, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1 }}><Txt style={{ fontFamily: font.medium }}>{f.n}</Txt><Txt v="mono" muted style={{ fontSize: 12 }}>{f.k} kcal · P {f.p} g</Txt></View>
                  <CheckCircle on={on} size={30} hit={30} label={f.n} onPress={tog} />
                </Pressy>
              );
            })}
            {res.length === 0 && (
              <View style={{ paddingVertical: 16, gap: 8, alignItems: 'flex-start' }}>
                <Txt muted style={{ fontSize: 14 }}>Not in the catalogue.</Txt>
                <PillBtn tone="soft" label="Write it instead" onPress={() => { setText(q); setMode('write'); }} />
              </View>
            )}
          </View>
        </>
      )}

      {items.length > 0 && (
        <Animated.View entering={fade()} style={{ borderRadius: 20, backgroundColor: c.surface2, paddingVertical: 4, paddingHorizontal: 14 }}>
          {items.map((it, i) => (
            <Row key={i} style={{ gap: 8, minHeight: 44, borderBottomWidth: 1, borderBottomColor: c.line }}>
              <Txt style={{ flex: 1, fontFamily: font.medium }}>{it.n}</Txt>
              {it.est && <Chip label="estimated" style={{ height: 22, alignSelf: 'center' }} />}
              <Txt v="mono">{it.k} kcal</Txt>
            </Row>
          ))}
          <Row style={{ justifyContent: 'space-between', minHeight: 44 }}>
            <Txt style={{ fontFamily: font.semibold }}>{total} kcal · {prot} g protein</Txt>
            <Txt v="caption">{diff === 0 ? 'Same as plan' : `${diff > 0 ? '+' : '−'}${Math.abs(diff)} kcal vs plan`}</Txt>
          </Row>
        </Animated.View>
      )}
      {!(mode === 'scan' && !items.length) && <Button kind="primary" label={logL} disabled={!items.length} onPress={log} />}
    </>
  );
}
