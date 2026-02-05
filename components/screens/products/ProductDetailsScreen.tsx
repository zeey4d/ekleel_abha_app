// import React from 'react';
// import { Stack, useLocalSearchParams } from 'expo-router';
// import { View } from 'react-native';
// import { ProductDetailsContent } from '@/components/shop/product/ProductDetailsContent';
// import { useGetProductByIdQuery } from '@/store/features/products/productsSlice';
// import { useLocalizedEntityName } from '@/hooks/useLocalizedEntityName';

// /**
//  * Decode HTML entities in text
//  */
// function decodeHtmlEntities(text: string): string {
//   if (!text) return "";
//   return text
//     .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
//     .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
//     .replace(/&#39;/g, "'");
// }

// export default function ProductDetailsScreen() {
//   const { id, locale = 'ar' } = useLocalSearchParams<{ id: string; locale: string }>();
  
//   // استخدام الـ Hook الجديد بدلاً من الكود اليدوي
//   const { name, isLoading, entity: product } = useLocalizedEntityName(
//     id,
//     locale,
//     useGetProductByIdQuery
//   );

//   const productName = isLoading ? "جاري التحميل..." : decodeHtmlEntities(name);

//   return (
//     <View className="flex-1 bg-background">
//       <Stack.Screen 
//         options={{
//           title: productName,
//           headerBackTitle: "",
//           headerTintColor: '#000',
//         }} 
//       />
//       <ProductDetailsContent initialProduct={product} />
//     </View>
//   );
// }
import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ProductDetailsContent } from '@/app/shop/product/ProductDetailsContent';
import { useGetProductByIdQuery } from '@/store/features/products/productsSlice';
import { useLocalizedEntityName } from '@/hooks/useLocalizedEntityName';

export default function ProductDetailsScreen() {
  const { id, locale = 'ar' } = useLocalSearchParams<{ id: string; locale: string }>();

  const { 
    name, 
    isLoading: isLocalizationLoading, 
    entity: product,
  } = useLocalizedEntityName(id, locale, useGetProductByIdQuery);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: isLocalizationLoading ? '...' : name,
        }}
      />
      <ProductDetailsContent 
        initialProduct={product}
        // تمرير كل البيانات مرة واحدة
      />
    </View>
  );
}