import React, { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { getImageUrl } from '@/lib/image-utils';
import { getAppRoute } from '@/lib/url-utils';

interface PromoGridProps {
  banners: Array<{
    id: number;
    url: string;
    image: string | null;
    title?: string;
  }>;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.85; 
const ITEM_SPACING = 12;

export function PromoGrid({ banners }: PromoGridProps) {
  const { t } = useTranslation('home');
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);

  if (!banners || banners.length === 0) return null;

  // Auto-scroll logic (optional, mimics web carousel autoplay)
  useEffect(() => {
     if (banners.length <= 1) return;
     const timer = setInterval(() => {
        const nextIndex = current === banners.length - 1 ? 0 : current + 1;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setCurrent(nextIndex);
     }, 4000); // 4 seconds
     return () => clearInterval(timer);
  }, [current, banners.length]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (ITEM_WIDTH + ITEM_SPACING));
    setCurrent(index);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => {
        const route = getAppRoute(item.url);
        if (route) router.push(route as any);
      }}
      className="rounded-xl overflow-hidden bg-gray-100 ml-3 first:ml-3 last:mr-3"
      style={{ 
        width: ITEM_WIDTH, 
        aspectRatio: 16 / 9,
      }}
    >
      {item.image ? (
        <Image
          source={{ uri: getImageUrl(item.image) }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-400">{t('PromoGrid.noImage')}</Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <View className="w-full py-4 bg-transparent">
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING} // Snap to item width + margin
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: 16 }} // Initial padding
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={() => {}} // Catch error if scroll fails
      />

            {/* Pagination Dots */}
      <View className="flex-row justify-center items-center absolute bottom-6 w-full gap-2">
        {banners.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index ? 'w-6 bg-white/90' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
