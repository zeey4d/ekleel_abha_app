import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/image-utils';
import { Tags } from 'lucide-react-native';

interface Brand {
  id: number;
  name: string;
  image: string | null;
  product_count?: number;
}

export const BrandCard = ({ brand }: { brand: Brand }) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/(shop)/brands/${brand.id}` as any)}
      className="flex-col items-center"
    >
      <View className="w-full aspect-square bg-white border border-slate-100 rounded-2xl p-6 items-center justify-center mb-3 relative">
        {brand.image ? (
          <Image
            source={{ uri: getImageUrl(brand.image) }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
            className="p-2"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Text className="text-2xl font-bold text-slate-200">
              {brand.name[0]}
            </Text>
          </View>
        )}

        {/* Product Count Badge */}
        {brand.product_count !== undefined && (
          <View className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-slate-50">
              <Text className="text-[10px] text-slate-500">
                {brand.product_count}
              </Text>
            </Badge>
          </View>
        )}
      </View>

      <Text className="font-medium text-slate-900 text-center">
        {brand.name}
      </Text>
    </Pressable>
  );
};