import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, MessageCircle, Search, X } from '@/lib/icons';
import { Button, Field, Pill, Pressy, Row, Txt } from '@/components/ui';
import { RoundBtn, Tag } from '@/components/bits';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { LIBRARY } from '@/lib/data';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { askCoach } from '@/features/coach/coach';
import { ExTile } from '@/features/plans/parts';
import { useSessionActions } from '@/features/workout/actions';

const GROUPS = ['All', ...Array.from(new Set(LIBRARY.map((x) => x.g)))];

// Search every exercise and swap the current one for it. Opens from the bottom, like the other X-close pages.
export default function ExerciseSearch() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d } = useDomain();
  const A = useSessionActions();
  const { toast } = useOverlay();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All');
  const [plan, setPlan] = useState(false);
  const s = d.session;

  useScenarios({
    title: 'Exercise search',
    rows: [{ label: 'Query', options: ['Empty', 'Squat', 'No match'], value: q === '' ? 'Empty' : q === 'squat' ? 'Squat' : 'No match', onPick: (v) => setQ(v === 'Empty' ? '' : v === 'Squat' ? 'squat' : 'zzzz') }],
  }, [q]);

  const current = s?.ex[s.exIdx]?.name;
  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return LIBRARY.filter((x) => x.n !== current && (group === 'All' || x.g === group) && (!qq || x.n.toLowerCase().includes(qq) || x.g.toLowerCase().includes(qq)));
  }, [q, group, current]);

  if (!s) return <Redirect href="/(tabs)" />;
  const close = () => { if (router.canGoBack()) router.back(); else router.replace('/workout'); };
  const pick = (name: string) => {
    A.swap(s.exIdx, name, plan);
    haptic.success();
    close();
    toast(plan ? `Swapped to ${name} · Coach Vikram will be notified` : `Swapped to ${name} for today`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Row style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}>
        <RoundBtn label="Close" onPress={close} glass><X size={20} color={c.ink} /></RoundBtn>
        <Txt accessibilityRole="header" style={{ flex: 1, textAlign: 'center', fontFamily: font.semibold, fontSize: 17, marginRight: 44 }}>Swap {current?.toLowerCase()}</Txt>
      </Row>

      <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
        <Field value={q} onChangeText={setQ} autoFocus placeholder="Search exercises or muscles" accessibilityLabel="Search exercises" returnKeyType="search" autoCapitalize="none" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>
          {GROUPS.map((g) => <Pill key={g} label={g} on={group === g} onPress={() => setGroup(g)} />)}
        </ScrollView>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 120, gap: 8 }}>
        {list.map((x) => (
          <Pressy key={x.n} accessibilityRole="button" accessibilityLabel={`${x.n}, ${x.g}. Swap`} onPress={() => pick(x.n)} scaleTo={0.985}
            style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, borderRadius: 20, backgroundColor: c.surface }}>
            <ExTile name={x.n} size={48} />
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold }}>{x.n}</Txt>
              <Txt v="caption">{x.g}</Txt>
            </View>
            <ChevronRight size={18} color={c.muted} />
          </Pressy>
        ))}
        {list.length === 0 && (
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 36 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}><Search size={24} color={c.muted} /></View>
            <Txt style={{ fontFamily: font.semibold, textAlign: 'center' }}>No exercise matches “{q.trim()}”</Txt>
            <Txt muted style={{ textAlign: 'center', fontSize: 14 }}>Try a muscle like chest or legs, or ask Coach Vikram to add it.</Txt>
            <Button kind="secondary" small label="Ask Coach Vikram" icon={<MessageCircle size={16} color={c.ink} />} onPress={() => askCoach('Exercise request', `Can you add ${q.trim()} to my plan? `)} />
          </View>
        )}
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12) + 6, gap: 8, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>
        <Row style={{ gap: 8 }}>
          <Pill label="Today only" on={!plan} onPress={() => setPlan(false)} style={{ flex: 1 }} />
          <Pill label="Also update my plan" on={plan} onPress={() => setPlan(true)} style={{ flex: 1 }} />
        </Row>
        <Tag label={plan ? 'Coach Vikram will be notified' : 'Only for this workout'} bg={c.surface2} fg={c.muted} style={{ alignSelf: 'center' }} />
      </View>
    </View>
  );
}
