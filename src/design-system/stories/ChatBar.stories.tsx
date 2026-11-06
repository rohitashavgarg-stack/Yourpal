import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Library } from '@/lib/icons';
import { ChatBar } from '@/design-system/patterns/ChatBar';

/** The glass message bar of a chat. */
const noop = () => {};
const meta = { title: 'Patterns/ChatBar', component: ChatBar, args: { value: '', onChangeText: noop, placeholder: 'Anything else?', leftIcon: <Library size={22} />, leftLabel: 'Open the food library', onLeft: noop, onMic: noop, onSend: noop } } satisfies Meta<typeof ChatBar>;
export default meta;
type S = StoryObj<typeof meta>;
function Live({ camera }: { camera?: boolean }) {
  const [v, setV] = useState('');
  return <ChatBar value={v} onChangeText={setV} placeholder="Anything else?" leftIcon={<Library size={22} />} leftLabel="Open the food library" onLeft={() => {}} onCamera={camera ? () => {} : undefined} onMic={() => {}} onSend={() => setV('')} />;
}
export const Default: S = { render: () => <Live camera />, args: {} };
export const WithoutCamera: S = { render: () => <Live />, args: {} };
