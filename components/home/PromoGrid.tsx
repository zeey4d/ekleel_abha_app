import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

interface PromoGridProps {
  banners: Array<{
    id: number;
    url: string;
    image: string | null;
  }>;
}

export function PromoGrid({ banners }: PromoGridProps) {
  const { t } = useTranslation('home');
  const router = useRouter();

  if (!banners || banners.length < 5) return null;

  const topRow = banners.slice(0, 2);
  const middleBanner = banners[2];
  const bottomRow = banners.slice(3, 5);

  const renderTile = (banner: { id: number; url: string; image: string | null }, wide = false) => (
    <Pressable
      key={banner.id}
      onPress={() => router.push((banner.url || '/shop') as any)}
      className="overflow-hidden rounded-sm bg-gray-100"
      style={{ width: wide ? '100%' : '48%', aspectRatio: wide ? 4 / 1 : 16 / 9 }}>
      {banner.image ? (
        <Image
          source={{ uri: getImageUrl(banner.image) }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-400">{t('PromoGrid.noImage')}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View className="w-full px-4">
      {/* Top Row */}
      <View className="mb-4 flex-row justify-between">{topRow.map((b) => renderTile(b))}</View>

      {/* Middle Wide Banner */}
      <View className="mb-4">{renderTile(middleBanner, true)}</View>

      {/* Bottom Row */}
      <View className="flex-row justify-between">{bottomRow.map((b) => renderTile(b))}</View>
    </View>
  );
}
