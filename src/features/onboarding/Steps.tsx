import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient as SvgGradient, Path, Rect, Stop } from 'react-native-svg';
import { CalendarCheck, Camera, Check, ClipboardList, Dumbbell, Flame, Footprints, Heart, Lock, Moon, TrendingUp, Trophy } from '@/lib/icons';
import { HEALTH_NAME } from '@/lib/health';
import { PersonAvatar } from '@/components/Brand';
import { Pressy, Row, Txt } from '@/components/ui';
import { fade } from '@/theme/motion';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme/ThemeProvider';
import { font } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';
import { Pt, smoothPath } from './path';
import { planMath } from './plan';

const AP = Animated.createAnimatedComponent(Path);

// Two-tone headline: the key part bold, the rest light.
export function Headline({ bold, light, size = 28 }: { bold: string; light?: string; size?: number }) {
  return (
    <Txt accessibilityRole="header" style={{ fontSize: size, letterSpacing: -1, lineHeight: Math.round(size * 1.3) }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: size, letterSpacing: -1, lineHeight: Math.round(size * 1.3) }}>{bold}</Txt>
      {light ? <Txt muted={false} style={{ fontFamily: font.light, fontSize: size, letterSpacing: -1, lineHeight: Math.round(size * 1.3) }}>{` ${light}`}</Txt> : null}
    </Txt>
  );
}

// ============ 1. Projection: the chart sits straight on the page, no card ============
export function ProjectionStep() {
  const { c } = useTheme();
  const { state } = useStore();
  const m = planMath(state.profile);
  const [w, setW] = useState(0);
  const H = 250, top = 46, bottom = 26;
  const t = useSharedValue(0);
  useEffect(() => { t.value = withDelay(250, withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) })); }, []);

  const nx = [0, 0.2, 0.5, 0.78, 1], ny = [0.96, 0.7, 0.44, 0.22, 0.08];
  const X = (n: number) => 12 + n * (w - 24 - 26);
  const Y = (n: number) => top + n * (H - top - bottom);
  const pts: Pt[] = w ? nx.map((n, i) => [X(n), Y(ny[i])] as const) : [[0, 0], [1, 1]];
  const { d, length } = smoothPath(pts);
  const line = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - t.value) }));
  const area = useAnimatedProps(() => ({ fillOpacity: t.value * 0.22 }));
  const end = pts[pts.length - 1];

  return (
    <>
      <View style={{ gap: 2, marginBottom: 6 }}>
        <Headline size={26} bold={`${m.gain ? 'Gaining' : 'Losing'} ${m.delta} kg in about ${m.weeks} weeks`} light="is possible." />
      </View>
      <View onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
        {w > 0 && (
          <Svg width={w} height={H}>
            <Defs>
              <SvgGradient id="projArea" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={c.accent} stopOpacity={1} /><Stop offset="1" stopColor={c.accent} stopOpacity={0} /></SvgGradient>
            </Defs>
            <AP d={`${d} L${end[0]} ${H - bottom} L${pts[0][0]} ${H - bottom} Z`} fill="url(#projArea)" animatedProps={area} />
            <AP d={d} fill="none" stroke={c.accent} strokeOpacity={0.14} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${length}`} animatedProps={line} />
            <AP d={d} fill="none" stroke={c.accent} strokeOpacity={0.28} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${length}`} animatedProps={line} />
            <AP d={d} fill="none" stroke={c.accent} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={`${length}`} animatedProps={line} />
            <Circle cx={pts[0][0]} cy={pts[0][1]} r={8} fill={c.bg} stroke={c.ink} strokeWidth={2.5} />
            {[2, 3].map((i) => <Circle key={i} cx={pts[i][0]} cy={pts[i][1]} r={8} fill="#fff" stroke={c.accent} strokeWidth={3} />)}
          </Svg>
        )}
        {w > 0 && (
          <>
            <View style={{ position: 'absolute', right: 0, top: 0, alignItems: 'flex-end' }}>
              <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.4, color: c.muted }}>YOUR GOAL</Txt>
              <Txt style={{ fontFamily: font.displayBold, fontSize: 22, lineHeight: 28, color: c.accentText }}>{m.target} <Txt style={{ fontFamily: font.semibold, fontSize: 12, color: c.accentText }}>KG</Txt></Txt>
            </View>
            <View pointerEvents="none" style={{ position: 'absolute', left: end[0] - 20, top: end[1] - 20, width: 40, height: 40, borderRadius: 20, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: c.accentSoft }}>
              <Trophy size={18} color="#fff" />
            </View>
          </>
        )}
      </View>
      <View style={{ height: 1, backgroundColor: c.line }} />
      <Row style={{ justifyContent: 'space-between' }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.1, color: c.muted }}>TODAY <Txt style={{ fontFamily: font.displayBold, fontSize: 18, color: c.ink }}>{m.cur} kg</Txt></Txt>
        <Txt style={{ fontFamily: font.semibold, fontSize: 12, letterSpacing: 1.1, color: c.muted }}>IN {m.weeks} WEEKS</Txt>
      </Row>
      <Txt style={{ textAlign: 'center', fontFamily: font.medium, marginTop: 6 }}>We go with you all the way.</Txt>
      <Txt v="caption" style={{ textAlign: 'center' }}>An estimate. Coach Vikram confirms your pace at the assessment.</Txt>
    </>
  );
}

