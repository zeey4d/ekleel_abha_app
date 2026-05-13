import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductReviews } from "@/features/products/components/ProductDetail/ProductReviews";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import RenderHTML from 'react-native-render-html';

export const ProductTabs = ({ product }: { product: any }) => {
  const { t } = useTranslation("products");
  const { width } = useWindowDimensions();

  return (
    <View className="mt-4 px-4 bg-[#f8fafc]">
      <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50">
      <Tabs initialTab="description" className="w-full">
        <TabsList className="flex-row w-full justify-between border-b border-slate-100 bg-transparent p-0">
          <TabsTrigger
            value="description"
            className="flex-1 py-3 border-b-2 border-transparent data-[state=active]:border-teal-600"
          >
            <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-sm data-[state=active]:text-teal-600 text-slate-400">
                {t("ProductTabs.description")}
            </Text>
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="flex-1 py-3 border-b-2 border-transparent data-[state=active]:border-teal-600"
          >
            <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-sm data-[state=active]:text-teal-600 text-slate-400">
                {t("ProductTabs.specifications")}
            </Text>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="flex-1 py-3 border-b-2 border-transparent data-[state=active]:border-teal-600"
          >
            <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-sm data-[state=active]:text-teal-600 text-slate-400">
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
                    className="flex-row justify-between border-b border-slate-50 pb-3"
                    style={{ flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row' }}
                    >
                    <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: i18n.language === 'ar' ? 'right' : 'left' }} className="text-slate-700 text-sm flex-1">
                        {attr.name}
                    </Text>
                    <Text style={{ fontFamily: 'Tajawal_500Medium', textAlign: i18n.language === 'ar' ? 'right' : 'left' }} className="text-slate-400 text-sm flex-1">{attr.text}</Text>
                    </View>
                ))
               ) : (
                <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-400 italic text-center">
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
    </View>
  );
};
