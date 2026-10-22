// Storybook only: a stand-in for expo-router. Stories have no navigation, so links and back buttons do nothing.
import React, { useEffect } from 'react';

const noop = () => {};
export const router = { push: noop, replace: noop, navigate: noop, back: noop, dismiss: noop, setParams: noop, canGoBack: () => false };
export const useRouter = () => router;
export const useLocalSearchParams = () => ({});
export const useGlobalSearchParams = () => ({});
export const usePathname = () => '/';
export const useSegments = () => [];
export const useNavigation = () => ({ addListener: () => noop, setOptions: noop, goBack: noop, canGoBack: () => false, isFocused: () => true });
export const useFocusEffect = (fn: () => void | (() => void)) => { useEffect(() => fn(), []); };
export const Redirect = () => null;
export const Link = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
const Navigator = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const Stack = Object.assign(Navigator, { Screen: () => null });
export const Tabs = Object.assign(Navigator, { Screen: () => null });
