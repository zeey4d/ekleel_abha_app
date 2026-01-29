import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Storage key
const LANGUAGE_STORAGE_KEY = '@app_language';

// Configuration
const RTL_LANGUAGES = ['ar', 'he', 'fa'];

export const isRTL = (lang: string) => RTL_LANGUAGES.includes(lang);

/**
 * Change the application language and restart to apply RTL/LTR changes properly.
 */
export const changeLanguage = async (lang: string) => {
  try {
    const isLangRTL = isRTL(lang);

    // 1. Save to Storage
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

    // 2. Update i18n instance (optional if restarting, but good for consistency)
    await i18n.changeLanguage(lang);

    // 3. Update Layout Direction
    if (isLangRTL !== I18nManager.isRTL) {
      I18nManager.allowRTL(true); // Always allow RTL to avoid getting stuck in LTR
      I18nManager.forceRTL(isLangRTL);
    }

    // 4. Restart the App
    // We add a small delay to ensure Native preferences are written to disk
    // before the process is killed/reloaded.
    setTimeout(async () => {
      try {
        if (Platform.OS === 'web') {
           window.location.reload();
        } else {
           await Updates.reloadAsync();
        }
      } catch (reloadError) {
        console.error('Reload failed:', reloadError);
      }
    }, 500);

  } catch (error) {
    console.error('Error changing language:', error);
    throw error;
  }
};

/**
 * Initialize language from storage.
 * Should be called early in the app lifecycle.
 */
export const loadLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (savedLanguage) {
      // If we have a saved language, use it
      return savedLanguage;
    }
  } catch (error) {
    console.error('Error loading language:', error);
  }
  
  // Default fallback (could vary based on requirements)
  return 'ar';
};
