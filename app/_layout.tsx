import '@/global.css';
import '@/i18n/config';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import AppHeader from '@/components/navigation/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import LanguageProvider from '@/providers/LanguageProvider';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';


export {
  ErrorBoundary,
} from 'expo-router';

import { useFonts } from 'expo-font';
import { Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import { Cairo_400Regular, Cairo_700Bold } from '@expo-google-fonts/cairo';
import Toast from 'react-native-toast-message';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <LanguageProvider>
          <ThemeProvider value={NAV_THEME.light}>
            <BottomSheetModalProvider>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  header: (props: any) => <AppHeader {...props} />,
                  headerShown: true,
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(info)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(unauthorized)" options={{ headerShown: false }} />
              </Stack>
              <PortalHost />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </LanguageProvider>
      </Provider>
      <Toast />
    </GestureHandlerRootView>
  );
}