// ============ 2. How it works: a winding path with three stops and a trophy ============
export function HowStep() {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const H = 400;
  const t = useSharedValue(0);
  useEffect(() => { t.value = withDelay(150, withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) })); }, []);
  const at = (fx: number, fy: number): Pt => [12 + fx * (w - 24), 24 + fy * (H - 48)];
  const stops = [at(0.08, 0.02), at(0.42, 0.42), at(0.62, 0.7), at(0.84, 0.96)];
  const way: Pt[] = [stops[0], at(0.26, 0.15), at(0.14, 0.3), stops[1], at(0.5, 0.56), stops[2], at(0.78, 0.86), stops[3]];
  const { d, length } = smoothPath(w ? way : [[0, 0], [1, 1]]);
  const line = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - t.value) }));
  const Node = ({ p, children, size = 44 }: { p: Pt; children: React.ReactNode; size?: number }) => (
    <View style={{ position: 'absolute', left: p[0] - size / 2, top: p[1] - size / 2, width: size, height: size, borderRadius: size / 2, backgroundColor: c.surface, borderWidth: 2, borderColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
  );
  const Label = ({ p, title, sub, right }: { p: Pt; title: string; sub: string; right?: boolean }) => (
    <View style={{ position: 'absolute', top: p[1] - 22, ...(right ? { right: w - p[0] + 34 } : { left: p[0] + 34 }), width: 170, alignItems: right ? 'flex-end' : 'flex-start' }}>
      <Txt style={{ fontFamily: font.semibold, fontSize: 15, lineHeight: 21, textAlign: right ? 'right' : 'left' }}>{title}</Txt>
      <Txt v="caption" style={{ textAlign: right ? 'right' : 'left' }}>{sub}</Txt>
    </View>
  );
  return (
    <>
      <View style={{ gap: 6 }}>
        <Headline size={28} bold="Your plan, your coach," light="all in one place." />
        <Txt muted>We build every step with you.</Txt>
      </View>
      <View onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
        {w > 0 && (
          <>
            <Svg width={w} height={H}>
              <AP d={d} fill="none" stroke={c.ink} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${length}`} animatedProps={line} />
              <AP d={d} fill="none" stroke={c.bg} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${length}`} animatedProps={line} />
            </Svg>
            <Animated.View pointerEvents="box-none" style={StyleAbs} entering={fade(200)}><Node p={stops[0]}><Camera size={19} color={c.ink} /></Node><Label p={stops[0]} title="Snap your plate" sub="and your food is logged" /></Animated.View>
            <Animated.View pointerEvents="box-none" style={StyleAbs} entering={fade(600)}><Node p={stops[1]}><Dumbbell size={19} color={c.ink} /></Node><Label p={stops[1]} title="A workout built for you" sub="with a demo for every exercise" /></Animated.View>
            <Animated.View pointerEvents="box-none" style={StyleAbs} entering={fade(1000)}><Node p={stops[2]}><TrendingUp size={19} color={c.ink} /></Node><Label p={stops[2]} right title="Progress you can see" sub="weight, lifts and records" /></Animated.View>
            <Animated.View pointerEvents="box-none" style={StyleAbs} entering={fade(1400)}><Node p={stops[3]} size={52}><View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}><Trophy size={22} color="#fff" /></View></Node></Animated.View>
          </>
        )}
      </View>
    </>
  );
}

