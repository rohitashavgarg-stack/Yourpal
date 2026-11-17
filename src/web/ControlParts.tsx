import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { font, light } from '@/theme/tokens';
import { Activity, ArrowRightLeft, BicepsFlexed, CalendarClock, Play, SkipForward, Bell, ClipboardCheck, ClipboardList, Clock, Compass, CircleCheck, Dumbbell, Flame, Footprints, HeartPulse, Info, Lock, Moon, PenLine, PersonStanding, Scale, Sun, Sunrise, Sunset, UserRound, UtensilsCrossed, X } from '@/lib/icons';
import { radii, fontSizes, fixed, round } from '@/design-system/tokens';

// Building blocks of the demo-controls panels, in the same language as the app: white cards with a hairline, outline chips that turn black
// when chosen, a tinted track with a black thumb for two or three options, small black icon tiles. The panel always uses the light palette.
export const P = { ink: light.ink, muted: light.muted, line: light.line, chip: light.chipLine, tint: light.surface2, track: light.surface3, bg: light.bg };

type IconC = React.ComponentType<{ size?: number; color?: string }>;

export function PanelCard({ icon: Icon, title, pill, children }: { icon: IconC; title: string; pill?: { label: string; tone?: 'good' | 'info' }; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: fixed.white, borderRadius: radii.md, borderWidth: 1, borderColor: P.line, padding: 10, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <Icon size={15} color={P.ink} />
          <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 13.5, lineHeight: 19, color: P.ink }}>{title}</Text>
        </View>
        {pill ? <View style={{ height: 22, paddingHorizontal: 8, borderRadius: radii.sm, borderWidth: 1, borderColor: P.chip, justifyContent: 'center' }}><Text numberOfLines={1} style={{ fontFamily: font.medium, fontSize: 11.5, lineHeight: 16, color: P.ink }}>{pill.label}</Text></View> : null}
      </View>
      {children}
    </View>
  );
}

export const FieldLabel = ({ children }: { children: string }) => (
  <Text style={{ fontFamily: font.semibold, fontSize: fontSizes.xs2, lineHeight: 14, letterSpacing: 0.6, color: P.muted, textTransform: 'uppercase' }}>{children}</Text>
);

