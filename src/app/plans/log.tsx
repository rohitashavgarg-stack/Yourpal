import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useLeaveIfPaused } from '@/lib/logGate';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { CameraOff, Check, PenLine, ScanLine, Search } from '@/lib/icons';
import { Button, Card, Field, Pill, Pressy, Row, Segmented, Txt } from '@/components/ui';
import { CheckCircle, FoodMark, foodTypeLabel, PillBtn } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { FoodType, MealId, MEALS } from '@/lib/data';
import { Extra, useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { FOOD, macroLine, RECENT, SCAN_PHOTO } from '@/features/plans/content';
import { useDietActions } from '@/features/plans/dietActions';
import { PageHeader } from '@/features/plans/parts';
import { allowedFor, dietItems, Food, setP, usePlans } from '@/features/plans/store';
import { radii, fontSizes, fixed } from '@/design-system/tokens';
import { ScanBracket } from '@/design-system/primitives/ScanBracket';
import { FadeIn } from '@/design-system/primitives/FadeIn';

type Mode = 'search' | 'write' | 'scan';
type ScanSt = 'idle' | 'busy' | 'done' | 'fail';

function ScanBeam() {
  const y = useSharedValue(0);
  useEffect(() => { y.value = withRepeat(withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }), -1, true); }, []);
  const a = useAnimatedStyle(() => ({ top: `${8 + y.value * 80}%` }));
  return <Animated.View style={[{ position: 'absolute', left: '12%', right: '12%', height: 2, backgroundColor: '#5CC2E6', shadowColor: '#5CC2E6', shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }, a]} />;
}
function NumField({ label, unit, value, onChange, ph }: { label: string; unit: string; value: string; onChange: (v: string) => void; ph: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, height: 52, borderRadius: radii.xl, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16 }}>
      <TextInput accessibilityLabel={label} value={value} onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder={ph} placeholderTextColor={c.muted}
        style={{ flex: 1, minWidth: 0, fontFamily: font.mono, fontSize: fontSizes.base, color: c.ink, height: '100%' as any, outlineStyle: 'none' as any }} />
      <Txt muted style={{ fontSize: fontSizes.sm }}>{unit}</Txt>
    </View>
  );
}

