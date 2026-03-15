import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Pressable, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Banner } from '@/store/types';
import { getImageUrl } from '@/lib/image-utils';
import { getAppRoute } from '@/lib/url-utils';

const CARD_GAP = 12;

interface HeroPromoBannersProps {
  banners: Banner[];
}

const BannerCarousel = ({ banners }: { banners: Banner[] }) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    if (banners && banners.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((current) => {
          const nextIndex = current === banners.length - 1 ? 0 : current + 1;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 5000); // 5 seconds interval
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / width);
      setActiveIndex(index);
    },
    [width]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width]
  );

  return (
    <View style={{ position: 'relative', marginBottom: CARD_GAP }}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => String(item.id || index)}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={getItemLayout}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width - 26}
        snapToAlignment="center"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View style={{ width: width - 26 }}>
            <Pressable
              style={{
                width: '100%',
                aspectRatio: 2.8,
                backgroundColor: '#f1f5f9'
              }}
              onPress={() => router.push(getAppRoute(item.url) as any)}
            >
              <Image
                source={{ uri: getImageUrl(item.image) }}
                style={{ flex: 1, borderRadius: 12 }}
                contentFit="cover"
                transition={300}
              />
            </Pressable>
          </View>
        )}
      />

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <View style={{ position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {banners.map((_, idx) => (
            <View
              key={idx}
              style={{
                height: 8,
                borderRadius: 4,
                width: idx === activeIndex ? 24 : 8,
                backgroundColor: idx === activeIndex ? '#ffffffff' : 'rgba(255, 255, 255, 0.7)',
                shadowColor: idx === activeIndex ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: idx === activeIndex ? 0.2 : 0,
                shadowRadius: 1.41,
                elevation: idx === activeIndex ? 2 : 0,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export const HeroPromoBanners = ({ banners }: HeroPromoBannersProps) => {
  const router = useRouter();
  const { width } = Dimensions.get('window');

  if (!banners || banners.length === 0) return null;

  // Group banners into pairs of 2
  const bannerGroups: Banner[][] = [];
  for (let i = 0; i < banners.length; i += 2) {
    bannerGroups.push(banners.slice(i, i + 2));
  }

  return (
    <View style={{ paddingVertical: 10 }}>
      {bannerGroups.map((group, index) => {
        if (group.length === 2) {
          // Render a carousel that swipes between the 2 banners
          return <BannerCarousel key={`carousel-${index}`} banners={group} />;
        } else {
          // Render a single banner taking full width without slider
          const banner = group[0];
          return (
            <Pressable
              key={`single-${banner.id || index}`}
              style={{
                width: '100%',
                aspectRatio: 2.8,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#f1f5f9',
                marginHorizontal: 16,
                alignSelf: 'center',
                maxWidth: width - 32,
                marginBottom: CARD_GAP
              }}
              onPress={() => router.push(getAppRoute(banner.url) as any)}
            >
              <Image
                source={{ uri: getImageUrl(banner.image) }}
                style={{ flex: 1 }}
                contentFit="cover"
                transition={300}
              />
            </Pressable>
          );
        }
      })}
    </View>
  );
};
