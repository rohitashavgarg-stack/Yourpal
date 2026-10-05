import React, { useEffect, useState } from 'react';
import { PersonAvatar } from '@/components/Brand';
import { ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { fade } from '@/theme/motion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChefHat, ChevronDown, Flame, Info, Leaf, MessageCircle, X } from '@/lib/icons';
import { Button, Card, Chip, Pressy, Row, Txt } from '@/components/ui';
import { FoodMark, foodTypeLabel, RoundBtn } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { FOOD_DB, FoodType, KCAL_TARGET, MACRO_TARGET, MealId } from '@/lib/data';
import { mealLog, useDomain, useMeals } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font, spring } from '@/theme/tokens';
import { mealById } from '@/features/today/meals';
import { QuickLogSheet } from '@/features/today/QuickLogSheet';
import { askCoach } from '@/features/coach/coach';

export default function FoodDetail() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { patch, toggleItem } = useMeals();
  const { openSheet, toast } = useOverlay();
  const p = useLocalSearchParams<{ mid: MealId; k: string; extra: string }>();
  const [micro, setMicro] = useState(false);
  const rot = useSharedValue(0);
  useEffect(() => { rot.value = withSpring(micro ? 180 : 0, spring.snappy); }, [micro]);
  const chev = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));

  useScenarios({
    title: 'Food detail',
    rows: [{ label: 'Micronutrients', options: ['Collapsed', 'Expanded'], value: micro ? 'Expanded' : 'Collapsed', onPick: (v) => setMicro(v === 'Expanded') }],
    actions: [{ label: 'Close food page', run: () => router.back() }],
  }, [micro]);

  const mid = (p.mid ?? 'bf') as MealId;
  const k = Number(p.k ?? 0);
  const extra = p.extra === '1';
  const meal = mealById(mid);
  const x = mealLog(d, mid);
  let fd: { n: string; k: number; p: number; serve: string; est: boolean; type: FoodType; eaten: boolean; repl: boolean; planned?: string } | null = null;
  if (extra) { const e = x.extra[k]; if (e) fd = { n: e.n, k: e.k, p: e.p, serve: 'As logged', est: !!e.est, type: e.type ?? 'veg', eaten: true, repl: false }; }
  else if (meal?.items[k]) {
    const base = meal.items[k], r = x.repl[k];
    fd = r ? { n: r.n, k: r.k, p: r.p, serve: 'As logged', est: !!r.est, type: 'veg', eaten: x.eaten.includes(k), repl: true, planned: base.n }
      : { n: base.n, k: base.k, p: base.p, serve: base.q, est: false, type: base.type, eaten: x.eaten.includes(k), repl: false };
  }
  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  if (!fd) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12, paddingHorizontal: 16, gap: 16 }}>
        <RoundBtn label="Close" onPress={close} glass><X size={20} color={c.ink} /></RoundBtn>
        <Txt v="title">This item is no longer in your log</Txt>
        <Txt muted>It may have been removed or undone.</Txt>
      </View>
    );
  }
  const db = !extra && !fd.repl ? FOOD_DB[fd.n] : undefined;
  const carbs = db ? db.c : Math.round((fd.k * 0.5) / 4), fat = db ? db.f : Math.round((fd.k * 0.3) / 9);
  const macros = [
    { l: 'Protein', v: fd.p, w: fd.p / MACRO_TARGET.p, col: c.accent },
    { l: 'Carbs', v: carbs, w: carbs / MACRO_TARGET.c, col: c.cNutri },
    { l: 'Fat', v: fat, w: fat / MACRO_TARGET.f, col: c.cFat },
  ];
  const micros = db ? db.mic : ([['Fibre', '~3 g', 10], ['Sodium', '~400 mg', 17], ['Iron', '~2 mg', 11]] as [string, string, number][]);
  const desc = db ? db.d : fd.repl ? `Logged instead of ${fd.planned!.toLowerCase()}. Numbers are estimated from what you entered.` : 'Added by you. Numbers are estimated from what you entered.';

  const alt = () => {
    const prev = d.meals;
    close();
    if (extra) { patch(mid, { extra: x.extra.filter((_, i) => i !== k) }); toast(`Removed ${fd!.n}`, { undo: () => set({ meals: prev }) }); }
    else if (fd!.repl) { const rp = { ...x.repl }; delete rp[k]; patch(mid, { repl: rp }); toast(`Back to ${fd!.planned!.toLowerCase()}`, { undo: () => set({ meals: prev }) }); }
    else setTimeout(() => openSheet(<QuickLogSheet mealId={mid} mode="sugg" replaceIdx={k} />, { label: 'Swap item' }), 250);
  };
  const main = () => { close(); if (!extra) toggleItem(mid, k); };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <LinearGradient colors={[c.tNutri, c.bg]} style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 22 }}>
          <RoundBtn label="Close" onPress={close} glass><X size={20} color={c.ink} /></RoundBtn>
          <View style={[{ marginTop: 14, marginBottom: 12, width: 96, height: 96, borderRadius: 48, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
            !isDark && { shadowColor: '#101828', shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } }]}>
            <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: c.tNutri, alignItems: 'center', justifyContent: 'center' }}><ChefHat size={30} strokeWidth={1.7} color={c.cNutri} /></View>
          </View>
          <Txt accessibilityRole="header" style={{ fontFamily: font.regular, fontSize: 34, letterSpacing: -1.4, lineHeight: 38 }}>{fd.n}</Txt>
          <Txt muted style={{ marginTop: 6, fontSize: 14, lineHeight: 20 }}>{desc}</Txt>
          <Row style={{ gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {[['Serving', fd.serve], ['Type', foodTypeLabel(fd.type)], ['Meal', meal.n]].map(([l, v]) => (
              <View key={l} style={{ gap: 2, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line }}>
                <Txt style={{ fontSize: 11, color: c.muted }}>{l}</Txt>
                <Row style={{ gap: 6 }}>{l === 'Type' && <FoodMark type={fd!.type} size={13} />}<Txt style={{ fontFamily: font.semibold, fontSize: 14 }}>{v}</Txt></Row>
              </View>
            ))}
          </Row>
          <Pressy accessibilityRole="button" onPress={() => askCoach(fd!.n, `Is ${fd!.n.toLowerCase()} right for my plan? `)} scaleTo={0.96} style={{ alignSelf: 'flex-start', marginTop: 12, height: 40, paddingHorizontal: 14, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PersonAvatar who="coach" size={22} /><Txt style={{ fontFamily: font.medium, fontSize: 13, color: c.ink }}>Ask Coach about this</Txt>
          </Pressy>
          {(fd.est || !db) && <Chip tone="warn" label="Estimated · numbers are approximate" icon={<Info size={12} color={c.warn} />} style={{ marginTop: 12 }} />}
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <Txt style={{ fontFamily: font.semibold, paddingHorizontal: 4, paddingTop: 4 }}>Nutrition</Txt>
          <Card style={{ padding: 18, gap: 14 }}>
            <Row style={{ gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.tAct, alignItems: 'center', justifyContent: 'center' }}><Flame size={20} color={c.cAct} /></View>
              <Txt style={{ fontFamily: font.display, fontSize: 32, lineHeight: 34 }}>{fd.k}</Txt><Txt muted>kcal</Txt>
              <View style={{ flex: 1 }} />
              <Txt v="caption" style={{ textAlign: 'right' }}>{Math.round((fd.k / KCAL_TARGET) * 100)}% of your{'\n'}daily 1,800</Txt>
            </Row>
            <Row style={{ gap: 8 }}>
              {macros.map((m) => (
                <View key={m.l} style={{ flex: 1, borderWidth: 1, borderColor: c.line, borderRadius: 18, padding: 12, gap: 6 }}>
                  <Txt v="caption">{m.l}</Txt>
                  <Txt style={{ fontFamily: font.display, fontSize: 22, lineHeight: 24 }}>{m.v}<Txt muted style={{ fontFamily: font.display, fontSize: 12 }}> g</Txt></Txt>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: c.surface2, overflow: 'hidden' }}><View style={{ height: '100%', width: `${Math.min(100, Math.round(m.w * 100))}%`, backgroundColor: m.col, borderRadius: 2 }} /></View>
                </View>
              ))}
            </Row>
            <Pressy accessibilityRole="button" accessibilityState={{ expanded: micro }} onPress={() => setMicro((v) => !v)} scaleTo={0.985}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.surface2, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14 }}>
              <Leaf size={20} color={c.cNutri} />
              <View style={{ flex: 1 }}><Txt style={{ fontFamily: font.semibold }}>Micronutrients</Txt><Txt v="caption">Fibre, vitamins and minerals</Txt></View>
              <Animated.View style={chev}><ChevronDown size={18} color={c.muted} /></Animated.View>
            </Pressy>
            {micro && (
              <Animated.View entering={fade()} style={{ gap: 10, paddingHorizontal: 4 }}>
                {micros.map(([l, v, pct]) => (
                  <View key={l} style={{ gap: 5 }}>
                    <Row style={{ justifyContent: 'space-between' }}><Txt style={{ fontSize: 13 }}>{l}</Txt><Txt v="mono" muted style={{ fontSize: 13 }}>{v} · {pct}%</Txt></Row>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: c.surface2, overflow: 'hidden' }}><View style={{ height: '100%', width: `${Math.min(100, pct)}%`, backgroundColor: c.cNutri, borderRadius: 2 }} /></View>
                  </View>
                ))}
                <Txt style={{ fontSize: 11, color: c.muted }}>% of daily value for an adult. A guide, not medical advice.</Txt>
              </Animated.View>
            )}
          </Card>

          {db && (
            <>
              <Txt style={{ fontFamily: font.semibold, paddingHorizontal: 4, paddingTop: 6 }}>Ingredients</Txt>
              <Card style={{ paddingVertical: 4, paddingHorizontal: 16 }}>
                {db.ing.map(([n, q, kc], i) => (
                  <Row key={n} style={{ gap: 10, minHeight: 58, borderBottomWidth: i < db.ing.length - 1 ? 1 : 0, borderBottomColor: c.line, borderStyle: 'dashed' }}>
                    <View style={{ flex: 1 }}><Txt style={{ fontFamily: font.medium }}>{n}</Txt><Txt v="mono" muted style={{ fontSize: 12 }}>{kc} kcal</Txt></View>
                    <Chip label={q} />
                  </Row>
                ))}
              </Card>
              <Row style={{ justifyContent: 'space-between', paddingHorizontal: 4, paddingTop: 6 }}>
                <Txt style={{ fontFamily: font.semibold }}>Recipe</Txt><Txt v="caption">{db.t}</Txt>
              </Row>
              <Card style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                {db.st.map((t, i) => (
                  <Row key={i} style={{ gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.line, alignItems: 'flex-start' }}>
                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Txt v="mono" style={{ fontSize: 12 }}>{i + 1}</Txt></View>
                    <Txt style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>{t}</Txt>
                  </Row>
                ))}
                <Row style={{ gap: 10, paddingTop: 12, paddingBottom: 8, alignItems: 'flex-start' }}>
                  <MessageCircle size={16} color={c.accentText} />
                  <Txt muted style={{ flex: 1, fontSize: 13 }}>Coach tip: {db.tip}</Txt>
                </Row>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
      <LinearGradient colors={[isDark ? 'rgba(14,17,22,0)' : 'rgba(245,247,250,0)', c.bg]} locations={[0, 0.3]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 16) + 10, flexDirection: 'row', gap: 8 }}>
        <Button kind="secondary" label={extra ? 'Remove' : fd.repl ? 'Back to planned' : 'Swap'} onPress={alt} style={{ flex: 1, height: 54 }} />
        <Button label={extra ? 'Done' : fd.eaten ? 'Mark as not eaten' : 'Mark as eaten'} onPress={main} style={{ flex: 1.3, height: 54 }} />
      </LinearGradient>
    </View>
  );
}
