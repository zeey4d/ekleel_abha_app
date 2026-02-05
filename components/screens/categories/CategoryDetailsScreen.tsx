import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { CategoryPageContent } from '@/app/shop/category/CategoryPageContent';
import { useGetCategoryByIdQuery } from '@/store/features/categories/categoriesSlice';
import { useLocalizedEntityName } from '@/hooks/useLocalizedEntityName';

export default function CategoryDetailsScreen() {
    const { id, locale = 'ar' } = useLocalSearchParams<{ id: string, locale: string }>();
    
    // استخدام الـ Hook الجديد بدلاً من useMemo اليدوي
    const { name: categoryName } = useLocalizedEntityName(
        Number(id),
        locale,
        useGetCategoryByIdQuery
    );

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen 
                options={{ 
                    title: categoryName,
                    headerBackTitle: "", 
                    headerTintColor: '#000',
                }} 
            />
            <CategoryPageContent 
                categoryId={Number(id)} 
                productLinkPrefix="../../products" 
            />
        </View>
    );
}
