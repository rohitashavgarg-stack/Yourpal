import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { FloatingTabBar, NavHideProvider } from '@/components/FloatingTabBar';
import { useStore } from '@/lib/store';
import { useDomain } from '@/lib/domain';
import { useTheme } from '@/theme/ThemeProvider';

export default function TabsLayout() {
  const { state } = useStore();
  const { c } = useTheme();
  const { d } = useDomain();
  if (!state.loggedIn) return <Redirect href="/welcome" />;
  if (!state.onboarded) return <Redirect href="/onboarding" />;
  return (
    <NavHideProvider>
      <Tabs
        tabBar={(props: any) => <FloatingTabBar {...props} />}
        // All four tabs are built when the app opens (lazy: false) so a tab opens at once the first time, and a tab you are not on is frozen (freezeOnBlur) so a change
        // elsewhere does not re-draw it in the background. Switching tabs is then only a show and hide.
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg }, lazy: false, freezeOnBlur: true } as any}
      >
        <Tabs.Screen name="index" options={{ title: 'Today' }} />
        <Tabs.Screen name="plans" options={{ title: 'Plans' }} />
        <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
        <Tabs.Screen name="gym" options={{ title: 'Gym', href: d.hasGym ? undefined : null } as any} />
      </Tabs>
    </NavHideProvider>
  );
}
