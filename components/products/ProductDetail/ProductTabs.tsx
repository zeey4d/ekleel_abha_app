import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductReviews } from "@/components/products/ProductDetail/ProductReviews";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import RenderHTML from 'react-native-render-html';

export const ProductTabs = ({ product }: { product: any }) => {
  const { t } = useTranslation("products");
  const { width } = useWindowDimensions();

  return (
    <View className="mt-8 px-4">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="flex-row w-full justify-between border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="description"
            className="flex-1 py-3 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Text className="text-sm font-medium data-[state=active]:text-primary text-muted-foreground">
                {t("ProductTabs.description")}
            </Text>
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="flex-1 py-3 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Text className="text-sm font-medium data-[state=active]:text-primary text-muted-foreground">
                {t("ProductTabs.specifications")}
            </Text>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="flex-1 py-3 border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Text className="text-sm font-medium data-[state=active]:text-primary text-muted-foreground">
                {t("ProductTabs.reviews")} ({product.review_count})
            </Text>
          </TabsTrigger>
        </TabsList>

        <View className="py-6">
          <TabsContent value="description">
            {product.description ? (
                <RenderHTML
                    contentWidth={width - 32}
                    source={{ html: product.description }}
                    baseStyle={{ color: '#4b5563', fontSize: 14, textAlign: 'left', lineHeight: 22 }}
                    tagsStyles={{
                        p: { marginBottom: 10 },
                    }}
                />
            ) : (
                <Text className="text-muted-foreground text-center">{t("ProductTabs.noDescription")}</Text>
            )}
          </TabsContent>

          <TabsContent value="specs">
            <View className="gap-4">
              {product.attributes && product.attributes.length > 0 ? (
                product.attributes.map((attr: any, idx: number) => (
                    <View
                    key={idx}
                    className="flex-row justify-between border-b border-border pb-3"
                    >
                    <Text className="font-bold text-foreground text-sm text-start flex-1">
                        {attr.name}
                    </Text>
                    <Text className="text-muted-foreground text-sm text-start flex-1">{attr.text}</Text>
                    </View>
                ))
               ) : (
                <Text className="text-muted-foreground italic text-center">
                  {t("ProductTabs.noAttributes")}
                </Text>
              )}
            </View>
          </TabsContent>

          <TabsContent value="reviews">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </View>
      </Tabs>
    </View>
  );
};
