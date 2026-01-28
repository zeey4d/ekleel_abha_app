import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// استيراد المكونات من مكتبة Reusables
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export const CategoryFilter = ({ categories = [] }: { categories?: any[] }) => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // الحصول على التصنيف الحالي من الروابط
  const currentCategory = Number(params.category);

  const handleCategoryChange = useCallback(
    (categoryId: number) => {
      // تحديث المعاملات (Params) في Expo Router
      router.setParams({
        category: currentCategory === categoryId ? undefined : categoryId.toString(),
        page: '1', // إعادة تعيين الصفحة
      });
    },
    [currentCategory, router]
  );

  // تصنيفات وهمية في حال عدم توفر بيانات
  const displayCategories = categories?.length
    ? categories
    : [
        { id: 1, name: 'Electronics', count: 120 },
        { id: 2, name: 'Clothing', count: 85 },
        { id: 3, name: 'Home & Garden', count: 45 },
      ];

  return (
    <View className="gap-3">
      <Text className="mb-2 text-sm font-semibold text-foreground">Categories</Text>

      <View className="gap-3">
        {displayCategories.map((cat) => {
          const meshId = `cat-${cat.id}`;
          const isChecked = currentCategory === cat.id;

          return (
            <View key={cat.id} className="flex-row items-center gap-3">
              <Checkbox
                id={meshId}
                checked={isChecked}
                onCheckedChange={() => handleCategoryChange(cat.id)}
                aria-labelledby={meshId}
              />

              <Label
                nativeID={meshId}
                onPress={() => handleCategoryChange(cat.id)}
                className="flex-1 flex-row items-center justify-between">
                <Text
                  className={cn(
                    'text-sm',
                    isChecked ? 'font-medium text-primary' : 'text-muted-foreground'
                  )}>
                  {cat.name}
                </Text>

                <Text className="text-xs text-muted-foreground">({cat.count || 0})</Text>
              </Label>
            </View>
          );
        })}
      </View>
    </View>
  );
};
