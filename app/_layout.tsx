import '@/global.css';
import '@/i18n/config';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import AppHeader from '@/components/navigation/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import { store } from '@/store/store';

const LANGUAGE_STORAGE_KEY = '@app_language';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Load saved language preference on app start
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && savedLanguage !== i18n.language) {
          await i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguage();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            header: (props: any) => <AppHeader {...props} />, // use custom header by default
            headerShown: true,
            animation: 'slide_from_right',
          }}
        >
          {/* (tabs) group contains the bottom tabs layout. Tabs will control its own headers if needed. */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* (shop) group: internal pages without tabs; keep header shown so pages have dynamic header */}
          <Stack.Screen name="(shop)" options={{ headerShown: true }} />
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </Provider>
  );
}
