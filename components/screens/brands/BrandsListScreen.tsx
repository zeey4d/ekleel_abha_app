// // screens/brands/index.tsx
// import React from 'react';
// import { View } from 'react-native';
// import { Stack, useRouter } from 'expo-router';
// import { useGetBrandsQuery, useGetFeaturedBrandsQuery } from '@/store/features/brands/brandsSlice';
// import { useTranslation } from 'react-i18next';
// import BrandsListContent from '@/components/shop/brand/BrandsListContent';

// export default function BrandsListScreen() {
//   const { t } = useTranslation('brands');
//   const router = useRouter();

//   const { data: featuredBrands } = useGetFeaturedBrandsQuery({ limit: 6 });
//   const { data: brandsData } = useGetBrandsQuery({ page: 1, limit: 24 });
//   const brands = brandsData?.ids.map((id) => brandsData.entities[id]) || [];

//   return (
//     <View className="flex-1 bg-background">
//       <Stack.Screen options={{ title: t('Header.title') || 'Brands' }} />
//       <BrandsListContent
//         brands={brands}
//         featuredBrands={featuredBrands}
//         onPressBrand={(id: number) => router.push(`brands/${id}`)}
//         isLoading={false}
//         t={t}
//       />
//     </View>
//   );
// }
// app/(tabs)/(shop)/brands/index.tsx

import React from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import  BrandsListContent  from '@/components/features/brand/BrandsListContent';

export default function BrandsScreen() {
  const { t } = useTranslation('brands');
  const { page } = useLocalSearchParams<{ page?: string }>();

  const currentPage = Number(page) || 1;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('Header.title') || 'Brands',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }}
      />

      <BrandsListContent />
    </View>
  );
}
