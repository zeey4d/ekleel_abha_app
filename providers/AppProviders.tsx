import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import LanguageProvider from '@/providers/LanguageProvider';
import { ThemeProvider } from '@react-navigation/native';
import { NAV_THEME } from '@/lib/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Consolidated root providers — flattens the nesting in _layout.tsx.
 * Order matters: GestureHandler → Redux → Language → Theme → BottomSheet
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <LanguageProvider>
          <ThemeProvider value={NAV_THEME.light}>
            <BottomSheetModalProvider>
              {children}
            </BottomSheetModalProvider>
          </ThemeProvider>
        </LanguageProvider>
      </Provider>
      <Toast />
    </GestureHandlerRootView>
  );
}
