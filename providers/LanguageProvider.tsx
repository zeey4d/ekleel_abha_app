import React, { createContext, useEffect, useState, useCallback } from 'react';
import { I18nManager, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import i18n from '@/i18n/config';
import { loadLanguage, isRTL, LANGUAGE_STORAGE_KEY } from '@/lib/i18n';
import RestartSplashScreen from '@/components/language/RestartSplashScreen';
import { store } from '@/store/store';
import { apiSlice } from '@/store/features/api/apiSlice';

// ---------- Types ----------
export type SupportedLanguage = 'ar' | 'en';

export type LanguageContextType = {
  /** Current active language code */
  language: SupportedLanguage;
  /** Change the app language – handles RTL, persistence, and reload */
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  /** Whether the current language is RTL */
  isRTL: boolean;
  /** True while a language switch + restart is in progress */
  isLoading: boolean;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ---------- Helpers ----------

/** Detect whether we are running inside Expo Go (dev client). */
const getIsExpoGo = (): boolean => {
  try {
    return Constants.appOwnership === 'expo';
  } catch {
    return false;
  }
};

// ---------- Provider ----------

type Props = { children: React.ReactNode };

export default function LanguageProvider({ children }: Props) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('ar');
  const [isReady, setIsReady] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  // ---- Initialisation ----
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const lang = (await loadLanguage()) as SupportedLanguage;
        setCurrentLanguage(lang);

        // Sync i18next if out of sync
        if (i18n.language !== lang) {
          await i18n.changeLanguage(lang);
        }

        // Safety: correct any RTL ↔ language mismatch that survived a restart
        const shouldBeRTL = isRTL(lang);
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(shouldBeRTL);
        }
      } catch (e) {
        console.error('Language init failed:', e);
      } finally {
        setIsReady(true);
      }
    };

    initLanguage();
  }, []);

  // ---- Core: change language ----
  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    try {
      if (lang === currentLanguage) return;

      const newIsRTL = isRTL(lang);
      const directionChanged = newIsRTL !== I18nManager.isRTL;

      // 1. Persist choice
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

      // 2. Update i18next & local state immediately
      await i18n.changeLanguage(lang);
      setCurrentLanguage(lang);

      // 3. Invalidate RTK Query cache (API responses may be locale-dependent)
      store.dispatch(apiSlice.util.invalidateTags([
        'Product', 'Category', 'Brand', 'Search',
        'Cart', 'Wishlist', 'Order', 'Banner',
      ]));

      // 4. If text direction changed → need full app restart
      if (directionChanged) {
        setIsRestarting(true);

        I18nManager.allowRTL(true);
        I18nManager.forceRTL(newIsRTL);

        // Small delay so the splash overlay renders first
        setTimeout(async () => {
          await reloadApp();
        }, 400);
      }
      // If same direction (e.g. both LTR) → i18next re-renders are enough, no restart needed

    } catch (error) {
      console.error('Error changing language:', error);
      setIsRestarting(false);
    }
  }, [currentLanguage]);

  // ---- Reload helper with Expo Go fallback ----
  const reloadApp = async () => {
    try {
      if (Platform.OS === 'web') {
        window.location.reload();
        return;
      }

      // In standalone builds, Updates.reloadAsync() works perfectly
      await Updates.reloadAsync();

    } catch (e) {
      // Updates.reloadAsync() throws in Expo Go / dev client
      const isExpo = getIsExpoGo();

      if (isExpo) {
        setIsRestarting(false);
        Alert.alert(
          '🔄 إعادة تشغيل مطلوبة',
          'تم حفظ اللغة الجديدة. لتطبيق اتجاه النص بالكامل:\n\n'
          + '• اضغط على (R) في الـ Terminal\n'
          + '• أو اهزّ الجهاز واختر "Reload"\n\n'
          + 'Language saved. To apply the new text direction:\n\n'
          + '• Press (R) in the terminal\n'
          + '• Or shake the device and tap "Reload"',
          [{ text: 'حسناً / OK', style: 'default' }]
        );
      } else {
        console.error('Failed to reload app:', e);
        setIsRestarting(false);
      }
    }
  };

  // Don't render children until the saved language is loaded
  if (!isReady) return null;

  return (
    <LanguageContext.Provider
      value={{
        language: currentLanguage,
        changeLanguage,
        isRTL: isRTL(currentLanguage),
        isLoading: isRestarting,
      }}
    >
      {children}
      {isRestarting && <RestartSplashScreen />}
    </LanguageContext.Provider>
  );
}
