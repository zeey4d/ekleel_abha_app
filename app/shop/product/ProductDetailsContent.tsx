import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Product detail components
import { ProductGallery } from '@/components/products/ProductDetail/ProductGallery';
import { ProductInfo } from '@/components/products/ProductDetail/ProductInfo';
import { ProductTabs } from '@/components/products/ProductDetail/ProductTabs';
import { ProductRecommendations } from '@/components/products/ProductDetail/ProductRecommendations';
import { ProductViewTracker } from '@/components/products/ProductDetail/ProductViewTracker';
import { ProductActions } from '@/components/products/ProductDetail/ProductActions';
import { ArrowLeft } from 'lucide-react-native';

// UI components
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

// Hooks
import { useGetProductByIdQuery } from '@/store/features/products/productsSlice';

interface ProductDetailsContentProps {
  initialProduct?: any;
}

// export function ProductDetailsContent({ initialProduct }: ProductDetailsContentProps) {
export function ProductDetailsContent({ initialProduct }: ProductDetailsContentProps) {
  const product = initialProduct; // استخدم الـ product الممرر فقط

  // تغيير شروط الـ Loading والـ Error
  const isLoading = !product; // إذا لم يمرر product، فهو loading
  const isError = false; // أو تمرر prop من الـ parent إذا
  const { id, locale } = useLocalSearchParams<{ id: string; locale: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch data if no initial product provided
  // const {
  //   data: fetchedProduct,
  //   isLoading,
  //   isError,
  // } = useGetProductByIdQuery(id, {
  //   skip: !!initialProduct,
  // });

  // const product = initialProduct || fetchedProduct;

  // Loading state
  if (!product && isLoading) {
    return (
      <View className="flex-1 gap-6 bg-background p-4">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <View className="gap-3">
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </View>
      </View>
    );
  }

  // Error state
  if (!product && (isError || !isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="mb-4 text-6xl font-bold text-muted-foreground">404</Text>
        <Text className="mb-2 text-xl font-semibold">خطأ في التحميل</Text>
        <Text className="mb-8 text-center text-muted-foreground">
          عذراً، لم نتمكن من العثور على المنتج المطلوب.
        </Text>
        <Button onPress={() => router.back()}>
          <Text>العودة</Text>
        </Button>
      </View>
    );
  }

  if (!product) return null;

  // Localization
  const localizedProduct = {
    ...product,
    name: locale === 'ar' ? product.name_ar || product.name : product.name_en || product.name,
    description:
      locale === 'ar'
        ? product.description_ar || product.description
        : product.description_en || product.description,
  };

  const bottomBarHeight = 70 + insets.bottom;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()} className="-ml-2 mr-3 p-2">
          <ArrowLeft size={24} color="#020617" />
        </Pressable>
        <Text className="text-l font-bold text-foreground" numberOfLines={1} ellipsizeMode="clip">
          {product.name}
        </Text>
      </View>

      {/* Recently viewed tracker */}
      <ProductViewTracker product={product} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomBarHeight + 20 }}>
        {/* Image gallery */}
        <ProductGallery
          images={
            localizedProduct.images || (localizedProduct.image ? [localizedProduct.image] : [])
          }
          mainImage={localizedProduct.image || ''}
        />

        {/* Product info */}
        <View className="px-1">
          <ProductInfo product={localizedProduct} />
        </View>

        {/* Tabs (description, specs, reviews) */}
        <ProductTabs product={localizedProduct} />

        {/* Recommendations */}
        <View className="mt-8">
          <ProductRecommendations productId={product.id} />
        </View>
      </ScrollView>

      {/* Add to cart - fixed at bottom */}
      <ProductActions product={localizedProduct} selectedOptions={{}} />
    </View>
  );
}