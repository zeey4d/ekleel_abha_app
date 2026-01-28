import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';

// استيراد المكونات التي حولناها سابقاً
import { CategoryFilter } from './CategoryFilter';
import { BrandFilter } from './BrandFilter';
// استيراد مكونات Reusables
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ملاحظة: افترضنا وجود مكونات PriceRangeFilter و RatingFilter تم تحويلها بنفس المنطق
import { PriceRangeFilter } from './PriceRangeFilter';
import { RatingFilter } from './RatingFilter';

interface FiltersSidebarProps {
  facets?: any;
  mobile?: boolean; // في Native غالباً ما تكون دائماً true أو ضمن Drawer
  onClose?: () => void;
}

export const FiltersSidebar = ({ facets, mobile, onClose }: FiltersSidebarProps) => {
  const { t } = useTranslation('products');
  const router = useRouter();
  const pathname = usePathname();

  const handleClearAll = () => {
    // في Expo Router، لإعادة التوجيه لمسار نظيف بدون بارامترات
    router.replace(pathname as any);
    if (onClose) onClose();
  };

  // معالجة البيانات (Mapping)
  const categories = React.useMemo(
    () =>
      facets?.categories?.values?.map((v: any) => ({
        id: v.value,
        name: v.name || v.value,
        count: v.count,
      })) || [],
    [facets]
  );

  const brands = React.useMemo(
    () =>
      facets?.brands?.values?.map((v: any, index: number) => ({
        id: v.id || index,
        name: v.value,
        count: v.count,
      })) || [],
    [facets]
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border p-4">
        <Text className="text-lg font-bold text-foreground">{t('Filters.title')}</Text>
        <Button variant="ghost" size="sm" onPress={handleClearAll} className="active:opacity-50">
          <Text className="text-xs font-medium text-destructive">{t('Filters.clearAll')}</Text>
        </Button>
      </View>

      {/* Filters Content */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 20, gap: 24 }}
        showsVerticalScrollIndicator={false}>
        <CategoryFilter categories={categories} />
        <Separator className="bg-border/50" />

        <PriceRangeFilter min={0} max={5000} />
        <Separator className="bg-border/50" />

        <BrandFilter brands={brands} />
        <Separator className="bg-border/50" />

        <RatingFilter />

        {/* مساحة إضافية في الأسفل للتأكد من عدم اختفاء المحتوى خلف أزرار الجوال */}
        <View className="h-20" />
      </ScrollView>

      {/* Footer Button (Apply) */}
      {mobile && (
        <View className="border-t border-border bg-background p-4">
          <Button className="w-full shadow-sm" onPress={onClose}>
            <Text className="font-semibold text-primary-foreground">
              {t('Filters.showResults')}
            </Text>
          </Button>
        </View>
      )}
    </View>
  );
};
