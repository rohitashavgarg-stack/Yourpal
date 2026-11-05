import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MuscleRings } from '@/design-system/primitives/MuscleRings';

/** Concentric rings, one segment per muscle group, names curved around the outside. */
const GROUPS = [
  { name: 'Chest', done: 9, target: 12 }, { name: 'Arms', done: 4, target: 8 }, { name: 'Shoulders', done: 5, target: 8 },
  { name: 'Core', done: 3, target: 6 }, { name: 'Legs', done: 0, target: 10 }, { name: 'Back', done: 0, target: 10 },
];
const meta = { title: 'Primitives/MuscleRings', component: MuscleRings, args: { groups: GROUPS, size: 260 } } satisfies Meta<typeof MuscleRings>;
export default meta;
type S = StoryObj<typeof meta>;
export const Default: S = {};
export const Empty: S = { args: { groups: GROUPS.map((g) => ({ ...g, done: 0 })) } };
export const AllDone: S = { args: { groups: GROUPS.map((g) => ({ ...g, done: g.target })) } };
export const Small: S = { args: { size: 180 } };