// ============ 3. Meal photo: tap the plate and see what the app reads ============
function MacroRing({ pct, v, l }: { pct: number; v: number; l: string }) {
  const { c } = useTheme();
  const R = 21, C = 2 * Math.PI * R;
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={52} height={52} viewBox="0 0 52 52">
          <Circle cx={26} cy={26} r={R} fill="none" stroke={c.surface3} strokeWidth={4} />
          <Circle cx={26} cy={26} r={R} fill="none" stroke={c.accent} strokeWidth={4} strokeLinecap="round" strokeDasharray={`${C}`} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 26 26)" />
        </Svg>
        <Txt style={{ position: 'absolute', fontFamily: font.semibold, fontSize: 13, lineHeight: 17 }}>{v}</Txt>
      </View>
      <Txt v="caption">{l}</Txt>
    </View>
  );
}

const MEAL_ITEMS: [string, string][] = [['cooked basmati rice', '180 g'], ['dal tadka', '200 g'], ['roti', '2 pieces']];
export function MealStep() {
  const { c } = useTheme();
  const [read, setRead] = useState(false);
  return (
    <>
      <Headline size={28} bold="Snap your plate," light="we do the maths." />
      <View style={{ height: 470, marginHorizontal: -20, overflow: 'hidden', backgroundColor: '#2B2118' }}>
        <Svg width="100%" height="100%" viewBox="0 0 320 470" preserveAspectRatio="xMidYMin slice" accessibilityLabel="A plate of rice, dal and roti">
          <Rect width={320} height={470} fill="#2B2118" />
          <Path d="M0 60 H320 M0 120 H320 M0 180 H320 M0 240 H320 M0 300 H320 M0 360 H320" stroke="rgba(255,255,255,0.04)" strokeWidth={2} />
          <Circle cx={160} cy={200} r={138} fill="#ECE8E1" />
          <Circle cx={160} cy={200} r={112} fill="#F8F5EF" />
          <Ellipse cx={120} cy={150} rx={44} ry={36} fill="#FFFFFF" /><Ellipse cx={112} cy={140} rx={26} ry={18} fill="#F1EFEA" />
          <Circle cx={205} cy={140} r={38} fill="#C9862B" /><Circle cx={205} cy={140} r={28} fill="#DDA13F" /><Circle cx={196} cy={132} r={6} fill="#B5541F" />
          <G><Circle cx={150} cy={218} r={30} fill="#D4A45C" /><Circle cx={150} cy={218} r={22} fill="#E2B970" /><Circle cx={196} cy={226} r={28} fill="#D4A45C" /><Circle cx={196} cy={226} r={20} fill="#E2B970" /></G>
        </Svg>
        {!read && (
          <View style={{ position: 'absolute', left: 14, right: 14, bottom: 14, alignItems: 'center', gap: 10 }}>
            <View style={{ alignSelf: 'stretch', padding: 14, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.72)' }}>
              <Txt style={{ fontFamily: font.semibold, color: '#fff' }}>This photo is ours.</Txt>
              <Txt style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Tap and see the maths the app does on a meal photo.</Txt>
            </View>
            <Pressy accessibilityRole="button" accessibilityLabel="See what the app reads" onPress={() => { haptic.success(); setRead(true); }} scaleTo={0.92}
              style={{ width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}><Camera size={22} color="#111" /></View>
            </Pressy>
            <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.4, color: 'rgba(255,255,255,0.85)' }}>SEE WHAT THE APP READS</Txt>
          </View>
        )}
        {read && (
          <Animated.View entering={fade()} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, gap: 8, backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <Row style={{ gap: 6 }}><Check size={14} strokeWidth={3} color={c.good} /><Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.2, color: c.good }}>IDENTIFIED ITEM BY ITEM</Txt></Row>
            <Txt style={{ fontFamily: font.displayBold, fontSize: 20, lineHeight: 26 }}>Rice, dal and roti</Txt>
            {MEAL_ITEMS.map(([n, q]) => (
              <Row key={n} style={{ justifyContent: 'space-between', minHeight: 32, borderBottomWidth: 1, borderBottomColor: c.line }}><Txt muted style={{ fontSize: 14 }}>{n}</Txt><Txt style={{ fontFamily: font.medium, fontSize: 14 }}>{q}</Txt></Row>
            ))}
            <Row style={{ justifyContent: 'space-between', paddingTop: 4 }}>
              <View><Txt v="caption" style={{ letterSpacing: 1.2 }}>CALORIES</Txt><Txt style={{ fontFamily: font.displayBold, fontSize: 36, lineHeight: 44, letterSpacing: -1 }}>590 <Txt muted style={{ fontFamily: font.semibold, fontSize: 12 }}>KCAL</Txt></Txt></View>
              <Row style={{ gap: 12 }}><MacroRing pct={0.55} v={21} l="Protein" /><MacroRing pct={0.75} v={100} l="Carbs" /><MacroRing pct={0.3} v={10} l="Fat" /></Row>
            </Row>
          </Animated.View>
        )}
      </View>
    </>
  );
}

