import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// المكونات التي قمنا بتحويلها سابقاً
import { ProductGallery } from '@/components/products/ProductDetail/ProductGallery';
import { ProductInfo } from '@/components/products/ProductDetail/ProductInfo';
import { ProductTabs } from '@/components/products/ProductDetail/ProductTabs';
import { ProductRecommendations } from '@/components/products/ProductDetail/ProductRecommendations';
import { ProductViewTracker } from '@/components/products/ProductDetail/ProductViewTracker'; // (الذي كان يسمى ProductDetailClient)

// مكونات UI
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

// Hooks
import { useGetProductByIdQuery } from "@/store/features/products/productsSlice";

interface ProductPageContentProps {
  initialProduct?: any;
}

export function ProductPageContent({ initialProduct }: ProductPageContentProps) {
  const { id, locale } = useLocalSearchParams<{ id: string, locale: string }>();
  const router = useRouter();

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
      <View className="flex-1 p-4 gap-6 bg-background">
        <Skeleton className="w-full aspect-square rounded-3xl" />
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
      <View className="flex-1 justify-center items-center p-6 bg-background">
        <Text className="text-6xl font-bold text-muted-foreground mb-4">404</Text>
        <Text className="text-xl font-semibold mb-2">خطأ في التحميل</Text>
        <Text className="text-center text-muted-foreground mb-8">
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
    name: locale === "ar" ? product.name_ar || product.name : product.name_en || product.name,
    description: locale === "ar" ? product.description_ar || product.description : product.description_en || product.description,
  };

  return (
    <View className="flex-1 bg-background">
      {/* تتبع المشاهدات الأخيرة - يعمل في الخلفية */}
      <ProductViewTracker product={product} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* معرض الصور */}
        <ProductGallery
          images={localizedProduct.images || (localizedProduct.image ? [localizedProduct.image] : [])}
          mainImage={localizedProduct.image || ""}
        />

        {/* معلومات المنتج (تشمل الاسم، السعر، الخيارات، والأكشنز) */}
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
    </View>
  );
}