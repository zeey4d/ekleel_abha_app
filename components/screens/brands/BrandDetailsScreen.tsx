import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { BrandPageContent } from '@/app/shop/brand/BrandPageContent';
import { useGetBrandByIdQuery } from '@/store/features/brands/brandsSlice';
import { useLocalizedEntityName } from '@/hooks/useLocalizedEntityName';

export default function BrandDetailsScreen() {
    const { id, locale = 'ar' } = useLocalSearchParams<{ id: string, locale: string }>();
    
    // استخدام الـ Hook الجديد بدلاً من useMemo اليدوي
    const { name: brandName } = useLocalizedEntityName(
        Number(id),
        locale,
        useGetBrandByIdQuery
    );

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen 
                options={{ 
                    title: brandName,
                    headerBackTitle: "", 
                    headerTintColor: '#000',
                }} 
            />
            <BrandPageContent 
                brandId={Number(id)} 
                productLinkPrefix="../../products" 
            />
        </View>
    );
}
