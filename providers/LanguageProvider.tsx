// src/providers/LanguageProvider.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, I18nManager } from 'react-native';
import i18n from '@/i18n/config';
import { loadLanguage, isRTL } from '@/lib/i18n';

type Props = {
  children: React.ReactNode;
};

export default function LanguageProvider({ children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initLanguage = async () => {
      try {
        const lang = await loadLanguage();

        // Sync i18n language
        if (i18n.language !== lang) {
          await i18n.changeLanguage(lang);
        }

        // Sync RTL / LTR
        const shouldBeRTL = isRTL(lang);
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.allowRTL(true);
          I18nManager.forceRTL(shouldBeRTL);
          // ⚠️ لا نعمل restart هنا
          // لأن هذا يحصل فقط عند تغيير اللغة يدويًا
        }

      } catch (e) {
        console.error('Language init failed:', e);
      } finally {
        setReady(true);
      }
    };

    initLanguage();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
