// import React from "react";
// import { View, Text, ActivityIndicator } from "react-native";
// import { useGetTopProductsQuery } from "@/store/features/products/productsSlice";
// import { ProductCard } from "@/components/products/ProductCard"; // تأكد أن هذا المكون محول لـ RN
// import { useTranslation } from "react-i18next";

// interface CartRecommendationsProps {
//   navigation: any;
// }

// export const CartRecommendations = ({ navigation }: CartRecommendationsProps) => {
//   const { t } = useTranslation('cart');
//   const { data: products, isLoading } = useGetTopProductsQuery({ per_page: 4 });

//   if (isLoading) {
//     return (
//       <View className="py-8 items-center">
//         <ActivityIndicator color="#2563eb" />
//       </View>
//     );
//   }

//   if (!products || products.length === 0) return null;

//   return (
//     <View className="pt-8 border-t border-slate-100 mt-6">
//       <Text className="text-xl font-bold text-slate-900 mb-6 px-1">
//         {t('CartRecommendations.title')}
//       </Text>

//       {/* محاكاة Grid: عنصرين في كل صف */}
//       <View className="flex-row flex-wrap justify-between">
//         {products.slice(0, 4).map((product: any) => (
//           <View 
//             key={product.id} 
//             className="w-[48%] mb-4" // كل عنصر يأخذ تقريباً نصف العرض
//           >
//             <ProductCard 
//               product={product} 
//               onPress={() => navigation.navigate('ProductDetails', { id: product.id })} 
//             />
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// };

import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useGetTopProductsQuery } from "@/store/features/products/productsSlice";
import { ProductCard } from "@/components/products/ProductCard"; // تأكد أن هذا المكون محول لـ RN
import { useRouter } from "expo-router";

export default function CartRecommendations() {
  const router = useRouter();
  const { data, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>حدث خطأ أثناء تحميل المنتجات</Text>;
  }

  return (
    <View>
      {data?.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </View>
  );
}
