import React, { createContext, useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import i18n from '@/i18n/config';
import { loadLanguage, isRTL, LANGUAGE_STORAGE_KEY } from '@/lib/i18n';
import RestartSplashScreen from '@/components/RestartSplashScreen';

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  isRTL: boolean;
  isLoading: boolean;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type Props = {
  children: React.ReactNode;
};

export default function LanguageProvider({ children }: Props) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('ar');
  const [isReady, setIsReady] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    const initLanguage = async () => {
      try {
        const lang = await loadLanguage();
        
        // Update local state
        setCurrentLanguage(lang);
        
        // Sync i18n
        if (i18n.language !== lang) {
          await i18n.changeLanguage(lang);
        }

        // Check if we need to force RTL/LTR mismatch correction on first load
        // (This shouldn't happen often if we restart correctly, but good for safety)
        const shouldBeRTL = isRTL(lang);
        if (I18nManager.isRTL !== shouldBeRTL) {
           I18nManager.allowRTL(true);
           I18nManager.forceRTL(shouldBeRTL);
           // If we found a mismatch on startup, we might need to reload immediately
           // or just let it be (often React Native requires a restart for layout changes to fully take effect)
        }

      } catch (e) {
        console.error('Language init failed:', e);
      } finally {
        setIsReady(true);
      }
    };

    initLanguage();
  }, []);

  const changeLanguage = useCallback(async (lang: string) => {
    try {
      if (lang === currentLanguage) return;

      // 1. Show Splash Screen to cover the transition
      setIsRestarting(true);

      // 2. Determine new direction
      const newIsRTL = isRTL(lang);
      const directionChanged = newIsRTL !== I18nManager.isRTL;

      // 3. Save to storage
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

      // 4. Update i18n (optional if we are restarting, but good practice)
      await i18n.changeLanguage(lang);
      setCurrentLanguage(lang);

      // 5. Handle Direction Change & Restart
      if (directionChanged) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(newIsRTL);
        
        // Give UI a moment to show the splash screen before killing the JS bundle
        setTimeout(async () => {
          try {
            if (Platform.OS === 'web') {
              window.location.reload();
            } else {
              await Updates.reloadAsync();
            }
          } catch (e) {
            console.error('Failed to reload app:', e);
            // If reload fails, at least hide the splash
            setIsRestarting(false);
          }
        }, 500);
      } else {
        // If direction didn't change (e.g. en-US to en-GB), maybe we don't need a full reload?
        // But for consistency and to ensure all components re-render with new strings, 
        // a reload is often safest. custom requirement said "reinitialize theme/nav/etc", 
        // so a reload is the best way to guarantee that.
        
        setTimeout(async () => {
           try {
             if (Platform.OS === 'web') {
               window.location.reload();
             } else {
               await Updates.reloadAsync();
             }
           } catch (e) {
             console.error('Failed to reload app:', e);
             setIsRestarting(false);
           }
        }, 500);
      }

    } catch (error) {
       console.error('Error changing language:', error);
       setIsRestarting(false);
    }
  }, [currentLanguage]);

  if (!isReady) {
    // Initial loading state
    return null; // Or return <RestartSplashScreen /> if you want
  }

  return (
    <LanguageContext.Provider
      value={{
        language: currentLanguage,
        changeLanguage,
        isRTL: isRTL(currentLanguage),
        isLoading: isRestarting,
      }}
    >
      { children }
      {/* Overlay splash screen when restarting */}
      { isRestarting && <RestartSplashScreen /> }
    </LanguageContext.Provider>
  );
}
