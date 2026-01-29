import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// المكونات التي قمنا بتحويلها سابقاً
import { ProductGallery } from '@/components/products/ProductDetail/ProductGallery';
import { ProductInfo } from '@/components/products/ProductDetail/ProductInfo';
import { ProductTabs } from '@/components/products/ProductDetail/ProductTabs';
import { ProductRecommendations } from '@/components/products/ProductDetail/ProductRecommendations';
import { ProductViewTracker } from '@/components/products/ProductDetail/ProductViewTracker'; // (الذي كان يسمى ProductDetailClient)
import { ProductActions } from '@/components/products/ProductDetail/ProductActions';
import { ArrowLeft } from 'lucide-react-native';

// مكونات UI
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

// Hooks
import { useGetProductByIdQuery } from '@/store/features/products/productsSlice';

interface ProductPageContentProps {
  initialProduct?: any;
}

export function ProductPageContent({ initialProduct }: ProductPageContentProps) {
  const { id, locale } = useLocalSearchParams<{ id: string; locale: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // جلب البيانات (يعمل في حال عدم وجود بيانات أولية)
  const {
    data: fetchedProduct,
    isLoading,
    isError,
  } = useGetProductByIdQuery(id, {
    skip: !!initialProduct,
  });

  const product = initialProduct || fetchedProduct;

  // 1. حالة التحميل (Skeleton Screen)
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

  // 2. حالة الخطأ أو المنتج غير موجود
  if (!product && (isError || !isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="mb-4 text-6xl font-bold text-muted-foreground">404</Text>
        <Text className="mb-2 text-xl font-semibold">خطأ في التحميل</Text>
        <Text className="mb-8 text-center text-muted-foreground">
          عذراً، لم نتمكن من العثور على المنتج المطلوب.
        </Text>
        <Button onPress={() => router.push('/products')}>
          <Text>العودة للمنتجات</Text>
        </Button>
      </View>
    );
  }

  if (!product) return null;

  // توطين البيانات (Localization)
  const localizedProduct = {
    ...product,
    name: locale === 'ar' ? product.name_ar || product.name : product.name_en || product.name,
    description:
      locale === 'ar'
        ? product.description_ar || product.description
        : product.description_en || product.description,
  };

  // حساب ارتفاع الزر الثابت في الأسفل
  const bottomBarHeight = 70 + insets.bottom;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={() => router.back()} className="-ml-2 mr-3 p-2">
          <ArrowLeft size={24} color="#020617" />
        </Pressable>
        {/* <Text className="flex-1 text-xl font-bold text-foreground">{product.name}</Text> */}
        <Text className="text-l font-bold text-foreground" numberOfLines={1} ellipsizeMode="clip">
          {product.name}
        </Text>
      </View>
      {/* تتبع المشاهدات الأخيرة - يعمل في الخلفية */}
      <ProductViewTracker product={product} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomBarHeight + 20 }}>
        {/* معرض الصور */}
        <ProductGallery
          images={
            localizedProduct.images || (localizedProduct.image ? [localizedProduct.image] : [])
          }
          mainImage={localizedProduct.image || ''}
        />

        {/* معلومات المنتج (تشمل الاسم، السعر، الخيارات) */}
        <View className="px-1">
          <ProductInfo product={localizedProduct} />
        </View>

        {/* التبويبات (الوصف، المواصفات، المراجعات) */}
        <ProductTabs product={localizedProduct} />

        {/* المنتجات المقترحة والصلة */}
        <View className="mt-8">
          <ProductRecommendations productId={product.id} />
        </View>
      </ScrollView>

      {/* زر أضف للسلة - ثابت في الأسفل */}
      <ProductActions product={localizedProduct} selectedOptions={{}} />
    </View>
  );
}
