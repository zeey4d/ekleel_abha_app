import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key
export const LANGUAGE_STORAGE_KEY = '@app_language';

// Configuration
export const RTL_LANGUAGES = ['ar', 'he', 'fa'];

export const isRTL = (lang: string) => RTL_LANGUAGES.includes(lang);

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
  
  // Default fallback
  return 'ar';
};
