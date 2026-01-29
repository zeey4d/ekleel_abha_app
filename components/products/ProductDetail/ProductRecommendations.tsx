import React from 'react';
import { View } from 'react-native';
import { 
  useGetRelatedProductsQuery, 
  useGetSimilarProductsQuery 
} from "@/store/features/products/productsSlice";
import { ProductCarousel } from "@/components/products/ProductCarousel"; // يجب تحويل هذا المكون أيضاً
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductRecommendationsProps {
  productId: string | number;
}

// افتراضاً للترجمة
const t = (key: string) => {
  const translations: Record<string, string> = {
    "Sections.relatedProducts": "منتجات ذات صلة",
    "Sections.similarProducts": "منتجات مشابهة"
  };
  return translations[key] || key;
};

export const ProductRecommendations = ({ productId }: ProductRecommendationsProps) => {
  const { data: relatedProducts, isLoading: relatedLoading } = useGetRelatedProductsQuery(productId);
  const { data: similarProducts, isLoading: similarLoading } = useGetSimilarProductsQuery(productId);

  // حالة التحميل (Skeletons) لتحسين تجربة المستخدم في الجوال
  if (relatedLoading || similarLoading) {
    return (
      <View className="p-4 gap-4">
        <Skeleton className="h-6 w-40 rounded-md" />
        <View className="flex-row gap-4">
          <Skeleton className="h-48 w-32 rounded-xl" />
          <Skeleton className="h-48 w-32 rounded-xl" />
          <Skeleton className="h-48 w-32 rounded-xl" />
        </View>
      </View>
    );
  }

  // إذا لم توجد بيانات
  if (
    (!relatedProducts || relatedProducts.length === 0) &&
    (!similarProducts || similarProducts.length === 0)
  ) {
    return null;
  }

  return (
    <View className="gap-10 py-6 border-t border-border">
      {relatedProducts && relatedProducts.length > 0 && (
        <View>
          <Text className="text-xl font-bold px-4 mb-4 text-start">
            {t("Sections.relatedProducts")}
          </Text>
          <ProductCarousel products={relatedProducts} title={''} />
        </View>
      )}

      {similarProducts && similarProducts.length > 0 && (
        <View>
          <Text className="text-xl font-bold px-4 mb-2 text-start">
            {t("Sections.similarProducts")}
          </Text>
          <ProductCarousel products={similarProducts} title={''} />
        </View>
      )}
    </View>
  );
};