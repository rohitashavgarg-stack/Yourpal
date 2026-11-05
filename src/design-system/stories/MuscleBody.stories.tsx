import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MuscleBody } from '@/design-system/primitives/MuscleBody';

/** A plain dark body, front or back, with muscle groups lit in the accent blue. */
const meta = { title: 'Primitives/MuscleBody', component: MuscleBody, args: { side: 'front', width: 140, lit: { Chest: 1, Shoulders: 1, Legs: 1, Arms: 0.5 } } } satisfies Meta<typeof MuscleBody>;
export default meta;
type S = StoryObj<typeof meta>;
export const Front: S = {};
export const Back: S = { args: { side: 'back', lit: { Back: 1, Legs: 1, Arms: 0.5 } } };
export const AllLit: S = { args: { lit: { Chest: 1, Shoulders: 1, Arms: 1, Core: 1, Legs: 1 } } };
