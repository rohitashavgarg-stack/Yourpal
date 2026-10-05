import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { MessageCircle, Pause, Play } from '@/lib/icons';
import { askCoach } from '@/features/coach/coach';
import { Button, Card, Pressy, Row, Txt } from '@/components/ui';
import { useDomain } from '@/lib/domain';
import { useScenarios } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { histFor, tipFor } from '@/features/plans/content';
import { ExTile, PageHeader } from '@/features/plans/parts';
import { artIdFor, ExerciseArt, hasPhoto } from '@/features/workout/ExerciseArt';

function PlayBar({ dark }: { dark?: boolean }) {
  const w = useSharedValue(0);
  useEffect(() => { w.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false); return () => cancelAnimation(w); }, []);
  const a = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ position: 'absolute', left: 14, right: 14, bottom: 12, height: 4, borderRadius: 2, backgroundColor: dark ? 'rgba(11,11,13,0.15)' : 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
      <Animated.View style={[{ height: '100%', backgroundColor: dark ? '#0B0B0D' : '#fff' }, a]} />
    </View>
  );
}

export default function ExerciseDetail() {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { d, set } = useDomain();
  const { name = 'Exercise', sub } = useLocalSearchParams<{ name?: string; sub?: string }>();
  const artId = artIdFor(name);
  const lightBg = artId && hasPhoto(artId) && isDark ? '#F4F6FA' : c.surface;
  const [playing, setPlaying] = useState(false);

  useScenarios({
    title: 'Exercise',
    rows: [
      { label: 'Form video', options: ['Paused', 'Playing'], value: playing ? 'Playing' : 'Paused', onPick: (v) => setPlaying(v === 'Playing') },
      { label: 'Connection', options: ['Online', 'Offline'], value: d.offline ? 'Offline' : 'Online', onPick: (v) => set({ offline: v === 'Offline' }) },
    ],
  }, [playing, d.offline]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title={name} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: insets.bottom + 28, gap: 12 }}>
        <View style={{ height: artId ? 250 : 210, borderRadius: 26, overflow: 'hidden', backgroundColor: artId ? lightBg : undefined }}>
          {artId ? (
            <View pointerEvents="none" style={{ position: 'absolute', top: 44, left: 12, right: 12, bottom: 18 }}>
              <ExerciseArt id={artId} fill />
            </View>
          ) : (<>
          <LinearGradient colors={[c.heroFrom, c.heroMid, c.heroTo]} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
          <Svg width="100%" height="100%" viewBox="0 0 358 210" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute' }}>
            <Path d="M0 170 C 90 130 180 200 260 160 S 340 150 400 170 V 900 H0z" fill="#FFFFFF" opacity={0.08} />
            <Circle cx={270} cy={40} r={150} fill="#FFFFFF" opacity={0.1} />
            <Circle cx={270} cy={40} r={90} fill="#FFFFFF" opacity={0.14} />
          </Svg>
          </>)}
          <View style={{ position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: artId ? 'rgba(11,11,13,0.72)' : 'rgba(255,255,255,0.14)' }}>
            <Txt style={{ fontFamily: font.medium, fontSize: 12, color: '#fff' }}>{d.offline ? 'Downloaded · plays offline' : 'Licensed form video'}</Txt>
          </View>
          <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Pressy accessibilityRole="button" accessibilityLabel={playing ? 'Pause video' : 'Play form video'} onPress={() => setPlaying((v) => !v)} scaleTo={0.92}
              style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: artId ? 'rgba(11,11,13,0.72)' : 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
              {playing ? <Pause size={22} color={artId ? '#fff' : '#0B0B0D'} fill={artId ? '#fff' : '#0B0B0D'} /> : <Play size={24} color={artId ? '#fff' : '#0B0B0D'} fill={artId ? '#fff' : '#0B0B0D'} style={{ marginLeft: 3 }} />}
            </Pressy>
          </View>
          {playing && <PlayBar dark={!!artId} />}
        </View>
        {sub ? (
          <Row style={{ gap: 12, paddingHorizontal: 4 }}>
            <ExTile name={name} size={44} />
            <View style={{ flex: 1 }}><Txt v="label">Your plan</Txt><Txt v="mono" style={{ fontSize: 14 }}>{sub}</Txt></View>
          </Row>
        ) : null}
        <View style={{ height: 96, borderRadius: 22, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 }}>
          <Svg width={64} height={64} viewBox="0 0 64 64">
            <Rect x={4} y={4} width={56} height={56} rx={16} fill={c.surface2} />
            <Path d="M18 46V18h6v10h16V18h6v28h-6V34H24v12z" fill={c.muted} />
          </Svg>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: font.semibold }}>Machine & setup</Txt>
            <Txt muted style={{ fontSize: 13 }}>Photo of the station at Wulf Fitness</Txt>
          </View>
        </View>
        <Card style={{ padding: 18, gap: 6 }}>
          <Txt style={{ fontFamily: font.semibold }}>Tips</Txt>
          <Txt muted style={{ fontSize: 14 }}>{tipFor(name)}</Txt>
        </Card>
        <Card style={{ padding: 18, gap: 6 }}>
          <Txt style={{ fontFamily: font.semibold }}>Your history</Txt>
          <Txt v="mono" muted>{histFor(name)}</Txt>
        </Card>
        <Button kind="secondary" label="Ask about this exercise" icon={<MessageCircle size={18} color={c.ink} />}
          onPress={() => askCoach(name)} />
      </ScrollView>
    </View>
  );
}