// ============ 4. Signature: draw a tick to confirm ============
export function SignStep({ onDrawn }: { onDrawn: (v: boolean) => void }) {
  const { c } = useTheme();
  const [path, setPath] = useState('');
  const [drawn, setDrawn] = useState(false);
  const len = useRef(0);
  const last = useRef<[number, number] | null>(null);
  const pan = Gesture.Pan().runOnJS(true).minDistance(0)
    .onBegin((e) => { last.current = [e.x, e.y]; setPath((p) => `${p} M${e.x.toFixed(1)} ${e.y.toFixed(1)}`); haptic.tick(); })
    .onUpdate((e) => {
      const l = last.current; if (!l) return;
      len.current += Math.hypot(e.x - l[0], e.y - l[1]);
      last.current = [e.x, e.y];
      setPath((p) => `${p} L${e.x.toFixed(1)} ${e.y.toFixed(1)}`);
    })
    .onEnd(() => { const ok = len.current > 90; setDrawn(ok); onDrawn(ok); if (ok) haptic.success(); });
  const clear = () => { setPath(''); len.current = 0; setDrawn(false); onDrawn(false); haptic.tick(); };
  return (
    <>
      <View style={{ paddingTop: 8 }}><Headline size={28} bold="Are you committed to following the plan" light="Coach Vikram builds for you?" /></View>
      <GestureDetector gesture={pan}>
        <View collapsable={false} accessible accessibilityLabel="Signature box. Draw a tick with your finger to confirm" style={{ height: 260, borderRadius: 28, borderWidth: 1.5, borderStyle: 'dashed', borderColor: drawn ? c.accent : c.chipLine, backgroundColor: c.surface, overflow: 'hidden' }}>
          {!path && <View pointerEvents="none" style={{ ...StyleAbs, alignItems: 'center', justifyContent: 'center' }}><Check size={84} strokeWidth={1.6} color={c.accent} style={{ opacity: 0.28 }} /></View>}
          <Svg width="100%" height="100%" style={{ position: 'absolute' }}><Path d={path} fill="none" stroke={c.accent} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" /></Svg>
          <View pointerEvents="none" style={{ position: 'absolute', left: 24, right: 24, bottom: 44, height: 1, backgroundColor: c.line }} />
        </View>
      </GestureDetector>
      <Txt style={{ textAlign: 'center', fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.3, color: c.muted }}>DRAW A ✓ IN THE BOX TO CONFIRM</Txt>
      <Pressy accessibilityRole="button" onPress={clear} style={{ alignSelf: 'center', height: 44, paddingHorizontal: 16, justifyContent: 'center' }}><Txt muted>Clear</Txt></Pressy>
    </>
  );
}
const StyleAbs = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

