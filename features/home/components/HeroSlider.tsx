import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  I18nManager
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { getImageUrl } from '@/lib/image-utils';
import { getAppRoute } from '@/lib/url-utils';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
// Use 3:4 aspect ratio or similar for taller mobile banners
const BANNER_HEIGHT = width * 1.15;
const TEAL = "#0d9488";

interface Banner {
  id: number | string;
  image?: string | null;
  url?: string | null;
  title?: string | null;
}

interface HeroSliderProps {
  banners: Banner[];
}

export const HeroSlider = ({ banners = [] }: HeroSliderProps) => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);

  // Auto play
  useEffect(() => {
    if (!banners.length || banners.length === 1) return;

    const timer = setInterval(() => {
      const nextIndex = current === banners.length - 1 ? 0 : current + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrent(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length, current]);

  // Handle scroll end to update current index
  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / width);
      setCurrent(index);
    },
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Banner }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          const route = getAppRoute(item.url);
          if (route) router.push(route as any);
        }}
        style={{ width, height: BANNER_HEIGHT }}
        className="relative"
      >
        {/* Image */}
        {item.image ? (
          <Image
            source={{ uri: getImageUrl(item.image) }}
            resizeMode="cover"
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-slate-200">
            <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-500">{t('HeroSlider.noImage')}</Text>
          </View>
        )}

        {/* Bottom Fade - Smoother Transition */}
        <LinearGradient
          colors={[
            'rgba(248, 250, 252, 0)',
            'rgba(248, 250, 252, 0.2)',
            'rgba(248, 250, 252, 0.6)',
            'rgba(248, 250, 252, 0.9)',
            '#f8fafc',
          ]}
          locations={[0, 0.4, 0.7, 0.9, 1]}
          style={{
            position: 'absolute',
            bottom: -1, // overlap slightly to prevent lines
            left: 0,
            right: 0,
            height: 200, // Slightly taller for smoother fade
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      </TouchableOpacity>
    ),
    [router, t]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    []
  );

  if (!banners.length) return null;

  return (
    <View className="relative bg-[#f8fafc]">
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={getItemLayout}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        contentContainerStyle={{ alignItems: 'center' }}
      />

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <View className="absolute bottom-12 left-0 right-0 flex-row justify-center gap-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          {banners.map((_, idx) => (
            <View
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === current
                ? 'w-6 bg-[#0d9488]'
                : 'w-1.5 bg-white/70'
                }`}
              style={{
                shadowColor: TEAL,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: idx === current ? 0.3 : 0,
                shadowRadius: 4,
                elevation: idx === current ? 2 : 0,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};
