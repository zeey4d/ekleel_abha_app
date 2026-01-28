import React from 'react';
import { View, Text, Image, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { getImageUrl } from '@/lib/image-utils';

interface Brand {
  id: number;
  name: string;
  image: string | null;
}

export const FeaturedBrands = ({ brands }: { brands: Brand[] }) => {
  const router = useRouter();

  return (
    <FlatList
      data={brands}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item: brand }) => (
        <Pressable
          onPress={() => router.push(`/(tabs)/(shop)/brands/${brand.id}` as any)}
          className="mr-4 h-32 w-32 bg-white border border-slate-200 rounded-xl items-center justify-center p-4"
        >
          {brand.image ? (
            <Image
              source={{ uri: getImageUrl(brand.image) }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-slate-400 font-bold text-center">
                {brand.name}
              </Text>
            </View>
          )}
        </Pressable>
      )}
    />
  );
};