// ============ 5. All set: the gym builds the plan, so say what happens next ============
export function ReadyContent({ assess }: { assess: string }) {
  const { c } = useTheme();
  const { state } = useStore();
  const p = state.profile;
  const m = planMath(p);
  const booked = assess === 'Scheduled';
  const shared: [string, string][] = [
    ['Goal', p.goal && p.goal !== 'Not sure yet' ? (m.has ? `${p.goal} · ${m.target} kg` : p.goal) : 'Decide with your coach'],
    ['Training', `${p.days || 4} days a week · ${p.time || 'Evening'}`],
    ...(p.heightCm && p.weightKg ? [['Height and weight', `${p.heightCm} cm · ${p.weightKg} kg`] as [string, string]] : []),
    ['Diet', p.diet || 'Veg'],
    ['Injuries', p.injury === 'Yes' ? 'Shared with your coach' : 'None'],
  ];
  const next: [React.ReactNode, string, string][] = [
    [<CalendarCheck size={17} color={c.ink} />, booked ? 'Assessment · Sat 10:00 am' : 'Book your assessment', booked ? 'A 30-minute check-in with Coach Vikram: measurements, movement and your goal.' : 'Ask at the front desk. Coach Vikram builds your plan from it.'],
    [<ClipboardList size={17} color={c.ink} />, 'Your plan lands on Today', "Workouts and meals from Coach Vikram. We'll notify you when it arrives."],
    [<Dumbbell size={17} color={c.ink} />, 'Start training', 'Until then, log your meals, water and weight.'],
  ];
  return (
    <>
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 8 }}>
        <Animated.View entering={fade()} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Check size={30} strokeWidth={2.6} color={c.accent} />
        </Animated.View>
        <View style={{ alignItems: 'center' }}>
          <Txt style={{ fontFamily: font.light, fontSize: 26, lineHeight: 34, letterSpacing: -0.7, textAlign: 'center' }}>You're all set,</Txt>
          <Txt style={{ fontFamily: font.semibold, fontSize: 26, lineHeight: 34, letterSpacing: -0.7, textAlign: 'center' }}>{p.name || 'Jyotsana Rankawat'}.</Txt>
        </View>
        <Row style={{ gap: 8 }}>
          <PersonAvatar who="coach" size={28} />
          <Txt muted style={{ fontSize: 14 }}>Coach Vikram has your answers</Txt>
        </Row>
      </View>

      <View style={{ gap: 4, padding: 16, borderRadius: 24, backgroundColor: c.surface }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.3, color: c.muted, paddingBottom: 4 }}>SHARED WITH YOUR COACH</Txt>
        {shared.map(([k, v], i) => (
          <Row key={k} style={{ justifyContent: 'space-between', gap: 12, minHeight: 48, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <Txt muted>{k}</Txt>
            <Txt style={{ fontFamily: font.semibold, flexShrink: 1, textAlign: 'right' }}>{v}</Txt>
          </Row>
        ))}
      </View>

      <View style={{ gap: 6, padding: 16, borderRadius: 24, backgroundColor: c.surface }}>
        <Txt style={{ fontFamily: font.semibold, fontSize: 11, lineHeight: 15, letterSpacing: 1.3, color: c.muted, paddingBottom: 4 }}>WHAT HAPPENS NEXT</Txt>
        {next.map(([icon, t, s], i) => (
          <Row key={t} style={{ gap: 14, alignItems: 'flex-start', paddingVertical: 6 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
            <View style={{ flex: 1 }}>
              <Txt style={{ fontFamily: font.semibold }}>{i + 1}. {t}</Txt>
              <Txt v="caption">{s}</Txt>
            </View>
          </Row>
        ))}
      </View>
    </>
  );
}

// ============ Connect Apple Health / Health Connect ============
export function HealthStep() {
  const { c, isDark } = useTheme();
  const rows: [React.ReactNode, string, string][] = [
    [<Footprints size={20} color={c.ink} />, 'Steps', 'Daily count and goal streaks'],
    [<Heart size={20} color={c.ink} />, 'Heart rate', 'Resting and during workouts'],
    [<Moon size={20} color={c.ink} />, 'Sleep', 'How rested you are for training'],
    [<Flame size={20} color={c.ink} />, 'Active energy', 'Calories burned today'],
  ];
  return (
    <>
      <View style={{ alignItems: 'center', gap: 14, paddingTop: 6 }}>
        <View accessibilityLabel={HEALTH_NAME} style={{ width: 88, height: 88, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...(isDark ? {} : { shadowColor: '#101828', shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 8 } }) }}>
          <Heart size={46} color="#FF375F" fill="#FF375F" />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Txt style={{ fontFamily: font.semibold, fontSize: 28, lineHeight: 36, letterSpacing: -0.9, textAlign: 'center' }}>Connect {HEALTH_NAME}</Txt>
          <Txt style={{ fontFamily: font.light, fontSize: 28, lineHeight: 36, letterSpacing: -0.9, textAlign: 'center' }}>for your full picture.</Txt>
        </View>
        <Txt muted style={{ textAlign: 'center' }}>Fills in your trends and helps Coach Vikram plan rest days.</Txt>
      </View>
      <View>
        {rows.map(([icon, t, s], i) => (
          <Row key={t} style={{ gap: 14, minHeight: 64, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
            <View style={{ flex: 1 }}><Txt style={{ fontFamily: font.semibold }}>{t}</Txt><Txt v="caption">{s}</Txt></View>
          </Row>
        ))}
      </View>
      <Row style={{ gap: 10, alignItems: 'flex-start' }}>
        <Lock size={15} color={c.muted} style={{ marginTop: 2 }} />
        <Txt v="caption" style={{ flex: 1 }}>You choose what to allow. Your gym never sees this unless you share it in Privacy. You can change it any time in Settings.</Txt>
      </Row>
    </>
  );
}
