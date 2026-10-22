import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { radii } from '@/design-system/tokens';
import { Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { Option } from '@/design-system/primitives/Option';

/** One choice in a set. The container and its selected state; the caller draws the content and colours its text from `selected`. */
const meta = {
  title: 'Primitives/Option',
  component: Option,
  args: { selected: false, look: 'fill', role: 'radio', height: 44, padX: 16, offLine: undefined, onPress: () => {}, children: null },
  argTypes: { look: { control: 'select', options: ['fill', 'outline'] }, role: { control: 'select', options: ['radio', 'tab'] }, children: { control: false } },
  render: (a) => <Label {...a} />,
} satisfies Meta<typeof Option>;
export default meta;
type S = StoryObj<typeof meta>;

function Label(a: React.ComponentProps<typeof Option>) {
  const { c } = useTheme();
  return <Option {...a}><Txt style={{ color: a.selected && a.look !== 'outline' ? c.bg : c.ink }}>Veg</Txt></Option>;
}
export const FillOff: S = {};
export const FillOn: S = { args: { selected: true } };
function LineLabel(a: React.ComponentProps<typeof Option>) {
  const { c } = useTheme();
  return <Label {...a} offLine={c.surface3} />;
}
/** Not selected with a 1 px line (food type); selected keeps a 1 px ink line so nothing moves. */
export const FillWithLine: S = { render: (a) => <LineLabel {...a} /> };
export const FillWithLineOn: S = { args: { selected: true }, render: (a) => <LineLabel {...a} /> };
export const OutlineOff: S = { args: { look: 'outline', minHeight: 72, height: undefined, padX: 16 } };
export const OutlineOn: S = { args: { look: 'outline', selected: true, minHeight: 72, height: undefined, padX: 16 } };

function SetDemo({ look }: { look: 'fill' | 'outline' }) {
  const { c } = useTheme();
  const [v, setV] = React.useState('Beginner');
  return (
    <View style={{ gap: 8 }}>
      {['Beginner', 'Some experience', 'Experienced'].map((l) => {
        const on = v === l;
        return (
          <Option key={l} look={look} selected={on} onPress={() => setV(l)} minHeight={look === 'outline' ? 72 : undefined} height={look === 'fill' ? 44 : undefined} padX={18} offLine={look === 'fill' ? c.surface3 : undefined}>
            <Txt style={{ flex: look === 'outline' ? 1 : undefined, color: on && look === 'fill' ? c.bg : c.ink }}>{l}</Txt>
          </Option>
        );
      })}
    </View>
  );
}
/** A radio set, outline look (onboarding experience). */
export const OutlineSet: S = { render: () => <SetDemo look="outline" /> };
/** A radio set, fill look with a line (food type). */
export const FillSet: S = { render: () => <SetDemo look="fill" /> };
/** Segmented tabs (role tab, fill look, no line). */
function TabsDemo() {
  const { c } = useTheme();
  const [v, setV] = React.useState('1M');
  return (
    <View style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: radii.lg, backgroundColor: c.surface2 }}>
      {['1W', '1M', '3M', '1Y'].map((l) => <Option key={l} role="tab" selected={v === l} onPress={() => setV(l)} height={32} radius={radii.md} style={{ flex: 1 }}><Txt style={{ color: v === l ? c.bg : c.muted }}>{l}</Txt></Option>)}
    </View>
  );
}
export const Tabs: S = { render: () => <TabsDemo /> };
