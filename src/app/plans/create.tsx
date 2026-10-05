import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { X } from '@/lib/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Field, Pill, Pressy, Row, Txt } from '@/components/ui';
import { useOverlay } from '@/components/Overlay';
import { useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { newEx } from '@/features/plans/content';
import { LibrarySheet } from '@/features/plans/Sheets';
import { PageHeader, ShakeText } from '@/features/plans/parts';
import { DAYL, dayPlan, exSub, PEx, setP, usePlans } from '@/features/plans/store';

export default function CreateWorkout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { d } = useDomain();
  const { p } = usePlans();
  const { openSheet, toast } = useOverlay();
  const [tries, setTries] = useState(0);

  const err = (m: string) => { setP({ cErr: m }); setTries((t) => t + 1); };
  const save = () => {
    const name = p.cName.trim();
    if (!name) return err('Give your workout a name.');
    if (!p.cEx.length) return err('Add at least one exercise.');
    const taken = dayPlan(d, p, p.cDay);
    if (taken && !p.created[p.cDay]) return err(`${DAYL[p.cDay]} already has ${taken.name}. Pick a free day.`);
    setP({ created: { ...p.created, [p.cDay]: { name, ex: p.cEx } }, day: p.cDay, week: 0, seg: 'workout', cErr: '' });
    router.back();
    toast(d.offline ? 'Saved on this phone · Coach Vikram is notified when you are online' : 'Added to your plan · Coach Vikram notified');
  };

  useScenarios({
    title: 'Create a workout',
    rows: [{ label: 'Day', options: DAYL, value: DAYL[p.cDay], onPick: (v) => setP({ cDay: DAYL.indexOf(v) }) }],
    actions: [
      { label: 'Fill a sample workout', run: () => setP({ cName: 'Arms + core', cErr: '', cEx: [newEx('Bicep curl', 'created'), newEx('Tricep pushdown', 'created'), newEx('Plank', 'created')] as PEx[] }) },
      { label: 'Try to save empty (errors)', run: () => { setP({ cName: '', cEx: [] }); err('Give your workout a name.'); } },
      { label: 'Pick a day that already has a workout', run: () => setP({ cDay: 0 }) },
    ],
  }, [p.cDay]);

  const nameErr = !!p.cErr && !p.cName.trim();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title="New workout" icon="close" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 28, gap: 14 }}>
        <View style={{ gap: 6 }}>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>Name</Txt>
          <Field accessibilityLabel="Workout name" value={p.cName} error={nameErr} onChangeText={(t) => setP({ cName: t, cErr: '' })} placeholder="e.g. Arms + core" returnKeyType="done" />
        </View>
        <View style={{ gap: 6 }}>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>Day</Txt>
          <Row style={{ gap: 6, flexWrap: 'wrap' }}>
            {DAYL.map((l, i) => {
              const has = dayPlan(d, p, i);
              return <Pill key={l} label={l} on={p.cDay === i} onPress={() => setP({ cDay: i, cErr: '' })} style={{ paddingHorizontal: 13, opacity: has && !p.created[i] && p.cDay !== i ? 0.55 : 1 }} />;
            })}
          </Row>
          <Txt v="caption" style={{ paddingHorizontal: 6 }}>Faded days already have a workout from Coach Vikram.</Txt>
        </View>
        <View style={{ gap: 6 }}>
          <Txt v="label" style={{ paddingHorizontal: 6 }}>Exercises</Txt>
          <Card style={{ paddingVertical: 4, paddingHorizontal: 14 }}>
            {p.cEx.map((e, i) => (
              <Row key={e.id} style={{ minHeight: 56, gap: 10, borderBottomWidth: i < p.cEx.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                <Txt style={{ flex: 1, fontFamily: font.medium }}>{e.name}</Txt>
                <Txt v="mono" muted style={{ fontSize: 12 }}>{exSub(e)}</Txt>
                <Pressy accessibilityRole="button" accessibilityLabel={`Remove ${e.name}`} onPress={() => setP({ cEx: p.cEx.filter((x) => x.id !== e.id) })}
                  style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} color={c.muted} />
                </Pressy>
              </Row>
            ))}
            {p.cEx.length === 0 && <Txt muted style={{ paddingVertical: 16, fontSize: 14 }}>No exercises yet</Txt>}
          </Card>
        </View>
        <Pressy accessibilityRole="button" onPress={() => openSheet(<LibrarySheet mode="create" />, { label: 'Add exercise' })}
          style={{ height: 48, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: c.chipLine, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontFamily: font.medium, fontSize: 14 }}>+ Add exercise</Txt>
        </Pressy>
        <ShakeText text={p.cErr} n={tries} />
        <Txt muted style={{ fontSize: 13, paddingHorizontal: 6 }}>Added to your plan · Coach Vikram will be notified</Txt>
        <Button label="Save workout" onPress={save} />
      </ScrollView>
    </View>
  );
}
