import React from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import  BestSellersPageContent  from '@/components/features/product/BestSellersPageContent';

export default function BestSellersPageScreen() {
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

      <BestSellersPageContent />
    </View>
  );
}
