import React from 'react';
import { View } from 'react-native';
import type { Preview } from '@storybook/react-native-web-vite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScenarioRegistryProvider, StoreProvider } from '@/lib/store';
import { DomainProvider } from '@/lib/domain';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { OverlayProvider } from '@/components/Overlay';

// Every story renders inside the app's providers, on the page colour of the chosen theme, at phone width.
function Page({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return <View style={{ backgroundColor: c.bg, padding: 16, minHeight: 640, width: '100%', maxWidth: 420 }}>{children}</View>;
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Light or dark theme',
      toolbar: { title: 'Theme', icon: 'mirror', items: [{ value: 'light', title: 'Light' }, { value: 'dark', title: 'Dark' }], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    docs: { source: { type: 'dynamic' } },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, ctx) => {
      const scheme = ctx.globals.theme === 'dark' ? 'dark' : 'light';
      if (typeof document !== 'undefined') document.body.style.background = scheme === 'dark' ? '#0E1116' : '#F5F7FA';
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StoreProvider>
              <ThemeProvider scheme={scheme}>
                <ScenarioRegistryProvider>
                  <DomainProvider>
                    <OverlayProvider>
                      <Page><Story /></Page>
                    </OverlayProvider>
                  </DomainProvider>
                </ScenarioRegistryProvider>
              </ThemeProvider>
            </StoreProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
    },
  ],
};
export default preview;
