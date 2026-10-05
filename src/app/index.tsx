import { Redirect } from 'expo-router';
import { useStore } from '@/lib/store';

// Entry: send the member to the right place for where they are in the journey.
export default function Index() {
  const { state } = useStore();
  if (!state.loggedIn) return <Redirect href="/welcome" />;
  if (!state.onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
