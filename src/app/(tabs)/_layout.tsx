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
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } } as any}
      >
        <Tabs.Screen name="index" options={{ title: 'Today' }} />
        <Tabs.Screen name="plans" options={{ title: 'Plans' }} />
        <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
        <Tabs.Screen name="gym" options={{ title: 'Gym', href: d.hasGym ? undefined : null } as any} />
      </Tabs>
    </NavHideProvider>
  );
}
