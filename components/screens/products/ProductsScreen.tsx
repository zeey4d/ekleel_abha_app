import React from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import ProductsContent from '@/components/features/product/ProductsContent';

export default function ProductsScreen() {
  const params = useLocalSearchParams();

  const page = Number(params.page) || 1;
  const sort_by = (params.sort as any) || 'relevance';
  const categories = Array.isArray(params.categories)
    ? params.categories
    : params.categories
    ? [params.categories]
    : [];

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'المنتجات',
          headerBackTitleVisible: false,
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }}
      />

      <ProductsContent
        page={page}
        sort_by={sort_by}
        categories={categories}
      />
    </View>
  );
}
