// app/(tabs)/(shop)/categories/index.tsx

import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CategoriesListPage from '@/components/features/category/‎CategoriesListPage';

export default function CategoriesListScreen() {
  const { t } = useTranslation('categories');

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: t('Header.title'),
          headerBackTitle: '',
        }}
      />
      <CategoriesListPage />
    </View>
  );
}
