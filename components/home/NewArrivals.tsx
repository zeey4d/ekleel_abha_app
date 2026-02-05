import { View, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ProductCard } from '@/components/products/ProductCard';
import { ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';

export const NewArrivals = ({ products }: { products: any[] }) => {
  const { t } = useTranslation('home');
  const router = useRouter();

  if (!products?.length) return null;

  return (
    <View className="w-full mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-foreground">{t('newArrivals.title')}</Text>
        <TouchableOpacity 
          className="flex-row items-center gap-1" 
          activeOpacity={0.7}
          onPress={() => {
            // @ts-ignore
             router.push('/(tabs)/(home)/(context)/products/(new)');
          }}
        >
          <Text className="text-primary font-medium">{t('newArrivals.viewAll')}</Text>
          <Icon as={ArrowRight} size={16} className="text-primary" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <View className="mr-4" style={{ width: 180 }}>
            <ProductCard product={item} />
          </View>
        )}
        contentContainerClassName="gap-4"
      />
    </View>
  );
};

// export const TopSellingProducts = ({ products }: { products: any[] }) => {
//   const { t } = useTranslation('home');

//   if (!products?.length) return null;

//   return (
//     <View className="w-full mb-6">
//       <View className="flex-row justify-between items-center mb-4">
//         <Text className="text-2xl font-bold text-foreground">{t('topSelling.title')}</Text>
//         <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
//           <Text className="text-primary font-medium">{t('topSelling.viewAll')}</Text>
//           <Icon as={ArrowRight} size={16} className="text-primary" />
//         </TouchableOpacity>
//       </View>
      
//       <FlatList
//         data={products}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => item.id?.toString()}
//         renderItem={({ item }) => (
//           <View className="mr-4" style={{ width: 180 }}>
//             <ProductCard product={item} />
//           </View>
//         )}
//         contentContainerClassName="gap-4"
//       />
//     </View>
//   );
// };