import React, { useMemo } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';

// State & Hooks
import { useGetProductByIdQuery } from '@/store/features/products/productsSlice';

// Components
import { ProductGallery } from '@/components/products/ProductDetail/ProductGallery';
import { ProductInfo } from '@/components/products/ProductDetail/ProductInfo';
import { ProductTabs } from '@/components/products/ProductDetail/ProductTabs';
import { ProductRecommendations } from '@/components/products/ProductDetail/ProductRecommendations';
import { ProductViewTracker } from '@/components/products/ProductDetail/ProductViewTracker';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailsScreen() {
  const { id, locale = 'ar' } = useLocalSearchParams<{ id: string; locale: string }>();
  const router = useRouter();
  const { i18n } = useTranslation('product_details');
  const currentLocale = i18n.language;

  // 1. Fetch Data
  const { data: product, isLoading, error } = useGetProductByIdQuery(id as string, {
      skip: !id
  });

  // 2. Localization Logic
  const localizedProduct = useMemo(() => {
    if (!product) return null;
    return {
      ...product,
      name: currentLocale === 'ar' ? product.name_ar || product.name : product.name_en || product.name,
      description: currentLocale === 'ar' ? product.description_ar || product.description : product.description_en || product.description,
    };
  }, [product, currentLocale]);

  // Loading State
  if (isLoading || !localizedProduct) return <ProductDetailsSkeleton />;

  // Error State
  if (error) {
      return (
          <View className="flex-1 justify-center items-center">
              <Stack.Screen options={{ title: 'Product Not Found', headerShown: true }} />
              <Text className="text-red-500">Failed to load product</Text>
          </View>
      );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: localizedProduct.name,
          headerShown: true,
          headerLeft: () => (
             <Pressable onPress={() => router.back()} >
                 <ChevronLeft color="#000000ff" size={28} />
             </Pressable>
         ),
        }}
      />
      
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Gallery */}
        <ProductGallery
          images={localizedProduct.images || (localizedProduct.image ? [localizedProduct.image] : [])}
          mainImage={localizedProduct.image || ''}
        />

        {/* Info */}
        <ProductInfo product={localizedProduct} />

        {/* Tabs (Desc, Specs, Reviews) */}
        <ProductTabs product={localizedProduct} />

        {/* Recommendations */}
        <ProductRecommendations productId={product.id} />

        {/* Tracker */}
        <ProductViewTracker product={product} />
      </ScrollView>
    </View>
  );
}

// --- Skeleton ---
function ProductDetailsSkeleton() {
  return (
    <View className="flex-1 bg-background p-4 gap-6">
      <Stack.Screen options={{ title: 'Loading...', headerShown: true }} />
      {/* Gallery Skeleton */}
      <Skeleton className="w-full h-80 rounded-2xl" />
      {/* Info Skeleton */}
      <View className="gap-4">
        <Skeleton className="w-3/4 h-8 rounded-md" />
        <Skeleton className="w-1/2 h-5 rounded-md" />
        <Skeleton className="w-full h-28 rounded-md" />
      </View>
    </View>
  );
}