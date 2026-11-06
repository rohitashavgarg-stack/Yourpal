import React, { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View, type ScrollViewInstance } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUp, Camera, Library, Mic, X } from '@/lib/icons';
import { Field, Pressy, Row, Txt } from '@/components/ui';
import { Button, IconButton } from '@/design-system/primitives/Button';
import { FadeIn } from '@/design-system/primitives/FadeIn';
import { useOverlay } from '@/components/Overlay';
import { KCAL_TARGET, MealId, parseFood, Parsed, SCAN_RESULT } from '@/lib/data';
import { mealLog, totals, useDomain } from '@/lib/domain';
import { useLeaveIfPaused } from '@/lib/logGate';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { fixed, fontSizes, radii, round } from '@/design-system/tokens';
import { mealById } from '@/features/today/meals';

type NewMsg =
  | { from: 'me'; text?: string; photo?: string }
  | { from: 'bot'; text: string }
  | { from: 'bot'; logged: { items: Parsed[]; kcal: number; meal: string; undone: boolean; prev: unknown; left: number } };
type Msg = NewMsg & { id: number };

// "Ate something else" as a full page that works like a chat: the member types or sends a photo, and the reply says what was logged.
export default function LogChat() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { toast } = useOverlay();
  useLeaveIfPaused();
  const p = useLocalSearchParams<{ mealId?: MealId; text?: string; photo?: string }>();
  const mealId = (p.mealId ?? 'sn') as MealId;
  const meal = mealById(mealId);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: 'bot', text: 'Tell me what you ate. Type it, or send a photo of your plate.' }]);
  const [text, setText] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);
  const idRef = useRef(1);
  const started = useRef(false);
  const dRef = useRef(d);
  useEffect(() => { dRef.current = d; });
  const add = (m: NewMsg) => setMsgs((l) => [...l, { ...m, id: idRef.current++ }]);

  // add the foods to this meal and say what happened
  const logItems = (items: Parsed[]) => {
    const cur = dRef.current;
    const prev = cur.meals;
    const log = mealLog(cur, mealId);
    const at = log.at ?? cur.min;
    set({ meals: { ...cur.meals, [mealId]: { ...log, extra: [...log.extra, ...items.map((x) => ({ n: x.n, k: x.k, p: x.p, est: x.est, type: 'veg' as const }))], at, skip: false } }, openMeal: mealId });
    const kcal = items.reduce((a, x) => a + x.k, 0);
    haptic.success();
    add({ from: 'bot', logged: { items, kcal, meal: meal.n.toLowerCase(), undone: false, prev, left: Math.max(0, KCAL_TARGET - (totals(cur).k + kcal)) } });
  };

  const send = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    setText('');
    add({ from: 'me', text: t });
    const items = parseFood(t);
    setTimeout(() => {
      if (!items.length) { haptic.error(); add({ from: 'bot', text: "I couldn't find a food in that. Try 2 roti, 1 cup milk or 100 g paneer." }); return; }
      logItems(items);
    }, 450);
  };

  const sendPhoto = (uri: string) => {
    add({ from: 'me', photo: uri === 'plate' ? undefined : uri, text: uri === 'plate' ? 'A photo of my plate' : undefined });
    add({ from: 'bot', text: 'Looking at your plate…' });
    setTimeout(() => {
      setMsgs((l) => l.filter((m) => !('text' in m && m.from === 'bot' && m.text === 'Looking at your plate…')));
      if (dRef.current.scanFails) { haptic.error(); add({ from: 'bot', text: "I couldn't read that. Too dark or too close. Try the whole plate in good light, or type it." }); return; }
      logItems(SCAN_RESULT);
    }, 1500);
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t = setTimeout(() => { if (p.photo) sendPhoto(String(p.photo)); else if (p.text) send(String(p.text)); }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60); }, [msgs.length]);

  const undo = (id: number) => {
    setMsgs((l) => l.map((m) => {
      if (m.id !== id || !('logged' in m)) return m;
      set({ meals: m.logged.prev as typeof d.meals });
      haptic.tick();
      return { ...m, logged: { ...m.logged, undone: true } };
    }));
  };
  const pickPhoto = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
      if (!r.canceled && r.assets?.[0]?.uri) sendPhoto(r.assets[0].uri);
    } catch { toast('Could not open your photos'); }
  };
  const library = () => router.push({ pathname: '/food-library', params: { mealId } });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      {/* no heading: only the cross, top right */}
      <Row style={{ justifyContent: 'flex-end', paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 4 }}>
        <IconButton label="Close" onPress={() => router.back()} glass><X size={20} color={c.ink} /></IconButton>
      </Row>
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
        {msgs.map((m) => (
          <FadeIn key={m.id} style={{ alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: m.from === 'me' ? '80%' : '90%' }}>
            {m.from === 'me' ? (
              <View style={{ backgroundColor: c.accent, borderRadius: radii.lg, borderBottomRightRadius: radii.xs, padding: m.photo ? 4 : 12, paddingHorizontal: m.photo ? 4 : 14 }}>
                {m.photo ? <Image source={{ uri: m.photo }} accessibilityIgnoresInvertColors style={{ width: 200, height: 150, borderRadius: radii.md }} /> : <Txt style={{ color: c.accentInk }}>{m.text}</Txt>}
              </View>
            ) : 'logged' in m ? (
              <View style={{ backgroundColor: c.cardLift, borderRadius: radii.lg, borderBottomLeftRadius: radii.xs, padding: 14, gap: 10, opacity: m.logged.undone ? 0.6 : 1 }}>
                <Txt style={{ fontFamily: font.semibold }}>{m.logged.undone ? 'Undone. Nothing was added.' : `Logged to ${m.logged.meal}, ${m.logged.kcal} kcal`}</Txt>
                <View style={{ backgroundColor: c.surface2, borderRadius: radii.md, paddingHorizontal: 12 }}>
                  {m.logged.items.map((it, i) => (
                    <Row key={i} style={{ justifyContent: 'space-between', minHeight: 44, borderBottomWidth: i < m.logged.items.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                      <Txt style={{ flex: 1, fontFamily: font.medium }}>{it.n}</Txt>
                      <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19 }}>{`${it.k} kcal${it.est ? ', estimated' : ''}`}</Txt>
                    </Row>
                  ))}
                </View>
                {!m.logged.undone && (
                  <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Txt muted style={{ fontSize: fontSizes.sm, lineHeight: 19, flex: 1 }}>{`You have ${m.logged.left} kcal left today. Coach Vikram sees what changed.`}</Txt>
                    <Button kind="secondary" small label="Undo" onPress={() => undo(m.id)} />
                  </Row>
                )}
              </View>
            ) : (
              <View style={{ backgroundColor: c.cardLift, borderRadius: radii.lg, borderBottomLeftRadius: radii.xs, padding: 12, paddingHorizontal: 14 }}>
                <Txt>{m.text}</Txt>
              </View>
            )}
          </FadeIn>
        ))}
      </ScrollView>
      {/* the library on the left; the camera and the mic sit inside the typing box, with no container of their own */}
      <Row style={{ gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12) }}>
        <IconButton label="Open the food library" onPress={library} size={56} radius={round(56)} bg={c.cardLift} edge><Library size={22} color={c.ink} /></IconButton>
        <View style={{ flex: 1 }}>
          <Field accessibilityLabel="Describe what to log" value={text} onChangeText={setText} placeholder="Anything else?" returnKeyType="send" autoFocus onSubmitEditing={() => send(text)}
            leading={<Pressy accessibilityRole="button" accessibilityLabel="Choose a photo" onPress={pickPhoto} hitSlop={8}><Camera size={22} color={c.muted} /></Pressy>}
            trailing={text.trim()
              ? <Pressy accessibilityRole="button" accessibilityLabel="Send" onPress={() => send(text)} hitSlop={8} style={{ width: 34, height: 34, borderRadius: round(34), backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}><ArrowUp size={18} color={fixed.white} /></Pressy>
              : <Pressy accessibilityRole="button" accessibilityLabel="Dictate" onPress={() => toast('Tap the microphone on your keyboard to speak')} hitSlop={8}><Mic size={22} color={c.muted} /></Pressy>} />
        </View>
      </Row>
    </KeyboardAvoidingView>
  );
}