export default function LogFood() {
  useLeaveIfPaused();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { p } = usePlans();
  const { toast } = useOverlay();
  const A = useDietActions();
  const prm = useLocalSearchParams<{ meal?: MealId; replace?: string; edit?: string }>();
  const forEdit = prm.edit === '1';
  const [meal, setMeal] = useState<MealId>((prm.meal as MealId) ?? 'lu');
  const replaceIt = prm.replace ? dietItems(d, p, meal).find((i) => i.key === prm.replace) : undefined;

  const [mode, setMode] = useState<Mode>('search');
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<Food | null>(null);
  const [picks, setPicks] = useState<Food[]>([]); // the foods ticked in the search list (several at once)
  const clearPick = () => { setPick(null); setPicks([]); };
  const [portion, setPortion] = useState(1);
  const [wName, setWName] = useState('');
  const [wType, setWType] = useState<FoodType>('veg');
  const [wK, setWK] = useState('');
  const [wP, setWP] = useState('');
  const [wSave, setWSave] = useState(true);
  const [scan, setScan] = useState<ScanSt>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const camOk = p.camOk ?? p.cam === 'Allowed';
  useScenarios({
    title: 'What did you eat?',
    rows: [
      { label: 'How to add it', options: ['Search', 'Write', 'Scan'], value: mode[0].toUpperCase() + mode.slice(1), onPick: (v) => changeMode(v.toLowerCase() as Mode) },
      { label: 'Camera (scan food)', options: ['Allowed', 'Denied'], value: camOk ? 'Allowed' : 'Denied', onPick: (v) => setP({ cam: v as any, camOk: null }) },
      { label: 'Scan result', options: ['Works', 'Fails'], value: d.scanFails ? 'Fails' : 'Works', onPick: (v) => { set({ scanFails: v === 'Fails' }); setScan('idle'); } },
      { label: 'Diet type (catalogue)', options: ['Veg', 'Eggetarian', 'Non-veg'], value: p.diet, onPick: (v) => setP({ diet: v as any }) },
    ],
    actions: [{ label: 'Search for something missing', run: () => { changeMode('search'); setQ('pav bhaji'); } }],
  }, [mode, camOk, d.scanFails, p.diet]);

  // ---- search
  const qq = q.trim().toLowerCase();
  const catalogue = [...p.myFoods, ...FOOD];
  const res = catalogue.filter((f) => (f.mine || allowedFor(p.diet, f.type)) && (!qq || f.n.toLowerCase().includes(qq))).slice(0, qq ? 12 : 6);
  // ---- write
  const wn = wName.trim();
  const guess = wn ? FOOD.find((f) => wn.toLowerCase().includes(f.n.split(',')[0].split(' ')[0].toLowerCase())) ?? null : null;
  const estK = guess ? guess.k : 250, estP = guess ? guess.p : 8;
  const wPick: Food | null = wn ? { n: wn, k: Number(wK) > 0 ? Number(wK) : estK, p: wP !== '' ? Number(wP) : estP, type: wType, est: !(Number(wK) > 0), written: true } : null;
  // search mode while logging selects several foods; swapping one item, a scan and a written food are one food
  const multi = mode === 'search' && !replaceIt;
  const list: Food[] = mode === 'write' ? (wPick ? [wPick] : []) : multi ? picks : pick ? [pick] : [];
  const cur = list[0] ?? null;
  const toggle = (f: Food) => { haptic.tick(); setPortion(1); setPicks((a) => (a.some((x) => x.n === f.n) ? a.filter((x) => x.n !== f.n) : [...a, f])); };

  const changeMode = (m: Mode) => {
    clearTimeout(timer.current);
    setMode(m);
    if (m === 'write') clearPick();
    if (m === 'scan' && scan !== 'done') clearPick();
    if (m === 'search' && scan !== 'idle') { setScan('idle'); clearPick(); }
  };
  const toWrite = () => { setWName(q); clearPick(); changeMode('write'); };
  const toSearch = () => { clearTimeout(timer.current); setScan('idle'); clearPick(); setMode('search'); };
  const goScan = () => {
    clearTimeout(timer.current); setScan('busy'); clearPick(); haptic.light();
    timer.current = setTimeout(() => {
      if (d.scanFails) { setScan('fail'); haptic.error(); return; }
      setScan('done'); setPick(SCAN_PHOTO); haptic.success();
    }, 1700);
  };

  // ---- diff vs plan
  let planK = 0, planP = 0;
  if (replaceIt) { planK = replaceIt.k; planP = replaceIt.p; }
  else dietItems(d, p, meal).forEach((i) => { if (i.kind === 'plan' && i.st !== 'skipped') { planK += i.k; planP += i.p; } });
  const diff = cur ? (() => { const tk = list.reduce((a, f) => a + f.k * portion, 0), tp = list.reduce((a, f) => a + f.p * portion, 0); const dk = Math.round(tk - planK), dp = Math.round(tp - planP); return `${dk >= 0 ? '+' : '−'}${Math.abs(dk)} kcal · ${dp >= 0 ? '+' : '−'}${Math.abs(dp)} g protein vs ${replaceIt ? 'planned item' : 'plan'}${list.some((f) => f.est) ? ' · estimated' : ''}`; })() : '';

  const log = () => {
    if (!cur) return;
    const items = list.map((f) => ({ f, item: { n: f.n + (portion !== 1 ? (portion < 1 ? ' (less)' : ' (more)') : ''), k: Math.round(f.k * portion), p: Math.round(f.p * portion), type: f.type ?? 'veg', est: !!f.est } as Extra }));
    items.forEach(({ f }) => { if (f.written && wSave && !p.myFoods.some((x) => x.n === f.n)) setP((st) => ({ myFoods: [{ ...f, mine: true, est: false, written: false }, ...st.myFoods] })); });
    const saveMine = !!cur.written && wSave && !p.myFoods.some((x) => x.n === cur.n);
    const what = items.length > 1 ? `${items.length} foods` : items[0].item.n;
    haptic.success();
    if (forEdit) {
      setP((st) => (st.draft?.kind === 'diet' ? { draft: { ...st.draft, rows: [...st.draft.rows, ...items.map(({ f, item }, i) => ({ key: `n${Date.now()}${i}`, n: item.n, k: item.k, p: item.p, por: 1, type: item.type ?? 'veg', mine: true, added: { ...f } }))] } } : {}));
      router.back();
      toast(`Added ${what}. Save to keep it`);
      return;
    }
    if (replaceIt) { A.applySwap(meal, replaceIt, items[0].item, false); router.back(); return; }
    items.forEach(({ item }) => A.addExtra(meal, item));
    setP({ seg: 'diet', openMeal: meal });
    router.back();
    toast(`Logged ${items.length > 1 ? what : cur.n}${saveMine ? '. Saved to your foods' : ''}`);
  };
  const logL = cur ? (replaceIt ? 'Swap it' : forEdit ? (list.length > 1 ? `Add ${list.length} foods to the meal` : 'Add to the meal') : list.length > 1 ? `Log ${list.length} foods` : 'Log it') : mode === 'scan' ? 'Scan first' : mode === 'write' ? 'Write what you ate' : 'Pick what you ate';
  const cap = { idle: 'Fit the whole plate in the frame', busy: 'Looking at your plate…', done: 'Here is our guess', fail: 'Try again' }[scan];

  const foodRow = (f: Food, last: boolean) => {
    const on = multi ? picks.some((x) => x.n === f.n) : pick?.n === f.n;
    return (
      <Pressy key={f.n} accessibilityRole={multi ? 'checkbox' : 'radio'} accessibilityState={multi ? { checked: on } : { selected: on }} accessibilityLabel={`${f.n}${f.mine ? ', yours' : ''}, ${f.k} kcal, ${foodTypeLabel(f.type)}`} onPress={() => (multi ? toggle(f) : (setPick(f), setPortion(1)))} scaleTo={0.985}
        style={{ minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, borderRadius: 14, backgroundColor: on ? c.accentSoft : 'transparent', borderBottomWidth: last || on ? 0 : 1, borderBottomColor: c.line }}>
        <FoodMark type={f.type ?? 'veg'} />
        <View style={{ flex: 1, minWidth: 0, paddingVertical: 8 }}>
          <Txt style={{ fontFamily: font.medium }}>{f.n}{f.mine ? ' · yours' : ''}</Txt>
          <Txt v="mono" muted style={{ fontSize: fontSizes.xs }}>{macroLine(f)}</Txt>
        </View>
        <Txt style={{ fontFamily: font.monoBold, fontSize: fontSizes.sm }}>{f.k} kcal</Txt>
        {multi && <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : 'transparent', borderWidth: on ? 0 : 1.5, borderColor: c.surface3 }}>{on && <Check size={13} strokeWidth={3.5} color={fixed.white} />}</View>}
      </Pressy>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title={replaceIt ? `Swap ${replaceIt.n.toLowerCase()}` : 'What did you eat?'} icon="close" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16, gap: 12 }}>
        {!replaceIt && !forEdit && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {MEALS.map((m) => <Pill key={m.id} label={m.n} on={meal === m.id} onPress={() => setMeal(m.id)} />)}
          </ScrollView>
        )}
        <Segmented<Mode> accessibilityLabel="How to add it" value={mode} onChange={changeMode}
          options={[{ value: 'search', label: 'Search' }, { value: 'write', label: 'Write' }, { value: 'scan', label: 'Scan' }]}
          icons={{ search: (col) => <Search size={16} color={col} />, write: (col) => <PenLine size={16} color={col} />, scan: (col) => <ScanLine size={16} color={col} /> }} />

        {mode === 'search' && (
          <>
            <View style={{ gap: 6 }}>
              <Txt v="label" style={{ paddingHorizontal: 6 }}>Search the food catalogue</Txt>
              <Field accessibilityLabel="Search the food catalogue" value={q} onChangeText={setQ} placeholder="poha, dal, roti, curd…" returnKeyType="search" />
            </View>
            {!qq && (
              <View style={{ gap: 6 }}>
                <Txt v="label" style={{ paddingHorizontal: 6 }}>Recent</Txt>
                <Row style={{ gap: 6, flexWrap: 'wrap' }}>
                  {RECENT.map((n) => { const f = FOOD.find((x) => x.n === n)!; return <Pill key={n} label={n} on={multi ? picks.some((x) => x.n === n) : pick?.n === n} onPress={() => (multi ? toggle(f) : (setPick(f), setPortion(1)))} />; })}
                </Row>
              </View>
            )}
            <Card style={{ paddingVertical: 4, paddingHorizontal: 10 }}>
              {res.map((f, i) => foodRow(f, i === res.length - 1))}
              {res.length === 0 && (
                <View style={{ paddingVertical: 16, paddingHorizontal: 6, gap: 10, alignItems: 'flex-start' }}>
                  <Txt muted style={{ fontSize: fontSizes.md }}>Nothing called "{q}" in the catalogue.</Txt>
                  <PillBtn tone="soft" h={40} label="Write it in instead" onPress={toWrite} />
                </View>
              )}
            </Card>
          </>
        )}

        {mode === 'write' && (
          <FadeIn>
            <Card style={{ padding: 16, gap: 12 }}>
              <View style={{ gap: 6 }}>
                <Txt v="label">What was it?</Txt>
                <Field accessibilityLabel="What was it" value={wName} onChangeText={setWName} placeholder="e.g. Mom's pav bhaji, 2 pav" />
              </View>
              <View style={{ gap: 6 }}>
                <Txt v="label">Type</Txt>
                <View accessibilityRole="radiogroup" accessibilityLabel="Food type" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {(['veg', 'egg', 'nv'] as FoodType[]).map((t) => (
                    <Pressy key={t} accessibilityRole="radio" accessibilityState={{ selected: wType === t }} accessibilityLabel={foodTypeLabel(t)} onPress={() => setWType(t)}
                      style={{ flex: 1, height: 44, borderRadius: radii.lg, borderWidth: 1, borderColor: wType === t ? c.ink : c.surface3, backgroundColor: wType === t ? c.ink : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <FoodMark type={t} />
                      <Txt style={{ fontFamily: font.medium, fontSize: fontSizes.md, color: wType === t ? c.bg : c.ink }}>{foodTypeLabel(t)}</Txt>
                    </Pressy>
                  ))}
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <Txt v="label">Know the numbers? <Txt v="label" style={{ fontFamily: font.regular }}>Optional</Txt></Txt>
                <Row style={{ gap: 8 }}>
                  <NumField label="Calories" unit="kcal" value={wK} onChange={setWK} ph={`≈ ${estK}`} />
                  <NumField label="Protein in grams" unit="g protein" value={wP} onChange={setWP} ph={`≈ ${estP}`} />
                </Row>
              </View>
              <Txt v="caption">{wn ? (guess ? `Leave blank and we use ${guess.n.split(',')[0].toLowerCase()} as a guide. Coach Vikram sees it as written by you.` : 'Leave blank and we estimate from a typical meal. Coach Vikram sees it as written by you.') : 'Blank numbers are estimated. You can fix them later.'}</Txt>
              <Pressy accessibilityRole="checkbox" accessibilityState={{ checked: wSave }} accessibilityLabel="Save to my foods so I can search it next time" onPress={() => setWSave((v) => !v)} scaleTo={0.99}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}>
                <View pointerEvents="none"><CheckCircle on={wSave} size={28} tone="good" label="Save to my foods" /></View>
                <Txt style={{ fontSize: fontSizes.md, flex: 1 }}>Save to my foods so I can search it next time</Txt>
              </Pressy>
            </Card>
          </FadeIn>
        )}

        {mode === 'scan' && (!camOk ? (
          <FadeIn>
            <Card style={{ paddingVertical: 22, paddingHorizontal: 18, gap: 10, alignItems: 'center' }}>
              <View style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><CameraOff size={26} color={c.ink} /></View>
              <Txt style={{ fontFamily: font.semibold }}>Camera access is off</Txt>
              <Txt muted style={{ fontSize: fontSizes.md, textAlign: 'center' }}>Allow the camera to take a photo of your plate. Photos are only used to guess the food and are not saved.</Txt>
              <Button label="Allow camera" onPress={() => { setP({ camOk: true }); toast('Camera allowed'); }} style={{ alignSelf: 'stretch' }} />
              <Button kind="outline" label="Write it in instead" onPress={toWrite} style={{ alignSelf: 'stretch', height: 48 }} />
            </Card>
          </FadeIn>
        ) : (
          <>
            <View accessibilityLiveRegion="polite" accessibilityLabel={cap} style={{ height: 250, borderRadius: radii.xl, overflow: 'hidden', backgroundColor: fixed.dark }}>
              <Svg width="100%" height="100%" viewBox="0 0 358 250" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', opacity: scan === 'idle' ? 0.55 : 1 }}>
                <Ellipse cx={179} cy={132} rx={118} ry={84} fill="#E9E4DA" /><Ellipse cx={179} cy={132} rx={96} ry={66} fill="#F7F3EC" />
                <Circle cx={146} cy={120} r={30} fill="#8C3B2A" /><Circle cx={140} cy={113} r={4} fill="#B5543C" /><Circle cx={154} cy={126} r={3} fill="#B5543C" />
                <Ellipse cx={212} cy={122} rx={34} ry={24} fill="#FFFDF6" /><Circle cx={186} cy={164} r={22} fill="#D9A45A" />
              </Svg>
              <ScanBracket pos="tl" size="large" /><ScanBracket pos="tr" size="large" /><ScanBracket pos="bl" size="large" /><ScanBracket pos="br" size="large" />
              {scan === 'busy' && <ScanBeam />}
              <Txt style={{ position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily: font.medium, fontSize: fontSizes.sm, color: fixed.white, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 }}>{cap}</Txt>
            </View>
            {scan === 'fail' && (
              <FadeIn style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: c.warnSoft, gap: 8 }}>
                <Txt style={{ fontSize: fontSizes.md, color: c.warn }}><Txt style={{ fontFamily: font.semibold, fontSize: fontSizes.md, color: c.warn }}>Couldn't read that.</Txt> Too dark or too close. Try the whole plate in good light.</Txt>
                <Row style={{ gap: 8 }}>
                  <PillBtn tone="soft" h={40} label="Try again" onPress={goScan} />
                  <PillBtn tone="soft" h={40} label="Search instead" onPress={toSearch} />
                </Row>
              </FadeIn>
            )}
            {scan === 'done' && (
              <FadeIn>
                <Card style={{ paddingVertical: 14, paddingHorizontal: 16, gap: 6 }}>
                  <Txt v="label">Looks like</Txt>
                  <Row style={{ gap: 8 }}><FoodMark type={SCAN_PHOTO.type} /><Txt style={{ fontFamily: font.semibold, fontSize: 16 }}>{SCAN_PHOTO.n}</Txt></Row>
                  <Txt v="mono" muted>{SCAN_PHOTO.k} kcal · {macroLine(SCAN_PHOTO)}</Txt>
                  <Txt v="caption">A guess from the photo. Change the portion below, or{' '}
                    <Txt v="caption" accessibilityRole="link" onPress={toSearch} style={{ fontFamily: font.semibold, color: c.accentText }}>search for the exact dish</Txt>.
                  </Txt>
                </Card>
              </FadeIn>
            )}
            {(scan === 'idle' || scan === 'done') && <Button kind="secondary" label={scan === 'done' ? 'Scan again' : 'Take photo'} onPress={goScan} style={{ height: 52 }} />}
          </>
        ))}

        {!!cur && (
          <FadeIn style={{ gap: 12 }}>
            <View accessibilityLiveRegion="polite" style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, backgroundColor: c.surface2 }}>
              <Txt v="mono" style={{ fontSize: fontSizes.md }}>{diff}</Txt>
            </View>
            <View accessibilityRole="radiogroup" accessibilityLabel="Portion" style={{ flexDirection: 'row', gap: 8 }}>
              {([['Less', 0.5], ['As shown', 1], ['More', 1.5]] as const).map(([l, v]) => <Pill key={l} label={l} on={portion === v} onPress={() => setPortion(v)} style={{ flex: 1 }} />)}
            </View>
          </FadeIn>
        )}
      </ScrollView>
      {/* the log button stays in view at the bottom while the list scrolls */}
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>
        <Button label={logL} disabled={!cur} onPress={log} />
      </View>
    </View>
  );
}
