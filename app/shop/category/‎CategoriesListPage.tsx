import React, { useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useGetCategoryTreeQuery } from '@/store/features/categories/categoriesSlice';
import { Text } from '@/components/ui/text';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Layers, AlertCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function CategoriesListPage() {
  const { t } = useTranslation('categories');

  const { data, isLoading, error, refetch } = useGetCategoryTreeQuery({
    parent_id: 0,
  });

  const categories = data?.tree ?? [];

  // دالة لمسح البيانات وإعادة التحميل (Pull to Refresh)
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // مكون الهيدر - نضعه داخل القائمة ليتحرك مع التمرير
  const ListHeader = () => (
    <View className="mb-8 mt-6 items-center px-6">
      <View className="mb-3 rounded-full bg-primary/10 p-4">
        <Layers size={28} className="text-primary" />
      </View>
      <Text className="text-center text-3xl font-bold tracking-tight">{t('Header.title')}</Text>
      <Text className="mt-2 text-center text-base text-muted-foreground">
        {t('Header.description')}
      </Text>
    </View>
  );

  // مكون الحالة الفارغة أو الخطأ
  const ListEmptyComponent = () => {
    if (isLoading) return <CategoriesLoadingSkeleton />;

    if (error)
      return (
        <View className="mx-4 items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-10">
          <AlertCircle size={40} color="#ef4444" />
          <Text className="mt-4 text-center font-medium text-red-600">{t('Content.error')}</Text>
        </View>
      );

    return (
      <View className="mx-4 items-center justify-center rounded-2xl bg-muted/30 py-20">
        <Text className="font-medium text-muted-foreground">{t('Content.noCategories')}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={isLoading ? [] : categories}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        // استخدام columnWrapperStyle لضبط المسافات بين الأعمدة بدقة
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 16 }}
        contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View className="flex-1">
            <CategoryCard category={item} />
          </View>
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmptyComponent}
        // إضافة ميزة السحب للتحديث
        refreshControl={
          <RefreshControl refreshing={isLoading && categories.length > 0} onRefresh={onRefresh} />
        }
        // تحسين الأداء
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

// تطوير الـ Skeleton ليكون أكثر دقة
function CategoriesLoadingSkeleton() {
  return (
    <View className="flex-row flex-wrap gap-4 px-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} className="mb-4 w-[47%] space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <View className="items-center space-y-2">
            <Skeleton className="h-5 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </View>
        </View>
      ))}
    </View>
  );
}