import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MuscleThumb } from '@/design-system/primitives/MuscleThumb';

/** A small dark square with one muscle group lit. */
const meta = { title: 'Primitives/MuscleThumb', component: MuscleThumb, args: { muscle: 'Chest', size: 64 } } satisfies Meta<typeof MuscleThumb>;
export default meta;
type S = StoryObj<typeof meta>;
export const Chest: S = {};
export const Arms: S = { args: { muscle: 'Arms' } };
export const Shoulders: S = { args: { muscle: 'Shoulders' } };
export const Core: S = { args: { muscle: 'Core' } };
export const Legs: S = { args: { muscle: 'Legs' } };
export const Back: S = { args: { muscle: 'Back' } };
