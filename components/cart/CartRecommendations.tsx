import React from "react";
import { View, Text, FlatList } from "react-native";
import { useGetTopProductsQuery } from "@/store/features/products/productsSlice";
import { ProductCard } from "@/components/products/ProductCard";
import { useTranslation } from "react-i18next";

export const CartRecommendations = () => {
  const { t } = useTranslation("cart");
  const { data: products, isLoading } = useGetTopProductsQuery({ per_page: 4 });

  if (isLoading || !products || products.length === 0) return null;

  return (
    <View className="pt-6 border-t border-slate-100">
      <Text className="text-lg font-bold text-slate-900 mb-4">
        {t("CartRecommendations.title")}
      </Text>
      <FlatList
        data={products.slice(0, 4)}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View style={{ width: 160 }}>
            <ProductCard product={item} variant="compact" />
          </View>
        )}
      />
    </View>
  );
};