import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';

// مكونات react-native-reusables
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';

// المكونات الفرعية
import { ProductReviews } from './ProductReviews';

interface ProductTabsProps {
  product: any;
}

export const ProductTabs = ({ product }: ProductTabsProps) => {
  const { width } = useWindowDimensions();

  // الترجمات (استبدلها بـ useTranslations إذا كانت متوفرة)
  const t = (key: string) => {
    const dict: Record<string, string> = {
      "ProductTabs.description": "الوصف",
      "ProductTabs.specifications": "المواصفات",
      "ProductTabs.reviews": "المراجعات",
      "ProductTabs.noAttributes": "لا توجد مواصفات فنية متوفرة."
    };
    return dict[key] || key;
  };

  return (
    <View className="mt-8 px-4">
      <Tabs defaultValue="description" className="w-full flex-col gap-4">
        {/* قائمة التبويبات */}
        <TabsList className="flex-row w-full border-b border-border bg-transparent">
          <TabsTrigger value="description" className="flex-1 py-3 border-b-2 border-transparent data-[state=active]:border-primary">
            <Text className="text-sm font-medium data-[state=active]:text-primary">
              {t("ProductTabs.description")}
            </Text>
          </TabsTrigger>
          
          <TabsTrigger value="specs" className="flex-1 py-3 border-b-2 border-transparent data-[state=active]:border-primary">
            <Text className="text-sm font-medium data-[state=active]:text-primary">
              {t("ProductTabs.specifications")}
            </Text>
          </TabsTrigger>

          <TabsTrigger value="reviews" className="flex-1 py-3 border-b-2 border-transparent data-[state=active]:border-primary">
            <Text className="text-sm font-medium data-[state=active]:text-primary">
              {t("ProductTabs.reviews")} ({product.review_count || 0})
            </Text>
          </TabsTrigger>
        </TabsList>

        {/* محتوى التبويبات */}
        <View className="py-4">
          {/* تبويب الوصف */}
          <TabsContent value="description">
            <RenderHTML
              contentWidth={width - 32} // خصم الـ Padding
              source={{ html: product.description || '' }}
              baseStyle={{
                color: '#475569', // slate-600
                fontSize: 15,
                textAlign: 'right',
                lineHeight: 22
              }}
            />
          </TabsContent>

          {/* تبويب المواصفات */}
          <TabsContent value="specs">
            <View className="gap-y-4">
              {product.attributes && product.attributes.length > 0 ? (
                product.attributes.map((attr: any, idx: number) => (
                  <View 
                    key={idx} 
                    className="flex-row justify-between items-center border-b border-slate-100 pb-3"
                  >
                    <Text className="font-bold text-slate-900 text-sm flex-1 text-right">
                      {attr.name}
                    </Text>
                    <Text className="text-slate-600 text-sm flex-1 text-left">
                      {attr.text}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-slate-500 italic text-center py-10">
                  {t("ProductTabs.noAttributes")}
                </Text>
              )}
            </View>
          </TabsContent>

          {/* تبويب المراجعات */}
          <TabsContent value="reviews">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </View>
      </Tabs>
    </View>
  );
};