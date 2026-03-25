import React, { useState } from 'react';
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Banner } from '@/store/types';
import { getImageUrl } from '@/lib/image-utils';
import { getAppRoute } from '@/lib/url-utils';

const CARD_GAP = 6;

interface VerticalPromoGridProps {
  banners: Banner[];
}

export const VerticalPromoGrid = ({ banners }: VerticalPromoGridProps) => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const [cardHeight, setCardHeight] = useState(0);

  if (!banners || banners.length === 0) return null;

  const handleLayout = (e: LayoutChangeEvent) => {
    const containerWidth = e.nativeEvent.layout.width;
    const singleCardWidth = (containerWidth - CARD_GAP) / 2;
    setCardHeight(singleCardWidth * 1.5); // 2:3 aspect ratio
  };

  return (
    <View
      onLayout={handleLayout}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      {banners.slice(0, 4).map((banner) => (
        <Pressable
          key={banner.id}
          style={{
            width: '48.5%',
            height: cardHeight || 260,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            marginBottom: CARD_GAP,
          }}
          onPress={() => router.push(getAppRoute(banner.url) as any)}
        >
          {/* Full Card Image */}
          <Image
            source={{ uri: getImageUrl(banner.image) }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            contentFit="cover"
            transition={300}
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '100%',
            }}
          />

          {/* Content */}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, alignItems: 'center' }}>
            <Text
              className="text-sm font-bold text-white text-center leading-tight"
              numberOfLines={2}
            >
              {banner.title}
            </Text>

            <View className="flex-row justify-center pt-1">
              <View className="flex-row items-center gap-1 bg-primary px-3 py-1.5 rounded-full shadow-lg">
                <Text className="text-white font-bold text-[10px] uppercase tracking-wide">
                  {t('Promos.specialOffer')}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

