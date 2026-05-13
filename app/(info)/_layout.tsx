import { Stack, router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, I18nManager } from 'react-native';
import { X } from 'lucide-react-native';

export default function InfoLayout() {
  const { t } = useTranslation('info');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,
        headerTitleStyle: { fontFamily: 'Tajawal_700Bold', fontSize: 18 },
        headerTitleAlign: 'center',
        headerLeft: () => (
            <Pressable onPress={() => router.back()} className="px-2" >
                <X color="#0f172a" size={26} />
            </Pressable>
        ),
        headerTintColor: '#0f172a',
        headerStyle: {
            backgroundColor: '#f8fafc',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="about" options={{ title: t('about.meta.title') }} />
      <Stack.Screen name="contact" options={{ title: t('contact.pageTitle') }} />
      <Stack.Screen name="faq" options={{ title: t('faq.hero.title') }} />
      <Stack.Screen name="privacy-policy" options={{ title: t('privacy.title') }} />
      <Stack.Screen name="terms-of-service" options={{ title: t('terms.title') }} />
      <Stack.Screen name="return-policy" options={{ title: t('returns.title') }} />
      <Stack.Screen name="shipping" options={{ title: t('shipping.title') }} />
      <Stack.Screen name="payment-methods" options={{ title: t('payment.title') }} />
    </Stack>
  );
}
