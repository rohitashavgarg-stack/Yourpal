// Web: react-native-maps has no web build, so the check-in page keeps its drawn map there.
export const hasRealMap = false;
export function GymMap(_: { where: 'inside' | 'near' | 'far'; off: boolean }) {
  return null;
}
