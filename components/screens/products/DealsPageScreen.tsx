import React from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import  DealsPageContent  from '@/app/shop/product/DealsPageContent';

export default function DealsPageScreen() {
  const { t } = useTranslation('deals');
  const { page } = useLocalSearchParams<{ page?: string }>();

  const currentPage = Number(page) || 1;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: false,

          headerShadowVisible: false,
          headerLeft: () => null, // لأننا سنعالج الرجوع داخل المحتوى
        }}
      />

      <DealsPageContent />
    </View>
  );
}
