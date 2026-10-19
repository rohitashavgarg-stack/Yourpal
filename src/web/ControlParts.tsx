import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { font, light } from '@/theme/tokens';
import { ChevronDown } from '@/lib/icons';

// Building blocks of the demo-controls panels, in the same language as the app: white cards with a hairline, outline chips that turn black
// when chosen, a tinted track with a black thumb for two or three options, small black icon tiles. The panel always uses the light palette.
export const P = { ink: light.ink, muted: light.muted, line: light.line, chip: light.chipLine, tint: light.surface2, track: light.surface3, bg: light.bg };

type IconC = React.ComponentType<{ size?: number; color?: string }>;

export function PanelCard({ icon: Icon, title, pill, children }: { icon: IconC; title: string; pill?: { label: string; tone?: 'good' | 'info' }; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: P.line, padding: 10, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <Icon size={15} color={P.ink} />
          <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 13.5, lineHeight: 19, color: P.ink }}>{title}</Text>
        </View>
        {pill ? <View style={{ height: 22, paddingHorizontal: 8, borderRadius: 11, borderWidth: 1, borderColor: P.chip, justifyContent: 'center' }}><Text numberOfLines={1} style={{ fontFamily: font.medium, fontSize: 11.5, lineHeight: 16, color: P.ink }}>{pill.label}</Text></View> : null}
      </View>
      {children}
    </View>
  );
}

export const FieldLabel = ({ children }: { children: string }) => (
  <Text style={{ fontFamily: font.semibold, fontSize: 10.5, lineHeight: 14, letterSpacing: 0.6, color: P.muted, textTransform: 'uppercase' }}>{children}</Text>
);

// Two or three options: a tinted track with a black thumb under the chosen one (like the app's Segmented). More options wrap into outline chips.
export function Choice({ label, options, value, onPick }: { label: string; options: string[]; value: string; onPick: (v: string) => void }) {
  const seg = options.length <= 3;
  return (
    <View style={{ gap: 4 }}>
      <FieldLabel>{label}</FieldLabel>
      {seg ? (
        <View style={{ flexDirection: 'row', padding: 2, borderRadius: 16, backgroundColor: P.tint }}>
          {options.map((o) => {
            const on = o === value;
            return (
              <Pressable key={o} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onPick(o)}
                style={{ flex: 1, minHeight: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, backgroundColor: on ? P.ink : 'transparent' }}>
                <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: on ? '#fff' : P.muted }}>{o}</Text>
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
                <Text style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 16, color: on ? '#fff' : P.ink }}>{o}</Text>
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
            <Text style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 16, color: P.ink }}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function QuickTime({ icon: Icon, label, time, onPress }: { icon: IconC; label: string; time: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Jump to ${label}, ${time}`} onPress={onPress}
      style={{ flexBasis: '30%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, borderColor: P.line, backgroundColor: P.bg }}>
      <Icon size={15} color={P.ink} />
      <View>
        <Text style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: P.ink }}>{label}</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 10.5, lineHeight: 14, color: P.muted }}>{time}</Text>
      </View>
    </Pressable>
  );
}

export function ScreenItem({ icon: Icon, label, on, onPress }: { icon: IconC; label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress}
      style={{ flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 30, paddingHorizontal: 10, borderRadius: 15, backgroundColor: on ? P.ink : 'transparent' }}>
      <Icon size={15} color={on ? '#fff' : P.muted} />
      <Text numberOfLines={1} style={{ flex: 1, fontFamily: on ? font.semibold : font.medium, fontSize: 12.5, lineHeight: 17, color: on ? '#fff' : P.ink }}>{label}</Text>
    </Pressable>
  );
}

// A row that shows the chosen value and opens its options right under it: for anything with more than a few options, so the panel stays short.
export function Dropdown({ label, options, value, onPick, placeholder = 'Choose' }: { label: string; options: string[]; value: string; onPick: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 4 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value || placeholder}`} accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)}
        style={{ minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: open ? P.track : P.tint }}>
        <Text numberOfLines={1} style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 16, color: P.muted }}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 12.5, lineHeight: 17, color: value ? P.ink : P.muted, flexShrink: 1 }}>{value || placeholder}</Text>
          <ChevronDown size={14} color={P.muted} style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] } as any} />
        </View>
      </Pressable>
      {open && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingBottom: 2 }}>
          {options.map((o) => {
            const on = o === value;
            return (
              <Pressable key={o} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => { onPick(o); setOpen(false); }}
                style={{ height: 28, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: on ? P.ink : P.chip, backgroundColor: on ? P.ink : 'transparent', justifyContent: 'center' }}>
                <Text style={{ fontFamily: font.medium, fontSize: 12, lineHeight: 16, color: on ? '#fff' : P.ink }}>{o}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

// An on/off switch as a chip: black when on. For the yes/no options (health, wearable, dark theme), three of them fit on one line.
export function SwitchChip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={onPress}
      style={{ flex: 1, minHeight: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 6, borderRadius: 15, borderWidth: 1, borderColor: on ? P.ink : P.chip, backgroundColor: on ? P.ink : 'transparent' }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: on ? '#7CF0C8' : P.chip }} />
      <Text numberOfLines={1} style={{ fontFamily: font.medium, fontSize: 11.5, lineHeight: 15, color: on ? '#fff' : P.ink }}>{label}</Text>
    </Pressable>
  );
}

// A one-off button: runs something, nothing stays selected.
export function ActionChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: P.ink, justifyContent: 'center' }}>
      <Text style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 16, color: '#fff' }}>{label}</Text>
    </Pressable>
  );
}
