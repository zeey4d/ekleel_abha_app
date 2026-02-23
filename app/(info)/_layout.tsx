import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function InfoLayout() {
  const { t } = useTranslation('info');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: t('common.back'), // Adjust based on your common translations
        headerTintColor: '#000',
        headerStyle: {
            backgroundColor: '#fff',
        },
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