// Two or three options: a tinted track with a black thumb under the chosen one (like the app's Segmented). More options wrap into outline chips.
export function Choice({ label, options, value, onPick }: { label: string; options: string[]; value: string; onPick: (v: string) => void }) {
  const seg = options.length <= 3;
  return (
    <View style={{ gap: 4 }}>
      <FieldLabel>{label}</FieldLabel>
      {seg ? (
        <View style={{ flexDirection: 'row', padding: 2, borderRadius: radii.md, backgroundColor: P.tint }}>
          {options.map((o) => {
            const on = o === value;
            return (
              <Pressable key={o} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onPick(o)}
                style={{ flex: 1, minHeight: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, backgroundColor: on ? P.ink : 'transparent' }}>
                <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 16, color: on ? fixed.white : P.muted }}>{o}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {options.map((o) => {
            const on = o === value;
            return (
              <Pressable key={o} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onPick(o)}
                style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: on ? P.ink : P.chip, backgroundColor: on ? P.ink : 'transparent', justifyContent: 'center' }}>
                <Text style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, color: on ? fixed.white : P.ink }}>{o}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// One-off actions (Redo ...): tapping runs it, nothing stays selected.
export function Actions({ label, options, onPick }: { label: string; options: string[]; onPick: (v: string) => void }) {
  return (
    <View style={{ gap: 4 }}>
      <FieldLabel>{label}</FieldLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {options.map((o) => (
          <Pressable key={o} accessibilityRole="button" onPress={() => onPick(o)} style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: P.chip, justifyContent: 'center' }}>
            <Text style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, color: P.ink }}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function QuickTime({ icon: Icon, label, time, onPress }: { icon: IconC; label: string; time: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Jump to ${label}, ${time}`} onPress={onPress}
      style={{ flexBasis: '30%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 8, borderRadius: radii.sm, borderWidth: 1, borderColor: P.line, backgroundColor: P.bg }}>
      <Icon size={15} color={P.ink} />
      <View>
        <Text style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 16, color: P.ink }}>{label}</Text>
        <Text style={{ fontFamily: font.regular, fontSize: fontSizes.xs2, lineHeight: 14, color: P.muted }}>{time}</Text>
      </View>
    </Pressable>
  );
}

export function ScreenItem({ icon: Icon, label, on, onPress }: { icon: IconC; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress}
      style={{ flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 30, paddingHorizontal: 10, borderRadius: 15, backgroundColor: on ? P.ink : 'transparent' }}>
      <Icon size={15} color={on ? fixed.white : P.muted} />
      <Text numberOfLines={1} style={{ flex: 1, fontFamily: on ? font.semibold : font.medium, fontSize: 12.5, lineHeight: 17, color: on ? fixed.white : P.ink }}>{label}</Text>
    </Pressable>
  );
}

// An icon for an option, found by its label (exact first, then by its first word, so "Workout 6:30 PM" gets the workout icon). Options without one show no icon.
const OPTION_ICONS: Record<string, IconC> = {
  'Normal day': Sun, 'With updates': Bell, Comeback: Activity, 'Workout done': CircleCheck, 'Rest day': Moon, 'New member': UserRound,
  Nothing: CircleCheck, 'Missed meal': UtensilsCrossed, 'Missed workout': Dumbbell, Both: Flame,
  Active: CircleCheck, Expiring: Clock, Expired: Lock,
  'Weight loss': Scale, 'Muscle gain': Dumbbell, 'Lean body': Flame, Strength: BicepsFlexed, Flexibility: PersonStanding, Agility: Footprints, 'General fitness': HeartPulse, 'Not sure yet': Compass,
  'One workout': Dumbbell, 'Two workouts': Dumbbell, Completed: CircleCheck, 'Not marked': Clock, Upcoming: CalendarClock, Missed: Clock,
  'To do': ClipboardList, Running: Play, Done: CircleCheck, Moved: ArrowRightLeft, Skipped: SkipForward,
  Assigned: ClipboardCheck, 'Not assigned': ClipboardList, Signed: PenLine, 'Not signed': X,
  'Early morning': Sunrise, Morning: Sun, Afternoon: Sun, Evening: Sunset,
  'By time of day': Clock, 'All logged': CircleCheck,
  Workout: Dumbbell, Breakfast: UtensilsCrossed, Lunch: UtensilsCrossed, Snack: UtensilsCrossed, Dinner: UtensilsCrossed, Night: Moon,
  Allowed: Bell, Blocked: Lock, 'Not asked': Info,
};
// What a chip shows when the label is long: the shorter word. The full label stays its accessibility label.
const SHORT: Record<string, string> = { 'Missed meal': 'Meal', 'Missed workout': 'Workout', 'With updates': 'Updates', 'Weight loss': 'Weight', 'Muscle gain': 'Muscle', 'General fitness': 'General', 'Not sure yet': 'Not sure', 'Early morning': 'Early', 'By time of day': 'By time' };
const iconOf = (o: string) => OPTION_ICONS[o] ?? OPTION_ICONS[o.split(' ')[0]];

// A labelled row of chips with an icon each: every option is visible at once and the chosen one is filled. Up to four options share one line; five or six are laid out in rows of three and eight in rows of four, so nothing wraps unevenly. `short` shortens what a chip shows (the full text stays its label). (It used to collapse into a dropdown; the name is kept so the panel code did not change.)
export function Dropdown({ label, options, value, onPick, placeholder, short }: { label: string; options: string[]; value: string; onPick: (v: string) => void; placeholder?: string; short?: (o: string) => string }) {
  const n = options.length;
  const one = n <= 4;
  const basis = one ? 0 : n % 4 === 0 ? '23%' : '31%';
  return (
    <View style={{ gap: 6 }}>
      <Text numberOfLines={1} accessibilityRole="header" style={{ fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, color: P.muted, paddingHorizontal: 2 }}>{placeholder && !value ? `${label}: ${placeholder}` : label}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: one ? 'nowrap' : 'wrap', gap: 4 }}>
        {options.map((o) => {
          const on = o === value;
          const Icon = iconOf(o);
          return (
            <Pressable key={o} accessibilityRole="radio" accessibilityLabel={o} accessibilityState={{ selected: on }} onPress={() => onPick(o)}
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: basis as any, minWidth: 0, height: 30, paddingHorizontal: 8, borderRadius: round(30), borderWidth: 1, borderColor: on ? P.ink : P.chip, backgroundColor: on ? P.ink : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              {Icon ? <Icon size={14} color={on ? fixed.white : P.muted} /> : null}
              <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: font.medium, fontSize: fontSizes.xs, lineHeight: 16, color: on ? fixed.white : P.ink }}>{short ? short(o) : SHORT[o] ?? o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// An on/off switch as a chip: black when on. For the yes/no options (health, wearable, dark theme), three of them fit on one line.
export function SwitchChip({ label, on, onPress, icon: Icon }: { label: string; on: boolean; onPress: () => void; icon?: IconC }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={onPress}
      style={{ flex: 1, minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 6, borderRadius: 15, borderWidth: 1, borderColor: on ? P.ink : P.chip, backgroundColor: on ? P.ink : 'transparent' }}>
      {Icon ? <Icon size={14} color={on ? fixed.white : P.muted} /> : <View style={{ width: 6, height: 6, borderRadius: radii.xs, backgroundColor: on ? fixed.live : P.chip }} />}
      <Text numberOfLines={1} style={{ fontFamily: font.medium, fontSize: 11.5, lineHeight: 15, color: on ? fixed.white : P.ink }}>{label}</Text>
    </Pressable>
  );
}

// A one-off button: runs something, nothing stays selected.
export function ActionChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ height: 32, paddingHorizontal: 12, borderRadius: radii.md, backgroundColor: P.ink, justifyContent: 'center' }}>
      <Text style={{ fontFamily: font.semibold, fontSize: fontSizes.xs, lineHeight: 16, color: fixed.white }}>{label}</Text>
    </Pressable>
  );
}
