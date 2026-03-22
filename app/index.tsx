import { Redirect } from 'expo-router';

// Root redirects to auth check in _layout.tsx
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
