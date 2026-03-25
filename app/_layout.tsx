import '@/global.css';
import '@/i18n/config';

import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { AppProviders } from '@/providers/AppProviders';

export {
  ErrorBoundary,
} from 'expo-router';

import { useFonts } from 'expo-font';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';

export default function RootLayout() {
    const { setColorScheme } = useColorScheme();
    const [loaded] = useFonts({
      Lato_400Regular,
      Lato_700Bold,
      Cairo_400Regular,
      Cairo_700Bold,
    });

  useEffect(() => {
    setColorScheme('light');
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(info)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(unauthorized)" options={{ headerShown: false }} />
      </Stack>
      <PortalHost />
    </AppProviders>
  );
}

