import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { getToneProfile } from '../lib/api';

export default function RootLayout() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRoute();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/(auth)/login');
      } else if (event === 'SIGNED_IN' && session) {
        await routeAfterAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthAndRoute = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/(auth)/login');
    } else {
      await routeAfterAuth();
    }
    setChecking(false);
  };

  const routeAfterAuth = async () => {
    try {
      const profile = await getToneProfile();
      if (!profile) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      router.replace('/(tabs)');
    }
  };

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
