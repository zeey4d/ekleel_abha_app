import React from 'react';
import { View } from 'react-native';
import {
  useGetRelatedProductsQuery,
  useGetSimilarProductsQuery,
} from "@/store/features/products/productsSlice";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";

interface ProductRecommendationsProps {
  productId: string | number;
}

export const ProductRecommendations = ({
  productId,
}: ProductRecommendationsProps) => {
  const { t } = useTranslation("product_details");

  const { data: relatedProducts, isLoading: relatedLoading } =
    useGetRelatedProductsQuery(productId);
  const { data: similarProducts, isLoading: similarLoading } =
    useGetSimilarProductsQuery(productId);

  if (
    (!relatedProducts || relatedProducts.length === 0) &&
    (!similarProducts || similarProducts.length === 0)
  ) {
    return null;
  }

  return (
    <View className="gap-8 pb-8 pt-4 border-t border-border mt-4">
      {relatedProducts && relatedProducts.length > 0 && (
         <View className="gap-4">
            <Text className="text-lg font-bold px-4 text-start">{t("Sections.relatedProducts")}</Text>
            <ProductCarousel
                products={relatedProducts}
                title="" // Title rendered manually above
            />
         </View>
      )}

      {similarProducts && similarProducts.length > 0 && (
        <View className="gap-4">
            <Text className="text-lg font-bold px-4 text-start">{t("Sections.similarProducts")}</Text>
            <ProductCarousel
                products={similarProducts}
                title=""
            />
        </View>
      )}
    </View>
  );
};
