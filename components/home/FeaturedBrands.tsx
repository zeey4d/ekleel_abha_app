import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';

interface Brand {
  id: number | string;
  name: string;
  image: string | null;
}

export const FeaturedBrands = ({ brands }: { brands: Brand[] }) => {
  const { t } = useTranslation('home');

  if (!brands?.length) return null;

  return (
    <View className="w-[96%] self-center mb-7 ">
      {/* Title */}
      <Text className="text-lg font-bold text-foreground mb-6">
        {t('FeaturedBrands.title')}
      </Text>

      {/* Grid */}
      <FlatList
        data={brands}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <Link
              href={{
                pathname: '/(tabs)/(home)/(context)/brands/[id]',
                params: { id: item.id },
              }}
              asChild
            >
              <TouchableOpacity
                activeOpacity={0.8}
                className="items-center justify-center bg-card border border-border rounded-xl h-32"
              >
                {item.image ? (
                  <Image
                    source={{ uri: getImageUrl(item.image) }}
                    style={{
                      width: 120,
                      height: 120,
                      resizeMode: 'contain',
                    }}
                  />
                ) : (
                  <Text className="text-muted-foreground font-medium">
                    {item.name}
                  </Text>
                )}
              </TouchableOpacity>
            </Link>
          </View>
        )}
      />
    </View>
  );
};
